import {z} from "zod";

const RAPIDAPI_HOST = "wft-geo-db.p.rapidapi.com";
const API_KEY=process.env.RAPIDAPI_KEY;
const BASE_URL = `https://${RAPIDAPI_HOST}/v1/geo`;

const destinationSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
});


async function getDestinationInfo(destination) {
    if (!API_KEY) {
        throw new Error("API key is required");
    }

    const url =
        `${BASE_URL}/cities?namePrefix=${encodeURIComponent(destination)}&limit=10`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
    });

    if (!response.ok) {
        throw new Error(
        `Destination lookup failed (${response.status})`
        );
    }

    const data = await response.json();

    const exactMatch = data.data?.find(
        (city) =>
        city.city?.toLowerCase() === destination.toLowerCase() &&
        city.type === "CITY"
    );

    if (exactMatch) {
        return exactMatch;
    }

    const cityMatch = data.data?.find(
        (city) => city.type === "CITY"
    );

    if (cityMatch) {
        return cityMatch;
    }
    throw new Error(`No matching city found for "${destination}"`);
    
}