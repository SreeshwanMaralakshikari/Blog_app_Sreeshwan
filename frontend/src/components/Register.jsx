import {
  divider, errorClass, formCard, formGroup, formTitle,
  inputClass, labelClass, pageBackground, submitBtn, mutedText, loadingClass
} from "../styles/common";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import axiosInstance from "../axiosInstance"; // ✅ Removed unused axios import

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const onUserRegister = async (userObj) => {
    const { profileImageUrl } = userObj;
    const formData = new FormData();
    formData.append("firstName", userObj.firstName);
    if (userObj.lastName) formData.append("lastName", userObj.lastName);
    formData.append("email", userObj.email);
    formData.append("password", userObj.password);
    formData.append("role", userObj.role);
    if (profileImageUrl?.[0]) formData.append("profileImageUrl", profileImageUrl[0]);

    try {
      setLoading(true);
      let res = await axiosInstance.post("/auth/users", formData);
      if (res.status === 201) navigate("/login");
    } catch (err) {
      setApiError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className={loadingClass}>Registering...</p>;

  return (
    <div className={`${pageBackground} flex items-center justify-center py-16 px-4`}>
      <div className={formCard}>
        <h2 className={formTitle}>Create an Account</h2>
        {apiError && <p className={errorClass}>{apiError}</p>}

        <form onSubmit={handleSubmit(onUserRegister)}>
          <div className="mb-5">
            <p className={labelClass}>Register as</p>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="USER" {...register("role", { required: "Please select a role" })} className="accent-blue-600 w-4 h-4" />
                <span className="text-sm">User</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="AUTHOR" {...register("role", { required: "Please select a role" })} className="accent-blue-600 w-4 h-4" />
                <span className="text-sm">Author</span>
              </label>
            </div>
            {errors.role && <p className={errorClass}>{errors.role.message}</p>}
          </div>

          <div className={divider} />

          <div className="sm:flex gap-4 mb-4">
            <div className="flex-1">
              <label className={labelClass}>First Name</label>
              <input type="text" className={inputClass} placeholder="First name"
                {...register("firstName", { required: "First name is required", minLength: { value: 2, message: "At least 2 characters" }, maxLength: { value: 30, message: "Max 30 characters" }, validate: (v) => v.trim().length > 0 || "Cannot be empty" })} />
              {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
            </div>
            <div className="flex-1">
              <label className={labelClass}>Last Name</label>
              <input type="text" className={inputClass} placeholder="Last name"
                {...register("lastName", { maxLength: { value: 30, message: "Max 30 characters" } })} />
              {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div className={formGroup}>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} placeholder="you@example.com"
              {...register("email", { required: "Email is required" })} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          <div className={formGroup}>
            <label className={labelClass}>Password</label>
            <input type="password" className={inputClass} placeholder="Min. 8 characters"
              {...register("password", { required: "Password is required" })} />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>

          <div className={formGroup}>
            <label className={labelClass}>Profile Image</label>
            <input type="file" className={inputClass} accept="image/png, image/jpeg"
              {...register("profileImageUrl", {
                validate: {
                  fileType: (files) => !files?.[0] || ["image/png", "image/jpeg"].includes(files[0].type) || "Only JPEG or PNG allowed",
                  fileSize: (files) => !files?.[0] || files[0].size <= 2 * 1024 * 1024 || "Max size is 2MB",
                }
              })}
              onChange={(e) => { const f = e.target.files[0]; if (f) setPreview(URL.createObjectURL(f)); }}
            />
            {errors.profileImageUrl && <p className={errorClass}>{errors.profileImageUrl.message}</p>}
            {preview && <img src={preview} alt="" className="w-24 mt-2" />}
          </div>

          <button type="submit" className={submitBtn}>Create Account</button>
        </form>

        <p className={`${mutedText} text-center mt-5`}>
          Already have an account?{" "}
          <NavLink to="/login" className="text-[#0066cc] font-medium">Sign in</NavLink>
        </p>
      </div>
    </div>
  );
}

export default Register;