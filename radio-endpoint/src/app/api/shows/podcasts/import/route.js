export const runtime = 'edge';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.NEON_DATABASE_URL);

// CORS (allow any origin)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-vercel-protection-bypass'
};

// Preflight handler
export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

// Improved CSV parser
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  // Parse headers - handle quoted headers
  const headerLine = lines[0];
  const headers = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headers.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  headers.push(current.trim().replace(/^"|"$/g, ''));
  
  // Parse data rows
  return lines.slice(1).map((line, lineIndex) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Debug log for first few rows
    if (lineIndex < 3) {
      console.log(`Row ${lineIndex + 1}:`, row);
    }
    
    return row;
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get('csv');
    
    if (!csvFile) {
      return new Response(JSON.stringify({ error: 'No CSV file provided' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const csvText = await csvFile.text();
    console.log('CSV Preview:', csvText.substring(0, 500)); // Debug log
    
    const rows = parseCSV(csvText);
    console.log('Parsed rows count:', rows.length);
    console.log('First row data:', rows[0]);
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'CSV file is empty' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate required columns
    const requiredColumns = ['id', 'url', 'title', 'show', 'description'];
    const firstRow = rows[0];
    const availableColumns = Object.keys(firstRow);
    console.log('Available columns:', availableColumns);
    
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return new Response(JSON.stringify({ 
        error: `Missing required columns: ${missingColumns.join(', ')}. Available columns: ${availableColumns.join(', ')}` 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Clear existing data and insert new data
    await sql/*sql*/`DELETE FROM podcast_episodes;`;
    
    let successCount = 0;
    
    for (const row of rows) {
      // Parse ID
      let id = null;
      if (row.id && row.id.toString().trim()) {
        const parsedId = parseInt(row.id.toString().trim(), 10);
        if (!isNaN(parsedId) && parsedId > 0) {
          id = parsedId;
        }
      }
      
      const url = (row.url || '').toString().trim();
      const title = (row.title || '').toString().trim();
      const show = (row.show || '').toString().trim();
      const description = (row.description || '').toString().trim();
      const createdAt = row.created_at && row.created_at.trim() ? row.created_at.trim() : null;
      
      // Insert row if we have required data
      if (id && url && title && show) {
        await sql/*sql*/`
          INSERT INTO podcast_episodes (id, url, title, "show", description, created_at)
          VALUES (
            ${id},
            ${url},
            ${title},
            ${show},
            ${description},
            ${createdAt || 'NOW()'}
          );
        `;
        successCount++;
      } else {
        console.log(`Skipping invalid row:`, { id, url, title, show, description });
      }
    }

    return new Response(JSON.stringify({ 
      message: `Successfully imported ${successCount} out of ${rows.length} podcast episodes` 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (err) {
    console.error('Import error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}