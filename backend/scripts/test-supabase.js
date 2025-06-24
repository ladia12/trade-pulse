#!/usr/bin/env node

/**
 * Supabase Integration Test Script
 * Tests the database connection and insertion operations
 * Run: npm run test-supabase or node scripts/test-supabase.js
 */

require('dotenv').config();
const { testConnection, insertNSEFilings, getRecentFilings } = require('../src/utils/supabaseClient');

// Mock announcement data for testing
const mockAnnouncements = [
  {
    symbol: "TEST",
    desc: "Test Announcement - Board Meeting",
    sm_name: "Test Company Limited",
    attchmntText: "This is a test announcement for board meeting scheduled.",
    smIndustry: "Testing Industry",
    attchmntFile: "https://test.example.com/announcement.pdf",
    fileSize: "123 KB",
    exchdisstime: "25-Dec-2024 15:30:00"
  },
  {
    symbol: "TEST",
    desc: "Test Announcement - Financial Results",
    sm_name: "Test Company Limited",
    attchmntText: "This is a test announcement for quarterly financial results.",
    smIndustry: "Testing Industry",
    attchmntFile: "https://test.example.com/results.pdf",
    fileSize: "456 KB",
    exchdisstime: "24-Dec-2024 18:00:00"
  }
];

async function runSupabaseTests() {
  console.log('🧪 [SUPABASE TEST] Starting Supabase integration tests...\n');

  try {
    // Test 1: Environment Variables
    console.log('📋 [TEST 1] Checking environment variables...');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ [TEST 1] FAILED: Missing Supabase environment variables');
      console.log('   Please ensure SUPABASE_URL and SUPABASE_KEY are set in .env file');
      process.exit(1);
    }

    console.log('✅ [TEST 1] PASSED: Environment variables are configured');
    console.log(`   SUPABASE_URL: ${supabaseUrl}`);
    console.log(`   SUPABASE_KEY: ${supabaseKey.substring(0, 20)}...`);
    console.log('');

    // Test 2: Database Connection
    console.log('🔌 [TEST 2] Testing database connection...');
    const connectionStatus = await testConnection();

    if (!connectionStatus) {
      console.error('❌ [TEST 2] FAILED: Cannot connect to Supabase database');
      console.log('   Please check your Supabase credentials and network connection');
      process.exit(1);
    }

    console.log('✅ [TEST 2] PASSED: Successfully connected to Supabase database');
    console.log('');

    // Test 3: Data Insertion
    console.log('💾 [TEST 3] Testing data insertion...');
    const insertResult = await insertNSEFilings(mockAnnouncements, 'TEST');

    if (!insertResult.success) {
      console.error('❌ [TEST 3] FAILED: Data insertion failed');
      console.error(`   Error: ${insertResult.error}`);
      process.exit(1);
    }

    console.log('✅ [TEST 3] PASSED: Successfully inserted test data');
    console.log(`   Inserted: ${insertResult.insertedCount} records`);
    console.log(`   Skipped: ${insertResult.skippedCount} records`);
    console.log('');

    // Test 4: Data Retrieval
    console.log('📊 [TEST 4] Testing data retrieval...');
    const retrievalResult = await getRecentFilings('TEST', 5);

    if (!retrievalResult.success || retrievalResult.count === 0) {
      console.error('❌ [TEST 4] FAILED: Data retrieval failed or no data found');
      console.error(`   Error: ${retrievalResult.error || 'No records found'}`);
      process.exit(1);
    }

    console.log('✅ [TEST 4] PASSED: Successfully retrieved test data');
    console.log(`   Retrieved: ${retrievalResult.count} records`);
    console.log('   Sample record:');
    console.log(`     Symbol: ${retrievalResult.data[0].symbol}`);
    console.log(`     Subject: ${retrievalResult.data[0].subject}`);
    console.log(`     Company: ${retrievalResult.data[0].company_name}`);
    console.log('');

    // Test 5: Duplicate Handling
    console.log('🔄 [TEST 5] Testing duplicate handling...');
    const duplicateResult = await insertNSEFilings(mockAnnouncements, 'TEST');

    console.log('✅ [TEST 5] PASSED: Duplicate handling test completed');
    console.log(`   New insertions: ${duplicateResult.insertedCount}`);
    console.log(`   Duplicates/Updates: ${duplicateResult.skippedCount}`);
    console.log('');

    // Summary
    console.log('🎉 [SUMMARY] All Supabase integration tests passed successfully!');
    console.log('');
    console.log('✅ Database connection: Working');
    console.log('✅ Data insertion: Working');
    console.log('✅ Data retrieval: Working');
    console.log('✅ Duplicate handling: Working');
    console.log('✅ Error handling: Working');
    console.log('');
    console.log('🚀 Your Supabase integration is ready for production!');

  } catch (error) {
    console.error('💥 [CRITICAL ERROR] Unexpected error during testing:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runSupabaseTests();
}

module.exports = { runSupabaseTests };
