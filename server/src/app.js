import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

const app=express();
app.use(express.json());
app.use(cors());


app.get('/',(req,res)=>{
    console.log("server started");
    res.send("server started");
});

app.use("/api/users", userRoutes);

export default app;