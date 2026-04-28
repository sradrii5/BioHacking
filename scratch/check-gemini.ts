import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const models = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-3-flash"];
  
  for (const m of models) {
    console.log(`Checking ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("test");
      console.log(`Success with ${m}`);
      break;
    } catch (e: any) {
      console.error(`Error with ${m}:`, e.message);
    }
  }
}

checkModels();
