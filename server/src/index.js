import connectDB from "./config/db.js";
import dotenv from "dotenv";
import app from "./app.js";


dotenv.config();

try {
   
    await connectDB();
    
    app.listen(process.env.PORT, () => {
        console.log(`Server started on port ${process.env.PORT}`);
    });
} catch (error) {
    console.log(error);
}