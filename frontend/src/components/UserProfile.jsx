import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router";
import axiosInstance from "../axiosInstance"; // ✅ Removed unused axios import
import { useEffect, useState } from "react";
import {
  articleGrid, articleCardClass, articleTitle,
  ghostBtn, loadingClass, errorClass, timestampClass,
} from "../styles/common.js";

function UserProfile() {
  const logout = useAuth((state) => state.logout);
  const currentUser = useAuth((state) => state.currentUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const getArticles = async () => {
      setLoading(true);
      try {
        let res = await axiosInstance.get("/user-api/articles");
        if (res.status === 200) setArticles(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    getArticles();
  }, []);

  const formatDateIST = (date) => new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
  });

  const onLogout = async () => { await logout(); navigate("/login"); };

  const navigateToArticleByID = (articleObj) => {
    navigate(`/article/${articleObj._id}`, { state: articleObj });
  };

  if (loading) return <p className={loadingClass}>Loading articles...</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {error && <p className={errorClass}>{error}</p>}

      <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentUser?.profileImageUrl ? (
            <img src={currentUser.profileImageUrl} className="w-16 h-16 rounded-full object-cover border" alt="profile" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-xl font-semibold">
              {currentUser?.firstName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm text-[#6e6e73]">Welcome back</p>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">{currentUser?.firstName}</h2>
          </div>
        </div>
        <button className="bg-[#ff3b30] text-white text-sm px-5 py-2 rounded-full hover:bg-[#d62c23] transition" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Latest Articles</h3>
        {articles.length === 0 ? (
          <p className="text-[#a1a1a6] text-sm text-center py-10">No articles available yet</p>
        ) : (
          <div className={articleGrid}>
            {articles.map((articleObj) => (
              <div className={articleCardClass} key={articleObj._id}>
                <div className="flex flex-col h-full">
                  <div>
                    <p className={articleTitle}>{articleObj.title}</p>
                    <p className="text-sm text-[#6e6e73] mt-1">{articleObj.content.slice(0, 80)}...</p>
                    <p className={`${timestampClass} mt-2`}>{formatDateIST(articleObj.createdAt)}</p>
                  </div>
                  <button className={`${ghostBtn} mt-auto pt-4`} onClick={() => navigateToArticleByID(articleObj)}>
                    Read Article →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;