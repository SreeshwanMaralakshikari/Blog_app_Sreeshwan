import exp from 'express';
import {UserModel} from '../models/UserModel.js';
import {ArticleModel} from '../models/ArticleModel.js';
import { verifyToken } from '../middlewares/verifyToken.js';

export const authorApp=exp.Router();

//Write Article (protected route)
authorApp.post("/articles",verifyToken("AUTHOR"),async(req,res)=>{
    //get articleObj from client
    const articleObj=req.body;

    //req user
    const user=req.user;

    //check author
    let author=await UserModel.findById(articleObj.author);

    //check if the author exist
    if(!author)
    {
        return res.status(404).json({message:"Invalid Author"})
    }
    //
    if(author.email!=user.email)
    {
        return res.status(404).json({message:"You are not the authorized author"})
    }
    //create article document
    const articleDoc=new ArticleModel(articleObj);

    //save the article document
    await articleDoc.save();

    //send res to author
    res.status(201).json({message:"Article Created Successfully"})
})

//Read own Articles
authorApp.get("/articles",verifyToken("AUTHOR"),async(req,res)=>{
  //get email from decoded token
  const authorIdOfToken=req.user?.id;
  //get articles by author id
  const articlesList=await ArticleModel.find({author:authorIdOfToken})
  res.status(200).json({message:"article",payload:articlesList})
})

//Update an Article
authorApp.put("/article",verifyToken("AUTHOR"),async(req,res)=>{
    /*get articleObj from req
    const {articleId,...articleObj}=req.body;
    const oriArticle=req.body;

    //find article by Id and Update it
    const updatedArticle=await ArticleModel.findByIdAndUpdate(articleObj.articleId,{articleObj},{new:true});
    //send res
    res.json({message:"Updated Success",payload:updatedArticle})*/

    //get author if from decoded token
    const authorIdOfToken=req.user?.id;
    //get modified article from client
    const {articleId,title,category,content}=req.body; //{articleId,tile,category,content}
    //find article by id and update
    const modifiedArticle= await ArticleModel.findOneAndUpdate(
        {_id:articleId,author:authorIdOfToken},
        {$set:{title,category,content}},
        {new:true});
    if(!modifiedArticle)
    {
        return res.status(403).json({message:"Not Authorized to edit article"})
    }
    //send res
    res.status(200).json({message:"Article is updated",payload:modifiedArticle})
})


//Delete or Replace an article temperoraily(soft delete)
authorApp.patch("/article",verifyToken("AUTHOR"),async(req,res)=>{
    //get author if from decoded token
    const authorIdOfToken=req.user?.id;
    //get modified article from client
    const {articleId,isArticleActive}=req.body;
    //get article by id
    const articleOfDb = await ArticleModel.findOne({_id: articleId,author: authorIdOfToken})

    //check if article found
    if(!articleOfDb){
        return res.status(404).json({message:"Article not found"})
    }
    //check status
    if(isArticleActive===articleOfDb.isArticleActive){
        return res.status(200).json({message:"Article already in the same state"})
    }

    articleOfDb.isArticleActive=isArticleActive;
    await articleOfDb.save();
    //send res
    res.status(200).json({message:"Article Modified",payload:articleOfDb})
})