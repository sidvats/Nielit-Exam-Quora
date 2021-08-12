const express=require('express');
const router=express.Router();
const controller=require('./controller/app.controller');
const auth=require('./middlewares/auth');

//routes
router.get('/',controller.index);
router.get('/about-us',controller.aboutus);
router.post('/savequestion',auth,controller.savequestion);
router.post('/saveanswer/:queid', auth ,controller.saveanswer);
router.post('/register',controller.registeruser);
router.post('/login',controller.login);
router.get('/answer/:queid',controller.findanswer);
router.post('/search',controller.searchquestion);
router.get('/searchquestion',auth,controller.searchquestioninprofile);
router.post('/searchquestioninprofile',auth,controller.findresult);
router.get('/profile', auth ,controller.profile);
router.get('/getanswer/:queid',controller.getanswer);
router.get('/postquestion',auth,controller.postquestion);
router.get('/addanswer/:queid',auth,controller.addanswer);
router.get('/logout',auth,controller.logout);
router.get('/logoutall',auth,controller.logoutall);
router.get('/livediscussion',auth,controller.livediscussion);

module.exports=router;