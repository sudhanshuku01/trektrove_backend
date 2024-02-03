import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";

export const requireSignIn = async (req, res, next) => {
  try {
    if(!req.headers.authorization || req.headers.authorization.length < 2){
     return res.status(400).json({
        success:false,
        message:'Sign In required!'
      })
    }

    const decode = jwt.verify(
      req.headers.authorization,
      process.env.SECRET_KEY
    );
    req.user = decode;
    next();
  } catch (error) { 
    console.log("Login Error"+ error);
  }
};

//admin acceess
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};