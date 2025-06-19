const validateCompany = (companyName) => {
  // Validate input
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
    return {
      isValid: false,
      message: 'Invalid company name. Please provide a valid company name.'
    };
  }

  // Trim and validate company name length
  const trimmedCompanyName = companyName.trim();
  if (trimmedCompanyName.length > 100) {
    return {
      isValid: false,
      message: 'Company name too long. Please limit to 100 characters.'
    };
  }

  return {
    isValid: true,
    companyName: trimmedCompanyName
  };
};

module.exports = validateCompany;