export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

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

    const result = rows.map(r => ({
      id: r.id,
      url: r.url,
      title: r.title,
      show: r.show,           // column is quoted in SQL; JS key can be plain
      description: r.description
    }));

    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
