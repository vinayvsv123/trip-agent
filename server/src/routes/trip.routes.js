import {createTip,getTrips,gettripBuId ,deleteTrip} from "../controllers/trip.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router =Router();

router.post("/createTrip",authMiddleware,createTrip);
router.get("/getTrips",authMiddleware,getTrips);
router.get("/getTrip/:id",authMiddleware,gettripById);
router.delete("/deleteTrip/:id",authMiddleware,deleteTrip);

export default router;