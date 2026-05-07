import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../axiosInstance";
import {
  articleCardClass,
  articleMeta,
  articleTitle,
  ghostBtn,
  loadingClass,
  errorClass,
  emptyStateClass,
} from "../styles/common";

function ListOfUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try 
    {
      setLoading(true);
      let res=await axiosInstance.get("/admin-api/users");
      setUsers(res.data.payload);
    }

    catch (err) 
    {
      setError(err.response?.data?.error||"Failed to fetch users");
    } 

    finally 
    {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUser = async (user) => {
    const endpoint = user.isUserActive ? "deactivate" : "activate";

    await axiosInstance.patch(`/admin-api/users/${endpoint}`,{
        userId: user._id,
        isUserActive: !user.isUserActive,
      },{withCredentials: true}
    );
    fetchUsers();
  };

  if (loading) return <p className={loadingClass}>Loading users...</p>;
  if (error) return <p className={errorClass}>{error}</p>;

  if (users.length === 0) {
    return <div className={emptyStateClass}>No users found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {users.map((user) => (
        <div key={user._id} className={`${articleCardClass} flex flex-col`}>
            <p className={articleMeta}>{user.email}</p>
            <p className={articleTitle}>{user.firstName}</p>

            <span className={`text-xs font-medium mt-1 ${
                user.isUserActive ? "text-green-500" : "text-red-500"
                }`}>
            {user.isUserActive ? "ACTIVE" : "INACTIVE"}
            </span>

            <button
                className={`${ghostBtn} mt-auto pt-4`}
                onClick={() => toggleUser(user)}
            >
                {user.isUserActive ? "Deactivate" : "Activate"}
             </button>
        </div>
      ))}
    </div>
  );
}

export default ListOfUsers;