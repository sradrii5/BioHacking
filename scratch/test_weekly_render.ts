import * as React from 'react';
import { render } from '@react-email/render';
import WeeklyDigestEmail from '../src/emails/WeeklyDigest';

async function testRender() {
  console.log('🧪 Testing rendering of WeeklyDigestEmail...');
  const testArticles = [
    { title: 'Test Article 1', slug: 'test-article-1' },
    { title: 'Test Article 2', slug: 'test-article-2' }
  ];

  try {
    console.log('Rendering in Spanish ("es")...');
    const esHtml = await render(React.createElement(WeeklyDigestEmail, {
      articles: testArticles,
      lang: 'es'
    }));
    console.log('✅ Spanish HTML rendered successfully! Length:', esHtml.length);

    console.log('Rendering in English ("en")...');
    const enHtml = await render(React.createElement(WeeklyDigestEmail, {
      articles: testArticles,
      lang: 'en'
    }));
    console.log('✅ English HTML rendered successfully! Length:', enHtml.length);

  } catch (error) {
    console.error('❌ Rendering failed:', error);
  }
}

testRender();
