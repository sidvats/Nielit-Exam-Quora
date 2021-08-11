const questionModel = require('../models/question.model');
const answerModel = require('../models/answer.model');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const index = async (req, res) => {
    const data = await questionModel.find({}).sort({timeadded:-1});
    const token=req.cookies.jwt;
    if(token === undefined ){
        res.status(200).render('index', { data });
    }
    else{
        const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
        res.redirect('/profile');
    }
}

const findanswer = async (req, res) => {
    try {
        const questionId = req.params.queid.slice(1);
        const result = await answerModel.find({ question: questionId });
        if(result.length==1)                                   //after receiving qid i have to find that qid in answer.question collection and return matched result
        {    
            const question=await questionModel.find({_id:questionId});  
            res.render('answer',{question:question[0],result:result[0]});
        }
        else{
            const question=await questionModel.find({_id:questionId});
            res.render('answer',{question:question[0],result:false});
        }
    }catch(err){
        console.log("\n--------------Error while finding answer",err);
    }    
}

const searchquestion=async (req,res)=>{
    try{
        const querry=req.body.querry;
        var regex=new RegExp(querry,'i') ;
        var results=await questionModel.find({question:regex});
        if(results.length > 0)
            res.status(200).render('index',{data: results});
        else{
            res.status(401).render('index',{data:[]});
        }    
    }catch(err)
    {
        console.log("\n-------------------Search answer error",err);
    }
}

const findresult=async (req,res)=>{
    try{
        const querry=req.body.querry;
        var regex=new RegExp(querry,'i') ;
        var results=await questionModel.find({question:regex});
        if(results.length > 0)
            res.status(200).render('searchquestion',{data: results});
        else{
            res.status(401).render('searchquestion',{data:[]});
        }    
    }catch(err)
    {
        console.log("\n-------------------Search answer error",err);
        res.status(401).render('searchquestion',{data:[]});
    }
}

const aboutus = (req, res) => {
    res.status(200).render('aboutus');
}

const savequestion = async (req, res) => {
    try {
        var answer=req.body.answer;
        const quedata = new questionModel({
            question:req.body.question,
            keywords:req.body.keywords,
            subject:req.body.subject,
            questiontype:req.body.questiontype,
            askedin:{
                exam:req.body.examasked,
                year:req.body.yearasked
            }
        });
        const qresult=await quedata.save();
        const userid=req.user._id;
        if(qresult){
                var quespostedid=qresult._id;
                var result=await userModel.findOneAndUpdate({ _id:userid },{ $push: {questionposted: quespostedid} } );
            if(answer){
                const ansdata=new answerModel({
                    question:qresult._id,
                    answers :{
                        answer:answer
                    } 
                });  
                const aresult=await ansdata.save();
                await questionModel.findOneAndUpdate({ _id:quespostedid },{ $push: {answers: aresult._id} } );
                await userModel.findOneAndUpdate({ _id:userid },{ $push: {answerposted: aresult._id} } );
            }
        }else{
            console.log("error in saving question");
        }
        res.redirect('/profile');
    }
    catch (err) {
        console.log("----------------------\nError savequestion = ", err);
    }
}
 
const saveanswer = async (req, res) => {
    try {
        const questionId = req.params.queid.slice(1);
        var findanswer=await answerModel.findOne({question:questionId});
        if(req.body.answer){
            if(findanswer)
            {
                const data ={
                        answer:req.body.answer
                    };
                await answerModel.findOneAndUpdate({question:questionId},{$push:{ answers : { answer : req.body.answer} }});
            }else
            {
                const data = new answerModel({
                    question:questionId,
                    answers:{
                        answer:req.body.answer
                    }
                });
                await data.save();
            }
        }
        res.redirect('/profile');
    }
    catch (err) {
        console.log("----------------------\nError saveanswer = ", err);
        res.redirect('/profile');
    }
}

