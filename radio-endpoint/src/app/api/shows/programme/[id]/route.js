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
    const { name, day, startTime, endTime } = requestData;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Programme ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const programmeId = parseInt(String(id).trim(), 10);
    if (isNaN(programmeId) || programmeId <= 0) {
      return new Response(JSON.stringify({ error: 'Valid numeric ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const rows = await sql/*sql*/`
      UPDATE programme 
      SET 
        name = ${name || ''},
        day = ${day || ''},
        start_time = ${startTime || '00:00'},
        end_time = ${endTime || '00:00'}
      WHERE id = ${programmeId}
      RETURNING 
        id, 
        name, 
        day, 
        to_char(start_time, 'HH24:MI') AS start_time,
        to_char(end_time, 'HH24:MI') AS end_time;
    `;
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Programme entry not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Programme updated successfully',
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
      return new Response(JSON.stringify({ error: 'Programme ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const programmeId = parseInt(String(id).trim(), 10);
    if (isNaN(programmeId) || programmeId <= 0) {
      return new Response(JSON.stringify({ error: 'Valid numeric ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const rows = await sql/*sql*/`
      DELETE FROM programme 
      WHERE id = ${programmeId}
      RETURNING id;
    `;
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Programme entry not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Programme deleted successfully'
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
