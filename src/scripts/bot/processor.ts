import Groq from 'groq-sdk';
import { RawArticle } from './fetchers';

let groqInstance: Groq | null = null;

const getGroq = (): Groq => {
  if (groqInstance) return groqInstance;

  const apiKey = process.env.GROQ_API_KEY || '';
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in environment variables.');
  }

  console.log('🔑 Groq API Key detected (length: ' + apiKey.length + ')');
  groqInstance = new Groq({ apiKey });
  return groqInstance;
};

export interface ProcessedArticle {
  title: { es: string; en: string };
  content: { es: string; en: string };
  tldr: { es: string; en: string };
  slug: { es: string; en: string }; // Updated to support dual slugs
  category: string;
  trustScore: number;
  sourceUrl: string;
}

export async function processArticle(raw: RawArticle): Promise<ProcessedArticle | null> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  let retries = 3;

  while (retries > 0) {
    try {
      const groq = getGroq();

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a world-class Biohacking and Longevity expert and science writer. You always respond with valid JSON only, no markdown, no extra text.',
          },
          {
            role: 'user',
            content: `
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
   - content_es: Full article in Spanish (Markdown format). Minimum 400 words.
   - content_en: Full article in English (Markdown format). Minimum 400 words.
   - slug_es: SEO-friendly URL slug in Spanish (3-5 keywords, lowercase, hyphens).
   - slug_en: SEO-friendly URL slug in English.
   - category: One of: "Protocolos", "Ciencia", "Recomendaciones"
   - trustScore: A number from 0 to 100 based on scientific evidence.

STRICT JSON ONLY. NO MARKDOWN WRAPPERS.
            `.trim(),
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content || '';
      const data = JSON.parse(text);

      return {
        title: { es: data.title_es, en: data.title_en },
        tldr: { es: data.tldr_es, en: data.tldr_en },
        content: { es: data.content_es, en: data.content_en },
        slug: { 
          es: data.slug_es.substring(0, 60).replace(/-$/, ''),
          en: data.slug_en.substring(0, 60).replace(/-$/, '')
        },
        category: data.category,
        trustScore: data.trustScore,
        sourceUrl: raw.link,
      };
    } catch (error: any) {
      // Handle Groq rate limits (429)
      if (error?.status === 429 || error?.error?.type === 'rate_limit_exceeded') {
        console.warn(`⚠️ Rate limit hit. Retrying in 10s... (${retries} left)`);
        await delay(10000);
        retries--;
        continue;
      }
      console.error(`❌ Error processing article "${raw.title}":`, error?.message || error);
      return null;
    }
  }

  console.warn(`⚠️ Max retries reached for: ${raw.title}`);
  return null;
}
