const { createClient } = require('@supabase/supabase-js');

// Load environment variables first
require('dotenv').config();

/**
 * Supabase Client Configuration
 * Handles connection to Supabase PostgreSQL database for Trade Pulse
 */

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [SUPABASE] Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_KEY in .env file.');
  console.error(`   SUPABASE_URL: ${supabaseUrl ? 'configured' : 'missing'}`);
  console.error(`   SUPABASE_KEY: ${supabaseKey ? 'configured' : 'missing'}`);
  // Don't throw error immediately, allow the app to start and show health check failures
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Insert NSE corporate filings into the database
 * @param {Array} announcements - Array of announcement objects to insert
 * @param {string} symbol - Company symbol for logging
 * @returns {Object} - Insertion result with success status and details
 */
async function insertNSEFilings(announcements, symbol) {
  if (!supabase) {
    console.error('❌ [SUPABASE] Database client not initialized. Check environment variables.');
    return {
      success: false,
      error: 'Supabase client not initialized',
      insertedCount: 0,
      skippedCount: announcements.length,
      totalProcessed: announcements.length
    };
  }

  try {
    console.log(`💾 [SUPABASE] Starting database insertion for ${announcements.length} announcements (${symbol})`);

    const insertData = announcements.map(announcement => ({
      symbol: announcement.symbol,
      subject: announcement.desc,
      company_name: announcement.sm_name,
      details: announcement.attchmntText,
      industry: announcement.smIndustry,
      attachment: announcement.attchmntFile,
      file_size: announcement.fileSize,
      broadcast_date_time: announcement.exchdisstime
    }));

    let insertedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Insert records one by one to handle duplicates gracefully
    for (const record of insertData) {
      try {
        // Check if record already exists based on symbol and attachment
        const { data: existingData, error: checkError } = await supabase
          .from('nse_corporate_filings')
          .select('id')
          .eq('symbol', record.symbol)
          .eq('attachment', record.attachment)
          .limit(1);

        if (checkError) {
          console.warn(`⚠️ [SUPABASE] Error checking for existing record: ${checkError.message}`);
        }

        if (existingData && existingData.length > 0) {
          // Record already exists, skip insertion
          skippedCount++;
          console.log(`🔄 [SUPABASE] Skipping duplicate record for ${record.symbol}: ${record.subject}`);
          continue;
        }

        // Insert new record
        const { data, error } = await supabase
          .from('nse_corporate_filings')
          .insert(record)
          .select();

        if (error) {
          errors.push(`${record.symbol}: ${error.message}`);
          console.warn(`⚠️ [SUPABASE] Failed to insert record for ${record.symbol}: ${error.message}`);
          skippedCount++;
        } else {
          insertedCount++;
          console.log(`✅ [SUPABASE] Inserted record for ${record.symbol}: ${record.subject}`);
        }

      } catch (recordError) {
        errors.push(`${record.symbol}: ${recordError.message}`);
        console.warn(`⚠️ [SUPABASE] Error processing record for ${record.symbol}: ${recordError.message}`);
        skippedCount++;
      }
    }

    console.log(`✅ [SUPABASE] Completed processing ${announcements.length} records for ${symbol}`);
    console.log(`   📝 Inserted: ${insertedCount} | 🔄 Skipped: ${skippedCount}`);

    return {
      success: insertedCount > 0 || skippedCount === announcements.length,
      insertedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : null,
      totalProcessed: announcements.length
    };

  } catch (error) {
    console.error(`💥 [SUPABASE] Unexpected error during database insertion for ${symbol}:`, error);
    return {
      success: false,
      error: error.message,
      insertedCount: 0,
      skippedCount: 0,
      totalProcessed: announcements.length
    };
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} - Connection status
 */
async function testConnection() {
  if (!supabase) {
    console.error('❌ [SUPABASE] Database client not initialized. Check environment variables.');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('nse_corporate_filings')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ [SUPABASE] Connection test failed:', error.message);
      return false;
    }

    console.log('✅ [SUPABASE] Database connection successful');
    return true;
  } catch (error) {
    console.error('💥 [SUPABASE] Connection test error:', error);
    return false;
  }
}

/**
 * Get recent filings for a specific symbol
 * @param {string} symbol - Company symbol
 * @param {number} limit - Number of records to fetch (default: 10)
 * @returns {Promise<Object>} - Query result
 */
async function getRecentFilings(symbol, limit = 10) {
  if (!supabase) {
    console.error('❌ [SUPABASE] Database client not initialized. Check environment variables.');
    return { success: false, error: 'Supabase client not initialized', data: [] };
  }

  try {
    const { data, error } = await supabase
      .from('nse_corporate_filings')
      .select('*')
      .eq('symbol', symbol)
      .order('broadcast_date_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`❌ [SUPABASE] Failed to fetch recent filings for ${symbol}:`, error.message);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data, count: data.length };
  } catch (error) {
    console.error(`💥 [SUPABASE] Unexpected error fetching filings for ${symbol}:`, error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Clean up test data (useful for testing)
 * @param {string} symbol - Symbol to clean up (default: 'TEST')
 * @returns {Promise<Object>} - Cleanup result
 */
async function cleanupTestData(symbol = 'TEST') {
  if (!supabase) {
    console.error('❌ [SUPABASE] Database client not initialized. Check environment variables.');
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('nse_corporate_filings')
      .delete()
      .eq('symbol', symbol);

    if (error) {
      console.error(`❌ [SUPABASE] Failed to cleanup test data for ${symbol}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`🧹 [SUPABASE] Cleaned up test data for ${symbol}`);
    return { success: true };
  } catch (error) {
    console.error(`💥 [SUPABASE] Unexpected error during cleanup for ${symbol}:`, error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  supabase,
  insertNSEFilings,
  testConnection,
  getRecentFilings,
  cleanupTestData
};
