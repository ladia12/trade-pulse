import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName } = body;

    // Validate input
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid company name. Please provide a valid company name.'
        },
        { status: 400 }
      );
    }

    // Trim and validate company name length
    const trimmedCompanyName = companyName.trim();
    if (trimmedCompanyName.length < 2) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Company name must be at least 2 characters long.'
        },
        { status: 400 }
      );
    }

    if (trimmedCompanyName.length > 100) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Company name must be less than 100 characters.'
        },
        { status: 400 }
      );
    }

    // Generate a unique job ID (simulated)
    const jobId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Log the analysis request (simulating async processing)
    console.log(`[${new Date().toISOString()}] Analysis job started:`, {
      jobId,
      companyName: trimmedCompanyName,
      status: 'initiated'
    });

    // Simulate some processing time (optional - remove in production)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return 202 Accepted with job details
    return NextResponse.json(
      {
        status: 'accepted',
        message: 'Analysis request received. Processing will begin shortly.',
        jobId
      },
      { status: 202 }
    );

  } catch (error) {
    console.error('Error processing analysis request:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      status: 'error',
      message: 'Method not allowed. Use POST to submit analysis requests.'
    },
    { status: 405 }
  );
}