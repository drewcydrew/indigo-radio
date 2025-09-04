export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

// helper: "HH:MM[:SS]" -> "HH:MM"
const hhmm = (t) => (typeof t === 'string' ? t.slice(0, 5) : t);

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
      day: r.day,                          // already lowercase per your schema
      startTime: hhmm(r.start_time),       // "HH:MM"
      endTime: hhmm(r.end_time)
    }));

    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
