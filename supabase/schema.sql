-- Table for storing original research studies
CREATE TABLE studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source_url TEXT UNIQUE NOT NULL,
    publish_date DATE,
    raw_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for AI-transformed articles optimized for humans (YMYL)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_html TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft', -- draft, published, archived
    seo_metadata JSONB DEFAULT '{}',
    tl_dr TEXT,
    trust_score INT CHECK (trust_score >= 0 AND trust_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for affiliate products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    affiliate_link TEXT NOT NULL,
    category TEXT,
    price_point TEXT, -- low, medium, high
    keywords TEXT[], -- keywords for auto-linking
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX idx_articles_slug ON articles(slug);

-- Index for product keyword matching
CREATE INDEX idx_products_keywords ON products USING GIN (keywords);

-- Enable Row Level Security (RLS)
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create Policies for public read access
CREATE POLICY "Allow public read access for studies" ON studies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read access for articles" ON articles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read access for products" ON products FOR SELECT TO anon, authenticated USING (true);

-- Note: Service Role key bypasses RLS, so the ingestion worker will work fine.
