import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import axiosInstance from "../axiosInstance"; // ✅ Removed unused axios import
import {
  formCard, formTitle, formGroup, labelClass,
  inputClass, submitBtn, errorClass, loadingClass,
} from "../styles/common";
import { useAuth } from "../store/authStore";

function WriteArticles() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const currentUser = useAuth((state) => state.currentUser);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const submitArticle = async (articleObj) => {
    if (!currentUser?._id) {
      console.error("User not available");
      return;
    }
    articleObj.author = currentUser._id;
    try {
      setLoading(true);
      let res = await axiosInstance.post("/author-api/articles", articleObj);
      if (res.status === 201) {
        toast.success("Article Successfully Published");
        navigate("../articles");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={formCard}>
      <h2 className={formTitle}>Write New Article</h2>
      <form onSubmit={handleSubmit(submitArticle)}>
        <div className={formGroup}>
          <label className={labelClass}>Title</label>
          <input type="text" className={inputClass} placeholder="Enter article title"
            {...register("title", { required: "Title is required", minLength: { value: 5, message: "Title must be at least 5 characters" } })} />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>
        <div className={formGroup}>
          <label className={labelClass}>Category</label>
          <select className={inputClass} {...register("category", { required: "Category is required" })}>
            <option value="">Select category</option>
            <option value="technology">Technology</option>
            <option value="programming">Programming</option>
            <option value="ai">AI</option>
            <option value="web-development">Web Development</option>
          </select>
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>
        <div className={formGroup}>
          <label className={labelClass}>Content</label>
          <textarea rows="8" className={inputClass} placeholder="Write your article content..."
            {...register("content", { required: "Content is required", minLength: { value: 50, message: "Content must be at least 50 characters" } })} />
          {errors.content && <p className={errorClass}>{errors.content.message}</p>}
        </div>
        <button className={submitBtn} type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish Article"}
        </button>
        {loading && <p className={loadingClass}>Publishing article...</p>}
      </form>
    </div>
  );
}

export default WriteArticles;