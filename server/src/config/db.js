import mongoose  from "mongoose";

const connectDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("mongo DB connected");
    }
    catch(error)
    {
        console.log("failed to connect",error);
       // console.error(error);
        process.exit(1);
    }
};

export default connectDB;