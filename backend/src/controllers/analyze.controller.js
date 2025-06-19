const validateCompany = require('../utils/validateCompany');

const analyzeCompany = (req, res) => {
  try {
    const { companyName } = req.body;

    // Validate input using utility function
    const validation = validateCompany(companyName);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: validation.message
      });
    }

    const trimmedCompanyName = validation.companyName;

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
};

module.exports = {
  analyzeCompany
};