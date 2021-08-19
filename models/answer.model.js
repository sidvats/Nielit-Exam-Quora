const mongoose=require('mongoose');
const schema=mongoose.Schema;
const answerSchema=new schema({
    question:
    {
        type:String,
        ref:'question',
        unique:true
    },
    answers:
    [
        {
            answer: 
                {
                   type:[String] 
                },
            votes:
                {
                    type:String,
                    default:1
                }
        }
    ],
    timeadded:{
        type:Date,
        default:Date.now()
    }
});
module.exports=mongoose.model('answer',answerSchema);