const registeruser = async (req, res) => {
    try {
        if (req.body.password === req.body.confirmpassword) {
            const hashedpassword = await bcrypt.hash(req.body.password, 10);
            const userdetail = new userModel({
                username: req.body.username,
                email: req.body.email,
                password: hashedpassword,
                confirmpassword: hashedpassword,
                course: req.body.course,
            });
            const result =await userModel.find({email:userdetail.email }); 
            if (result.length > 0) {
                res.redirect('/:user_with_provided_E-mail_already_exists');
            }
            else {
                const token = await userdetail.generateAuthToken();
                const user=await userdetail.save();
                res.cookie('jwt', token, {
                    expires: new Date(Date.now() + 3600000), //cookie expires in 1 hr.
                    httponly: true
                });
                const data=[];
                res.render('profile',{user,data});
            }
        } 
        else {
            res.stats(401).redirect('/:Password_confirm-password_do_not_match');
        }

    } catch (err) {
        console.log("----------------------\nError Register User = ", err);
    }
}

const login = async (req, res) => {
    try {
        const result = await userModel.findOne({ email: req.body.email });
        const ismatch = await bcrypt.compare(req.body.password, result.password); 
        if (ismatch) {
            const token = await result.generateAuthToken();
            res.cookie('jwt', token, {
                expires: new Date(Date.now() + 3600000),
                httponly: true
            });
            var data= await questionModel.find({_id:result.questionposted});
            res.render('profile',{user:result,data})
        }
        else {
            res.redirect('/');
        }
    } catch (err) {
        if (err) {
            console.log("\n---------------------------Error Login", err);
            res.redirect('/');
        }
    }
} 

const addanswer= async (req,res)=>{
    try{
        const questionId = req.params.queid.slice(1);
        var question = await questionModel.findById({_id:questionId});
        res.render('addanswer',{question});
    }catch(err){
        console.log("\n-------------------error  = ",err);
    }    
}

const profile=async (req,res)=>{
    try{
        var user=req.user;
        var data=await questionModel.find({_id:user.questionposted}).sort({timeadded:-1});
        res.render('profile',{user,data});
    }catch(err){
        console.log("\n--------------------Error Profile ",err);
    }
}

const getanswer=async (req,res)=>{
    try {
        const questionId = req.params.queid.slice(1);
        const result = await answerModel.find({question: questionId });
        if(result.length==1)                                   //after receiving qid i have to find that qid in answer.question collection and return matched result
        {    
            const question=await questionModel.find({_id:questionId});  
            res.render('profileanswer',{question:question[0],result:result[0]});
        }
        else{
            const question=await questionModel.find({_id:questionId});
            res.render('profileanswer',{question:question[0],result:false});
        }
    }catch(err){
        console.log("\n--------------Error while finding answer",err);
    }  
}

const postquestion=(req,res)=>{
    res.render('postquestion');
}

const searchquestioninprofile= async (req,res)=>{
    try{
        const data = await questionModel.find({}).sort({timeadded:-1});
        res.status(200).render('searchquestion', { data });
    }catch(err)
    {
        console.log("\n-----------------------search question error = ",err);
        res.status(401).render('searchquestion',{data:[]});
    }
}

const logout=async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(element=>{
            return element.token !== req.token;
        })
        res.clearCookie('jwt');
        await req.user.save();
        res.redirect('/');
    }catch(err){
        console.log("logout error = ",err);
        res.status(500);
    }
}

const logoutall=async (req,res)=>{
    try{
        req.user.tokens=[];
        res.clearCookie('jwt');
        await req.user.save();
        res.redirect('/');
    }catch(err){
        console.log("All device logout error=",err)
        res.redirect('/');
    }
}

module.exports = {
    index, aboutus, savequestion, saveanswer, registeruser, login, findanswer ,searchquestion ,profile,
    getanswer , logout , logoutall ,postquestion , addanswer , searchquestioninprofile , findresult
}