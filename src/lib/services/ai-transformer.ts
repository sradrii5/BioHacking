import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export type Locale = 'es' | 'en';

export interface StudyMetadata {
  title: string;
  tl_dr: string;
  key_benefits: string[];
  trust_score: number;
  product_keywords: string[];
  category: 'Ciencia' | 'Suplementos' | 'Protocolos';
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
  private primaryModelName = "gemini-1.5-flash"; 

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
        "category": "Select one: 'Ciencia', 'Suplementos' or 'Protocolos'"
      }

      Abstract: ${abstract}
    `;

    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
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
          if (error.status === 429 && retries > 1) {
            console.log(`Rate limit on ${modelName}. Waiting 125s...`);
            await new Promise(resolve => setTimeout(resolve, 125000));
            retries--;
            continue;
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

    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      let retries = 5;
      const model = this.getModel(false, modelName);
      
      while (retries > 0) {
        try {
          console.log(`Trying model in generatePost: ${modelName}...`);
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          return text.replace(/```html\n?|```\n?/g, '').trim();
        } catch (error: any) {
          lastError = error;
          if (error.status === 429 && retries > 1) {
            console.log(`Rate limit in generatePost on ${modelName}. Waiting 125s...`);
            await new Promise(resolve => setTimeout(resolve, 125000));
            retries--;
            continue;
          }
          console.warn(`Model ${modelName} failed in generatePost: ${error.message}`);
          break; // Try next model
        }
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

    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
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
    
    products.forEach(product => {
      product.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        // Simple replacement with a link. In production, we'd avoid double linking.
        modifiedContent = modifiedContent.replace(regex, `<a href="${product.link}" class="affiliate-link" target="_blank" rel="nofollow noreferrer">$1</a>`);
      });
    });

    return modifiedContent;
  }
}
