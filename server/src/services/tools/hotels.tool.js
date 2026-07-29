import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchHotelRecommendations } from "../services/hotel.service.js";

export const hotelsTools=tool(
  async(input)=>{
    return await searchHotelRecommendations(input);
  
  },
  {
    name:"search_hotel_recommendations",
    description:
       "Searches for real hotel recommendations based on destination, travel dates, travellers, and optional hotel type.",

    schema: z.object({
      destination: z.string().describe("Destination city"),
      checkIn: z.string().describe("Check-in date (YYYY-MM-DD)"),
      checkOut: z.string().describe("Check-out date (YYYY-MM-DD)"),
      travellers: z.number().describe("Number of travellers"),
      hotelType: z
        .string()
        .optional()
        .describe("Optional hotel category like Luxury, Budget, Hostel"),
    }),

  }

  
);