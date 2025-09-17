export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS (allow any origin)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-vercel-protection-bypass'
};

// Preflight handler
export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    const rows = await sql/*sql*/`
      SELECT address
      FROM streamingaddress
      LIMIT 1;
    `;
    
    const radioAddress = rows.length > 0 ? rows[0].address : null;
    
    if (!radioAddress) {
      return new Response(JSON.stringify({ error: 'No streaming address found' }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({ radioAddress }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function PUT(request) {
  try {
    const { address } = await request.json();
    
    if (!address || typeof address !== 'string' || !address.trim()) {
      return new Response(JSON.stringify({ error: 'Valid address is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const rows = await sql/*sql*/`
      UPDATE streamingaddress 
      SET address = ${address.trim()}
      RETURNING address;
    `;
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'No streaming address record found to update' }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({ 
      radioAddress: rows[0].address,
      message: 'Address updated successfully'
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