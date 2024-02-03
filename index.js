import express from 'express';
import { dbConnection } from './utils/db.js';
import bodyParser from 'body-parser';
import cors from 'cors'
import dotevn from 'dotenv'
import authRoute from './Routes/AuthRoute.js';
import commentRoute from './Routes/CommentRoute.js'
import LikedRoute from './Routes/LikedRoute.js';
 
const app=express();
app.use(cors());
dotevn.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

dbConnection()
app.use('/auth',authRoute);

app.use('/comment',commentRoute);

app.use('/destination',LikedRoute);



app.get('/',(req,res)=>{
    res.send("all set");
})
 
const port=process.env.PORT;
app.listen(port,()=>{
    console.log(`App is listing on port ${port}`)
})