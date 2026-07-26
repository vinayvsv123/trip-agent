import {createTrip,getTrips,getTripById ,deleteTrip,generateItinerary} from "../controllers/trip.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router =Router();

router.post("/createTrip",authMiddleware,createTrip);
router.get("/getTrips",authMiddleware,getTrips);
router.get("/getTrip/:id",authMiddleware,getTripById);
router.delete("/deleteTrip/:id",authMiddleware,deleteTrip);
router.post("/generate-itinerary/:id",authMiddleware,generateItinerary);

export default router;