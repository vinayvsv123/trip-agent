import { tool } from "@langchain/core/tools";
import { z } from "zod";
import llm from "../ai/llm.services.js";

export const destinationTool = tool(
  async ({ destination }) => {
    try {
      const response = await llm.invoke([
        {
          role: "system",
          content: "You are an expert travel assistant. Provide key information about the requested destination in clean JSON format. Do not write markdown blocks (like ```json), just return raw JSON."
        },
        {
          role: "user",
          content: `Provide travel information for destination: "${destination}". Return a JSON object with:
          - description (string): a brief summary of the city/place.
          - bestTimeToVisit (string): best months/seasons to visit.
          - currency (string): local currency name and symbol.
          - localCustoms (string): key cultural etiquette or rules.
          - emergencyContact (string): police/medical emergency number.`
        }
      ]);
      
      return response.content;
    } catch (error) {
      console.error("Error in destinationTool:", error);
      return JSON.stringify({
        description: `A wonderful trip to ${destination}`,
        bestTimeToVisit: "Year-round",
        currency: "Local currency",
        localCustoms: "Respect local traditions.",
        emergencyContact: "112 / 911"
      });
    }
  },
  {
    name: "search_destination_info",
    description: "Get general description, best time to visit, currency, local customs, and emergency contact numbers for a specific destination.",
    schema: z.object({
      destination: z.string().describe("The name of the destination city or country (e.g., Paris, Tokyo)")
    })
  }
);
