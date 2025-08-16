// ExportEngineService.js - Multi-format export engine for AI, CRM, and sales automation integration

export const ExportEngineService = {
  
  // EXPORT FORMATS BY TOOL CATEGORY
  exportFormats: {
    ai_tools: [
      'claude_prompts',      // Structured prompts for Claude/ChatGPT
      'persona_briefs',      // AI persona development templates
      'conversation_scripts' // AI conversation flow templates
    ],
    crm_platforms: [
      'hubspot_properties',  // Custom property mappings
      'salesforce_fields',   // Field definitions and data
      'pipedrive_data'       // Contact and deal templates
    ],
    sales_automation: [
      'outreach_sequences',  // Email sequence templates
      'salesloft_cadences',  // Multi-touch cadence data
      'apollo_lists'         // Prospect list criteria
    ],
    business_intelligence: [
      'looker_dashboards',   // BI dashboard definitions
      'tableau_data',        // Data visualization feeds
      'excel_models'         // Financial modeling templates
    ]
  },

  // INTELLIGENT EXPORT RECOMMENDATIONS
  recommendExportFormats: (userTools, contentType) => {
    try {
      const toolMappings = {
        'icp-analysis': {
          ai_tools: ['claude_prompts', 'persona_briefs'],
          crm_platforms: ['hubspot_properties', 'salesforce_fields'],
          sales_automation: ['apollo_lists', 'outreach_sequences']
        },
        'financial-impact': {
          ai_tools: ['conversation_scripts'],
          crm_platforms: ['salesforce_fields'],
          business_intelligence: ['excel_models', 'looker_dashboards']
        },
        'business-case': {
          ai_tools: ['claude_prompts'],
          crm_platforms: ['hubspot_properties'],
          sales_automation: ['outreach_sequences']
        }
      };
      
      // Safe access with fallbacks
      const contentMappings = toolMappings[contentType] || {};
      const userToolsList = Array.isArray(userTools) ? userTools : [];
      
      // Generate recommendations based on user's existing tools
      const recommendations = [];
      
      // If user has AI tools, recommend AI formats
      if (userToolsList.some(tool => ['claude', 'chatgpt', 'gpt', 'ai'].some(keyword => 
        tool.toLowerCase().includes(keyword)))) {
        recommendations.push(...(contentMappings.ai_tools || []));
      }
      
      // If user has CRM tools, recommend CRM formats
      if (userToolsList.some(tool => ['hubspot', 'salesforce', 'pipedrive', 'crm'].some(keyword => 
        tool.toLowerCase().includes(keyword)))) {
        recommendations.push(...(contentMappings.crm_platforms || []));
      }
      
      // If user has sales automation tools, recommend automation formats
      if (userToolsList.some(tool => ['outreach', 'salesloft', 'apollo', 'sequence'].some(keyword => 
        tool.toLowerCase().includes(keyword)))) {
        recommendations.push(...(contentMappings.sales_automation || []));
      }
      
      // If user has BI tools, recommend BI formats
      if (userToolsList.some(tool => ['looker', 'tableau', 'powerbi', 'excel'].some(keyword => 
        tool.toLowerCase().includes(keyword)))) {
        recommendations.push(...(contentMappings.business_intelligence || []));
      }
      
      // Fallback: if no tools detected, recommend based on content type
      if (recommendations.length === 0) {
        const fallbackRecommendations = Object.values(contentMappings).flat();
        recommendations.push(...fallbackRecommendations);
      }
      
      // Final fallback: ensure we always return something useful
      if (recommendations.length === 0) {
        recommendations.push('claude_prompts', 'hubspot_properties', 'outreach_sequences');
      }
      
      // Remove duplicates and return
      return [...new Set(recommendations)];
      
    } catch (error) {
      console.error('Error generating export recommendations:', error);
      // Safe fallback - return basic formats for any content type
      return ['claude_prompts', 'hubspot_properties', 'outreach_sequences'];
    }
  },

  // GET EXPORT FORMAT METADATA
  getExportFormatInfo: (formatId) => {
    try {
      const formatInfo = {
        claude_prompts: {
          name: 'Claude Prompt Templates',
          category: 'ai_tools',
          description: 'Copy-paste prompts using your buyer intelligence for Claude AI',
          fileType: 'text',
          implementation: 'Copy prompts and paste into Claude, ChatGPT, or your preferred AI tool',
          variables: ['[COMPANY_NAME]', '[PROSPECT_CONTEXT]', '[INDUSTRY]']
        },
        persona_briefs: {
          name: 'AI Persona Development',
          category: 'ai_tools',
          description: 'Buyer personas optimized for AI role-playing and simulation',
          fileType: 'json',
          implementation: 'Use as persona instructions in AI conversations',
          variables: ['[BUYER_NAME]', '[ROLE]', '[PAIN_POINTS]']
        },
        conversation_scripts: {
          name: 'AI Conversation Scripts',
          category: 'ai_tools',
          description: 'Structured conversation flows for AI-assisted sales calls',
          fileType: 'text',
          implementation: 'Guide AI through discovery calls and value conversations',
          variables: ['[DISCOVERY_QUESTIONS]', '[VALUE_PROPS]', '[OBJECTIONS]']
        },
        hubspot_properties: {
          name: 'HubSpot Custom Properties',
          category: 'crm_platforms',
          description: 'Import ICP scores and buyer intelligence as custom HubSpot fields',
          fileType: 'json',
          implementation: 'Create custom properties in HubSpot Settings > Properties',
          variables: ['[PROPERTY_NAME]', '[PROPERTY_TYPE]', '[OPTIONS]']
        },
        salesforce_fields: {
          name: 'Salesforce Custom Fields',
          category: 'crm_platforms',
          description: 'Field definitions and workflow automation rules',
          fileType: 'xml',
          implementation: 'Import through Salesforce Setup > Custom Fields',
          variables: ['[FIELD_NAME]', '[FIELD_TYPE]', '[VALIDATION_RULES]']
        },
        pipedrive_data: {
          name: 'Pipedrive Import Templates',
          category: 'crm_platforms',
          description: 'Contact and deal templates with buyer intelligence',
          fileType: 'csv',
          implementation: 'Import through Pipedrive Settings > Import Data',
          variables: ['[CONTACT_FIELDS]', '[DEAL_FIELDS]', '[CUSTOM_FIELDS]']
        },
        outreach_sequences: {
          name: 'Outreach Email Sequences',
          category: 'sales_automation',
          description: 'Multi-touch sequences using buyer intelligence',
          fileType: 'text',
          implementation: 'Create new sequence in Outreach and copy email templates',
          variables: ['[SEQUENCE_NAME]', '[EMAIL_SUBJECT]', '[PERSONALIZATION]']
        },
        salesloft_cadences: {
          name: 'SalesLoft Cadence Templates',
          category: 'sales_automation',
          description: 'Multi-channel cadences with buyer-specific messaging',
          fileType: 'json',
          implementation: 'Import cadence structure into SalesLoft',
          variables: ['[CADENCE_NAME]', '[TOUCH_POINTS]', '[TALK_TRACKS]']
        },
        apollo_lists: {
          name: 'Apollo Prospect Lists',
          category: 'sales_automation',
          description: 'Targeting criteria based on ICP analysis',
          fileType: 'json',
          implementation: 'Use criteria to build prospect lists in Apollo',
          variables: ['[INDUSTRY_CRITERIA]', '[COMPANY_SIZE]', '[TECHNOGRAPHICS]']
        },
        looker_dashboards: {
          name: 'Looker Dashboard Definitions',
          category: 'business_intelligence',
          description: 'BI dashboard templates with revenue intelligence metrics',
          fileType: 'json',
          implementation: 'Import dashboard configuration into Looker',
          variables: ['[METRICS]', '[DIMENSIONS]', '[FILTERS]']
        },
        tableau_data: {
          name: 'Tableau Data Connections',
          category: 'business_intelligence',
          description: 'Data visualization feeds for buyer intelligence',
          fileType: 'csv',
          implementation: 'Connect Tableau to exported data sources',
          variables: ['[DATA_SOURCE]', '[CALCULATED_FIELDS]', '[VISUALIZATIONS]']
        },
        excel_models: {
          name: 'Excel Financial Models',
          category: 'business_intelligence',
          description: 'Financial modeling templates with buyer-specific calculations',
          fileType: 'xlsx',
          implementation: 'Download and customize Excel templates',
          variables: ['[FINANCIAL_INPUTS]', '[CALCULATIONS]', '[PROJECTIONS]']
        }
      };

      return formatInfo[formatId] || {
        name: 'Unknown Format',
        category: 'unknown',
        description: 'Format information not available',
        fileType: 'text',
        implementation: 'Please contact support for implementation guidance',
        variables: []
      };
      
    } catch (error) {
      console.error('Error getting export format info:', error);
      return {
        name: 'Export Format',
        category: 'unknown',
        description: 'Format information temporarily unavailable',
        fileType: 'text',
        implementation: 'Please try again or contact support',
        variables: []
      };
    }
  },

  // VALIDATE EXPORT DATA
  validateExportData: (data, formatId) => {
    try {
      if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Invalid data object provided' };
      }

      const formatInfo = ExportEngineService.getExportFormatInfo(formatId);
      
      // Basic validation based on format category
      switch (formatInfo.category) {
        case 'ai_tools':
          if (!data.content && !data.buyerPersona && !data.icpData) {
            return { isValid: false, error: 'AI tools export requires content, buyer persona, or ICP data' };
          }
          break;
        case 'crm_platforms':
          if (!data.fields && !data.properties && !data.icpData) {
            return { isValid: false, error: 'CRM export requires field definitions or ICP data' };
          }
          break;
        case 'sales_automation':
          if (!data.sequences && !data.templates && !data.icpData) {
            return { isValid: false, error: 'Sales automation export requires sequence templates or ICP data' };
          }
          break;
        case 'business_intelligence':
          if (!data.metrics && !data.calculations && !data.financialData) {
            return { isValid: false, error: 'BI export requires metrics, calculations, or financial data' };
          }
          break;
        default:
          // Unknown format, allow with warning
          break;
      }

      return { isValid: true, error: null };
      
    } catch (error) {
      console.error('Error validating export data:', error);
      return { isValid: false, error: 'Validation error occurred' };
    }
  },

  // GET ALL AVAILABLE FORMATS FOR CATEGORY
  getFormatsForCategory: (category) => {
    try {
      const formats = ExportEngineService.exportFormats[category] || [];
      return formats.map(formatId => ({
        id: formatId,
        ...ExportEngineService.getExportFormatInfo(formatId)
      }));
    } catch (error) {
      console.error('Error getting formats for category:', error);
      return [];
    }
  },

  // GET ALL CATEGORIES
  getAllCategories: () => {
    try {
      return Object.keys(ExportEngineService.exportFormats).map(categoryId => ({
        id: categoryId,
        name: ExportEngineService.getCategoryDisplayName(categoryId),
        description: ExportEngineService.getCategoryDescription(categoryId),
        icon: ExportEngineService.getCategoryIcon(categoryId)
      }));
    } catch (error) {
      console.error('Error getting all categories:', error);
      return [];
    }
  },

  // GET CATEGORY DISPLAY NAME
  getCategoryDisplayName: (categoryId) => {
    const names = {
      ai_tools: 'AI Sales Enablement',
      crm_platforms: 'CRM Enhancement',
      sales_automation: 'Sales Automation',
      business_intelligence: 'Business Intelligence'
    };
    return names[categoryId] || 'Unknown Category';
  },

  // GET CATEGORY DESCRIPTION
  getCategoryDescription: (categoryId) => {
    const descriptions = {
      ai_tools: 'Structured prompts and personas for Claude, ChatGPT, and other AI tools',
      crm_platforms: 'Custom fields and workflows for HubSpot, Salesforce, and Pipedrive',
      sales_automation: 'Sequences and cadences for Outreach, SalesLoft, and Apollo',
      business_intelligence: 'Dashboards and models for Looker, Tableau, and Excel'
    };
    return descriptions[categoryId] || 'Export formats for external tools';
  },

  // GET CATEGORY ICON
  getCategoryIcon: (categoryId) => {
    const icons = {
      ai_tools: '🤖',
      crm_platforms: '📊',
      sales_automation: '🎯',
      business_intelligence: '📈'
    };
    return icons[categoryId] || '📄';
  }
};

export default ExportEngineService;