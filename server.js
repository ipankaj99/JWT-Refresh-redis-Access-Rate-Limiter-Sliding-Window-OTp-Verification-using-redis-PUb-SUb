import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import redis from './Redis/redis.js';
import { publisher } from './Redis/redis.js';
import cors from 'cors';
import rateLimiter from './Redis/rateLimiter.js';
dotenv.config();
const app=express();

app.use(cors(
    {
        credentials:true
    }
));
app.use(express.json());
app.use(cookieParser());



app.use(rateLimiter);

app.post('/api/login', async(req, res)=>{
    const {email, password}=req.body;
    if(!email || !password)
    {
        return res.status(404).json({message:"All fields are required"});
    }

    const accessToken=jwt.sign(
        { email: email},
        process.env.MY_SECRET,
        {expiresIn: "15m"}
        
    )

    const refreshTokken=jwt.sign(
        { email: email},
        process.env.MY_SECRET,
        {expiresIn: "7d"}
        
    )
    await redis.set(`refresh:${email}`, refreshTokken);
    await redis.expire(`refresh:${email}`, 7*60*60*24);
    await publisher.publish("user:login", JSON.stringify({
  email
}));
    res.cookie("token", accessToken, {
        httpOnly: true,    
        secure: false,     
               sameSite: "lax",   
        maxAge: 15* 60 * 1000  
    });
    res.status(200).json({message:"User login successfully", accessToken});
})

app.post('/auth/send-otp', async(req, res)=>{
    const {email}=req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);

    await redis.set(
    `otp:${email}`,
    otp
  );
 await publisher.publish("otp:sent", JSON.stringify({ email, otp }));
  await redis.expire(`otp:${email}`, 300);
     res.status(200).json({
    message: "OTP sent successfully",
    otp: otp
  });
})

app.post('/auth/verify-otp', async(req, res)=>{
    const {email, otp}=req.body;
    const verifyOtp=await redis.get(
    `otp:${email}`
  );
   if(!verifyOtp )
   {
    return res.status(401).json({message:"Token is expired"});
   }
   if(verifyOtp.toString()!=otp)
   {
    return res.status(401).json({message:"Token is wrong"})
   }
   redis.del(`otp:${email}`);
   return res.status(201).json({message:"verified"})
})

app.post('/api/auth', async(req, res)=>{

   const {email}= req.body;
   
   //check refresh token
   const userEmail= await redis.get(`refresh:${email}`)
   const decoded=jwt.verify(userEmail, process.env.MY_SECRET);
   return res.status(200).json(
    {
        decoded
    }
   )

})


app.post('/api/logout', async(req, res)=>{
    const {email, password}=req.body;
    if(!email || !password)
    {
        return res.status(404).json({message:"All fields are required"});
    }


    await redis.del(`refresh:${email}`);
    publisher.publish("user:logout", JSON.stringify({ email}));
    res.status(200).json({message:"User logout successfully"});
})





app.listen(5000, ()=>{
    console.log("http://localhost:5000");
})