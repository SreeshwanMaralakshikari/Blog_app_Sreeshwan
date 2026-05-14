import exp from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { ArticleModel } from '../models/ArticleModel.js';

export const userApp = exp.Router();

// ✅ Populate author so firstName and lastName show correctly
userApp.get("/articles", verifyToken("USER"), async (req, res) => {
  const articlesList = await ArticleModel.find({ isArticleActive: true })
    .populate("author", "firstName lastName")
    .populate("comments.user");
  res.status(200).json({ message: "All Articles", payload: articlesList });
});

// Add comment to an article
userApp.put("/article", verifyToken("USER"), async (req, res) => {
  const { articleId, comment } = req.body;

  const articleDocument = await ArticleModel.findOne({
    _id: articleId,
    isArticleActive: true,
  }).populate("comments.user");

  if (!articleDocument) {
    return res.status(404).json({ message: "Article not found" });
  }

  const userIdOfToken = req.user?.id;
  articleDocument.comments.push({ user: userIdOfToken, comment: comment });
  await articleDocument.save();

  const updatedArticle = await ArticleModel.findById(articleId)
    .populate("author", "firstName lastName")
    .populate("comments.user");

  res.status(200).json({ message: "Comment added successfully", payload: updatedArticle });
});