import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

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
 * Service to interface with Gemini for content transformation.
 */
export class AITransformerService {
  private genAI: GoogleGenerativeAI;
  private primaryModelName = "gemini-2.0-flash"; 

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('GEMINI_API_KEY missing. AI features will fail.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Helper to get the model with fallback logic.
   */
  private getModel(isJson: boolean = false, modelName: string = this.primaryModelName) {
    return this.genAI.getGenerativeModel({ 
      model: modelName,
    }, { apiVersion: "v1beta" });
  }

  /**
   * Step 1: Extracts key points and metadata from a raw scientific abstract.
   */
  async extractKeyPoints(abstract: string, locale: Locale = 'es'): Promise<StudyMetadata> {
    const model = this.getModel(true);
    const prompt = `
      Analyze the following scientific abstract and extract key information in ${locale === 'es' ? 'Spanish' : 'English'}.
      Return a JSON object with the following structure:
      {
        "title": "Clear and engaging title for humans",
        "tl_dr": "One sentence summary for a layperson",
        "key_benefits": ["List of 3-5 specific health benefits found in the study"],
        "trust_score": number (0-100, based on study methodology and sample size),
        "product_keywords": ["Identify ANY biohacking products, gadgets, or supplements mentioned (e.g., 'magnesium', 'red light therapy', 'wearables', 'cold plunge', 'blue light glasses')"],
        "category": "Select one: 'Ciencia', 'Recomendaciones' (for supplements/gadgets/devices) or 'Protocolos'"
      }

      Abstract: ${abstract}
    `;

    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash-8b"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      let retries = 5;
      const model = this.getModel(true, modelName);
      
      while (retries > 0) {
        try {
          console.log(`Trying model: ${modelName}...`);
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
          return JSON.parse(cleanJson);
        } catch (error: any) {
          lastError = error;
          if (error.status === 429) {
            console.log(`Rate limit hit on ${modelName}. Relinquishing job to avoid timeout.`);
            throw error; // Throw immediately, don't wait
          }
          console.warn(`Model ${modelName} failed: ${error.message}`);
          break; // Try next model
        }
      }
    }
    throw lastError || new Error("All models failed");
  }

  /**
   * Step 2: Redacts the full post based on previously extracted metadata.
   */
  async generatePost(metadata: StudyMetadata, locale: Locale = 'es'): Promise<string> {
    const model = this.getModel(false);
    
    const prompt = `
      Write a compelling, science-based blog post in ${locale === 'es' ? 'Spanish' : 'English'} for a longevity/biohacking audience.
      Use the following metadata as a base:
      Title: ${metadata.title}
      Key Benefits: ${metadata.key_benefits.join(', ')}
      Trust Score: ${metadata.trust_score}%
      
      Requirements:
      - Use HTML tags (h2, p, strong, ul, li).
      - Style should be authoritative yet accessible (Senior Full Stack Developer / Biohacker persona).
      - Include a section on practical application.
      - Total length: around 400-600 words.
    `;

    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      const model = this.getModel(false, modelName);
      
      try {
        console.log(`Trying model in generatePost: ${modelName}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text.replace(/```html\n?|```\n?/g, '').trim();
      } catch (error: any) {
        lastError = error;
        if (error.status === 429) {
          console.log(`Rate limit in generatePost on ${modelName}. Relinquishing job.`);
          throw error;
        }
        console.warn(`Model ${modelName} failed in generatePost: ${error.message}`);
        continue; // Try next model
      }
    }
    throw lastError || new Error("All models failed in generatePost");
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

    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash-8b"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      const model = this.getModel(true, modelName);
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (error: any) {
        lastError = error;
        console.warn(`Social generation failed with ${modelName}: ${error.message}`);
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
