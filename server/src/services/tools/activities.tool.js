import { tool } from "@langchain/core/tools";
import { z } from "zod";
import llm from "../ai/llm.services.js";

export const activitiesTool = tool(
  async ({ destination, interests, totalDays }) => {
    try {
      const response = await llm.invoke([
        {
          role: "system",
          content: "You are a local tour guide and travel planner. Recommend a diverse set of local sights and activities for the given destination that match the user's interests. Return a JSON array of objects. Do not write markdown blocks (like ```json), just return raw JSON."
        },
        {
          role: "user",
          content: `Recommend sightseeing spots and activities in "${destination}" for a ${totalDays}-day trip based on interests: ${JSON.stringify(interests)}.
          Return a JSON array of objects, where each object has:
          - activityName (string): title of the place or activity.
          - description (string): brief description of the activity/sight.
          - location (string): address or neighborhood name.
          - cost (string): estimated cost (e.g. Free, $15 entry, or local currency).
          - duration (string): typical time spent (e.g. 2 hours, half-day).`
        }
      ]);
      
      return response.content;
    } catch (error) {
      console.error("Error in activitiesTool:", error);
      return JSON.stringify([
        {
          activityName: "Exploring the City Center",
          description: "Stroll around the central squares, historical streets, and local markets.",
          location: "Downtown",
          cost: "Free",
          duration: "3 hours"
        }
      ]);
    }
  },
  {
    name: "search_activity_recommendations",
    description: "Get sightseeing, dining, and activity recommendations based on destination, traveler interests, and total days of the trip.",
    schema: z.object({
      destination: z.string().describe("The name of the destination"),
      interests: z.array(z.string()).describe("A list of interests (e.g. ['food', 'history', 'adventure'])"),
      totalDays: z.number().describe("Total days of the trip")
    })
  }
);
