const express = require('express');

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed. Use POST.'
    });
  }

  try {
    const { companyName } = req.body;

    // Validate input
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid company name. Please provide a valid company name.'
      });
    }

    // Trim and validate company name length
    const trimmedCompanyName = companyName.trim();
    if (trimmedCompanyName.length > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Company name too long. Please limit to 100 characters.'
      });
    }

    // Generate a simple job ID
    const jobId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Log the analysis request (simulating async processing)
    console.log(`[${new Date().toISOString()}] Analysis request received for company: "${trimmedCompanyName}" | Job ID: ${jobId}`);
    console.log(`[${new Date().toISOString()}] Simulating async analysis processing for job: ${jobId}`);

    // Return 202 Accepted response
    return res.status(202).json({
      status: 'accepted',
      message: 'Analysis request received. Processing will begin shortly.',
      jobId: jobId
    });

  } catch (error) {
    console.error('Error processing analysis request:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error. Please try again later.'
    });
  }
}