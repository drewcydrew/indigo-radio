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
        name,
        description
      FROM shows
      ORDER BY name ASC;
    `;

    const result = rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description
    }));

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
    const { name, description } = await request.json();
    
    if (!name) {
      return new Response(JSON.stringify({ error: 'Show name is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const rows = await sql/*sql*/`
      INSERT INTO shows (name, description)
      VALUES (
        ${name.trim()},
        ${description?.trim() || ''}
      )
      RETURNING id, name, description;
    `;
    
    return new Response(JSON.stringify({
      message: 'Show created successfully',
      show: {
        id: rows[0].id,
        name: rows[0].name,
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
