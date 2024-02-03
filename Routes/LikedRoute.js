import express from 'express';
import dotenv from 'dotenv'; 
import User from '../Models/userModel.js';
import {requireSignIn} from '../Middleware/Middleware.js';
dotenv.config();

const Router = express.Router();

Router.get('/get-liked-places', requireSignIn, async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({
      success: false,
      messsage: 'Sign In required',
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        messsage: "Don't be smart illegle work",
      });
    }

    return res.status(201).json({
      success: true,
      message:'Found Places successfully',
      LikedPlaces: user.LikedPlaces,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      messsage: 'Something went wrong',
    });
  }
});

Router.post('/like-place', requireSignIn, async (req, res) => {
  const {destination} = req.body;
  const userId = req.user.id;
  if (!destination) {
    return res.status(400).json({
      success: false,
      message: 'destination is required',
    });
  }
  console.log(userId)
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Sign In required',
    });
  }

  try {
    const user = await User.updateOne(
      {_id: userId},
      {$addToSet: {LikedPlaces: destination}, $set: {updatedAt: new Date()}},
      {new:true}
    );
    if(!user){
      return res.status(400).send({
        success:false,
        message:"Don't be smart"
      })
    }
    return res.status(201).send({
      success:true,
      message:"Place Added Successfully!"
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      success:false,
      message:"Something went wrong"
    })
  }
}); 

Router.post('/unlike-place', requireSignIn, async (req, res) => {
  const {destination} = req.body;
  const userId = req.user.id;
  if (!destination) {
    return res.status(400).json({
      success: false,
      message: 'destination is required',
    });
  }
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Sign In is required',
    });
  }
  try {

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { LikedPlaces: destination }, $set: { updatedAt: new Date() } },
      { new: true }
    );

    if(!user){
      return res.status(400).send({
        success:false,
        message:"Don't be smart"
      })
    }
    return res.status(201).send({
      success:true,
      message:"Place removed Successfully!"
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      success:false,
      message:"Something went wrong"
    })
  }
});

export default Router;
