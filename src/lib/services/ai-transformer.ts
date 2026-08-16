import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from 'groq-sdk';
import type { PubMedStudy } from './pubmed';
import { fetchUnsplashImage } from './unsplash';

export type Locale = 'es' | 'en';

export interface StudyMetadata {
  title: string;
  tl_dr: string;
  key_benefits: string[];
  trust_score: number;
  product_keywords: string[];
  category: 'Ciencia' | 'Recomendaciones' | 'Protocolos';
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  cover_image_credit?: string | null;
  cover_image_credit_url?: string | null;
}

export interface TransformedPost {
  metadata: StudyMetadata;
  content_html: string;
  locale: Locale;
  social?: {
    twitter: string;
    linkedin: string;
  };
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  cover_image_credit?: string | null;
  cover_image_credit_url?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * System prompt for metadata extraction (Step 1).
 * Kept lean — its only job is to classify and extract structured JSON.
 */
function buildExtractionSystemPrompt(locale: Locale): string {
  const lang = locale === 'es' ? 'Spanish' : 'English';
  return `You are a scientific metadata extractor for a biohacking and longevity platform.
Your ONLY output is a valid JSON object — no markdown fences, no prose.
All text fields must be written in ${lang}.

Rules:
- "title": Craft an engaging, specific title. Do NOT use vague phrases like "new study shows" or "research suggests". Include a concrete finding.
- "tl_dr": One factual sentence. State the measured outcome with its direction (increased/decreased/no effect). No speculation.
- "key_benefits": 3-5 items. Each must name a SPECIFIC biological mechanism or measurable variable, not a vague benefit.
- "trust_score": 0-100. Score higher for RCTs, double-blind, large n. Score lower for observational, animal-only, small n.
- "product_keywords": Exact supplement, device, or compound names found in the text. Empty array if none.
- "category": "Protocolos" if the study provides actionable dosages/timing/steps. "Recomendaciones" for general lifestyle advice. "Ciencia" for pure mechanistic research.`;
}

/**
 * Master system prompt for article generation (Step 2).
 * This is the core of the AdSense quality fix.
 */
function buildGenerationSystemPrompt(locale: Locale, structureVariant: 1 | 2 | 3): string {
  const lang = locale === 'es' ? 'Spanish' : 'English';
  const isEs = locale === 'es';

  return `You are a senior science writer specializing in biohacking, human performance, and longevity. You write for an educated lay audience — people who read research papers for fun but want clarity, not jargon.

## OUTPUT LANGUAGE
Write entirely in ${lang}.

## ABSOLUTE RULES — NEVER VIOLATE

### Anti-Redundancy (Critical for AdSense)
- Each section must introduce INFORMATION NOT PRESENT in any previous section.
- NEVER restate the study's main finding after the introduction. Build on it, don't repeat it.
- NEVER open a paragraph by restating the article title or the premise already stated.
- NEVER use these AI filler connectors: ${isEs
    ? '"En resumen", "Es crucial destacar", "En conclusión", "Es importante mencionar", "Cabe destacar", "Sin duda", "En definitiva", "En última instancia", "Definitivamente"'
    : '"In summary", "It is crucial to note", "In conclusion", "It is important to mention", "Notably", "Without a doubt", "Ultimately", "Definitely", "Importantly"'
  }.
- NEVER pad sentences. If you have nothing new to say in a paragraph, cut it.

### Hard Scientific Data (Mandatory Inclusions)
You will receive a structured data block with the study's raw metadata. You MUST incorporate ALL of the following into the article where available:
1. **Authors & Institution**: Name the lead researcher (last name + institution) in the first or second paragraph.
2. **Methodology**: Name the exact research method (e.g., randomized controlled trial, double-blind crossover, fMRI, RNA-seq, mass spectrometry). Never say "the researchers used advanced techniques".
3. **Sample / Cohort**: State the sample size and subject type (e.g., "48 sedentary adults aged 45-65", "12 elite athletes"). If only a hint is available, use it.
4. **Measured Variables**: Name the primary outcome variables explicitly (e.g., VO2 max, serum cortisol, BDNF levels, HbA1c, polysomnography-measured REM duration).
5. **Quantified Result**: If a number appears in the abstract (e.g., "23% reduction", "p < 0.01", "effect size d = 0.7"), quote it. Do not generalize.

### YMYL Safety Boundary
- Frame all practical applications as PERFORMANCE OPTIMIZATION for healthy adults, not as medical treatment.
- Do NOT suggest this replaces a doctor's advice for chronic conditions.
- The disclaimer section handles legal coverage — do not over-hedge inside the article body.

### Practical Application Honesty
- The final section is MANDATORY and must be genuinely useful, not padding.
- If the study's data supports a concrete action (timing, dose, frequency), state it plainly for a healthy adult optimizing performance — grounded ONLY in what THIS study's data shows.
- If the finding is too early-stage (in vitro, animal-only, tiny n, mechanistic-only, no measured outcome in the abstract) to justify a real protocol, say so explicitly — ${isEs ? '"Es demasiado pronto para aplicar esto en un protocolo personal, pero..."' : '"It\'s too early to apply this to a personal protocol, but..."'} — then explain ONLY what would need to happen (human trials, replication, larger cohort) before it becomes actionable, and STOP there.
- NEVER invent a dose, timing, or protocol the study does not support.
- NEVER follow a "too early to apply" statement with generic reassurance about the compound/intervention's general safety or effectiveness from outside knowledge. That reintroduces the exact unsubstantiated claim you just said was too early — it is not grounded in THIS study and must not appear. If it's too early, the section ends after explaining what's missing — it does not pivot to selling the reader on the intervention anyway.
- FORBIDDEN PATTERN — this exact shape is banned, do not produce anything resembling it:
  ${isEs
    ? '"Es demasiado pronto para aplicar esto... Sin embargo, es importante destacar que [compuesto] ha demostrado ser seguro/efectivo para..." — the "Sin embargo" clause is the violation. If your draft sentence starts with "Sin embargo" or "No obstante" right after the too-early statement in this section, DELETE that sentence. The section ends at "...antes de que sea accionable." Nothing more.'
    : '"It\'s too early to apply this... However, it\'s worth noting that [compound] has been shown to be safe/effective for..." — the "However" clause is the violation. If your draft sentence starts with "However" or "That said" right after the too-early statement in this section, DELETE that sentence. The section ends at "...before it becomes actionable." Nothing more.'
  }

## MANDATORY ARTICLE STRUCTURE

Output clean HTML using: h2, h3, p, ul, li, strong, table, thead, tbody, tr, th, td.
Do NOT output Markdown. Do NOT wrap in \`\`\`html\`\`\`.
This article must use Structure Variant ${structureVariant} below — do not blend it with other variants.

${isEs ? buildSpanishStructure(structureVariant) : buildEnglishStructure(structureVariant)}

## STYLE
- Tone: Direct, precise, intellectually curious. Like a scientist friend explaining their work over coffee.
- Sentence variety: Mix short punchy sentences with longer explanatory ones. Avoid uniform sentence length.
- Paragraph length: 2-4 sentences max per paragraph. White space aids readability.
- Numbers: Always use numerals (23%, not twenty-three percent).`;
}

const ES_DISCLAIMER = `<hr>
<p class="disclaimer"><strong>Aviso Legal:</strong> Este artículo tiene carácter exclusivamente informativo y divulgativo. La información presentada no constituye consejo médico, diagnóstico ni tratamiento. Consulta a un profesional de la salud cualificado antes de modificar tu dieta, suplementación o rutinas de ejercicio. Los estudios científicos citados reflejan el estado del conocimiento en su fecha de publicación y pueden estar sujetos a revisión.</p>`;

const EN_DISCLAIMER = `<hr>
<p class="disclaimer"><strong>Disclaimer:</strong> This article is for informational and educational purposes only. The information presented does not constitute medical advice, diagnosis, or treatment. Consult a qualified healthcare professional before modifying your diet, supplementation, or exercise routines. The scientific studies cited reflect the state of knowledge at their publication date and may be subject to revision.</p>`;

/**
 * Three rotating structure variants, picked randomly per article (see generatePost).
 * Independent of category — the goal is to avoid every article looking identical,
 * not to encode category rules here. Every variant ends in a mandatory
 * "Aplicación Práctica" section (see Practical Application Honesty rule above).
 */
function buildSpanishStructure(variant: 1 | 2 | 3): string {
  if (variant === 1) {
    return `<h2>El Hallazgo</h2>
→ Qué encontraron, en una frase clara con el dato clave. Nombra autores, institución, metodología exacta y tamaño muestral.

<h2>Cómo Llegaron a Esta Conclusión</h2>
→ Diseño del estudio, variables medidas, grupo control si aplica. Usa una tabla comparativa si hay 3+ variables con valores numéricos.

<h2>El Mecanismo: Qué Pasa a Nivel Biológico</h2>
→ Vía molecular o biológica subyacente. Cita cualquier biomarcador o pathway nombrado en el estudio (mTOR, AMPK, HIF-1α, etc.). No solapes con la sección anterior.

<h2>Limitaciones del Estudio</h2>
→ 2-3 limitaciones concretas (tamaño muestral, duración, población específica, falta de grupo control, etc.).

<h2>Aplicación Práctica</h2>
→ Ver regla "Practical Application Honesty" arriba.

${ES_DISCLAIMER}`;
  }

  if (variant === 2) {
    return `<h2>Los Números</h2>
→ Abre con los datos concretos: porcentajes, p-values, effect sizes, tamaño muestral. Usa tabla comparativa si hay 3+ variables numéricas.

<h2>Contexto: Qué Estudio Es Este</h2>
→ Autores, institución, metodología exacta, por qué se hizo este estudio.

<h2>Qué Significa Este Resultado</h2>
→ Interpretación del dato: qué cambia respecto a lo que ya se sabía. Menciona brevemente el mecanismo biológico o pathway implicado.

<h2>Limitaciones del Estudio</h2>
→ 2-3 limitaciones concretas (tamaño muestral, duración, población específica, falta de grupo control, etc.).

<h2>Aplicación Práctica</h2>
→ Ver regla "Practical Application Honesty" arriba.

${ES_DISCLAIMER}`;
  }

  return `<h2>La Pregunta</h2>
→ Qué gap de conocimiento motivó este estudio. Sin repetir el título.

<h2>El Experimento</h2>
→ Autores, institución, metodología exacta, tamaño muestral, cómo lo midieron.

<h2>Lo Que Encontraron</h2>
→ Resultado con datos concretos (porcentajes, p-values, effect sizes).

<h2>Por Qué Importa</h2>
→ Mecanismo biológico o pathway implicado + implicación más amplia. No repitas la sección anterior.

<h2>Limitaciones del Estudio</h2>
→ 2-3 limitaciones concretas (tamaño muestral, duración, población específica, falta de grupo control, etc.).

<h2>Aplicación Práctica</h2>
→ Ver regla "Practical Application Honesty" arriba.

${ES_DISCLAIMER}`;
}

function buildEnglishStructure(variant: 1 | 2 | 3): string {
  if (variant === 1) {
    return `<h2>The Finding</h2>
→ What they found, in one clear sentence with the key data point. Name authors, institution, exact methodology, and sample size.

<h2>How They Got There</h2>
→ Study design, measured variables, control group if applicable. Use a comparison table if there are 3+ variables with numeric values.

<h2>The Mechanism: What Happens Biologically</h2>
→ Underlying molecular or biological pathway. Cite any biomarker or pathway named in the study (mTOR, AMPK, HIF-1α, etc.). Do not overlap with the previous section.

<h2>Study Limitations</h2>
→ 2-3 specific limitations (sample size, duration, specific population, lack of control group, etc.).

<h2>Practical Application</h2>
→ See the "Practical Application Honesty" rule above.

${EN_DISCLAIMER}`;
  }

  if (variant === 2) {
    return `<h2>The Numbers</h2>
→ Open with the concrete data: percentages, p-values, effect sizes, sample size. Use a comparison table if there are 3+ numeric variables.

<h2>Context: What This Study Is</h2>
→ Authors, institution, exact methodology, why this study was done.

<h2>What This Result Means</h2>
→ Interpret the data: what changes relative to what was already known. Briefly mention the biological mechanism or pathway involved.

<h2>Study Limitations</h2>
→ 2-3 specific limitations (sample size, duration, specific population, lack of control group, etc.).

<h2>Practical Application</h2>
→ See the "Practical Application Honesty" rule above.

${EN_DISCLAIMER}`;
  }

  return `<h2>The Question</h2>
→ What knowledge gap motivated this study. Do not restate the title.

<h2>The Experiment</h2>
→ Authors, institution, exact methodology, sample size, how they measured it.

<h2>What They Found</h2>
→ Result with concrete data (percentages, p-values, effect sizes).

<h2>Why It Matters</h2>
→ Biological mechanism or pathway involved + the broader implication. Do not repeat the previous section.

<h2>Study Limitations</h2>
→ 2-3 specific limitations (sample size, duration, specific population, lack of control group, etc.).

<h2>Practical Application</h2>
→ See the "Practical Application Honesty" rule above.

${EN_DISCLAIMER}`;
}

/**
 * Formats the structured study data block injected into the user message.
 * This ensures the LLM always sees hard data in a predictable schema.
 */
function buildStudyDataBlock(study: PubMedStudy, metadata: StudyMetadata): string {
  const authorsStr = study.authors.length > 0
    ? study.authors.slice(0, 5).join(', ') + (study.authors.length > 5 ? ' et al.' : '')
    : 'Not available';

  return `## STUDY DATA BLOCK (USE ALL AVAILABLE FIELDS)

- **PMID**: ${study.pmid}
- **Source URL**: ${study.url}
- **DOI**: ${study.doi || 'Not available'}
- **Journal**: ${study.journal || 'Not available'}
- **Publication Year**: ${study.pubDate?.split('-')[0] || 'Not available'}
- **Authors**: ${authorsStr}
- **Lead Author Last Name**: ${study.firstAuthorLastName || 'Not available'}
- **Primary Institution**: ${study.institution || 'Not available'}
- **Sample Size Hint**: ${study.sampleSizeHint || 'Not explicitly stated in abstract'}
- **AI-Derived Category**: ${metadata.category}
- **AI-Derived Product Keywords**: ${metadata.product_keywords.join(', ') || 'None'}
- **Trust Score**: ${metadata.trust_score}/100

## ORIGINAL ABSTRACT (PRIMARY SOURCE — extract specific data from here)

${study.abstract}

## ARTICLE PARAMETERS

- **Target Title**: ${metadata.title}
- **Key Benefits to Address**: ${metadata.key_benefits.join(' | ')}
- **TL;DR (do not repeat verbatim — this is for context only)**: ${metadata.tl_dr}`;
}

/**
 * Deterministic safety net for the Practical Application Honesty rule.
 * The LLM (Groq/Llama-3.3-70b especially) sometimes ignores the prompt
 * instruction and follows a "too early to apply" statement with a
 * "Sin embargo / However" sentence that reintroduces generic, unsubstantiated
 * reassurance about the intervention. Prompt tightening alone did not fully
 * eliminate this — this strips that specific sentence deterministically.
 */
function stripPrematureReassurance(html: string, locale: Locale): string {
  const heading = locale === 'es' ? 'Aplicaci[oó]n Pr[aá]ctica' : 'Practical Application';
  const tooEarlyMarker = locale === 'es' ? /demasiado pronto/i : /too early/i;
  const bannedStart = locale === 'es' ? /^(sin embargo|no obstante)\b/i : /^(however|that said)\b/i;

  const sectionRegex = new RegExp(`(<h2>${heading}<\\/h2>\\s*<p>)([\\s\\S]*?)(<\\/p>)`, 'i');
  const match = html.match(sectionRegex);
  if (!match) return html;

  const [, openTag, body, closeTag] = match;
  if (!tooEarlyMarker.test(body)) return html;

  const sentences = body.split(/(?<=[.!?])\s+/);
  const cleaned = sentences.filter((s) => !bannedStart.test(s.trim())).join(' ').trim();

  if (cleaned === body.trim()) return html;

  console.log('🧹 Stripped a "sin embargo / however" reassurance sentence from Practical Application section');
  return html.replace(sectionRegex, `${openTag}${cleaned}${closeTag}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE CLASS
// ─────────────────────────────────────────────────────────────────────────────

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

  private getGeminiModel(modelName: string = this.primaryModelName) {
    return this.genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1beta" });
  }

  /**
   * Step 1: Extracts structured metadata from the raw abstract.
   * Uses a proper system/user message split for better instruction-following.
   */
  async extractKeyPoints(abstract: string, locale: Locale = 'es'): Promise<StudyMetadata> {
    const systemPrompt = buildExtractionSystemPrompt(locale);
    const userMessage = `Extract metadata from this scientific abstract:\n\n${abstract}`;

    if (this.groq) {
      try {
        console.log('⚡ Trying Groq (llama-3.3-70b) for extraction...');
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });
        return JSON.parse(completion.choices[0]?.message?.content || '{}');
      } catch (error: any) {
        console.warn('⚠️ Groq failed, falling back to Gemini:', error.message);
      }
    }

    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      const model = this.getGeminiModel(modelName);
      try {
        console.log(`Trying Gemini (${modelName}) for extraction...`);
        const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
        const text = result.response.text();
        const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (error: any) {
        lastError = error;
        if (error.status === 429) throw error;
      }
    }
    throw lastError || new Error("All AI models failed for extraction");
  }

  /**
   * Step 2: Generates the full article using the complete enriched study data.
   * Passes the full PubMedStudy object — not just derived metadata — so the LLM
   * can include hard scientific data (authors, institution, methodology, sample size).
   */
  async generatePost(
    metadata: StudyMetadata,
    study: PubMedStudy,
    locale: Locale = 'es'
  ): Promise<string> {
    // Pick one of 3 structure variants per article (not per category) so
    // consecutive articles don't all read with the identical section layout.
    // Fixed once here so Groq and any Gemini fallback attempt use the same variant.
    const structureVariant = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
    console.log(`📐 Using structure variant ${structureVariant} for "${metadata.title}"`);

    const systemPrompt = buildGenerationSystemPrompt(locale, structureVariant);
    const userMessage = buildStudyDataBlock(study, metadata);

    if (this.groq) {
      try {
        console.log('⚡ Trying Groq (llama-3.3-70b) for generation...');
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.65, // Slightly creative but factually grounded
          max_tokens: 3500,
        });
        return stripPrematureReassurance(completion.choices[0]?.message?.content || '', locale);
      } catch (error: any) {
        console.warn('⚠️ Groq failed in generation, falling back to Gemini:', error.message);
      }
    }

    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      const model = this.getGeminiModel(modelName);
      try {
        console.log(`Trying Gemini (${modelName}) for generation...`);
        const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
        const text = result.response.text();
        return stripPrematureReassurance(text.replace(/```html\n?|```\n?/g, '').trim(), locale);
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
  async generateSocialPosts(
    metadata: StudyMetadata,
    locale: Locale = 'es'
  ): Promise<{ twitter: string; linkedin: string }> {
    const lang = locale === 'es' ? 'Spanish' : 'English';
    const isEs = locale === 'es';

    const systemPrompt = `You are a social media copywriter for a science and biohacking brand.
Write in ${lang}. Output ONLY valid JSON with keys "twitter" and "linkedin". No prose outside the JSON.
Rules: Be specific. Use actual numbers from the study data. No vague claims. No emojis spam.`;

    const userMessage = `Create social copy for this article:
Title: ${metadata.title}
Key findings: ${metadata.key_benefits.join(' | ')}
Trust score: ${metadata.trust_score}/100

Twitter: 3-5 tweets. Hook in tweet 1 (stat or counterintuitive fact). Thread marker 🧵. End with article link placeholder [LINK].
LinkedIn: Professional. Lead with a bold data point. 3-4 bullet findings. CTA: "${isEs ? 'Análisis completo en el primer comentario 👇' : 'Full analysis in the first comment 👇'}"`;

    if (this.groq) {
      try {
        console.log('⚡ Trying Groq for social posts...');
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.75,
        });
        return JSON.parse(completion.choices[0]?.message?.content || '{}');
      } catch (error: any) {
        console.warn('⚠️ Groq failed in social posts, falling back to Gemini:', error.message);
      }
    }

    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: any;

    for (const modelName of modelsToTry) {
      const model = this.getGeminiModel(modelName);
      try {
        console.log(`Trying Gemini (${modelName}) for social posts...`);
        const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
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
   * Orchestrates the full transformation pipeline.
   * Now requires the full PubMedStudy object so generatePost can access hard data.
   */
  async transformStudy(study: PubMedStudy, locale: Locale = 'es'): Promise<TransformedPost> {
    const metadata = await this.extractKeyPoints(study.abstract, locale);

    // Rate limit buffer
    await new Promise(resolve => setTimeout(resolve, 2000));

    const [content_html, social, coverImage] = await Promise.all([
      this.generatePost(metadata, study, locale),
      this.generateSocialPosts(metadata, locale),
      fetchUnsplashImage(metadata.product_keywords, metadata.title),
    ]);

    return {
      metadata,
      content_html,
      locale,
      social,
      cover_image_url: coverImage?.url ?? null,
      cover_image_alt: coverImage?.alt ?? null,
      cover_image_credit: coverImage?.credit ?? null,
      cover_image_credit_url: coverImage?.creditUrl ?? null,
    };
  }

  /**
   * Dynamically injects affiliate links into the content based on product keywords.
   * @param htmlContent The original HTML content
   * @param products List of available products with their keywords and links
   */
  injectAffiliateLinks(
    htmlContent: string,
    products: { keywords: string[]; link: string }[]
  ): string {
    let modifiedContent = htmlContent;

    // Sort by keyword length desc (match more specific terms first)
    const allKeywords = products.flatMap(p =>
      p.keywords.map(kw => ({ kw, link: p.link }))
    );
    allKeywords.sort((a, b) => b.kw.length - a.kw.length);

    const linkedKeywords = new Set<string>();

    allKeywords.forEach(({ kw, link }) => {
      if (linkedKeywords.has(kw.toLowerCase())) return;

      const regex = new RegExp(`\\b(${kw})\\b`, 'i');
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
