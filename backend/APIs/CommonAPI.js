import exp from "express";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import { UserModel } from "../models/UserModel.js";
import { hash, compare } from "bcryptjs";
import { config } from "dotenv";
import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";

export const commonApp = exp.Router();
const { sign } = jwt;
config();

//Route for register
commonApp.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
  let cloudinaryResult;
  try {
    let allowedRoles = ["USER", "AUTHOR"];
    const newUser = req.body;
    console.log(newUser);
    console.log(req.file);

    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (req.file) {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    }

    newUser.profileImageUrl = cloudinaryResult?.secure_url;

    if (!newUser.password || newUser.password.trim().length === 0) {
      return res.status(400).json({ message: "Password cannot be empty or spaces only" });
    }

    newUser.password = await hash(newUser.password, 12);
    const newUserDoc = new UserModel(newUser);
    await newUserDoc.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.log("err is ", err);
    if (cloudinaryResult?.public_id) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }
    next(err);
  }
});

//Route for Login
commonApp.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email: email });

  if (!user) {
    return res.status(400).json({ message: "Invalid Email" });
  }

  const isMatched = await compare(password, user.password);

  if (!isMatched) {
    return res.status(400).json({ message: "Invalid Password" });
  }

  const signedToken = sign(
    {
      id: user._id,
      email: email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    process.env.SECRET_KEY,
    { expiresIn: "6h" }
  );

  const userObj = user.toObject();
  delete userObj.password;

  // ✅ Send token in response body instead of cookie
  res.status(200).json({ message: "Login Success", payload: userObj, token: signedToken });
});

//Route for Logout
commonApp.get("/logout", (req, res) => {
  // ✅ No cookie to clear — frontend handles localStorage
  res.status(200).json({ message: "Logout Success" });
});

//Page Refresh
commonApp.get("/check-auth", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res) => {
  res.status(200).json({
    message: "authenticated",
    payload: req.user,
  });
});

//Change Password
commonApp.put("/password", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: "Current Password and New Password are same in your request" });
  }

  const userIdOfToken = req.user?.id;
  const userDocument = await UserModel.findById(userIdOfToken);

  const isMatched = await compare(currentPassword, userDocument.password);
  if (!isMatched) {
    return res.status(403).json({ message: "Your password is incorrect. Please Enter Again" });
  }

  if (!newPassword || newPassword.trim().length === 0) {
    return res.status(400).json({ message: "Password cannot be empty or spaces only" });
  }

  const hashedPassword = await hash(newPassword, 12);
  userDocument.password = hashedPassword;
  await userDocument.save();
  res.status(201).json({ message: "User Password is successfully changed" });
});