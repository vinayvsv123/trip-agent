import {z} from "zod";

const RAPID_API_HOST="bookiing-com.p.rapidapi.com";
const BASE_URL=`https://${RAPID_API_HOST}`;

const destinationCache=new Map();

function headers(){
    return {
        "x-rapidapi-key":process.env.RAPIDAPI_KEY,
        "x-rapidapi-host":RAPID_API_HOST
    };
}

//validate input

const hotelSearchSchema = z.object({
  destId: z.string().uuid(),
  destType: z.enum(["city", "district", "landmark", "hotel", "region"]),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  travellers: z.number().min(1),
  hotelType: z.string().optional()
});

const result= hotelSearchSchema.safeParse(input);
if(!result.success){
   return{
    success:false,
    message: result.error.issues[0].message,
   };
}   

if(!process.env.RAPIDAPI_KEY){
    throw new Error("API key is missing");
}

//search destination
 async function getDestination(destination){

    const cached=destinationCache.get(destination.toLowerCase());
    if(cached)
    { 
        return cached;
    }

    const url=`${BASE_URL}/api/v1/hotels/searchDestination?query=${encodeURIComponent(destination)}`;
    const res=await fetch(url,{headers:headers()});

    if(!res.ok){
        throw new Error(`Destination lookup failed (${res.status})`);
    }

    const data=await res.json();
    const destinationInfo = data.data[0];  

    destinationCache.set(
        destination.toLowerCase(),
        resolvedDestination
    );  
}

//hotel serach
 async function searchHotels(destId,destType,checkIn,CheckOut,travellers,hotelType)
{
    const params = new URLSearchParams({
        dest_id: destId,
        dest_type: destType,
        checkin_date: checkIn,
        checkout_date: checkOut,
        adults_number: String(travellers),
        units: "metric",
        order_by: "popularity",
    });

    if (hotelType) {
        params.append("categories", hotelType);
    }

    const url = `${BASE_URL}/api/v1/hotels/searchHotels?${params.toString()}`;

    const response = await fetch(url, {
        method: "GET",
        headers: headers(),
    });

    if (!response.ok) {
        throw new Error(`Hotel search failed (${response.status})`);
    }

    const data = await response.json();
    return data?.data?.hotels || [];
   
}


//fromat hotel data
 async function formatHotel(rawHotel) {
  return {
    hotelId: hotel.hotel_id ?? null,

    name: hotel.hotel_name ?? null,

    rating: hotel.review_score ?? null,

    pricePerNight:
      hotel.price_breakdown?.gross_amount ?? null,

    currency:
      hotel.price_breakdown?.currency ?? null,

    location:
      hotel.address ?? hotel.city ?? null,

    amenities:
      hotel.hotel_facilities ?? [],

    image:
      hotel.main_photo_url ??
      hotel.max_photo_url ??
      null,

    bookingUrl:
      hotel.url ?? null,
  };
}

export async function searchHotelRecommendations(input){
    const result=hotelSearchSchema.safeParse(input);

    if(!result.success){
        return{
            success:false,
            message:result.error.issues[0].message,
        };
    }
    const {
destId,destType,checkIn,checkOut,travellers,hotelType}=result.data;

    try{
        const destination=await getDestination(destination);

        const hotels=await serachHotels(
            destinationInfo.id,
            destinationInfo.type,
            checkIn,
            checkOut,
            travellers,
            hotelType

        );

        const formattedHotels=await Promise.all(
            hotels.map(formatHotel)
        );

        return{
            success:true,
            destination:destinationInfo.label,
            hotels:formattedHotels,
        };


    }
    catch(error){  
        return{
            success:false,
            message:error.message,
        };
    }
}

