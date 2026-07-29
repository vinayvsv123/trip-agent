import itineraryAgent from "./itinerary.agent.js";
import dotenv from "dotenv";

// Load configuration
dotenv.config();

const runTest = async () => {
  console.log("Starting LangGraph AI Trip Agent test run...");
  
  const mockTripDetails = {
    source: "New York",
    destination: "Paris",
    startDate: "2026-09-01",
    endDate: "2026-09-04",
    totalDays: 3,
    budget: 1500,
    travellers: 2,
    interests: ["history", "food", "art"]
  };
  
  try {
    const result = await itineraryAgent.invoke({
      tripDetails: mockTripDetails
    });
    
    console.log("Agent run finished successfully!");
    console.log("---- Result ----");
    console.log(JSON.stringify(result.itinerary, null, 2));
    
    if (result.validationNotes) {
      console.log("Validation Notes:", result.validationNotes);
    }
    
    console.log("Total Iterations:", result.iterations);
  } catch (error) {
    console.error("Agent execution failed:", error);
  }
};

runTest();
