import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
// import OpenAI from 'openai';

/*
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
*/

// -----------------------------
// Score generator
// Seeded from the URL so the same site always gets the same scores.
// Ranges: SEO 45–85, UX 50–90, Content 40–80
// -----------------------------
function seededRandom(seed: string): () => number {
  let hash = Array.from(seed).reduce((acc, ch) => {
    const h = (acc << 5) - acc + ch.charCodeAt(0);
    return h & h;
  }, 0);

  return () => {
    hash = (hash << 13) ^ hash;
    hash = (hash * (hash * hash * 15731 + 789221) + 1376312589) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function generateMockScores(url: string) {
  const rand = seededRandom(url);
  const seo     = Math.round(45 + rand() * 40); // 45–85
  const ux      = Math.round(50 + rand() * 40); // 50–90
  const content = Math.round(40 + rand() * 40); // 40–80
  const final   = Math.round(seo * 0.4 + ux * 0.35 + content * 0.25);
  return { seo, ux, content, final };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    // -----------------------------
    // 1. Fetch website
    // -----------------------------
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    });

    // -----------------------------
    // 2. Parse HTML
    // -----------------------------
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
    const h1 = $('h1').first().text().trim();
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 5);
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 2000);

    // -----------------------------
    // 3. MOCK AUDIT (ACTIVE)
    // Flip USE_MOCK to false and uncomment OpenAI block below to go live
    // -----------------------------
    const USE_MOCK = true;
    let auditIssues: {
      seo: { issue: string; impact: string; fix: string }[];
      ux: { issue: string; impact: string; fix: string }[];
      content: { issue: string; impact: string; fix: string }[];
      top_fixes: string[];
    };

    if (USE_MOCK) {
      auditIssues = {
        seo: [
          {
            issue: 'Missing meta description',
            impact: 'Lower click-through rate in search results',
            fix: 'Add a 150–160 character meta description',
          },
          {
            issue: 'Weak heading structure',
            impact: 'Search engines may not understand page hierarchy',
            fix: 'Ensure one clear H1 and structured H2s',
          },
        ],
        ux: [
          {
            issue: 'No clear call-to-action above the fold',
            impact: 'Users may not know what action to take',
            fix: 'Add a prominent CTA near the top of the page',
          },
        ],
        content: [
          {
            issue: 'Content not optimized for scanning',
            impact: 'Users may struggle to read efficiently',
            fix: 'Break content into shorter paragraphs and use subheadings',
          },
        ],
        top_fixes: [
          'Add meta description',
          'Improve heading structure',
          'Add clear CTA above the fold',
          'Improve readability',
          'Strengthen SEO structure',
        ],
      };
    } else {
      // -----------------------------
      // 4. OPENAI MODE (UNCOMMENT TO USE)
      // -----------------------------
      /*
      const prompt = `
Analyze this website content and return a JSON audit.

Title: ${title}
Meta Description: ${metaDescription}
H1: ${h1}
H2s: ${h2s.join(', ')}
Content: ${textContent}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a website auditor. Respond ONLY with a valid JSON object with exactly these keys: ' +
              '"seo", "ux", "content" (each an array of {issue, impact, fix} objects) and ' +
              '"top_fixes" (array of exactly 5 strings). ' +
              'No markdown, no explanation, no extra keys.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      });

      const aiText = response.choices[0].message.content || '';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in AI response');
      auditIssues = JSON.parse(jsonMatch[0]);
      */

      throw new Error('OpenAI mode not enabled. Set USE_MOCK = true or uncomment the OpenAI block.');
    }

    // -----------------------------
    // 5. Calculate scores
    // -----------------------------
    const scores = generateMockScores(url);

    // -----------------------------
    // 6. Response
    // -----------------------------
    return NextResponse.json({
      url,
      title,
      audit: auditIssues,
      scores,
      mode: USE_MOCK ? 'mock' : 'ai',
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to generate audit', details: error?.message },
      { status: 500 }
    );
  }
}