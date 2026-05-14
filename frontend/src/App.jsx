import axiosInstance from "../axiosInstance.js";
import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../store/authStore.js";
import { toast } from "react-hot-toast"; // ✅ Added missing import
import {
  articlePageWrapper, articleHeader, articleCategory, articleMainTitle,
  articleAuthorRow, authorInfo, articleContent, articleFooter,
  articleActions, editBtn, deleteBtn, loadingClass, errorClass,
  inputClass, commentsWrapper, commentCard, commentHeader,
  commentUserRow, avatar, commentUser, commentTime, commentText,
} from "../styles/common.js";
import { useForm } from "react-hook-form";

function ArticleByID() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const user = useAuth((state) => state.currentUser);

  const [article, setArticle] = useState(location.state || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (article) return;

    const getArticle = async () => {
      setLoading(true);
      try {
        // ✅ Fixed: correct route that exists in backend
        const res = await axiosInstance.get(`/user-api/articles`);
        const found = res.data.payload.find((a) => a._id === id);
        if (found) {
          setArticle(found);
        } else {
          setError("Article not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    getArticle();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const toggleArticleStatus = async () => {
    const newStatus = !article.isArticleActive;
    const confirmMsg = newStatus ? "Restore this article?" : "Delete this article?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axiosInstance.patch("/author-api/article", {
        articleId: article._id,
        isArticleActive: newStatus,
      });
      setArticle(res.data.payload);
      toast.success(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(msg || "Operation failed");
    }
  };

  const editArticle = (articleObj) => {
    navigate("/edit-article", { state: articleObj });
  };

  const addComment = async (commentObj) => {
    commentObj.articleId = article._id;
    try {
      let res = await axiosInstance.put("/user-api/article", commentObj);
      if (res.status === 200) {
        toast.success("Comment added!");
        setArticle(res.data.payload);
      }
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  if (loading) return <p className={loadingClass}>Loading article...</p>;
  if (error) return <p className={errorClass}>{error}</p>;
  if (!article) return null;

  return (
    <div className={articlePageWrapper}>
      <div className={articleHeader}>
        <span className={articleCategory}>{article.category}</span>
        <h1 className={`${articleMainTitle} uppercase`}>{article.title}</h1>
        <div className={articleAuthorRow}>
          <div className={authorInfo}>✍️ {article.author?.firstName || "Author"}</div>
          <div>{formatDate(article.createdAt)}</div>
        </div>
      </div>

      <div className={articleContent}>{article.content}</div>

      {user?.role === "AUTHOR" && (
        <div className={articleActions}>
          <button className={editBtn} onClick={() => editArticle(article)}>Edit</button>
          <button className={deleteBtn} onClick={toggleArticleStatus}>
            {article.isArticleActive ? "Delete" : "Restore"}
          </button>
        </div>
      )}

      {user?.role === "USER" && (
        <div className={articleActions}>
          <form onSubmit={handleSubmit(addComment)}>
            <input
              type="text"
              {...register("comment")}
              className={inputClass}
              placeholder="Write your comment here..."
            />
            <button type="submit" className="bg-amber-600 text-white px-5 py-2 rounded-2xl mt-5">
              Add comment
            </button>
          </form>
        </div>
      )}

      <div className={commentsWrapper}>
        {article.comments?.length === 0 && (
          <p className="text-[#a1a1a6] text-sm text-center">No comments yet</p>
        )}
        {article.comments?.map((commentObj, index) => {
          const name = commentObj.user?.email || "User";
          const firstLetter = name.charAt(0).toUpperCase();
          return (
            <div key={index} className={commentCard}>
              <div className={commentHeader}>
                <div className={commentUserRow}>
                  <div className={avatar}>{firstLetter}</div>
                  <div>
                    <p className={commentUser}>{name}</p>
                    <p className={commentTime}>{formatDate(commentObj.createdAt || new Date())}</p>
                  </div>
                </div>
              </div>
              <p className={commentText}>{commentObj.comment}</p>
            </div>
          );
        })}
      </div>

      <div className={articleFooter}>Last updated: {formatDate(article.updatedAt)}</div>
    </div>
  );
}

export default ArticleByID;