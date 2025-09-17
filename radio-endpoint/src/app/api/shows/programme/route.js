export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS (allow any origin)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-vercel-protection-bypass'
};

// helper: "HH:MM[:SS]" -> "HH:MM"
const hhmm = (t) => (typeof t === 'string' ? t.slice(0, 5) : t);

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
        day,
        to_char(start_time, 'HH24:MI') AS start_time,
        to_char(end_time,   'HH24:MI') AS end_time
      FROM programme
      ORDER BY array_position(ARRAY[
        'monday','tuesday','wednesday','thursday','friday','saturday','sunday'
      ]::text[], day), start_time;
    `;

    const result = rows.map(r => ({
      id: r.id,
      name: r.name,
      day: r.day,
      startTime: hhmm(r.start_time),
      endTime: hhmm(r.end_time)
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
    const { name, day, startTime, endTime } = await request.json();
    
    if (!name || !day || !startTime || !endTime) {
      return new Response(JSON.stringify({ error: 'Name, day, start time, and end time are required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const rows = await sql/*sql*/`
      INSERT INTO programme (name, day, start_time, end_time)
      VALUES (
        ${name.trim()},
        ${day.trim()},
        ${startTime.trim()},
        ${endTime.trim()}
      )
      RETURNING 
        id, 
        name, 
        day, 
        to_char(start_time, 'HH24:MI') AS start_time,
        to_char(end_time, 'HH24:MI') AS end_time;
    `;
    
    return new Response(JSON.stringify({
      message: 'Programme created successfully',
      programme: {
        id: rows[0].id,
        name: rows[0].name,
        day: rows[0].day,
        startTime: rows[0].start_time,
        endTime: rows[0].end_time
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
