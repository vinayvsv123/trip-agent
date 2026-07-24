import {createTrip,getTrips,getTripById ,deleteTrip} from "../controllers/trip.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router =Router();

router.post("/createTrip",authMiddleware,createTrip);
router.get("/getTrips",authMiddleware,getTrips);
router.get("/getTrip/:id",authMiddleware,getTripById);
router.delete("/deleteTrip/:id",authMiddleware,deleteTrip);

export default router;