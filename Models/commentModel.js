
import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema({
    Destination:{
      type: String,
      required: true,
    },
    message: { 
      type: String, 
      required: true,
    },
    user: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const Comment = mongoose.model('Comment', commentSchema);
  export default Comment;