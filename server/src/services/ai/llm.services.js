import {chatGooleGenerativeAI } from "@langchain/google-generative-ai";
const llm=new ChatGoogleGenerativeAI({
  modelName:"gemini-2.5-flash",
  api_key:process.env.GOOGLE_API_KEY,
  temperature:0.7,
});
export default llm;
