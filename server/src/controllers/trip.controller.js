import Trip from "../models/trip.models.js";


//create trip
export const createTrip=async(req,res)=>{
    try{
        const { source,destination,startDate,endDate,totalDays,budgest,travellers,interests }=req.body;
        
        
       if(!source || !destination || !startDate || !endDate || !totalDays || !budgest || !travellers || !interests){
            return res.status(400).json({"message":"All fields are required"});
        }
        const newTrip=await Trip.create({
            user:req.user._id,
            source,
            destination,
            startDate,
            endDate,
            totalDays,
            budgest,
            travellers,
            interests
            
        });
        return res.status(201).json({"message":"trip created successfully",newTrip});
    }
    catch(error){
        console.log("couldnt create trip",error);
        return res.status(500).json({"message":"trip creation failed"});
    }
}

//get all trips

export const getTrips=async(req,res)=>{
    try{
        const user=req.user._id;
        const allTrips=await Trip.find({user});
        if(allTrips.length===0){
            return res.status(404).json({"message":"no trips found"});
        }
        return res.status(200).json({"message":"trips found",allTrips});
    }
    catch(error){
        console.log("couldnt fetch trips",error);
        return res.status(500).json({"message":"failed to fetch trips"});
    }
}

//get trip by id
export const gettripById=async(req,res)=>{
    try{
        const id=req.params.id;
        const trip=await Trip.findById(id);
        if(!trip){
            return res.status(404).json({"message":"trip not found"});
        }
        return 
        res.status(200).json({"message":"trip found",trip});
    }
    catch(error){
        console.log("couldnt fetch trip",error);
        return res.status(500).json({"message":"failed to fetch trip"});
    }
}


//deleteTrip
export const deleteTrip=async(req,res)=>{
    try{
        const id=req.params.id;
        const trip=await Trip.findById(id);
        if(!trip){
            return res.status(404).json({"message":"trip not found"});
        }
        if(trip.user.toString()!==req.user._id.toString()){
            return res.status(403).json({"message":"unauthorized to delete this trip"});
        }
        
        await Trip.findByIdAndDelete(id);
        return res.status(200).json({"message":"trip deleted successfully"});
    }
    catch(error){
        console.log("couldnt delete trip",error);
        return res.status(500).json({"message":"failed to delete trip"});
    }
}
