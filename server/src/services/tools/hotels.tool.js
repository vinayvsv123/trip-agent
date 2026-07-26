import { tool } from "@langchain/core/tools";
import { z } from "zod";
import llm from "../ai/llm.services.js";

export const hotelsTool = tool(
  async ({ destination, budget, travellers }) => {
    try {
      const response = await llm.invoke([
        {
          role: "system",
          content: "You are an expert hotel booking coordinator. Suggest 3 realistic hotel options matching the destination, budget constraint, and number of travelers. Provide the response as a valid JSON array of objects. Do not write markdown blocks (like ```json), just return raw JSON."
        },
        {
          role: "user",
          content: `Find hotel recommendations for:
          - Destination: ${destination}
          - Total Trip Budget: $${budget}
          - Number of Travellers: ${travellers}
          
          Return a JSON array of objects, where each object has:
          - name (string): hotel name.
          - rating (string): hotel rating (e.g. 4.3/5).
          - priceRange (string): cost per night (e.g. $80 - $120 per night).
          - description (string): description of the hotel.
          - whyChoose (string): why this is a good option for this budget and group.`
        }
      ]);
      
      return response.content;
    } catch (error) {
      console.error("Error in hotelsTool:", error);
      return JSON.stringify([
        {
          name: "Standard Boutique Hotel",
          rating: "4.2/5",
          priceRange: "$100 - $150 per night",
          description: "A comfortable and well-reviewed hotel near key locations.",
          whyChoose: "Fits the specified budget and provides good amenities."
        }
      ]);
    }
  },
  {
    name: "search_hotel_recommendations",
    description: "Get hotel suggestions for a destination based on user's total budget and number of travellers.",
    schema: z.object({
      destination: z.string().describe("The name of the destination"),
      budget: z.number().describe("The total budget of the trip in USD"),
      travellers: z.number().describe("Number of travellers")
    })
  }
);
