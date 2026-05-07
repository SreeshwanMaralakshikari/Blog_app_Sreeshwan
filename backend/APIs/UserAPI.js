import exp from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { ArticleModel } from '../models/ArticleModel.js';

export const userApp=exp.Router();

//Read Articles of all authors
userApp.get("/articles",verifyToken("USER"),async(req,res)=>{
    //read articles
    const articlesList=await ArticleModel.find({isArticleActive: true}).populate("comments.user");
    //send res
    res.status(200).json({message:"All Articles",payload:articlesList})

})

//Add comment to an article
userApp.put("/article",verifyToken("USER"),async(req,res)=>{
    //get body from req
    const {articleId,comment}=req.body;

    //check article
    const articleDocument=await ArticleModel.findOne({_id:articleId,isArticleActive: true}).populate("comments.user");
    
    //if article not found
    if(!articleDocument){
        return res.status(404).json({message:"Article not found"})
    }
    //get user id from the Token
    const userIdOfToken=req.user?.id;

    //add comment to comments array of article document
    articleDocument.comments.push({user:userIdOfToken,comment:comment})

    //save
    await articleDocument.save();

    const updatedArticle = await ArticleModel.findById(articleId).populate("comments.user");

    //send res
    res.status(200).json({message:"Comment added successfully", payload:updatedArticle})
})


