import connectDB from "./config/db.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

connectDB();

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
});
