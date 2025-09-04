export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS (allow any origin)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-vercel-protection-bypass'
};

// Preflight
export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET() {
  try {
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
        COALESCE(h.hosts, ARRAY[]::text[])        AS hosts,
        COALESCE(g.genres, ARRAY[]::text[])       AS genres,
        COALESCE(t.themes, ARRAY[]::text[])       AS themes,
        COALESCE(f.features, ARRAY[]::text[])     AS features,
        COALESCE(a.artists, ARRAY[]::text[])      AS featured_artists,
        COALESCE(seg.segments, '[]'::json)        AS segments
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
        SELECT show_id,
               JSON_AGG(JSON_BUILD_OBJECT('name', name, 'description', descr) ORDER BY name) AS segments
        FROM show_segments GROUP BY show_id
      ) seg ON seg.show_id = s.show_id
      ORDER BY s.name;
    `;

    // Shape each record to match your original JSON (omit empty/null fields)
    const result = rows.map(r => {
      const obj = {
        showId: r.show_id,
        name: r.name
      };

      // host/hosts (single host => "host", multiple => "hosts"; zero => omit)
      if (Array.isArray(r.hosts) && r.hosts.length === 1) obj.host = r.hosts[0];
      else if (Array.isArray(r.hosts) && r.hosts.length > 1) obj.hosts = r.hosts;

      // Simple string fields (skip empty strings)
      const addIfStr = (key, val) => {
        if (val !== null && val !== undefined && String(val).trim() !== '') obj[key] = val;
      };
      addIfStr('frequency', r.frequency);
      addIfStr('duration', r.duration);
      addIfStr('description', r.description);
      addIfStr('scope', r.scope);
      addIfStr('tagline', r.tagline);
      addIfStr('approach', r.approach);
      addIfStr('mix', r.mix);
      addIfStr('schedule', r.schedule);
      addIfStr('type', r.type);
      addIfStr('demographic', r.demographic);
      addIfStr('perspective', r.perspective);
      addIfStr('style', r.style);
      addIfStr('established', r.established);
      addIfStr('focus', r.focus);
      addIfStr('artwork', r.artwork);

      // Arrays (skip if empty)
      if (Array.isArray(r.genres) && r.genres.length) obj.genres = r.genres;
      if (Array.isArray(r.features) && r.features.length) obj.features = r.features;
      if (Array.isArray(r.themes) && r.themes.length) obj.themes = r.themes;
      if (Array.isArray(r.featured_artists) && r.featured_artists.length) {
        obj.featuredArtists = r.featured_artists;
      }

      // specialSegments from segments JSON
      if (Array.isArray(r.segments) && r.segments.length) {
        obj.specialSegments = r.segments.map(s => ({
          name: s.name,
          description: s.description
        }));
      }

      return obj;
    });

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
