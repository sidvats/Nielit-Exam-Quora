require('dotenv').config();
const express=require('express');
const app=express();
const port=process.env.PORT || 4000;
const routes=require('./app.routing');
const mongoose=require('mongoose');
const bodyparser=require('body-parser');
const cookieparser=require('cookie-parser');

//mongodb connection
mongoose.connect(process.env.DB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify: false
}).then(()=>{
    console.log("DB Connected");
}).catch((err)=>{
    console.log("\n--------------------------------Error in Connecting to database : ERROR :: ",err);
});


//middlewares
app.use(bodyparser.json());
app.use(cookieparser());
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(routes);

//404
app.use((req,res)=>{
    res.status(404).render('404');
});

//server
app.listen(port,(err)=>{
    if(err) throw err;
})