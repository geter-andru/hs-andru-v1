// CRMIntegrationService.js - CRM integration data structures for HubSpot, Salesforce, and Pipedrive

export const CRMIntegrationService = {
  
  // HUBSPOT CUSTOM PROPERTIES
  generateHubSpotProperties: (icpData, assessmentData) => {
    try {
      const personaTypes = icpData?.personaTypes || [
        { name: 'Technical Decision Maker', id: 'technical_dm' },
        { name: 'Business Decision Maker', id: 'business_dm' },
        { name: 'Economic Buyer', id: 'economic_buyer' },
        { name: 'Technical Evaluator', id: 'technical_evaluator' }
      ];

      const competencyAreas = assessmentData?.competencyAreas || [
        'Customer Analysis',
        'Value Communication',
        'Executive Readiness'
      ];

      return {
        contactProperties: [
          {
            name: 'icp_fit_score',
            label: 'ICP Fit Score',
            type: 'number',
            fieldType: 'number',
            description: 'Systematic buyer fit score (1-10) based on H&S ICP analysis',
            options: {
              min: 1,
              max: 10,
              step: 0.1
            },
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 1
          },
          {
            name: 'buyer_persona_type', 
            label: 'Buyer Persona Type',
            type: 'enumeration',
            fieldType: 'select',
            options: personaTypes.map(type => ({
              label: type.name,
              value: type.id,
              description: `${type.name} persona from H&S buyer intelligence`
            })),
            description: 'Primary buyer persona classification from H&S analysis',
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 2
          },
          {
            name: 'primary_pain_points',
            label: 'Primary Pain Points',
            type: 'string',
            fieldType: 'textarea',
            description: 'Key pain points identified through H&S buyer intelligence',
            options: {
              rows: 4
            },
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 3
          },
          {
            name: 'decision_making_process',
            label: 'Decision Making Process',
            type: 'enumeration',
            fieldType: 'select',
            options: [
              { label: 'Individual', value: 'individual', description: 'Single decision maker' },
              { label: 'Committee', value: 'committee', description: 'Committee-based decisions' },
              { label: 'Consensus', value: 'consensus', description: 'Consensus-driven process' },
              { label: 'Hierarchical', value: 'hierarchical', description: 'Top-down decision making' }
            ],
            description: 'Decision-making style from H&S persona analysis',
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 4
          },
          {
            name: 'competency_gap_analysis',
            label: 'Competency Gap Analysis',
            type: 'string',
            fieldType: 'textarea',
            description: 'Analysis of buyer competency gaps and development needs',
            options: {
              rows: 3
            },
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 5
          },
          {
            name: 'value_proposition_alignment',
            label: 'Value Proposition Alignment',
            type: 'enumeration',
            fieldType: 'select',
            options: [
              { label: 'High', value: 'high', description: 'Strong value proposition fit' },
              { label: 'Medium', value: 'medium', description: 'Moderate value proposition fit' },
              { label: 'Low', value: 'low', description: 'Limited value proposition fit' },
              { label: 'Unknown', value: 'unknown', description: 'Value alignment not yet determined' }
            ],
            description: 'Alignment between our value proposition and buyer needs',
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 6
          }
        ],
        
        companyProperties: [
          {
            name: 'icp_company_fit_score',
            label: 'ICP Company Fit Score',
            type: 'number',
            fieldType: 'number',
            description: 'Company-level ICP fit score based on firmographics and technographics',
            options: {
              min: 1,
              max: 10,
              step: 0.1
            },
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 1
          },
          {
            name: 'revenue_intelligence_tier',
            label: 'Revenue Intelligence Tier',
            type: 'enumeration',
            fieldType: 'select',
            options: [
              { label: 'Foundation', value: 'foundation', description: 'Building systematic foundations' },
              { label: 'Growth', value: 'growth', description: 'Scaling revenue processes' },
              { label: 'Expansion', value: 'expansion', description: 'Market expansion focus' }
            ],
            description: 'Revenue intelligence maturity tier from H&S assessment',
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 2
          }
        ],

        dealProperties: [
          {
            name: 'financial_impact_projection',
            label: 'Financial Impact Projection',
            type: 'number',
            fieldType: 'number',
            description: 'Projected financial impact from H&S cost calculator ($)',
            options: {
              min: 0,
              step: 1000
            },
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 1
          },
          {
            name: 'business_case_status',
            label: 'Business Case Status',
            type: 'enumeration',
            fieldType: 'select',
            options: [
              { label: 'Not Started', value: 'not_started', description: 'Business case development not begun' },
              { label: 'In Development', value: 'in_development', description: 'Business case being created' },
              { label: 'Draft Complete', value: 'draft_complete', description: 'Initial business case draft finished' },
              { label: 'Shared with Prospect', value: 'shared', description: 'Business case presented to prospect' },
              { label: 'Under Review', value: 'under_review', description: 'Prospect reviewing business case' },
              { label: 'Approved', value: 'approved', description: 'Business case approved by prospect' }
            ],
            description: 'Business case development and approval status',
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 2
          },
          {
            name: 'cost_of_inaction',
            label: 'Cost of Inaction',
            type: 'number',
            fieldType: 'number',
            description: 'Calculated monthly cost of inaction from H&S analysis ($)',
            options: {
              min: 0,
              step: 1000
            },
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 3
          },
          {
            name: 'competency_development_plan',
            label: 'Competency Development Plan',
            type: 'string',
            fieldType: 'textarea',
            description: 'Buyer competency development recommendations and timeline',
            options: {
              rows: 4
            },
            groupName: 'h_s_revenue_intelligence',
            displayOrder: 4
          }
        ],

        propertyGroups: [
          {
            name: 'h_s_revenue_intelligence',
            label: 'H&S Revenue Intelligence',
            description: 'Properties from H&S Revenue Intelligence Platform for systematic buyer analysis'
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generating HubSpot properties:', error);
      return CRMIntegrationService.getDefaultHubSpotProperties();
    }
  },

  // SALESFORCE FIELD MAPPINGS
  generateSalesforceFields: (icpData, costData) => {
    try {
      const impactCategories = costData?.categories || [
        'Lost Revenue Opportunities',
        'Operational Inefficiencies', 
        'Competitive Disadvantage',
        'Productivity Losses'
      ];

      return {
        customFields: [
          {
            fullName: 'Account.ICP_Fit_Score__c',
            label: 'ICP Fit Score',
            type: 'Number',
            precision: 3,
            scale: 1,
            description: 'H&S Revenue Intelligence - Account fit score based on systematic buyer analysis (1.0-10.0)',
            inlineHelpText: 'Score from H&S ICP analysis. 8.5+ indicates high-fit prospects.',
            required: false,
            unique: false,
            trackTrending: true
          },
          {
            fullName: 'Contact.Buyer_Persona_Profile__c',
            label: 'Buyer Persona Profile', 
            type: 'LongTextArea',
            length: 32768,
            description: 'H&S Revenue Intelligence - Detailed buyer persona analysis and characteristics',
            inlineHelpText: 'Comprehensive buyer persona from H&S intelligence including decision criteria and communication preferences.',
            required: false,
            trackTrending: false
          },
          {
            fullName: 'Contact.Decision_Making_Style__c',
            label: 'Decision Making Style',
            type: 'Picklist',
            valueSet: {
              restricted: true,
              valueSetDefinition: {
                value: [
                  { fullName: 'Individual', label: 'Individual Decision Maker' },
                  { fullName: 'Committee', label: 'Committee Based' },
                  { fullName: 'Consensus', label: 'Consensus Driven' },
                  { fullName: 'Hierarchical', label: 'Hierarchical Approval' }
                ]
              }
            },
            description: 'H&S Revenue Intelligence - Contact decision-making approach from persona analysis',
            required: false
          },
          {
            fullName: 'Opportunity.Cost_of_Inaction__c',
            label: 'Cost of Inaction',
            type: 'Currency',
            precision: 10,
            scale: 0,
            description: 'H&S Revenue Intelligence - Calculated monthly cost of inaction for prospect decision delay',
            inlineHelpText: 'Monthly financial impact of not implementing solution based on H&S cost analysis.',
            required: false,
            trackTrending: true
          },
          {
            fullName: 'Opportunity.Financial_Impact_Projection__c',
            label: 'Financial Impact Projection',
            type: 'Currency',
            precision: 12,
            scale: 0,
            description: 'H&S Revenue Intelligence - Projected annual financial benefit from solution implementation',
            required: false,
            trackTrending: true
          },
          {
            fullName: 'Opportunity.Business_Case_Status__c',
            label: 'Business Case Status',
            type: 'Picklist',
            valueSet: {
              restricted: true,
              valueSetDefinition: {
                value: [
                  { fullName: 'Not Started', label: 'Not Started' },
                  { fullName: 'In Development', label: 'In Development' },
                  { fullName: 'Draft Complete', label: 'Draft Complete' },
                  { fullName: 'Shared with Prospect', label: 'Shared with Prospect' },
                  { fullName: 'Under Review', label: 'Under Review' },
                  { fullName: 'Approved', label: 'Approved' }
                ]
              }
            },
            description: 'H&S Revenue Intelligence - Business case development and approval status',
            required: false
          },
          {
            fullName: 'Account.Revenue_Intelligence_Tier__c',
            label: 'Revenue Intelligence Tier',
            type: 'Picklist',
            valueSet: {
              restricted: true,
              valueSetDefinition: {
                value: [
                  { fullName: 'Foundation', label: 'Foundation - Building Systematic Foundations' },
                  { fullName: 'Growth', label: 'Growth - Scaling Revenue Processes' },
                  { fullName: 'Expansion', label: 'Expansion - Market Expansion Focus' }
                ]
              }
            },
            description: 'H&S Revenue Intelligence - Company revenue intelligence maturity assessment',
            required: false
          }
        ],
        
        workflows: [
          {
            name: 'H&S_ICP_Score_Alert',
            triggerCondition: 'ICP_Fit_Score__c >= 8.5',
            actions: [
              {
                type: 'Task',
                assignedTo: 'Account.Owner',
                subject: 'High-Fit Prospect Alert - H&S Intelligence',
                description: 'This prospect has been identified as a high-fit opportunity based on H&S Revenue Intelligence analysis. Review ICP scoring details and prioritize outreach.',
                priority: 'High',
                dueDate: 'Today + 1'
              },
              {
                type: 'Email',
                template: 'H&S_High_Fit_Prospect_Alert',
                recipientType: 'AccountOwner'
              }
            ],
            description: 'Alert for high-fit prospects identified through H&S intelligence'
          },
          {
            name: 'H&S_Business_Case_Shared',
            triggerCondition: 'Business_Case_Status__c = "Shared with Prospect"',
            actions: [
              {
                type: 'Task',
                assignedTo: 'Opportunity.Owner',
                subject: 'Follow up on Business Case - H&S Intelligence',
                description: 'Business case has been shared with prospect. Schedule follow-up to discuss questions and next steps.',
                priority: 'High',
                dueDate: 'Today + 3'
              }
            ],
            description: 'Follow-up workflow when business case is shared'
          }
        ],

        reportTypes: [
          {
            name: 'H&S Revenue Intelligence Pipeline',
            description: 'Pipeline analysis using H&S Revenue Intelligence data',
            baseObject: 'Opportunity',
            fields: [
              'Opportunity.Name',
              'Account.Name',
              'Opportunity.Amount',
              'Opportunity.ICP_Fit_Score__c',
              'Opportunity.Financial_Impact_Projection__c',
              'Opportunity.Cost_of_Inaction__c',
              'Opportunity.Business_Case_Status__c',
              'Account.Revenue_Intelligence_Tier__c'
            ],
            filters: [
              {
                field: 'Opportunity.ICP_Fit_Score__c',
                operator: 'greater than',
                value: '0'
              }
            ]
          }
        ]
      };
      
    } catch (error) {
      console.error('Error generating Salesforce fields:', error);
      return CRMIntegrationService.getDefaultSalesforceFields();
    }
  },

  // PIPEDRIVE DATA TEMPLATES
  generatePipedriveData: (icpData, assessmentData) => {
    try {
      const personaTypes = icpData?.personaTypes || ['Technical DM', 'Business DM', 'Economic Buyer'];
      const competencyAreas = assessmentData?.competencyAreas || ['Customer Analysis', 'Value Communication'];

      return {
        customFields: [
          {
            name: 'ICP Fit Score',
            key: 'icp_fit_score',
            field_type: 'double',
            description: 'H&S Revenue Intelligence ICP fit score (1-10)',
            options: {
              min: 1,
              max: 10
            }
          },
          {
            name: 'Buyer Persona',
            key: 'buyer_persona',
            field_type: 'enum',
            description: 'Primary buyer persona from H&S analysis',
            options: personaTypes.map(type => ({ 
              label: typeof type === 'string' ? type : type.name,
              id: typeof type === 'string' ? type.toLowerCase().replace(' ', '_') : type.id
            }))
          },
          {
            name: 'Decision Process',
            key: 'decision_process',
            field_type: 'enum',
            description: 'Decision-making approach from persona analysis',
            options: [
              { label: 'Individual', id: 'individual' },
              { label: 'Committee', id: 'committee' },
              { label: 'Consensus', id: 'consensus' }
            ]
          },
          {
            name: 'Financial Impact',
            key: 'financial_impact',
            field_type: 'monetary',
            description: 'Projected financial impact from H&S cost calculator',
            currency: 'USD'
          },
          {
            name: 'Cost of Inaction',
            key: 'cost_of_inaction',
            field_type: 'monetary',
            description: 'Monthly cost of inaction from H&S analysis',
            currency: 'USD'
          }
        ],

        activities: [
          {
            name: 'H&S ICP Analysis',
            icon_key: 'analysis',
            color: 'blue',
            description: 'ICP fit score analysis and buyer persona identification'
          },
          {
            name: 'H&S Business Case Review',
            icon_key: 'document',
            color: 'green',
            description: 'Business case development and review using H&S framework'
          }
        ],

        importTemplates: {
          contacts: {
            columns: [
              'Name',
              'Email',
              'Company',
              'ICP Fit Score',
              'Buyer Persona',
              'Decision Process',
              'Primary Pain Points'
            ],
            mapping: {
              'Name': 'name',
              'Email': 'email',
              'Company': 'org_name',
              'ICP Fit Score': 'icp_fit_score',
              'Buyer Persona': 'buyer_persona',
              'Decision Process': 'decision_process',
              'Primary Pain Points': 'notes'
            }
          },
          deals: {
            columns: [
              'Title',
              'Value',
              'Organization',
              'Financial Impact',
              'Cost of Inaction',
              'Business Case Status',
              'ICP Fit Score'
            ],
            mapping: {
              'Title': 'title',
              'Value': 'value',
              'Organization': 'org_name',
              'Financial Impact': 'financial_impact',
              'Cost of Inaction': 'cost_of_inaction',
              'Business Case Status': 'stage_id',
              'ICP Fit Score': 'icp_fit_score'
            }
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating Pipedrive data:', error);
      return CRMIntegrationService.getDefaultPipedriveData();
    }
  },

  // CRM FIELD VALIDATION
  validateCRMData: (data, crmType) => {
    try {
      if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Invalid data object provided' };
      }

      switch (crmType) {
        case 'hubspot':
          if (!data.icpData && !data.assessmentData) {
            return { isValid: false, error: 'HubSpot integration requires ICP data or assessment data' };
          }
          break;
        case 'salesforce':
          if (!data.icpData && !data.costData) {
            return { isValid: false, error: 'Salesforce integration requires ICP data or cost data' };
          }
          break;
        case 'pipedrive':
          if (!data.icpData && !data.assessmentData) {
            return { isValid: false, error: 'Pipedrive integration requires ICP data or assessment data' };
          }
          break;
        default:
          return { isValid: false, error: 'Unsupported CRM type' };
      }

      return { isValid: true, error: null };
      
    } catch (error) {
      console.error('Error validating CRM data:', error);
      return { isValid: false, error: 'CRM data validation error occurred' };
    }
  },

  // DEFAULT FALLBACK TEMPLATES
  getDefaultHubSpotProperties: () => {
    return {
      contactProperties: [
        {
          name: 'icp_fit_score',
          label: 'ICP Fit Score',
          type: 'number',
          description: 'H&S Revenue Intelligence ICP fit score'
        }
      ],
      dealProperties: [
        {
          name: 'business_case_status',
          label: 'Business Case Status',
          type: 'enumeration',
          options: [
            { label: 'Not Started', value: 'not_started' },
            { label: 'In Development', value: 'in_development' },
            { label: 'Completed', value: 'completed' }
          ],
          description: 'Business case development status'
        }
      ]
    };
  },

  getDefaultSalesforceFields: () => {
    return {
      customFields: [
        {
          fullName: 'Account.ICP_Fit_Score__c',
          label: 'ICP Fit Score',
          type: 'Number',
          precision: 3,
          scale: 1,
          description: 'H&S Revenue Intelligence ICP fit score'
        }
      ],
      workflows: []
    };
  },

  getDefaultPipedriveData: () => {
    return {
      customFields: [
        {
          name: 'ICP Fit Score',
          key: 'icp_fit_score',
          field_type: 'double',
          description: 'H&S Revenue Intelligence ICP fit score'
        }
      ],
      activities: [],
      importTemplates: {}
    };
  }
};

export default CRMIntegrationService;