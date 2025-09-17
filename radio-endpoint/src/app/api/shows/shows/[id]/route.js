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
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const requestData = await request.json();
    const { name, description } = requestData;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Show ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const showId = parseInt(String(id).trim(), 10);
    if (isNaN(showId) || showId <= 0) {
      return new Response(JSON.stringify({ error: 'Valid numeric ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const rows = await sql/*sql*/`
      UPDATE shows 
      SET 
        name = ${name || ''},
        description = ${description || ''}
      WHERE id = ${showId}
      RETURNING id, name, description;
    `;
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Show not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Show updated successfully',
      show: {
        id: rows[0].id,
        name: rows[0].name,
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
      return new Response(JSON.stringify({ error: 'Show ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const showId = parseInt(String(id).trim(), 10);
    if (isNaN(showId) || showId <= 0) {
      return new Response(JSON.stringify({ error: 'Valid numeric ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const rows = await sql/*sql*/`
      DELETE FROM shows 
      WHERE id = ${showId}
      RETURNING id;
    `;
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Show not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Show deleted successfully'
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
