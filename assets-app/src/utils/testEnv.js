/**
 * Test Environment Variables
 * Run this to verify environment variables are loaded correctly
 */

export const testEnvironmentVariables = () => {
  console.log('=== Environment Variables Test ===');
  
  const variables = {
    'REACT_APP_AIRTABLE_BASE_ID': process.env.REACT_APP_AIRTABLE_BASE_ID,
    'REACT_APP_AIRTABLE_API_KEY': process.env.REACT_APP_AIRTABLE_API_KEY,
    'REACT_APP_APP_NAME': process.env.REACT_APP_APP_NAME,
    'NODE_ENV': process.env.NODE_ENV
  };
  
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      // Mask API key for security
      if (key.includes('API_KEY')) {
        const masked = value.substring(0, 10) + '...' + value.substring(value.length - 5);
        console.log(`✅ ${key}: ${masked}`);
      } else {
        console.log(`✅ ${key}: ${value}`);
      }
    } else {
      console.error(`❌ ${key}: NOT SET`);
    }
  });
  
  console.log('=================================');
  
  // Return status
  const allSet = Object.values(variables).every(v => v !== undefined && v !== null && v !== '');
  return allSet;
};

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  testEnvironmentVariables();
}

export default testEnvironmentVariables;