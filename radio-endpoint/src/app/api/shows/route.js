export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL);

/** Small helper to build safe ILIKE patterns */
const like = (v) => v ? `%${v}%` : null;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const frequency = searchParams.get('frequency');          // exact
    const genre     = like(searchParams.get('genre'));        // ilike
    const search    = like(searchParams.get('search'));       // ilike (name/desc)
    const offset    = Number(searchParams.get('offset') ?? 0);
    const limitReq  = Number(searchParams.get('limit') ?? 50);
    const limit     = Math.min(Math.max(limitReq, 1), 200);

    const rows = await sql/*sql*/`
      SELECT
        s.show_id,
        s.name,
        s.frequency,
        s.duration,
        s.description,
        s.scope,
        s.tagline,
        s.type,
        s.focus,
        s.approach,
        s.mix,
        s.schedule,
        s.demographic,
        s.established,
        s.style,
        s.perspective,
        s.artwork,
        COALESCE(h.hosts, '{}')      AS hosts,
        COALESCE(g.genres, '{}')     AS genres,
        COALESCE(t.themes, '{}')     AS themes,
        COALESCE(f.features, '{}')   AS features,
        COALESCE(a.artists, '{}')    AS featured_artists,
        COALESCE(seg.segments, '[]') AS segments
      FROM shows s
      LEFT JOIN (
        SELECT show_id, ARRAY_AGG(host ORDER BY host) AS hosts
        FROM show_hosts GROUP BY show_id
      ) h ON h.show_id = s.show_id
      LEFT JOIN (
        SELECT show_id, ARRAY_AGG(genre ORDER BY genre) AS genres
        FROM show_genres GROUP BY show_id
      ) g ON g.show_id = s.show_id
      LEFT JOIN (
        SELECT show_id, ARRAY_AGG(theme ORDER BY theme) AS themes
        FROM show_themes GROUP BY show_id
      ) t ON t.show_id = s.show_id
      LEFT JOIN (
        SELECT show_id, ARRAY_AGG(feature ORDER BY feature) AS features
        FROM show_features GROUP BY show_id
      ) f ON f.show_id = s.show_id
      LEFT JOIN (
        SELECT show_id, ARRAY_AGG(artist ORDER BY artist) AS artists
        FROM show_featured_artists GROUP BY show_id
      ) a ON a.show_id = s.show_id
      LEFT JOIN (
        SELECT show_id, JSON_AGG(JSON_BUILD_OBJECT('name', name, 'description', descr) ORDER BY name) AS segments
        FROM show_segments GROUP BY show_id
      ) seg ON seg.show_id = s.show_id
      WHERE
        (${frequency}::text IS NULL OR s.frequency = ${frequency})
        AND (${genre}::text IS NULL OR EXISTS (
              SELECT 1 FROM show_genres gg
              WHERE gg.show_id = s.show_id AND gg.genre ILIKE ${genre}
            ))
        AND (${search}::text IS NULL OR s.name ILIKE ${search} OR s.description ILIKE ${search})
      ORDER BY s.name
      OFFSET ${offset}
      LIMIT ${limit}
    `;

    return new Response(JSON.stringify(rows), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
