/**
 * Enhanced Airtable Service - Phase 4
 * 
 * Extended Airtable integration for comprehensive competency tracking
 * Handles Customer Actions, Competency History, and Achievement tracking
 */

import authService from './authService';

const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID || (() => {
  console.error('Missing REACT_APP_AIRTABLE_BASE_ID environment variable');
  throw new Error('Airtable configuration missing');
})();
const API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY || (() => {
  console.error('Missing REACT_APP_AIRTABLE_API_KEY environment variable');
  throw new Error('Airtable configuration missing');
})();
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

class EnhancedAirtableService {
  constructor() {
    this.headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    };
    
    // Table configurations
    this.tables = {
      customerAssets: 'Customer Assets',
      customerActions: 'Customer Actions', 
      competencyHistory: 'Customer Competency History',
      userProgress: 'User Progress'
    };
  }

  /**
   * Get customer competency data with history
   */
  async getCustomerCompetencyData(customerId) {
    try {
      // Get current assets
      const assetsResponse = await fetch(
        `${BASE_URL}/${encodeURIComponent(this.tables.customerAssets)}?filterByFormula={Customer ID}='${customerId}'`,
        { headers: this.headers }
      );
      
      if (!assetsResponse.ok) {
        throw new Error('Failed to fetch customer assets');
      }
      
      const assetsData = await assetsResponse.json();
      const customerRecord = assetsData.records[0];
      
      if (!customerRecord) {
        return null;
      }

      // Get recent actions (last 50)
      const actionsResponse = await fetch(
        `${BASE_URL}/${encodeURIComponent(this.tables.customerActions)}?` +
        `filterByFormula={Customer ID}='${customerId}'&` +
        `sort[0][field]=Action Date&sort[0][direction]=desc&maxRecords=50`,
        { headers: this.headers }
      );
      
      const actionsData = actionsResponse.ok ? await actionsResponse.json() : { records: [] };

      // Get competency history
      const historyResponse = await fetch(
        `${BASE_URL}/${encodeURIComponent(this.tables.competencyHistory)}?` +
        `filterByFormula={Customer ID}='${customerId}'&` +
        `sort[0][field]=Assessment Date&sort[0][direction]=desc&maxRecords=10`,
        { headers: this.headers }
      );
      
      const historyData = historyResponse.ok ? await historyResponse.json() : { records: [] };

      // Combine and return comprehensive competency data
      return {
        customerId,
        recordId: customerRecord.id,
        
        // Core competency scores
        baselineCustomerAnalysis: customerRecord.fields['baseline_customer_analysis'] || 45,
        baselineValueCommunication: customerRecord.fields['baseline_value_communication'] || 38,
        baselineSalesExecution: customerRecord.fields['baseline_sales_execution'] || 42,
        currentCustomerAnalysis: customerRecord.fields['current_customer_analysis'] || 45,
        currentValueCommunication: customerRecord.fields['current_value_communication'] || 38,
        currentSalesExecution: customerRecord.fields['current_sales_execution'] || 42,
        
        // Progress tracking
        totalProgressPoints: customerRecord.fields['total_progress_points'] || 0,
        competencyLevel: customerRecord.fields['Competency Level'] || 'Customer Intelligence Foundation',
        learningVelocity: customerRecord.fields['Learning Velocity'] || 0,
        
        // Tool unlocks
        toolUnlockStates: {
          icpUnlocked: customerRecord.fields['icp_unlocked'] !== false,
          costCalculatorUnlocked: customerRecord.fields['cost_calculator_unlocked'] || false,
          businessCaseUnlocked: customerRecord.fields['business_case_unlocked'] || false
        },
        
        // Achievements
        achievementIds: customerRecord.fields['Achievement IDs'] 
          ? customerRecord.fields['Achievement IDs'].split(',').map(id => id.trim())
          : [],
        
        // Development plan
        developmentPlanActive: customerRecord.fields['Development Plan Active'] || false,
        developmentFocus: customerRecord.fields['Development Focus'] || 'balanced',
        
        // Activity tracking
        lastAssessmentDate: customerRecord.fields['Last Assessment Date'],
        lastActionDate: customerRecord.fields['Last Action Date'],
        
        // Related data
        recentActions: actionsData.records.map(record => ({
          id: record.id,
          type: record.fields['Action Type'],
          description: record.fields['Action Description'],
          impact: record.fields['Impact Level'],
          pointsAwarded: record.fields['Points Awarded'],
          category: record.fields['Category'],
          actionDate: record.fields['Action Date'],
          verified: record.fields['Verified']
        })),
        
        competencyHistory: historyData.records.map(record => ({
          id: record.id,
          assessmentDate: record.fields['Assessment Date'],
          customerAnalysisScore: record.fields['Customer Analysis Score'],
          valueCommunicationScore: record.fields['Value Communication Score'],
          salesExecutionScore: record.fields['Sales Execution Score'],
          totalProgressPoints: record.fields['Total Progress Points'],
          assessmentType: record.fields['Assessment Type'],
          competencyLevel: record.fields['Competency Level']
        }))
      };
    } catch (error) {
      console.error('Error fetching customer competency data:', error);
      throw error;
    }
  }

  /**
   * Track a real-world action
   */
  async trackRealWorldAction(customerId, actionData) {
    try {
      const response = await fetch(
        `${BASE_URL}/${encodeURIComponent(this.tables.customerActions)}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            fields: {
              'Customer ID': customerId,
              'Action Type': actionData.type,
              'Action Description': actionData.description,
              'Impact Level': actionData.impact,
              'Points Awarded': actionData.pointsAwarded,
              'Category': actionData.category,
              'Action Date': actionData.actionDate || new Date().toISOString(),
              'Evidence Link': actionData.evidenceLink || '',
              'Verified': true, // Honor system
              'Created At': new Date().toISOString()
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to track action');
      }

      const result = await response.json();
      
      // Update customer's last action date and points
      await this.updateCustomerCompetencyScores(customerId, {
        additionalPoints: actionData.pointsAwarded,
        category: actionData.category,
        lastActionDate: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Error tracking real-world action:', error);
      throw error;
    }
  }

  /**
   * Update customer competency scores
   */
  async updateCustomerCompetencyScores(customerId, updates) {
    try {
      // First get current record
      const currentData = await this.getCustomerCompetencyData(customerId);
      if (!currentData) {
        throw new Error('Customer not found');
      }

      // Calculate new scores
      let newScores = {
        'current_customer_analysis': currentData.currentCustomerAnalysis,
        'current_value_communication': currentData.currentValueCommunication,
        'current_sales_execution': currentData.currentSalesExecution,
        'total_progress_points': currentData.totalProgressPoints
      };

      // Add points if provided
      if (updates.additionalPoints) {
        newScores['total_progress_points'] += updates.additionalPoints;
        
        // Update specific category score
        const pointsToScore = updates.additionalPoints / 10; // 10 points = 1 score point
        switch (updates.category) {
          case 'customerAnalysis':
            newScores['current_customer_analysis'] = Math.min(100, 
              newScores['current_customer_analysis'] + pointsToScore);
            break;
          case 'valueCommunication':
            newScores['current_value_communication'] = Math.min(100,
              newScores['current_value_communication'] + pointsToScore);
            break;
          case 'salesExecution':
            newScores['current_sales_execution'] = Math.min(100,
              newScores['current_sales_execution'] + pointsToScore);
            break;
        }
      }

      // Calculate new competency level
      const newLevel = this.calculateCompetencyLevel(newScores['total_progress_points']);
      
      // Check for tool unlocks
      const toolUnlocks = {
        'cost_calculator_unlocked': newScores['current_value_communication'] >= 70,
        'business_case_unlocked': newScores['current_sales_execution'] >= 70
      };

      // Update record
      const updateFields = {
        ...newScores,
        'Competency Level': newLevel,
        ...toolUnlocks
      };

      if (updates.lastActionDate) {
        updateFields['Last Action Date'] = updates.lastActionDate;
      }

      if (updates.achievementIds) {
        updateFields['Achievement IDs'] = updates.achievementIds.join(',');
      }

      const response = await fetch(
        `${BASE_URL}/${encodeURIComponent(this.tables.customerAssets)}/${currentData.recordId}`,
        {
          method: 'PATCH',
          headers: this.headers,
          body: JSON.stringify({ fields: updateFields })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update competency scores');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating competency scores:', error);
      throw error;
    }
  }

  /**
   * Record assessment results
   */
  async recordAssessmentResults(customerId, assessmentData) {
    try {
      // Record in history table
      const historyResponse = await fetch(
        `${BASE_URL}/${encodeURIComponent(this.tables.competencyHistory)}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            fields: {
              'Customer ID': customerId,
              'Assessment Date': new Date().toISOString(),
              'Customer Analysis Score': assessmentData.customerAnalysisScore,
              'Value Communication Score': assessmentData.valueCommunicationScore,
              'Sales Execution Score': assessmentData.salesExecutionScore,
              'Total Progress Points': assessmentData.totalProgressPoints || 0,
              'Assessment Type': assessmentData.assessmentType || 'progress',
              'Competency Level': this.calculateCompetencyLevel(assessmentData.totalProgressPoints || 0),
              'Notes': assessmentData.notes || '',
              'Created At': new Date().toISOString()
            }
          })
        }
      );

      if (!historyResponse.ok) {
        throw new Error('Failed to record assessment');
      }

      // Update customer assets with new scores
      if (assessmentData.updateCurrent) {
        await this.updateCustomerCompetencyScores(customerId, {
          currentCustomerAnalysis: assessmentData.customerAnalysisScore,
          currentValueCommunication: assessmentData.valueCommunicationScore,
          currentSalesExecution: assessmentData.salesExecutionScore,
          lastAssessmentDate: new Date().toISOString()
        });
      }

      return await historyResponse.json();
    } catch (error) {
      console.error('Error recording assessment results:', error);
      throw error;
    }
  }

  /**
   * Get customer achievements
   */
  async getCustomerAchievements(customerId) {
    try {
      const data = await this.getCustomerCompetencyData(customerId);
      if (!data) return [];
      
      return data.achievementIds || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(customerId, achievementId, bonusPoints = 0) {
    try {
      const currentData = await this.getCustomerCompetencyData(customerId);
      if (!currentData) {
        throw new Error('Customer not found');
      }

      const currentAchievements = currentData.achievementIds || [];
      
      // Check if already unlocked
      if (currentAchievements.includes(achievementId)) {
        return { alreadyUnlocked: true };
      }

      // Add achievement
      const newAchievements = [...currentAchievements, achievementId];
      
      // Update with bonus points if provided
      await this.updateCustomerCompetencyScores(customerId, {
        achievementIds: newAchievements,
        additionalPoints: bonusPoints,
        category: 'general'
      });

      return { 
        success: true, 
        achievementId,
        bonusPoints,
        totalAchievements: newAchievements.length
      };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Calculate learning velocity (points per week)
   */
  async calculateLearningVelocity(customerId) {
    try {
      const actions = await this.getRecentActions(customerId, 30); // Last 30 days
      
      if (actions.length === 0) return 0;
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentActions = actions.filter(a => new Date(a.actionDate) >= thirtyDaysAgo);
      
      const totalPoints = recentActions.reduce((sum, action) => sum + action.pointsAwarded, 0);
      const weeks = 30 / 7;
      
      return Math.round(totalPoints / weeks);
    } catch (error) {
      console.error('Error calculating learning velocity:', error);
      return 0;
    }
  }

  /**
   * Get recent actions for a customer
   */
  async getRecentActions(customerId, days = 7) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `${BASE_URL}/${encodeURIComponent(this.tables.customerActions)}?` +
        `filterByFormula=AND({Customer ID}='${customerId}', {Action Date}>='${startDate}')&` +
        `sort[0][field]=Action Date&sort[0][direction]=desc`,
        { headers: this.headers }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent actions');
      }
      
      const data = await response.json();
      return data.records.map(record => ({
        id: record.id,
        type: record.fields['Action Type'],
        description: record.fields['Action Description'],
        impact: record.fields['Impact Level'],
        pointsAwarded: record.fields['Points Awarded'],
        category: record.fields['Category'],
        actionDate: record.fields['Action Date']
      }));
    } catch (error) {
      console.error('Error fetching recent actions:', error);
      return [];
    }
  }

  /**
   * Calculate competency level based on total points
   */
  calculateCompetencyLevel(totalPoints) {
    if (totalPoints >= 20000) return 'Revenue Intelligence Master';
    if (totalPoints >= 10000) return 'Market Execution Expert';
    if (totalPoints >= 5000) return 'Revenue Development Advanced';
    if (totalPoints >= 2500) return 'Sales Strategy Proficient';
    if (totalPoints >= 1000) return 'Value Communication Developing';
    return 'Customer Intelligence Foundation';
  }

  /**
   * Get action statistics for analytics
   */
  async getActionStatistics(customerId) {
    try {
      const allActions = await this.getRecentActions(customerId, 90); // Last 90 days
      
      const stats = {
        totalActions: allActions.length,
        totalPoints: allActions.reduce((sum, a) => sum + a.pointsAwarded, 0),
        byCategory: {},
        byImpact: {},
        weeklyTrend: [],
        averagePointsPerAction: 0
      };

      // Calculate category breakdown
      allActions.forEach(action => {
        stats.byCategory[action.category] = (stats.byCategory[action.category] || 0) + 1;
        stats.byImpact[action.impact] = (stats.byImpact[action.impact] || 0) + 1;
      });

      // Calculate average
      stats.averagePointsPerAction = stats.totalActions > 0 
        ? Math.round(stats.totalPoints / stats.totalActions)
        : 0;

      return stats;
    } catch (error) {
      console.error('Error calculating action statistics:', error);
      return null;
    }
  }

  /**
   * Batch update competency data (for efficiency)
   */
  async batchUpdateCompetencyData(updates) {
    try {
      const requests = updates.map(update => ({
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          id: update.recordId,
          fields: update.fields
        })
      }));

      // Note: Airtable doesn't have a true batch API, so we'll use Promise.all
      const promises = requests.map((request, index) => 
        fetch(
          `${BASE_URL}/${encodeURIComponent(this.tables.customerAssets)}/${updates[index].recordId}`,
          request
        )
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));
      
      return results;
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enhancedAirtableService = new EnhancedAirtableService();
export default enhancedAirtableService;