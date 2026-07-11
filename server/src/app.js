import express from "express";
import cors from "cors";

const app=express();
app.use(express.json());
app.use(cors);


app.get('/',(req,res)=>{
    console.log("server started");
    res.send("server started");
});

export default app;