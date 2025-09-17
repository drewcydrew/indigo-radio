export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS (allow any origin)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-vercel-protection-bypass'
};

// Preflight handler
export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    const rows = await sql/*sql*/`
      SELECT
        id,
        url,
        title,
        "show",
        description
      FROM podcast_episodes
      ORDER BY created_at DESC, id ASC;
    `;

    console.log('Raw database rows:', rows.slice(0, 3)); // Log first 3 rows

    const result = rows.map(r => ({
      id: r.id,
      url: r.url,
      title: r.title,
      show: r.show,
      description: r.description
    }));

    console.log('Mapped result:', result.slice(0, 3)); // Log first 3 mapped rows

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function POST(request) {
  try {
    const { id, url, title, show, description } = await request.json();
    
    if (!id || !url || !title || !show) {
      return new Response(JSON.stringify({ error: 'ID, URL, title, and show are required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate ID is not empty after trimming
    const episodeId = String(id).trim();
    if (!episodeId) {
      return new Response(JSON.stringify({ error: 'Valid ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const rows = await sql/*sql*/`
      INSERT INTO podcast_episodes (id, url, title, "show", description, created_at)
      VALUES (
        ${episodeId},
        ${url.trim()},
        ${title.trim()},
        ${show.trim()},
        ${description?.trim() || ''},
        NOW()
      )
      RETURNING id, url, title, "show", description;
    `;
    
    return new Response(JSON.stringify({
      message: 'Episode created successfully',
      episode: {
        id: rows[0].id,
        url: rows[0].url,
        title: rows[0].title,
        show: rows[0].show,
        description: rows[0].description
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
