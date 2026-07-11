import mongoose from "mongoose";

const tripSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    
    },

    source:{
        type:String,
        required:true,
    },

    destination:{
        type:String,
        required:true,
    },

    startDate:{
        type:Date,
        required:true,

    },
    endDate:{
        type:Date,
        required:true,
    },

    totalDays:{
        type:Number,
        required:true,
        min:1,

    },

    budget:{
        type:Number,
        required:true,
        min:0,

    },

    travellers:{
        type:Number,
        required:true,

    },

    interests:{
        type:[String],
        required:true,
        

    },

},{
    timestamps:true,
});

const Trip=mongoose.model('Trip',tripSchema);
export default Trip;