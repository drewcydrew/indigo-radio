export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS (allow any origin)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-vercel-protection-bypass'
};

// Preflight handler
export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function PUT(request, { params }) {
  try {
    console.log('Raw params object:', params);
    
    const resolvedParams = await params;
    console.log('Resolved params:', resolvedParams);
    
    const { id } = resolvedParams;
    console.log('Extracted ID:', id, 'Type:', typeof id);
    
    const requestData = await request.json();
    console.log('Request data:', requestData);
    
    const { url, title, show, description } = requestData;
    
    // More lenient ID validation
    if (!id) {
      console.error('No ID provided');
      return new Response(JSON.stringify({ error: 'Episode ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    const idString = String(id).trim();
    
    // Try to parse as integer first
    const episodeId = parseInt(idString, 10);
    
    // If it's not a valid integer, treat it as a string ID
    if (isNaN(episodeId)) {
      console.log('Using string ID:', idString);
      
      const rows = await sql/*sql*/`
        UPDATE podcast_episodes 
        SET 
          url = ${url || ''},
          title = ${title || ''},
          "show" = ${show || ''},
          description = ${description || ''}
        WHERE id::text = ${idString}
        RETURNING id, url, title, "show", description;
      `;
      
      console.log('Update result with string ID:', rows);
      
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Podcast episode not found' }), {
          status: 404,
          headers: corsHeaders
        });
      }
      
      return new Response(JSON.stringify({
        message: 'Episode updated successfully',
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
    }
    
    // Use numeric ID
    console.log('Using numeric ID:', episodeId);

    const rows = await sql/*sql*/`
      UPDATE podcast_episodes 
      SET 
        url = ${url || ''},
        title = ${title || ''},
        "show" = ${show || ''},
        description = ${description || ''}
      WHERE id = ${episodeId}
      RETURNING id, url, title, "show", description;
    `;
    
    console.log('Update result:', rows);
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Podcast episode not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Episode updated successfully',
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
    console.error('PUT error:', err);
    return new Response(JSON.stringify({ 
      error: err.message,
      details: 'Check server logs for more information'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Episode ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    const idString = String(id).trim();
    const episodeId = parseInt(idString, 10);
    
    // Handle both numeric and string IDs
    if (isNaN(episodeId)) {
      const rows = await sql/*sql*/`
        DELETE FROM podcast_episodes 
        WHERE id::text = ${idString}
        RETURNING id;
      `;
      
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Podcast episode not found' }), {
          status: 404,
          headers: corsHeaders
        });
      }
    } else {
      const rows = await sql/*sql*/`
        DELETE FROM podcast_episodes 
        WHERE id = ${episodeId}
        RETURNING id;
      `;
      
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Podcast episode not found' }), {
          status: 404,
          headers: corsHeaders
        });
      }
    }
    
    return new Response(JSON.stringify({
      message: 'Episode deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (err) {
    console.error('DELETE error:', err);
    return new Response(JSON.stringify({ 
      error: err.message,
      details: 'Check server logs for more information'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
