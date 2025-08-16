// AIIntegrationTemplates.js - AI tool integration templates for Claude, ChatGPT, and other AI platforms

export const AIIntegrationTemplates = {
  
  // CLAUDE/CHATGPT PROMPT TEMPLATES
  generateClaudePrompts: (icpData, costData, businessCaseData) => {
    try {
      // Safe data extraction with fallbacks
      const buyerPersona = icpData?.buyerPersona || {};
      const demographics = buyerPersona.demographics || 'Target buyer demographics';
      const painPoints = Array.isArray(buyerPersona.painPoints) 
        ? buyerPersona.painPoints.join(', ') 
        : buyerPersona.painPoints || 'Key pain points';
      const decisionMaking = buyerPersona.decisionMaking || 'Decision-making process';
      
      const impactCalculation = costData?.impactCalculation || {};
      const methodology = impactCalculation.methodology || 'Financial impact methodology';
      const results = impactCalculation.results || 'Impact analysis results';
      
      const framework = businessCaseData?.framework || {};
      const executiveSummary = framework.executiveSummary || 'Executive summary framework';
      const financialJustification = framework.financialJustification || 'Financial justification structure';
      const riskAssessment = framework.riskAssessment || 'Risk assessment methodology';

      return {
        prospectResearchPrompt: `You are a sales research specialist. Using this systematic buyer intelligence:

TARGET BUYER PROFILE:
Demographics: ${demographics}
Pain Points: ${painPoints}
Decision Making: ${decisionMaking}

Research [COMPANY_NAME] and provide:
1. Fit score (1-10) based on our ICP criteria
2. Specific pain points they likely experience based on our buyer intelligence
3. Key stakeholders to target based on decision-making patterns
4. Recommended approach strategy aligned with buyer preferences

Company to research: [INSERT_COMPANY_URL]
Industry context: [INSERT_INDUSTRY]

Format your response with clear sections and actionable insights.`,

        valuePropositionPrompt: `You are a technical value translator. Using our financial impact model:

OUR SOLUTION IMPACT:
Methodology: ${methodology}
Results: ${results}

For [PROSPECT_COMPANY], translate our technical capabilities into:
1. Industry-specific business outcomes that resonate with their stakeholders
2. Quantified financial benefits using our proven calculation methods
3. Risk mitigation value addressing their specific concerns
4. Competitive advantages that matter to their decision criteria

Their industry: [INSERT_INDUSTRY]
Their challenges: [INSERT_CHALLENGES]
Their decision timeline: [INSERT_TIMELINE]

Use business language that speaks to executives and financial stakeholders.`,

        businessCasePrompt: `You are an executive business case writer. Using our proven framework:

FRAMEWORK STRUCTURE:
Executive Summary: ${executiveSummary}
Financial Justification: ${financialJustification}
Risk Assessment: ${riskAssessment}

Create a business case for [PROSPECT_COMPANY] that includes:
1. Executive summary (C-suite focused, results-oriented)
2. Financial ROI projections with clear payback timeline
3. Implementation roadmap with realistic milestones
4. Risk mitigation strategies addressing common concerns

Prospect context: [INSERT_PROSPECT_CONTEXT]
Budget range: [INSERT_BUDGET_RANGE]
Implementation timeline: [INSERT_TIMELINE]

Keep language professional and benefit-focused for executive audiences.`,

        objectionHandlingPrompt: `You are a sales conversation specialist. Using our buyer intelligence:

BUYER PROFILE:
Key Concerns: ${painPoints}
Decision Style: ${decisionMaking}

For the objection: "[INSERT_OBJECTION]"

Provide:
1. Root cause analysis of this objection based on buyer psychology
2. Empathetic acknowledgment that builds trust
3. Evidence-based response using our success data
4. Forward momentum question to continue the conversation

Keep responses consultative and focused on the buyer's success.`,

        discoveryPrompt: `You are a discovery conversation specialist. Using our buyer intelligence:

IDEAL BUYER PROFILE:
Target Profile: ${demographics}
Known Pain Points: ${painPoints}
Decision Process: ${decisionMaking}

Create discovery questions for [PROSPECT_COMPANY] that:
1. Uncover their specific version of our known pain points
2. Quantify the business impact of their challenges
3. Identify all stakeholders in their decision process
4. Establish urgency and timeline for resolution

Structure as open-ended questions that encourage detailed responses and build trust.`
      };
      
    } catch (error) {
      console.error('Error generating Claude prompts:', error);
      return AIIntegrationTemplates.getDefaultPrompts();
    }
  },

  // PERSONA DEVELOPMENT FOR AI TOOLS
  generateAIPersonas: (icpData) => {
    try {
      const buyerPersona = icpData?.buyerPersona || {};
      const name = buyerPersona.name || 'Target Buyer';
      const role = buyerPersona.role || 'Decision Maker';
      const language = buyerPersona.language || 'professional business terminology';
      const objections = Array.isArray(buyerPersona.objections) 
        ? buyerPersona.objections 
        : (buyerPersona.objections ? [buyerPersona.objections] : ['budget concerns', 'timing issues']);
      const motivations = Array.isArray(buyerPersona.motivations) 
        ? buyerPersona.motivations 
        : (buyerPersona.motivations ? [buyerPersona.motivations] : ['efficiency gains', 'cost reduction']);
      const decisionCriteria = Array.isArray(buyerPersona.decisionCriteria) 
        ? buyerPersona.decisionCriteria 
        : (buyerPersona.decisionCriteria ? [buyerPersona.decisionCriteria] : ['ROI', 'implementation ease']);

      const conversationFrameworks = icpData?.conversationFrameworks || [
        'Tell me about your current process for...',
        'How do you currently handle...',
        'What challenges do you face with...'
      ];

      const objectionResponses = icpData?.objectionResponses || [
        'I understand that concern. Many of our clients initially felt the same way...',
        'That\'s a great question. Let me share how we\'ve addressed this for similar companies...',
        'I appreciate you bringing that up. Here\'s what we\'ve learned...'
      ];

      return {
        buyerPersona: {
          name: name,
          role: role,
          aiInstructions: `When role-playing as this buyer persona:
- Use terminology: ${language}
- Express concerns about: ${objections.join(', ')}
- Show interest in: ${motivations.join(', ')}
- Make decisions based on: ${decisionCriteria.join(', ')}
- Respond with realistic business context and appropriate skepticism
- Ask follow-up questions that real buyers would ask
- Demonstrate understanding of industry challenges`,
          
          conversationStarters: conversationFrameworks,
          objectionHandling: objectionResponses,
          
          rolePlayingPrompt: `You are role-playing as ${name}, a ${role}. You are evaluating business solutions and want to make informed decisions that benefit your organization.

Key characteristics:
- Decision criteria: ${decisionCriteria.join(', ')}
- Primary concerns: ${objections.join(', ')}
- What motivates you: ${motivations.join(', ')}
- Communication style: ${language}

Respond as this persona would in a business conversation, asking realistic questions and raising appropriate concerns.`,

          validationPrompt: `You are ${name}, a ${role} who has been asked to validate a business solution.

Your perspective:
- You need to see clear business value: ${motivations.join(', ')}
- You have concerns about: ${objections.join(', ')}
- You evaluate solutions based on: ${decisionCriteria.join(', ')}

Review this proposal and respond with the questions and concerns you would genuinely have as this buyer persona.`
        }
      };
      
    } catch (error) {
      console.error('Error generating AI personas:', error);
      return AIIntegrationTemplates.getDefaultPersona();
    }
  },

  // CONVERSATION FLOW TEMPLATES
  generateConversationScripts: (icpData, businessCaseData) => {
    try {
      const buyerPersona = icpData?.buyerPersona || {};
      const painPoints = Array.isArray(buyerPersona.painPoints) 
        ? buyerPersona.painPoints 
        : [buyerPersona.painPoints || 'operational challenges'];
      
      const businessCase = businessCaseData?.framework || {};
      const valueProposition = businessCase.valueProposition || 'Our solution provides significant business value';
      const successMetrics = businessCase.successMetrics || ['efficiency improvement', 'cost reduction'];

      return {
        discoveryScript: {
          title: 'Discovery Conversation Flow',
          objective: 'Uncover specific pain points and quantify business impact',
          structure: [
            {
              phase: 'Opening',
              duration: '2-3 minutes',
              script: `Thank you for taking the time to speak with me. I've done some research on [COMPANY] and your role as [ROLE]. 

Based on what I've learned about companies in your industry, I'm curious about how you're currently handling [PRIMARY_PAIN_POINT]. 

Before we dive in, could you give me a quick overview of your current [RELEVANT_PROCESS]?`,
              notes: 'Establish credibility and show preparation while opening a natural conversation'
            },
            {
              phase: 'Pain Discovery',
              duration: '10-15 minutes',
              script: `That's helpful context. I'm hearing [REFLECT_THEIR_SITUATION]. 

Many organizations we work with face challenges around:
${painPoints.map(point => `- ${point}`).join('\n')}

Which of these resonates most with your experience? Or is there something else that's a bigger concern?

[FOLLOW-UP] Can you help me understand the business impact of [THEIR_PAIN_POINT]? For example, how much time does your team spend on [RELATED_ACTIVITY]?`,
              notes: 'Use known pain points to guide discovery while remaining open to their specific situation'
            },
            {
              phase: 'Value Exploration',
              duration: '8-10 minutes',
              script: `I can see how that would be frustrating. What you're describing is exactly what we've helped other ${buyerPersona.industry || 'organizations'} address.

If you could wave a magic wand and solve [THEIR_PAIN_POINT], what would that mean for your team? Your organization?

[QUANTIFICATION] Is this something that keeps you up at night, or is it more of a nice-to-have improvement?`,
              notes: 'Connect their pain to potential value and establish urgency'
            },
            {
              phase: 'Solution Bridge',
              duration: '5-8 minutes',
              script: `Based on what you've shared, I think there could be a really good fit here. We've helped companies like [SIMILAR_COMPANY] achieve [SPECIFIC_RESULT] by [HIGH_LEVEL_APPROACH].

${valueProposition}

Would it be helpful if I showed you how this might work for [COMPANY]?`,
              notes: 'Connect their specific situation to your solution without jumping into a full demo'
            }
          ]
        },

        objectionHandlingScript: {
          title: 'Common Objection Responses',
          objective: 'Address concerns while maintaining conversation momentum',
          responses: {
            budget: `I understand budget is always a consideration. Many of our clients initially had the same concern.

What we've found is that the cost of not solving [THEIR_PAIN_POINT] often far exceeds the investment in a solution. 

Based on what you've told me about [SPECIFIC_IMPACT], have you calculated what this challenge is currently costing you?`,

            timing: `Timing is definitely important. When you say it's not the right time, help me understand - is that because of other priorities, or because [THEIR_PAIN_POINT] isn't urgent enough yet?

What would need to happen for this to become a priority?`,

            authority: `I appreciate you being upfront about the decision process. Who else would be involved in evaluating something like this?

Would it be helpful if I put together some information that you could share with [DECISION_MAKER]?`,

            competition: `That's great that you're being thorough in your evaluation. What criteria are you using to compare options?

I'd be happy to show you how we're different, but first - what's most important to you in a solution?`
          }
        }
      };
      
    } catch (error) {
      console.error('Error generating conversation scripts:', error);
      return AIIntegrationTemplates.getDefaultScripts();
    }
  },

  // PROMPT OPTIMIZATION HELPERS
  optimizePromptForAI: (basePrompt, aiType = 'claude') => {
    try {
      if (!basePrompt || typeof basePrompt !== 'string') {
        return basePrompt;
      }
      
      const optimizations = {
        claude: {
          prefix: 'You are a professional sales specialist with deep expertise in B2B sales. ',
          structure: 'Think step by step and provide detailed, actionable insights.',
          format: 'Format your response with clear headings and bullet points for easy reading.'
        },
        chatgpt: {
          prefix: 'As an experienced B2B sales professional, ',
          structure: 'Analyze this systematically and provide practical recommendations.',
          format: 'Use numbered lists and clear sections in your response.'
        },
        generic: {
          prefix: 'Using your expertise in B2B sales, ',
          structure: 'Provide detailed analysis and actionable recommendations.',
          format: 'Structure your response clearly with headings and examples.'
        }
      };

      const optimization = optimizations[aiType] || optimizations.generic;
      
      return `${optimization.prefix}${basePrompt}

${optimization.structure}

${optimization.format}`;
      
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      return basePrompt;
    }
  },

  // VARIABLE REPLACEMENT SYSTEM
  replacePromptVariables: (prompt, variables = {}) => {
    try {
      let processedPrompt = prompt;
      
      // Standard variable replacements
      const standardVariables = {
        '[COMPANY_NAME]': variables.companyName || '[COMPANY_NAME]',
        '[PROSPECT_CONTEXT]': variables.prospectContext || '[PROSPECT_CONTEXT]',
        '[INDUSTRY]': variables.industry || '[INDUSTRY]',
        '[CHALLENGES]': variables.challenges || '[CHALLENGES]',
        '[TIMELINE]': variables.timeline || '[TIMELINE]',
        '[BUDGET_RANGE]': variables.budgetRange || '[BUDGET_RANGE]',
        '[INSERT_COMPANY_URL]': variables.companyUrl || '[INSERT_COMPANY_URL]',
        '[INSERT_OBJECTION]': variables.objection || '[INSERT_OBJECTION]'
      };

      // Replace each variable (only if replacement value is different from placeholder)
      Object.entries(standardVariables).forEach(([placeholder, value]) => {
        if (value !== placeholder) {
          // Escape special regex characters in placeholder
          const escapedPlaceholder = placeholder.replace(/[[\]]/g, '\\$&');
          processedPrompt = processedPrompt.replace(new RegExp(escapedPlaceholder, 'g'), value);
        }
      });

      return processedPrompt;
      
    } catch (error) {
      console.error('Error replacing prompt variables:', error);
      return prompt;
    }
  },

  // DEFAULT FALLBACK TEMPLATES
  getDefaultPrompts: () => {
    return {
      prospectResearchPrompt: `You are a sales research specialist. Research [COMPANY_NAME] and provide:
1. Business overview and key challenges
2. Potential fit for our solution (1-10 score)
3. Key stakeholders to target
4. Recommended approach strategy

Company URL: [INSERT_COMPANY_URL]`,

      valuePropositionPrompt: `You are a value communication specialist. For [PROSPECT_COMPANY]:
1. Identify their likely business challenges
2. Translate our capabilities into their business outcomes
3. Quantify potential benefits
4. Address likely concerns

Industry: [INSERT_INDUSTRY]`,

      businessCasePrompt: `Create a business case for [PROSPECT_COMPANY] including:
1. Executive summary
2. Financial projections
3. Implementation plan
4. Risk mitigation

Context: [INSERT_PROSPECT_CONTEXT]`
    };
  },

  getDefaultPersona: () => {
    return {
      buyerPersona: {
        name: 'Business Decision Maker',
        role: 'Director/VP Level',
        aiInstructions: 'Role-play as a cautious but open business decision maker who evaluates solutions based on ROI and business impact.',
        conversationStarters: ['Tell me about your solution', 'How does this work?', 'What are the costs?'],
        objectionHandling: ['I need to see clear ROI', 'What about implementation time?', 'How do you compare to alternatives?']
      }
    };
  },

  getDefaultScripts: () => {
    return {
      discoveryScript: {
        title: 'Basic Discovery Flow',
        objective: 'Understand prospect needs and challenges',
        structure: [
          {
            phase: 'Opening',
            script: 'Thank you for your time. Tell me about your current challenges.',
            notes: 'Start with open-ended questions'
          }
        ]
      }
    };
  },

  // VALIDATION HELPERS
  validatePromptData: (data) => {
    try {
      if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Invalid data provided' };
      }

      // Check for required data structure
      if (!data.icpData && !data.costData && !data.businessCaseData) {
        return { isValid: false, error: 'At least one data source (ICP, cost, or business case) is required' };
      }

      return { isValid: true, error: null };
      
    } catch (error) {
      console.error('Error validating prompt data:', error);
      return { isValid: false, error: 'Validation error occurred' };
    }
  }
};

export default AIIntegrationTemplates;