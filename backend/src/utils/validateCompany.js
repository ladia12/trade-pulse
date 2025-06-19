/**
 * Validates company name input for analysis requests
 * @param {string} companyName - The company name to validate
 * @returns {Object} - Validation result with isValid boolean and message
 */
const validateCompany = (companyName) => {
  // Check if company name exists
  if (!companyName) {
    return {
      isValid: false,
      message: 'Company name is required'
    };
  }

  // Check if company name is a string
  if (typeof companyName !== 'string') {
    return {
      isValid: false,
      message: 'Company name must be a string'
    };
  }

  // Check if company name is not just whitespace
  const trimmedName = companyName.trim();
  if (trimmedName.length === 0) {
    return {
      isValid: false,
      message: 'Company name cannot be empty or contain only whitespace'
    };
  }

  // Check minimum length
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'Company name must be at least 2 characters long'
    };
  }

  // Check maximum length
  if (trimmedName.length > 200) {
    return {
      isValid: false,
      message: 'Company name cannot exceed 200 characters'
    };
  }

  // Check for valid characters (letters, numbers, spaces, common punctuation)
  const validCharacterPattern = /^[a-zA-Z0-9\s\-\.\&\(\)\,\'\"]+$/;
  if (!validCharacterPattern.test(trimmedName)) {
    return {
      isValid: false,
      message: 'Company name contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed'
    };
  }

  // Check for suspicious patterns (basic security)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\(/i,
    /document\./i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedName)) {
      return {
        isValid: false,
        message: 'Company name contains potentially harmful content'
      };
    }
  }

  // Additional business logic validations
  
  // Check for common NSE company name patterns
  const commonNSEPatterns = [
    /limited$/i,
    /ltd\.?$/i,
    /pvt\.?\s*ltd\.?$/i,
    /private\s*limited$/i,
    /corporation$/i,
    /corp\.?$/i,
    /company$/i,
    /co\.?$/i,
    /industries$/i,
    /enterprises$/i,
    /technologies$/i,
    /tech$/i,
    /systems$/i,
    /solutions$/i,
    /services$/i,
    /bank$/i,
    /financial$/i,
    /insurance$/i
  ];

  // Log validation details for monitoring
  console.log(`🔍 [VALIDATION] Validating company name: "${trimmedName}"`);
  console.log(`📏 [VALIDATION] Length: ${trimmedName.length} characters`);
  
  const hasCommonPattern = commonNSEPatterns.some(pattern => pattern.test(trimmedName));
  if (hasCommonPattern) {
    console.log(`✅ [VALIDATION] Company name matches common NSE pattern`);
  }

  // All validations passed
  return {
    isValid: true,
    message: 'Company name is valid',
    normalizedName: trimmedName,
    hasCommonNSEPattern: hasCommonPattern
  };
};

/**
 * Validates multiple company names at once
 * @param {string[]} companyNames - Array of company names to validate
 * @returns {Object} - Validation results for all companies
 */
const validateMultipleCompanies = (companyNames) => {
  if (!Array.isArray(companyNames)) {
    return {
      isValid: false,
      message: 'Input must be an array of company names'
    };
  }

  if (companyNames.length === 0) {
    return {
      isValid: false,
      message: 'At least one company name is required'
    };
  }

  if (companyNames.length > 10) {
    return {
      isValid: false,
      message: 'Cannot validate more than 10 companies at once'
    };
  }

  const results = companyNames.map((name, index) => ({
    index,
    companyName: name,
    validation: validateCompany(name)
  }));

  const validCompanies = results.filter(result => result.validation.isValid);
  const invalidCompanies = results.filter(result => !result.validation.isValid);

  return {
    isValid: invalidCompanies.length === 0,
    totalCompanies: companyNames.length,
    validCompanies: validCompanies.length,
    invalidCompanies: invalidCompanies.length,
    results,
    message: invalidCompanies.length === 0 
      ? 'All company names are valid' 
      : `${invalidCompanies.length} out of ${companyNames.length} company names are invalid`
  };
};

module.exports = {
  validateCompany,
  validateMultipleCompanies
};