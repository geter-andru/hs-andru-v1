import axios from 'axios';

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;
const API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;

// Create axios instance with default config
const airtableClient = axios.create({
  baseURL: `${BASE_URL}/${BASE_ID}`,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Add request interceptor for logging
airtableClient.interceptors.request.use(
  (config) => {
    console.log('Airtable Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
airtableClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Airtable Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch data from Airtable');
  }
);

export const airtableService = {
  // Fetch customer assets data
  async getCustomerAssets(customerId, accessToken) {
    try {
      // First try to get by record ID if customerId looks like a record ID
      if (customerId.startsWith('rec')) {
        const response = await airtableClient.get(`/Customer Assets/${customerId}`);
        const record = response.data;
        
        // Verify access token matches
        if (record.fields['Access Token'] !== accessToken) {
          throw new Error('Invalid customer ID or access token');
        }
        
        return {
          id: record.id,
          customerId: record.fields['Customer ID'] || customerId,
          customerName: record.fields['Customer Name'],
          accessToken: record.fields['Access Token'],
          icpContent: this.parseJsonField(record.fields['ICP Content']),
          costCalculatorContent: this.parseJsonField(record.fields['Cost Calculator Content']),
          businessCaseContent: this.parseJsonField(record.fields['Business Case Content']),
          createdAt: record.fields['Created At'],
          lastAccessed: record.fields['Last Accessed']
        };
      }
      
      // Fallback to formula field query (get all records and filter in code)
      const response = await airtableClient.get('/Customer Assets', {
        params: {
          filterByFormula: `{Access Token} = '${accessToken}'`,
          maxRecords: 100
        }
      });

      // Find matching record by Customer ID (since formula fields don't filter reliably)
      const matchingRecord = response.data.records.find(record => 
        record.fields['Customer ID'] === customerId && 
        record.fields['Access Token'] === accessToken
      );

      if (!matchingRecord) {
        throw new Error('Invalid customer ID or access token');
      }

      const record = matchingRecord;
      return {
        id: record.id,
        customerId: record.fields['Customer ID'],
        customerName: record.fields['Customer Name'],
        accessToken: record.fields['Access Token'],
        icpContent: this.parseJsonField(record.fields['ICP Content']),
        costCalculatorContent: this.parseJsonField(record.fields['Cost Calculator Content']),
        businessCaseContent: this.parseJsonField(record.fields['Business Case Content']),
        createdAt: record.fields['Created At'],
        lastAccessed: record.fields['Last Accessed']
      };
    } catch (error) {
      console.error('Error fetching customer assets:', error);
      throw error;
    }
  },

  // Update last accessed timestamp
  async updateLastAccessed(recordId) {
    try {
      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'Last Accessed': new Date().toISOString()
          }
        }]
      });
    } catch (error) {
      console.error('Error updating last accessed:', error);
      // Don't throw - this is not critical
    }
  },

  // Save user progress/state
  async saveUserProgress(customerId, toolName, progressData) {
    try {
      const response = await airtableClient.post('/User Progress', {
        records: [{
          fields: {
            'Customer ID': customerId,
            'Tool Name': toolName,
            'Progress Data': JSON.stringify(progressData),
            'Updated At': new Date().toISOString()
          }
        }]
      });
      return response.data.records[0];
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw error;
    }
  },

  // Fetch user progress
  async getUserProgress(customerId, toolName) {
    try {
      const response = await airtableClient.get('/User Progress', {
        params: {
          filterByFormula: `AND({Customer ID} = '${customerId}', {Tool Name} = '${toolName}')`,
          sort: [{ field: 'Updated At', direction: 'desc' }],
          maxRecords: 1
        }
      });

      if (response.data.records.length > 0) {
        const record = response.data.records[0];
        return this.parseJsonField(record.fields['Progress Data']);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  },

  // Helper method to safely parse JSON fields
  parseJsonField(field) {
    if (!field) return null;
    try {
      return typeof field === 'string' ? JSON.parse(field) : field;
    } catch (error) {
      console.error('Error parsing JSON field:', error);
      return null;
    }
  },

  // Health check method
  async healthCheck() {
    try {
      const response = await airtableClient.get('/Customer Assets', {
        params: { maxRecords: 1 }
      });
      return true;
    } catch (error) {
      console.error('Airtable health check failed:', error);
      return false;
    }
  }
};