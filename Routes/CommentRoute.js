import express from 'express';
import* as dotenv from 'dotenv';
import User from '../Models/userModel.js';
import Comment from '../Models/commentModel.js';
import {requireSignIn} from '../Middleware/Middleware.js';
dotenv.config();

const Router = express.Router();

Router.post('/post-comment', requireSignIn, async (req, res) => {
  try {
    const userId = req.user.id;
    const {message, Destination} = req.body;
    if (!Destination) {
      return res.status(400).json({
        success:false,
        message: 'Destination is required'
      });
    }
    if (!message) {
      return res.status(400).json({
        success:false,
        message: 'Message is required'
      });
    }
    if(!userId){
      return res.status(400).json({
        success:false,
        message: 'SignIn required'
      });
    }
    console.log(userId)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success:false,
        error: "Don't be smart illegal work!"
      });
    }

    const newComment = new Comment({
      Destination: Destination,
      message: message,
      user: userId,
    });

    await newComment.save();

    return res.status(201).json({
      success: true,
      message:"Comment added successfully",
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      success:false,
      message: 'Something went wrong'
    });
  }
}); 

Router.post('/get-comments',async (req,res)=>{
  const {Destination}=req.body;
  try {
    if (!Destination) {
      return res.status(400).json({
        success:false,
        message:"Destination name is required!"
      }) 
    }
    const commentsWithDestination = await Comment.find({ Destination: Destination })
    .sort({ createdAt: 'desc' })
    .populate({
      path: 'user',
      select: ['-profilePicture','-password']
    });

    return res.status(201).json({
      success:true,
      comments:commentsWithDestination
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success:false,
      message:"Destination name is required!"
    }) 
  }
})

Router.delete('/delete-comment/:commentId',requireSignIn,async (req,res)=>{
    const {commentId}=req.params;
    if(!commentId){
      return res.status(400).json({
        success:false,
        message:"commentId required!"
      })
    }
   try {
    const deletedComment = await Comment.findOneAndDelete({ _id: commentId });
    if(deletedComment){
      return res.status(201).json({
        success:true,
        message:"Comment deleted"
      })
    }else{
      return res.status(201).json({
        success:true,
        message:"Comment not found or already deleted"
      })
    }
   } catch (error) {
     console.log(error);
     res.status(500).json({
      success:false,
      message:"Something went wrong!"
     })
   }
})

Router.put('/edit-comment',requireSignIn,async (req,res)=>{
  const {commentId,newMessage}=req.body;

  if(!commentId){
    return res.status(400).json({
      success:false,
      message:"commentId required!"
    })
  }

  if(!newMessage){
    return res.status(400).json({
      success:false,
      newMessage:"newMessage required!"
    })
  }
  try {
    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId },
      {
        $set: {
          message: newMessage,
          createdAt: new Date()
         }
      },
      { new: true }
    );

    if (updatedComment) { 
      res.status(200).json({
        success:true,
        message: 'Comment updated successfully',
        updatedComment });
    } else {
      res.status(404).json({ 
        success:false,
        message:'Comment not found or update failed'
       });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success:false,
      message:'Something went wrong!'
     });
  }
})

export default Router;
