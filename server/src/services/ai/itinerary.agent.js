import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { z } from "zod";
import llm from "./llm.services.js";
import { itineraryPrompt } from "../prompts/itinerary.prompt.js";
import { destinationTool } from "../tools/destination.tool.js";
import { weatherTool } from "../tools/weather.tool.js";
import { hotelsTool } from "../tools/hotels.tool.js";
import { activitiesTool } from "../tools/activities.tool.js";

// Define the itinerary Zod schema for structured output validation
const itinerarySchema = z.object({
  destination: z.string().describe("The trip destination city"),
  totalDays: z.number().describe("The total duration of the trip in days"),
  budget: z.number().describe("The traveler's budget in USD"),
  travellers: z.number().describe("Number of travelers"),
  interests: z.array(z.string()).describe("Traveler interests"),
  destinationInfo: z.object({
    description: z.string().describe("General description of the destination"),
    bestTimeToVisit: z.string().describe("Best time of the year to visit"),
    currency: z.string().describe("Local currency info"),
    localCustoms: z.string().describe("Important local customs or etiquette rules"),
    emergencyContact: z.string().describe("Local emergency contact numbers"),
  }),
  weather: z.object({
    averageTemperature: z.string().describe("Average temperature range"),
    conditions: z.string().describe("Typical weather condition"),
    packingTips: z.string().describe("Packing recommendations"),
  }),
  hotelSuggestions: z.array(
    z.object({
      name: z.string().describe("Hotel name"),
      rating: z.string().describe("Rating out of 5 stars"),
      priceRange: z.string().describe("Average price per night"),
      description: z.string().describe("Brief description of the hotel"),
      whyChoose: z.string().describe("Why this fits the user's trip"),
    })
  ).describe("Suggested hotel accommodations matching budget"),
  dailyItinerary: z.array(
    z.object({
      day: z.number().describe("Day number (1, 2, 3...)"),
      theme: z.string().describe("Theme or focus of the day"),
      activities: z.array(
        z.object({
          time: z.string().describe("Time slot (e.g. 09:00 AM)"),
          activityName: z.string().describe("Name of activity or sight"),
          description: z.string().describe("What to do/see"),
          location: z.string().describe("Location or address"),
          cost: z.string().describe("Estimated cost"),
          duration: z.string().describe("Typical duration"),
        })
      ),
    })
  ).describe("Day-by-day activity timeline"),
  budgetEstimation: z.object({
    accommodationTotal: z.number().describe("Total estimated cost of hotel stays"),
    activitiesTotal: z.number().describe("Total cost of activities/tours"),
    foodAndDiningTotal: z.number().describe("Estimated budget for food/drinks"),
    transportationTotal: z.number().describe("Estimated local transport costs"),
    totalEstimatedCost: z.number().describe("Sum of all estimated expenses"),
    budgetStatus: z.string().describe("Status e.g. 'Within Budget', 'Slightly Over Budget'"),
  }),
});

// Define State annotation schema using LangGraph Annotation.Root
const StateAnnotation = Annotation.Root({
  tripDetails: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  destinationInfo: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  weather: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  hotels: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  activities: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  itinerary: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  validationNotes: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  iterations: Annotation({
    reducer: (x, y) => (x ?? 0) + (y ?? 1),
    default: () => 0,
  }),
});

// Node 1: Research Node - executes all tools in parallel using state details
const researchNode = async (state) => {
  const { destination, budget, travellers, interests, totalDays, startDate } = state.tripDetails;
  
  const monthName = startDate 
    ? new Date(startDate).toLocaleString("default", { month: "long" }) 
    : "general";

  // Run all tools concurrently
  const [destData, weatherData, hotelsData, activitiesData] = await Promise.all([
    destinationTool.invoke({ destination }),
    weatherTool.invoke({ destination, month: monthName }),
    hotelsTool.invoke({ destination, budget, travellers }),
    activitiesTool.invoke({ destination, interests, totalDays }),
  ]);

  return {
    destinationInfo: destData,
    weather: weatherData,
    hotels: hotelsData,
    activities: activitiesData,
  };
};

// Node 2: Generator Node - uses formatted prompt + tools info to construct the final plan
const generatorNode = async (state) => {
  const structuredLlm = llm.withStructuredOutput(itinerarySchema);

  const { source, destination, startDate, endDate, totalDays, budget, travellers, interests } = state.tripDetails;
  
  const validationFeedback = state.validationNotes
    ? `\n[CRITICAL NOTE FROM VALIDATOR - PLEASE FIX]:\n${state.validationNotes}`
    : "";

  const response = await structuredLlm.invoke(
    await itineraryPrompt.formatMessages({
      source,
      destination,
      startDate: new Date(startDate).toDateString(),
      endDate: new Date(endDate).toDateString(),
      totalDays,
      budget,
      travellers,
      interests: interests.join(", "),
      destinationInfo: state.destinationInfo,
      weather: state.weather,
      hotels: state.hotels,
      activities: state.activities,
      validationFeedback,
    })
  );

  return {
    itinerary: response,
    iterations: 1, // increments iterations by 1 due to the reducer
  };
};

// Node 3: Validator Node - checks constraints
const validatorNode = async (state) => {
  const { itinerary, iterations } = state;
  const { budget, totalDays } = state.tripDetails;
  
  let validationNotes = "";
  let isValid = true;
  
  if (itinerary.dailyItinerary.length !== totalDays) {
    isValid = false;
    validationNotes += `The generated itinerary has ${itinerary.dailyItinerary.length} days, but user requested exactly ${totalDays} days. Please rewrite with exactly ${totalDays} daily elements.\n`;
  }
  
  if (itinerary.budgetEstimation.totalEstimatedCost > budget * 1.15) {
    isValid = false;
    validationNotes += `The total estimated cost ($${itinerary.budgetEstimation.totalEstimatedCost}) exceeds the budget ($${budget}) by over 15%. Make adjustments to stay closer to budget.\n`;
  }
  
  if (!isValid && iterations < 3) {
    return {
      validationNotes,
    };
  }
  
  return {
    validationNotes: "", // clear notes if valid or max iterations reached
  };
};

// Edge routing logic based on validator findings
const routingEdge = (state) => {
  if (state.validationNotes && state.iterations < 3) {
    console.log(`Validation failed. Re-routing back to generatorNode. Feedback: ${state.validationNotes}`);
    return "generatorNode";
  }
  return END;
};

// Initialize StateGraph
const workflow = new StateGraph(StateAnnotation)
  .addNode("researchNode", researchNode)
  .addNode("generatorNode", generatorNode)
  .addNode("validatorNode", validatorNode)
  .addEdge(START, "researchNode")
  .addEdge("researchNode", "generatorNode")
  .addEdge("generatorNode", "validatorNode")
  .addConditionalEdges("validatorNode", routingEdge, {
    generatorNode: "generatorNode",
    __end__: END,
  });

// Compile the runnable graph
const itineraryAgent = workflow.compile();

export default itineraryAgent;
