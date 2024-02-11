import mongoose from "mongoose";
import * as dotevn from 'dotenv'
dotevn.config();

export async function dbConnection(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected Successfully")
      } catch (error) {
        console.log(error);
      }
}