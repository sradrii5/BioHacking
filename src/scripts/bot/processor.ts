import { GoogleGenerativeAI } from '@google/generative-ai';
import { RawArticle } from './fetchers';

let modelInstance: any = null;

const getModel = () => {
  if (modelInstance) return modelInstance;

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables.');
  }

  console.log('🔑 API Key detected (length: ' + apiKey.length + ')');

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using the most standard name
  modelInstance = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  return modelInstance;
};

export interface ProcessedArticle {
  title: { es: string; en: string };
  content: { es: string; en: string };
  tldr: { es: string; en: string };
  category: string;
  trustScore: number;
  slug: string;
  sourceUrl: string;
}

export async function processArticle(raw: RawArticle): Promise<ProcessedArticle | null> {
  let retries = 3;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  while (retries > 0) {
    try {
      const model = getModel();
      const prompt = `
        You are a world-class Biohacking and Longevity expert.
        Translate and expand this scientific news into a professional blog post.
        
        SOURCE TITLE: ${raw.title}
        SOURCE LINK: ${raw.link}
        
        Your task:
        1. Analyze the topic and create a deep, engaging article.
        2. Provide the output in STRICT JSON format with these fields:
           - title_es: Title in Spanish (catchy but scientific)
           - title_en: Title in English
           - tldr_es: One sentence summary in Spanish
           - tldr_en: One sentence summary in English
           - content_es: Full article in Spanish (Markdown format). Use professional formatting with headers and lists.
           - content_en: Full article in English (Markdown format).
           - category: One of: "Protocolos", "Ciencia", "Recomendaciones"
           - trustScore: A number from 0 to 100 based on scientific evidence (PubMed = higher, News = medium).
           - slug: A URL-friendly slug based on the English title.
           
        STRICT JSON ONLY. NO MARKDOWN WRAPPERS.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      const data = JSON.parse(text);

      return {
        title: { es: data.title_es, en: data.title_en },
        tldr: { es: data.tldr_es, en: data.tldr_en },
        content: { es: data.content_es, en: data.content_en },
        category: data.category,
        trustScore: data.trustScore,
        slug: data.slug,
        sourceUrl: raw.link
      };
    } catch (error: any) {
      if (error.status === 429) {
        console.warn(`Rate limit hit for "${raw.title}". Retrying in 15s... (${retries} left)`);
        await delay(15000);
        retries--;
        continue;
      }
      console.error(`Error processing article "${raw.title}":`, error);
      return null;
    }
  }
  return null;
}
