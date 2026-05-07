import {Schema,model,Types} from 'mongoose';

//Create User Schema
const userSchema=new Schema({
    firstName:{
        type: String,
        required:[true,"First Name is required"]
    },
    lastName:{
        type: String
    },
    email:{
        type: String,
        required:[true,"Email is Required"],
        unique:[true,"Email already exists"]
    },
    password:{
        type: String,
        required:[true,"Password is Required"]
        //Apply Regular Expressions
    },
    role:{
        type: String,
        enum:["USER","AUTHOR","ADMIN"],
        required:[true,"{Value} is an invalid role"]
    },
    profileImageUrl:{
        type:String
    },
    isUserActive:{
        type:Boolean,
        default:true
    }
},
{
    timeStamps:true,
    versionKey:false,
    strict:"throw"  //By default strict is true
});

//Create User Model
export const UserModel=model("user",userSchema);