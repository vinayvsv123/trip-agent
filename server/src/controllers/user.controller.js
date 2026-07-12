import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


export const register=async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        if(!username||!email||!password)
        {
             return res.status(400).json({"message":"all fields required"});
        }
        
        const existingUser=await User.findOne({ email });
        if(existingUser)
        {
            console.log("email already exists");
            return res.status(409).json({"message":"email already exists"});
        }

        const hashedpassword=await bcrypt.hash(password,10);
        const user=await User.create({
            username,
            email,
            password: hashedpassword
        });

        //console.log("regirtered succesfully");
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(201).json({
            message: "Registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    }
    catch(error)
    {
        console.log("couldnt register",error);
        return res.status(500).json({"message":" Registartionfailed"});
    }

};

export const login=async(req,res)=>{
        try{
            const {email,password}=req.body;
            if(!email||!password)
            {
                return res.status(400).send("required");

            }
            const userExists=await User.findOne({ email });
            if(!userExists)
            {
                return res.status(401).json({"message":"invalid email"});
            }

            const isMatch = await bcrypt.compare(
                password,
                userExists.password
            );
            if(!isMatch)
            {
                return res.status(401).json({"message":"password is incorrect"});
            }

            const token = jwt.sign(
                { id: userExists._id },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            return res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: userExists._id,
                    username: userExists.username,
                    email: userExists.email,
                },
            });


            
        }
        catch(error)
        {
            console.log("login failed",error);
            return res.status(500).send("login failed");
        }
    
}