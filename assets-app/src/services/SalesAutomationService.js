// SalesAutomationService.js - Sales automation integration for Outreach, SalesLoft, Apollo, and other platforms

export const SalesAutomationService = {
  
  // OUTREACH SEQUENCE TEMPLATES
  generateOutreachSequences: (icpData, businessCaseData) => {
    try {
      const buyerPersona = icpData?.buyerPersona || {};
      const primaryPainPoint = Array.isArray(buyerPersona.painPoints) 
        ? buyerPersona.painPoints[0] 
        : buyerPersona.painPoints || 'operational challenges';
      const industry = icpData?.targetIndustry || 'your industry';
      const caseStudyCompany = businessCaseData?.caseStudy?.company || 'a similar company';
      const specificOutcome = businessCaseData?.caseStudy?.outcome || 'significant improvements';
      
      return {
        prospectingSequence: {
          name: 'H&S ICP-Qualified Prospects',
          description: 'Multi-touch sequence for prospects identified through H&S Revenue Intelligence',
          steps: [
            {
              stepNumber: 1,
              type: 'email',
              delay: 0,
              subject: 'Quick question about {{prospect.primary_pain_point}}',
              template: `Hi {{prospect.first_name}},

I noticed {{prospect.company}} is in the ${industry} space, and I'm curious about something.

Based on our work with similar companies, I'm wondering - are you seeing challenges with ${primaryPainPoint}?

We've helped companies like ${caseStudyCompany} achieve ${specificOutcome} in this area, and I thought there might be a similar opportunity with {{prospect.company}}.

Worth a quick 10-minute conversation to explore?

Best,
{{sender.first_name}}

P.S. I've done some research on {{prospect.company}} and have a few specific ideas that might be relevant.`,
              
              trackingParameters: {
                utm_source: 'outreach',
                utm_medium: 'email',
                utm_campaign: 'h_s_icp_qualified',
                utm_content: 'step_1_initial_outreach'
              },
              
              variables: [
                '{{prospect.first_name}}',
                '{{prospect.company}}',
                '{{prospect.primary_pain_point}}',
                '{{sender.first_name}}'
              ]
            },
            {
              stepNumber: 2,
              type: 'email', 
              delay: 3,
              subject: 'Re: {{previous.subject}} + case study',
              template: `Hi {{prospect.first_name}},

Following up on my previous email about ${primaryPainPoint}.

I wanted to share a quick case study that might be relevant. ${caseStudyCompany} was facing similar challenges and saw these results after implementing our approach:

• {{improvement_metric_1}} improvement in {{timeframe}}
• {{improvement_metric_2}} reduction in {{cost_area}}
• {{improvement_metric_3}} increase in {{efficiency_area}}

The interesting part is they started with a similar situation to what I'm seeing at {{prospect.company}}.

I've attached a brief overview that shows how this might apply to your situation.

Worth a brief conversation to see if there's a fit?

{{sender.first_name}}

[Attach: H&S Business Case Template - Customized for {{prospect.industry}}]`,
              
              trackingParameters: {
                utm_source: 'outreach',
                utm_medium: 'email',
                utm_campaign: 'h_s_icp_qualified',
                utm_content: 'step_2_case_study'
              },
              
              variables: [
                '{{prospect.first_name}}',
                '{{prospect.company}}',
                '{{prospect.industry}}',
                '{{improvement_metric_1}}',
                '{{improvement_metric_2}}',
                '{{improvement_metric_3}}',
                '{{timeframe}}',
                '{{cost_area}}',
                '{{efficiency_area}}',
                '{{sender.first_name}}'
              ]
            },
            {
              stepNumber: 3,
              type: 'linkedin',
              delay: 5,
              subject: 'Connection request',
              template: `Hi {{prospect.first_name}}, I sent you a couple emails about how we've helped ${industry} companies with ${primaryPainPoint}. Thought it might be easier to connect here. Would love to share some specific insights about {{prospect.company}}.`,
              
              trackingParameters: {
                utm_source: 'linkedin',
                utm_medium: 'connection_request',
                utm_campaign: 'h_s_icp_qualified',
                utm_content: 'step_3_linkedin'
              }
            },
            {
              stepNumber: 4,
              type: 'email',
              delay: 7,
              subject: 'Final follow-up: {{prospect.company}} + ${primaryPainPoint}',
              template: `Hi {{prospect.first_name}},

This will be my final email on this topic.

I realize you're probably busy, but I wanted to make one last attempt to connect because I think there's a real opportunity for {{prospect.company}}.

Based on my research, you're likely dealing with:
• ${primaryPainPoint}
• The downstream effects on {{related_impact_area}}
• Pressure to {{business_pressure}}

We've developed a systematic approach that's helped {{number_of_companies}}+ companies in ${industry} address exactly these challenges.

If now isn't the right time, I completely understand. But if you'd like to see how this might work for {{prospect.company}}, I'm happy to share some specific insights.

Either way, I wish you the best of luck with {{prospect.company}}.

{{sender.first_name}}

P.S. If this resonates but you're not the right person to speak with, I'd appreciate a quick introduction to whoever handles {{relevant_function}} at {{prospect.company}}.`,
              
              trackingParameters: {
                utm_source: 'outreach',
                utm_medium: 'email',
                utm_campaign: 'h_s_icp_qualified',
                utm_content: 'step_4_final_followup'
              }
            }
          ],
          
          // PROSPECT QUALIFICATION CRITERIA
          targetingCriteria: {
            icpFitScore: { min: 7.0, max: 10.0 },
            industry: icpData?.targetIndustries || [industry],
            companySize: icpData?.companySize || { min: 50, max: 500 },
            technologies: icpData?.technographics || [],
            excludeConditions: icpData?.negativeCriteria || [],
            jobTitles: buyerPersona?.jobTitles || ['Director', 'VP', 'Head of', 'Manager'],
            seniority: buyerPersona?.seniority || ['Director', 'VP', 'C-Level']
          },
          
          sequenceSettings: {
            timezone: 'prospect_timezone',
            sendingWindow: {
              start: '9:00 AM',
              end: '5:00 PM'
            },
            skipWeekends: true,
            skipHolidays: true,
            maxDailyEmails: 50
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating Outreach sequences:', error);
      return SalesAutomationService.getDefaultOutreachSequence();
    }
  },

  // SALESLOFT CADENCE INTEGRATION
  generateSalesLoftCadences: (icpData, costData) => {
    try {
      const buyerPersona = icpData?.buyerPersona || {};
      const discoveryQuestions = icpData?.discoveryQuestions || [
        'How do you currently handle this process?',
        'What challenges are you seeing?',
        'How is this impacting your team?'
      ];
      const qualificationCriteria = costData?.qualificationCriteria || [
        'Budget authority confirmed',
        'Timeline established',
        'Business impact quantified'
      ];

      return {
        multiTouchCadence: {
          name: 'H&S Revenue Intelligence Qualification',
          description: 'Systematic qualification cadence using H&S buyer intelligence',
          touches: [
            {
              day: 1,
              type: 'email',
              template: 'h_s_initial_outreach',
              subject: 'Quick question about {{prospect.primary_challenge}}',
              personalizations: [
                'prospect.icp_fit_reasons',
                'prospect.primary_pain_points',
                'prospect.financial_impact_preview'
              ],
              trackingTags: ['h_s_cadence', 'day_1', 'initial_email']
            },
            {
              day: 4,
              type: 'linkedin',
              template: 'h_s_value_story',
              subject: 'Connection + value insight',
              personalizations: [
                'prospect.industry_case_study',
                'prospect.role_specific_value'
              ],
              trackingTags: ['h_s_cadence', 'day_4', 'linkedin_touch']
            },
            {
              day: 7,
              type: 'call',
              template: 'h_s_discovery_framework',
              duration: 15,
              objectives: qualificationCriteria,
              talkTracks: discoveryQuestions,
              dispositionOptions: [
                'Connected - Qualified',
                'Connected - Not Qualified',
                'Voicemail Left',
                'No Answer',
                'Gatekeeper',
                'Bad Number'
              ],
              trackingTags: ['h_s_cadence', 'day_7', 'discovery_call']
            },
            {
              day: 10,
              type: 'email',
              template: 'h_s_case_study_share',
              subject: 'Thought you\'d find this interesting',
              personalizations: [
                'prospect.industry_case_study',
                'prospect.financial_impact_estimate'
              ],
              attachments: ['h_s_industry_case_study.pdf'],
              trackingTags: ['h_s_cadence', 'day_10', 'case_study_email']
            },
            {
              day: 14,
              type: 'call',
              template: 'h_s_qualification_call',
              duration: 30,
              objectives: [
                'Confirm decision-making process',
                'Validate business case requirements',
                'Establish next steps'
              ],
              talkTracks: [
                'Based on our previous conversation...',
                'I\'ve done some analysis of your situation...',
                'What would need to happen for this to be a priority?'
              ],
              trackingTags: ['h_s_cadence', 'day_14', 'qualification_call']
            },
            {
              day: 18,
              type: 'linkedin',
              template: 'h_s_thought_leadership',
              subject: 'Industry insight you might find valuable',
              personalizations: [
                'prospect.industry_trends',
                'prospect.competitive_landscape'
              ],
              trackingTags: ['h_s_cadence', 'day_18', 'thought_leadership']
            },
            {
              day: 21,
              type: 'email',
              template: 'h_s_final_attempt',
              subject: 'Final follow-up re: {{prospect.company}}',
              personalizations: [
                'prospect.specific_opportunity',
                'prospect.timing_sensitivity'
              ],
              trackingTags: ['h_s_cadence', 'day_21', 'final_email']
            }
          ],
          
          cadenceSettings: {
            timezone: 'prospect',
            workingHours: {
              start: '8:00 AM',
              end: '6:00 PM'
            },
            skipWeekends: true,
            autoSkipBounces: true,
            autoSkipReplies: true,
            maxConcurrentTouches: 3
          },
          
          successCriteria: {
            replies: 'Any reply moves to nurture sequence',
            meetings: 'Meeting booked moves to opportunity stage',
            phoneConnects: 'Connected call moves to qualification track'
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating SalesLoft cadences:', error);
      return SalesAutomationService.getDefaultSalesLoftCadence();
    }
  },

  // APOLLO PROSPECT LISTS
  generateApolloLists: (icpData, assessmentData) => {
    try {
      const targetIndustries = icpData?.targetIndustries || ['Technology', 'Software'];
      const companySize = icpData?.companySize || { min: 50, max: 500 };
      const buyerPersona = icpData?.buyerPersona || {};
      const jobTitles = buyerPersona?.jobTitles || ['Director', 'VP', 'Head of'];
      const technologies = icpData?.technographics || [];
      const revenueRange = icpData?.revenueRange || { min: 10000000, max: 100000000 };

      return {
        prospectListCriteria: {
          name: 'H&S ICP High-Fit Prospects',
          description: 'Prospect list based on H&S Revenue Intelligence ICP analysis',
          
          // COMPANY CRITERIA
          companyFilters: {
            industries: targetIndustries,
            employeeCount: {
              min: companySize.min,
              max: companySize.max
            },
            revenue: {
              min: revenueRange.min,
              max: revenueRange.max
            },
            geography: icpData?.geography || ['United States', 'Canada'],
            companyType: icpData?.companyType || ['Public', 'Private'],
            fundingStage: icpData?.fundingStage || ['Series A', 'Series B', 'Series C'],
            technologies: technologies,
            excludeCompanies: icpData?.excludeCompanies || []
          },
          
          // CONTACT CRITERIA  
          contactFilters: {
            jobTitles: jobTitles,
            departments: buyerPersona?.departments || ['Sales', 'Marketing', 'Operations', 'IT'],
            seniority: buyerPersona?.seniority || ['Director', 'VP', 'C-Level'],
            jobFunction: buyerPersona?.jobFunction || ['Sales', 'Marketing', 'Operations'],
            excludeTitles: ['Intern', 'Assistant', 'Coordinator'],
            emailStatus: 'verified',
            hasLinkedIn: true,
            hasPhoneNumber: icpData?.requirePhone || false
          },
          
          // INTENT SIGNALS
          intentSignals: {
            technographics: technologies,
            fundingEvents: ['Recently funded', 'IPO filed'],
            hiringTrends: ['Expanding sales team', 'Hiring in operations'],
            newsEvents: ['Leadership changes', 'Product launches', 'Market expansion'],
            competitorMentions: icpData?.competitors || []
          },
          
          // EXPORT SETTINGS
          exportSettings: {
            fields: [
              'First Name',
              'Last Name',
              'Email',
              'Title',
              'Company',
              'Industry',
              'Employee Count',
              'Revenue',
              'Location',
              'LinkedIn URL',
              'Phone Number'
            ],
            customFields: [
              {
                name: 'ICP Fit Score',
                formula: 'Calculated based on H&S criteria'
              },
              {
                name: 'Primary Pain Point',
                value: buyerPersona?.primaryPainPoint || 'Operational efficiency'
              },
              {
                name: 'Outreach Priority',
                formula: 'Based on ICP fit and intent signals'
              }
            ],
            format: 'CSV',
            maxRecords: 1000
          }
        },
        
        // SEQUENCE INTEGRATION
        sequenceMapping: {
          highFitProspects: {
            icpScore: { min: 8.5, max: 10.0 },
            sequence: 'H&S High-Priority Outreach',
            priority: 'High',
            assignTo: 'Senior Sales Rep'
          },
          mediumFitProspects: {
            icpScore: { min: 6.0, max: 8.4 },
            sequence: 'H&S Standard Outreach',
            priority: 'Medium',
            assignTo: 'Sales Development Rep'
          },
          lowFitProspects: {
            icpScore: { min: 4.0, max: 5.9 },
            sequence: 'H&S Nurture Track',
            priority: 'Low',
            assignTo: 'Marketing Automation'
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating Apollo lists:', error);
      return SalesAutomationService.getDefaultApolloList();
    }
  },

  // SEQUENCE OPTIMIZATION HELPERS
  optimizeSequenceForPersona: (baseSequence, buyerPersona) => {
    try {
      const optimizedSequence = { ...baseSequence };
      
      // Adjust messaging based on persona
      if (buyerPersona?.communicationStyle === 'direct') {
        optimizedSequence.steps = optimizedSequence.steps.map(step => ({
          ...step,
          template: step.template.replace(/might be/g, 'is').replace(/might/g, 'will').replace(/could/g, 'will')
        }));
      }
      
      // Adjust timing based on persona
      if (buyerPersona?.decisionSpeed === 'fast') {
        optimizedSequence.steps = optimizedSequence.steps.map(step => ({
          ...step,
          delay: Math.max(1, step.delay - 1) // Reduce delays by 1 day
        }));
      }
      
      // Add persona-specific value propositions
      if (buyerPersona?.primaryMotivations) {
        optimizedSequence.personalizations = [
          ...optimizedSequence.personalizations || [],
          'prospect.primary_motivations',
          'prospect.decision_criteria'
        ];
      }
      
      return optimizedSequence;
      
    } catch (error) {
      console.error('Error optimizing sequence:', error);
      return baseSequence;
    }
  },

  // A/B TEST VARIATIONS
  generateSequenceVariations: (baseSequence, variationType = 'subject_lines') => {
    try {
      const variations = [];
      
      switch (variationType) {
        case 'subject_lines':
          variations.push(
            { ...baseSequence, name: baseSequence.name + ' - Direct', subjectVariation: 'direct' },
            { ...baseSequence, name: baseSequence.name + ' - Question', subjectVariation: 'question' },
            { ...baseSequence, name: baseSequence.name + ' - Benefit', subjectVariation: 'benefit' }
          );
          break;
          
        case 'messaging_tone':
          variations.push(
            { ...baseSequence, name: baseSequence.name + ' - Professional', toneVariation: 'professional' },
            { ...baseSequence, name: baseSequence.name + ' - Casual', toneVariation: 'casual' },
            { ...baseSequence, name: baseSequence.name + ' - Consultative', toneVariation: 'consultative' }
          );
          break;
          
        case 'timing':
          variations.push(
            { ...baseSequence, name: baseSequence.name + ' - Aggressive', timingMultiplier: 0.7 },
            { ...baseSequence, name: baseSequence.name + ' - Standard', timingMultiplier: 1.0 },
            { ...baseSequence, name: baseSequence.name + ' - Patient', timingMultiplier: 1.5 }
          );
          break;
      }
      
      return variations;
      
    } catch (error) {
      console.error('Error generating sequence variations:', error);
      return [baseSequence];
    }
  },

  // VALIDATION HELPERS
  validateSequenceData: (sequenceData) => {
    try {
      if (!sequenceData || typeof sequenceData !== 'object') {
        return { isValid: false, error: 'Invalid sequence data provided' };
      }

      if (!sequenceData.steps || !Array.isArray(sequenceData.steps)) {
        return { isValid: false, error: 'Sequence must have steps array' };
      }

      if (sequenceData.steps.length === 0) {
        return { isValid: false, error: 'Sequence must have at least one step' };
      }

      // Validate each step
      for (let i = 0; i < sequenceData.steps.length; i++) {
        const step = sequenceData.steps[i];
        if (!step.type || !step.template) {
          return { isValid: false, error: `Step ${i + 1} missing required type or template` };
        }
      }

      return { isValid: true, error: null };
      
    } catch (error) {
      console.error('Error validating sequence data:', error);
      return { isValid: false, error: 'Sequence validation error occurred' };
    }
  },

  // DEFAULT FALLBACK TEMPLATES
  getDefaultOutreachSequence: () => {
    return {
      prospectingSequence: {
        name: 'Basic H&S Sequence',
        steps: [
          {
            stepNumber: 1,
            type: 'email',
            delay: 0,
            subject: 'Quick question about {{prospect.company}}',
            template: 'Hi {{prospect.first_name}}, I noticed your work at {{prospect.company}} and wanted to reach out about a potential opportunity.'
          }
        ],
        targetingCriteria: {
          icpFitScore: { min: 5.0, max: 10.0 }
        }
      }
    };
  },

  getDefaultSalesLoftCadence: () => {
    return {
      multiTouchCadence: {
        name: 'Basic H&S Cadence',
        touches: [
          {
            day: 1,
            type: 'email',
            template: 'basic_outreach',
            subject: 'Introduction'
          }
        ]
      }
    };
  },

  getDefaultApolloList: () => {
    return {
      prospectListCriteria: {
        name: 'Basic Prospect List',
        companyFilters: {
          industries: ['Technology'],
          employeeCount: { min: 50, max: 500 }
        },
        contactFilters: {
          jobTitles: ['Director', 'VP'],
          seniority: ['Director', 'VP']
        }
      }
    };
  }
};

export default SalesAutomationService;