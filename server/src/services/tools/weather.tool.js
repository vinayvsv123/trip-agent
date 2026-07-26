import { tool } from "@langchain/core/tools";
import { z } from "zod";
import llm from "../ai/llm.services.js";

export const weatherTool = tool(
  async ({ destination, month }) => {
    try {
      const response = await llm.invoke([
        {
          role: "system",
          content: "You are an expert travel assistant. Provide typical weather details for the requested destination and month/season in clean JSON format. Do not write markdown blocks (like ```json), just return raw JSON."
        },
        {
          role: "user",
          content: `Provide typical weather details for destination: "${destination}" during month/season: "${month || "general"}". Return a JSON object with:
          - averageTemperature (string): typical temperature range (e.g. 15-22°C).
          - conditions (string): typical weather condition (e.g. Sunny, rainy, windy).
          - packingTips (string): suggestions on what clothes/accessories to pack.`
        }
      ]);
      
      return response.content;
    } catch (error) {
      console.error("Error in weatherTool:", error);
      return JSON.stringify({
        averageTemperature: "Moderate",
        conditions: "Clear skies",
        packingTips: "Wear comfortable walking shoes and bring a light jacket."
      });
    }
  },
  {
    name: "get_weather_info",
    description: "Get typical weather conditions, average temperature range, and packing tips for a specific destination and month.",
    schema: z.object({
      destination: z.string().describe("The name of the destination (e.g., Paris)"),
      month: z.string().optional().describe("The month or time of year of travel (e.g., July, Spring)")
    })
  }
);
