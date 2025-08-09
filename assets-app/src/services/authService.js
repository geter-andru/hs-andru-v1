import { airtableService } from './airtableService';

export const authService = {
  // Validate customer credentials
  async validateCredentials(customerId, accessToken) {
    try {
      if (!customerId || !accessToken) {
        return { 
          valid: false, 
          error: 'Missing customer ID or access token' 
        };
      }

      const customerData = await airtableService.getCustomerAssets(customerId, accessToken);
      
      return {
        valid: true,
        customerData
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  },

  // Extract credentials from URL
  extractCredentials(location) {
    const urlParams = new URLSearchParams(location.search);
    const pathParts = location.pathname.split('/');
    
    return {
      customerId: pathParts[2] || null, // /customer/:customerId
      accessToken: urlParams.get('token')
    };
  },

  // Generate secure session
  generateSession(customerData, accessToken) {
    const sessionData = {
      customerId: customerData.customerId,
      customerName: customerData.customerName,
      recordId: customerData.id,
      accessToken: accessToken,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    // Store in sessionStorage (more secure than localStorage for tokens)
    sessionStorage.setItem('customerSession', JSON.stringify(sessionData));
    return sessionData;
  },

  // Get current session
  getCurrentSession() {
    try {
      const sessionData = sessionStorage.getItem('customerSession');
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error reading session:', error);
      this.clearSession();
      return null;
    }
  },

  // Clear session
  clearSession() {
    sessionStorage.removeItem('customerSession');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.getCurrentSession() !== null;
  },

  // Refresh session timestamp
  refreshSession() {
    const session = this.getCurrentSession();
    if (session) {
      session.timestamp = Date.now();
      sessionStorage.setItem('customerSession', JSON.stringify(session));
    }
  }
};