const mongoose=require('mongoose');
const schema=mongoose.Schema;
const questionSchema=new schema({
    question:
    {
        type:[String],
        required:true,
        unique:true
    },
    keywords:[
        {
            type:String,
            required:true,
            min:['1','Minimum 1 keyword is required'],
            trim:true
        }
    ],
    subject:{
        type:String,
        required:true
    },
    questiontype:
    {
        type:String,
        required:true
    },
    askedin:
    {
        exam:{type:String},
        year:{type:Number}
    },
    answers:
    [
        {
            type:String,
            ref:'answer'
        }
    ],
    timeadded:{
        type:Date,
        default:Date.now()
    }
});
module.exports=mongoose.model('question',questionSchema);