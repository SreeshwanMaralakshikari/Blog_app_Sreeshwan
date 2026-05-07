import exp from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { UserModel } from '../models/UserModel.js';
import { ArticleModel } from '../models/ArticleModel.js';

export const adminApp=exp.Router();

//Protected Admin Route to get All Users
adminApp.get("/users",verifyToken("ADMIN"),async(req,res)=>{
    //read all users
    const userList=await UserModel.find();
    //send res
    res.status(200).json({message: "All Users",payload: userList})
})

adminApp.patch("/users/deactivate",verifyToken("ADMIN"),async(req,res)=>{
    //get user id from the body
    const {userId,isUserActive}=req.body;

    //get user by id
    const userOfDb=await UserModel.findOne({_id: userId});

    //check if user found
    if(!userOfDb)
    {
        //Return user not found
        return res.status(404).json({message:"User not Found"})
    }

    //check status
    if(isUserActive===userOfDb.isUserActive){
        return res.status(200).json({message:"User already in the same state"})
    }
    //Update isUserActive property to false
    userOfDb.isUserActive=isUserActive;
    await userOfDb.save();

    //send res
    res.status(200).json({message:"User is Deactivated",payload:userOfDb})
})


adminApp.patch("/users/activate",verifyToken("ADMIN"),async(req,res)=>{
    //get user id from the body
    const {userId,isUserActive}=req.body;

    //get user by id
    const userOfDb=await UserModel.findOne({_id: userId});

    //check if user found
    if(!userOfDb)
    {
        //Return user not found
        return res.status(404).json({message:"User not Found"})
    }

    //check status
    if(isUserActive===userOfDb.isUserActive){
        return res.status(200).json({message:"User already in the same state"})
    }

    //Update isUserActive property to true
    userOfDb.isUserActive=isUserActive;
    await userOfDb.save();

    //send res
    res.status(200).json({message:"User is Activated",payload:userOfDb})
})