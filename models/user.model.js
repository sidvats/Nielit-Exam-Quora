const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt=require("jsonwebtoken");

const userSchema = new schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmpassword: { type: String, required: true },
    course: { type: String },
    questionposted:
        [
            {
                type: String,
                ref: 'question'
            }
        ],
    answerposted: 
        [
            {
                type: String,
                ref: 'answer'
            }
        ],
    tokens: [
        {
            token:
            {
                type: String,
                required: true
            }
        }
    ],
    creationtime: { type: Date, default: Date.now() }

})

userSchema.methods.generateAuthToken=async function(){
    try{
        const token=jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(err){
       console.log("----------------------------------\n Error Generating token = ",err); 
    }
}

module.exports = mongoose.model('user', userSchema)