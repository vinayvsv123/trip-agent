import "dotenv/config";
import { getDestinationInfo } from "./src/services/destination.services.js";

console.log("API KEY EXISTS:", !!process.env.RAPIDAPI_KEY);

const result = await getDestinationInfo("Paris");
console.log(JSON.stringify(result, null, 2));