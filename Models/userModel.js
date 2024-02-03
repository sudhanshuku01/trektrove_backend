import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  profilePicture: { 
    type:{
      data: Buffer,
      contentType: String,
    },
    default:{}
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true, 
  },
  confirmPassword: {
    type: String,
  },
  verficationToken: {
    type: String,
    default:"",
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role:{
  type:Number,
  default:0
  },
  LikedPlaces: {
    type: [String],
    default: [],    
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }, 
});

const User = mongoose.model('User', userSchema);

export default User;
