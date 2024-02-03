import express from "express";
import fs from "fs";
import formidable from "express-formidable";
import dotenv from "dotenv";
import path from "path"; 
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../Models/userModel.js";
import { hashPassword, comparePassword } from "../Helper/authHelper.js";
import sendMail from "../utils/Nodemailer.js";
import { requireSignIn } from "../Middleware/Middleware.js";
const __dirname = path.resolve();
dotenv.config();
const Router = express.Router();

Router.post("/signup", formidable(), async (req, res) => {
  try {
    const { username, firstName, lastName, email, password, confirmPassword } =
      req.fields;
    const profilePicture = req.files.profilePicture;
    switch (true) {
      case !username:
        return res.status(400).json({
          success: false,
          message: "Username is Required",
        });
      case !firstName:
        return res.status(400).json({
          success: false,
          message: "First Name is Required",
        });
      case !lastName:
        return res.status(400).json({
          success: false,
          message: "Last Name is Required",
        });
      case !email:
        return res.status(400).send({
          success: false,
          message: "Email is Required",
        });
      case !password:
        return res.status(400).json({
          success: false,
          message: "Password is Required",
        });
      case !confirmPassword:
        return res.status(400).json({
          success: false,
          message: "Confirm Password is required",
        });
      case !profilePicture:
        return res.status(400).json({
          success: false,
          message: "ProfilePicture is required",
        });
      case profilePicture && profilePicture > 5000000:
        return res.status(500).json({
          success: false,
          message: "Picture is Required and should be less then 5 MB",
        });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm do not match",
      });
    }

    // Check if the user already exists with the provided email
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "User exist with this email",
      });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "User exist with this userName",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      confirmPassword: undefined,
    });

    if (profilePicture) {
      newUser.profilePicture.data = fs.readFileSync(profilePicture.path);
      newUser.profilePicture.contentType = profilePicture.type;
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");

    if (verificationToken) {
      newUser.verficationToken = verificationToken;
    }

    await sendMail(email, verificationToken);
    const savedUser = await newUser.save();
    console.log(savedUser.profilePicture.data);
    res.status(201).json({
      success: true,
      message: "User created successfully and Verify Email for Login",
      user: savedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong try after sometime",
    });
  }
});

Router.post("/login", async (req, res) => {
  try {
    const { emailorUsername, password } = req.body;
    console.log(req.body);
    if (!emailorUsername) {
      return res.status(400).json({
        success: false,
        message: "Email is Required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is Required",
      });
    }

    const user = await User.findOne({
      $or: [{ email: emailorUsername }, { username: emailorUsername }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    if (!user.isVerified) {
      return res.status(500).json({
        success: false,
        message: "Verify you email before login",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

    const userdetails = {
      _id: user._id,
      userName: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userdetails,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

Router.get("/verify-email", async (req, res) => {
  const email = req.query.email;
  const verficationToken = req.query.verficationToken;
  try {
    if (!email || !verficationToken) {
      return res
        .status(500)
        .sendFile(
          path.join(__dirname, "ResponseFile", "verification-error.html")
        );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(500)
        .sendFile(
          path.join(__dirname, "ResponseFile", "verification-error.html")
        );
    }
    if (user.isVerified === true) {
      return res
        .status(200)
        .sendFile(
          path.join(__dirname, "ResponseFile", "verification-successful.html")
        );
    }

    if (verficationToken !== user.verficationToken) {
      return res
        .status(500)
        .sendFile(
          path.join(__dirname, "ResponseFile", "verification-error.html")
        );
    }

    user.isVerified = true;
    user.verficationToken = undefined;
    await user.save();
    return res
      .status(200)
      .sendFile(
        path.join(__dirname, "ResponseFile", "verification-successful.html")
      );
  } catch (error) {
    return res
      .status(500)
      .sendFile(
        path.join(__dirname, "ResponseFile", "verification-error.html")
      );
  }
});

Router.get("/user-picture/:userid", async (req, res) => {
  try {
    const user = await User.findById(req.params.userid).select(
      "profilePicture"
    );
    if (user.profilePicture.data) {
      res.set("Content-type", user.profilePicture.contentType);
      return res.status(200).send(user.profilePicture.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
    });
  }
});

Router.post("/email-check", async (req, res) => {
  const { emailorUsername } = req.body;
  if (!emailorUsername) {
    return res.status(400).json({
      success: false,
      message: "Email of userName is required",
    });
  }
  try {
    const user = await User.findOne({
      $or: [{ email: emailorUsername }, { username: emailorUsername }],
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect userName or email",
      });
    }
    return res.status(200).json({
      success: true,
      message: "user found successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      messsage: "Something went wrong",
    });
  }
});

Router.post("/update-password", async (req, res) => {
  const { emailorUsername, password, confirmPassword } = req.body;
  if (!emailorUsername || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields is required",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "password do not match",
    });
  }
  try {
    const hashedPassword = await hashPassword(password);
    const updatedUser = await User.findOneAndUpdate(
      { $or: [{ email: emailorUsername }, { username: emailorUsername }] },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "something went wrong",
    });
  }
});
export default Router;
