export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS (allow any origin)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
        description,
        to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.US+00') AS created_at
      FROM podcast_episodes
      ORDER BY created_at DESC, id ASC;
    `;

    // Convert to CSV
    const headers = ['id', 'url', 'title', 'show', 'description', 'created_at'];
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escaped = String(value).replace(/"/g, '""');
          return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ].join('\n');

    return new Response(csvContent, {
      headers: { 
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="podcast_episodes.csv"',
        ...corsHeaders 
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
