import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from 'groq-sdk';

export type Locale = 'es' | 'en';

export interface StudyMetadata {
  title: string;
  tl_dr: string;
  key_benefits: string[];
  trust_score: number;
  product_keywords: string[];
  category: 'Ciencia' | 'Recomendaciones' | 'Protocolos';
}

export interface TransformedPost {
  metadata: StudyMetadata;
  content_html: string;
  locale: Locale;
  social?: {
    twitter: string;
    linkedin: string;
  };
}

/**
 * Service to interface with AI engines (Groq/Gemini) for content transformation.
 */
export class AITransformerService {
  private genAI: GoogleGenerativeAI;
  private groq: Groq | null = null;
  private primaryModelName = "gemini-2.0-flash"; 

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(geminiKey);

    const groqKey = process.env.GROQ_API_KEY || '';
    if (groqKey) {
      this.groq = new Groq({ apiKey: groqKey });
      console.log('🚀 Groq engine initialized as primary.');
    }
  }

  /**
   * Helper to get the Gemini model.
   */
  private getGeminiModel(modelName: string = this.primaryModelName) {
    return this.genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1beta" });
  }

  /**
   * Step 1: Extracts key points and metadata from a raw scientific abstract.
   */
  async extractKeyPoints(abstract: string, locale: Locale = 'es'): Promise<StudyMetadata> {
    const prompt = `
      Analyze the following scientific abstract and extract key information in ${locale === 'es' ? 'Spanish' : 'English'}.
      Return a JSON object with the following structure:
      {
        "title": "Clear and engaging title for humans",
        "tl_dr": "One sentence summary for a layperson",
        "key_benefits": ["List of 3-5 specific health benefits found in the study"],
        "trust_score": number (0-100),
        "product_keywords": ["Identify ANY biohacking products, gadgets, or supplements mentioned"],
        "category": "Select 'Protocolos' IF the study provides actionable dosages, timing, or specific steps to follow. Select 'Recomendaciones' for general lifestyle advice. Select 'Ciencia' for pure research findings."
      }

      Abstract: ${abstract}
    `;

    // 1. Try Groq first (extremely fast)
    if (this.groq) {
      try {
        console.log('⚡ Trying Groq (llama-3.3-70b) for extraction...');
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });
        return JSON.parse(completion.choices[0]?.message?.content || '{}');
      } catch (error: any) {
        console.warn('⚠️ Groq failed, falling back to Gemini:', error.message);
      }
    }

    // 2. Fallback to Gemini
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      const model = this.getGeminiModel(modelName);
      try {
        console.log(`Trying Gemini (${modelName}) for extraction...`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (error: any) {
        lastError = error;
        if (error.status === 429) throw error; // Re-throw rate limit to trigger queue retry
      }
    }
    throw lastError || new Error("All AI models failed for extraction");
  }

  /**
   * Step 2: Redacts the full post based on previously extracted metadata.
   */
  async generatePost(metadata: StudyMetadata, locale: Locale = 'es'): Promise<string> {
    const prompt = `
      Write a compelling, science-based blog post in ${locale === 'es' ? 'Spanish' : 'English'} for a longevity/biohacking audience.
      Use HTML tags (h2, p, strong, ul, li). Authoritative yet accessible tone.
      
      TITLE: ${metadata.title}
      CATEGORY: ${metadata.category}
      
      IF CATEGORY IS 'Protocolos', USE THIS STRUCTURE:
      1. [h2] Objetivo del Protocolo (What are we optimizing?)
      2. [h2] Fundamento Científico (Briefly explain WHY it works based on the study)
      3. [h2] Instrucciones del Protocolo (Create a step-by-step guide: Dosages, Timing, Frequency)
      4. [h2] Sinergias y Optimizaciones (What to combine it with)
      5. [h2] Advertencias y Seguridad (Based on study contraindications)

      ELSE (Ciencia/Recomendaciones), USE THIS STRUCTURE:
      1. [h2] El Descubrimiento
      2. [h2] Beneficios Clave (Use lists)
      3. [h2] ¿Cómo aplicarlo?
      4. [h2] Conclusión
    `;

    // 1. Try Groq
    if (this.groq) {
      try {
        console.log('⚡ Trying Groq (llama-3.3-70b) for generation...');
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        });
        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        console.warn('⚠️ Groq failed in generation, falling back to Gemini:', error.message);
      }
    }

    // 2. Fallback to Gemini
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      const model = this.getGeminiModel(modelName);
      try {
        console.log(`Trying Gemini (${modelName}) for generation...`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.replace(/```html\n?|```\n?/g, '').trim();
      } catch (error: any) {
        lastError = error;
        if (error.status === 429) throw error;
      }
    }
    throw lastError || new Error("All AI models failed for generation");
  }

  /**
   * Step 3: Generates social media copy for the article.
   */
  async generateSocialPosts(metadata: StudyMetadata, locale: Locale = 'es'): Promise<{ twitter: string; linkedin: string }> {
    const prompt = `
      Create social media copy for a biohacking/longevity article in ${locale === 'es' ? 'Spanish' : 'English'}.
      Base info:
      Title: ${metadata.title}
      Key Benefits: ${metadata.key_benefits.join(', ')}

      Requirements:
      1. Twitter Thread: 3-5 tweets. Start with a disruptive hook. Use 🧵 to indicate a thread. End with a link to the article.
      2. LinkedIn Post: Professional, authoritative tone. Start with a bold statement. Use bullet points for benefits. End with a Call to Action saying 'Analysis link in the first comment 👇'.

      Return ONLY a JSON object:
      {
        "twitter": "Full thread content here...",
        "linkedin": "Full LinkedIn post here..."
      }
    `;

    // 1. Try Groq
    if (this.groq) {
      try {
        console.log('⚡ Trying Groq (llama-3.3-70b) for social posts...');
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        return JSON.parse(completion.choices[0]?.message?.content || '{}');
      } catch (error: any) {
        console.warn('⚠️ Groq failed in social posts, falling back to Gemini:', error.message);
      }
    }

    // 2. Fallback to Gemini
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      const model = this.getGeminiModel(modelName);
      try {
        console.log(`Trying Gemini (${modelName}) for social posts...`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (error: any) {
        lastError = error;
      }
    }

    return { 
      twitter: "Could not generate twitter thread.", 
      linkedin: "Could not generate linkedin post." 
    };
  }

  /**
   * Orchestrates the two-step transformation process.
   */
  async transformStudy(abstract: string, locale: Locale = 'es'): Promise<TransformedPost> {
    const metadata = await this.extractKeyPoints(abstract, locale);
    
    // Artificial delay to prevent rate limiting (429) on free tier
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const [content_html, social] = await Promise.all([
      this.generatePost(metadata, locale),
      this.generateSocialPosts(metadata, locale)
    ]);
    
    return {
      metadata,
      content_html,
      locale,
      social
    };
  }

  /**
   * Dynamically injects affiliate links into the content based on product keywords.

  /**
   * Dynamically injects affiliate links into the content based on product keywords.
   * @param htmlContent The original HTML content
   * @param products List of available products with their keywords and links
   */
  injectAffiliateLinks(htmlContent: string, products: { keywords: string[], link: string }[]): string {
    let modifiedContent = htmlContent;
    
    // Sort products by keyword length (descending) to match more specific terms first (e.g., 'Magnesium L-Threonate' before 'Magnesium')
    const allKeywords = products.flatMap(p => p.keywords.map(kw => ({ kw, link: p.link })));
    allKeywords.sort((a, b) => b.kw.length - a.kw.length);

    const linkedKeywords = new Set<string>();

    allKeywords.forEach(({ kw, link }) => {
      if (linkedKeywords.has(kw.toLowerCase())) return;

      const regex = new RegExp(`\\b(${kw})\\b`, 'i'); // 'i' for case-insensitive, no 'g' to only catch first
      
      // Simple check to see if the word is already inside an <a> tag (primitive but effective for this use case)
      const parts = modifiedContent.split(/(<a[^>]*>.*?<\/a>)/gi);
      let replaced = false;

      modifiedContent = parts.map(part => {
        if (part.startsWith('<a') || replaced) return part;
        
        const newPart = part.replace(regex, (match) => {
          replaced = true;
          linkedKeywords.add(kw.toLowerCase());
          return `<a href="${link}" class="affiliate-link" target="_blank" rel="nofollow noreferrer">${match}</a>`;
        });
        return newPart;
      }).join('');
    });

    return modifiedContent;
  }
}
