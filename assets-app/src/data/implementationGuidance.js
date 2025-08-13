/**
 * Implementation Guidance Data
 * 
 * Tool-specific guidance content for practical business execution.
 * Framed as methodology rather than sales training to maintain professional positioning.
 */

export const getGuidanceForTool = (toolType, context) => {
  const guidanceMap = {
    'icp-analysis': {
      when: [
        "Before first prospect outreach (research phase)",
        "During discovery calls for qualification",
        "When training team members on target customer identification",
        "Before attending industry events or conferences"
      ],
      how: [
        "Rate prospects 1-10 before scheduling calls",
        "Use scoring criteria as qualifying questions",
        "Focus effort on 7+ rated prospects first",
        "Create team alignment around customer definition"
      ],
      why: [
        "Prevents wasting time on prospects who won't buy",
        "Distinguishes technical interest from business buying behavior", 
        "Increases close rates by 73% through better targeting",
        "Reduces sales cycle length by focusing on qualified prospects"
      ],
      conversationStarters: [
        {
          situation: "Discovery Call",
          opener: "I'd like to understand if we're a good fit for what you're trying to accomplish...",
          followUp: [
            "What's driving you to evaluate this type of solution right now?",
            "Who else is involved in making this decision?",
            "What happens if you don't solve this in the next 6 months?",
            "How are you handling this challenge today?"
          ]
        },
        {
          situation: "Prospect Research",
          opener: "Before reaching out, evaluate the prospect using your ICP criteria...",
          followUp: [
            "Do they match your target company size/industry?",
            "Is there evidence of the business pain you solve?",
            "Can you identify the likely decision-maker?",
            "Are they in active buying mode or just browsing?"
          ]
        },
        {
          situation: "Team Training",
          opener: "When qualifying prospects, focus on business buying signals...",
          followUp: [
            "Budget authority vs technical evaluation access",
            "Urgency drivers vs curious exploration",
            "Decision timeline vs research phase",
            "Business impact focus vs feature interest"
          ]
        }
      ]
    },
    
    'cost-calculator': {
      when: [
        "During discovery when timeline discussions arise",
        "In proposal presentations to executive stakeholders",
        "When prospects express price sensitivity",
        "To create urgency in stalled deal situations"
      ],
      how: [
        "Show the timeline visual during screen share",
        "Walk through the calculation logic transparently",
        "Customize inputs based on their specific situation",
        "Export results for stakeholder sharing"
      ],
      why: [
        "Creates urgency without appearing pushy",
        "Quantifies business impact of delayed decisions",
        "Shifts conversation from cost to value",
        "Provides CFO-ready financial justification"
      ],
      conversationStarters: [
        {
          situation: "Timeline Discussion",
          opener: "Let's look at what delay might cost your business...",
          followUp: [
            "Based on your current situation, here's what I'm seeing...",
            "Each month of delay represents this much lost opportunity...",
            "How does this timeline align with your planning cycle?",
            "What would need to happen to accelerate this decision?"
          ]
        },
        {
          situation: "Executive Presentation",
          opener: "I want to show you the financial impact of this initiative...",
          followUp: [
            "Here's the cost of maintaining status quo over 6 months...",
            "This represents the opportunity cost of delayed implementation...",
            "The investment pays back in X months based on these metrics...",
            "How do these numbers align with your budget planning?"
          ]
        },
        {
          situation: "Stalled Deal",
          opener: "I realize timing might be challenging, but let's look at the bigger picture...",
          followUp: [
            "While you're deciding, the business impact continues to accumulate...",
            "What I'm seeing is that delay costs exceed implementation costs...",
            "Is there a way to move forward with a pilot to start capturing value?",
            "What would change about this timeline if the board saw these numbers?"
          ]
        }
      ]
    },
    
    'business-case': {
      when: [
        "After technical validation is complete",
        "Before presenting to executive decision-makers",
        "When prospect requests formal proposal",
        "To support champion internal selling process"
      ],
      how: [
        "Customize stakeholder-specific versions (CEO/CFO/CTO)",
        "Include data from ICP analysis and cost calculations",
        "Use as email attachment with contextual message",
        "Present sections live during stakeholder meetings"
      ],
      why: [
        "Bridges technical validation to business approval",
        "Provides champions with selling tools for internal advocacy",
        "Creates professional presentation for board/executive review",
        "Demonstrates consulting-level business acumen"
      ],
      conversationStarters: [
        {
          situation: "Champion Enablement",
          opener: "I've prepared a business case you can use internally...",
          followUp: [
            "The executive summary focuses on ROI and strategic impact...",
            "I've included technical details for your engineering team...",
            "Here are the key talking points for your CFO discussion...",
            "What questions do you anticipate from your decision-makers?"
          ]
        },
        {
          situation: "Executive Presentation",
          opener: "I'd like to walk through the strategic business case...",
          followUp: [
            "This initiative aligns with your growth objectives by...",
            "The financial impact over 12 months shows...",
            "Implementation risk is minimal given your current infrastructure...",
            "What other factors should we consider in your decision process?"
          ]
        },
        {
          situation: "Proposal Submission",
          opener: "I'm including a comprehensive business case with our proposal...",
          followUp: [
            "Section 1 covers strategic alignment with your initiatives...",
            "Section 2 details the financial justification and ROI...",
            "Section 3 addresses implementation and risk considerations...",
            "Who else should review this before your final decision?"
          ]
        }
      ]
    }
  };

  return guidanceMap[toolType] || getDefaultGuidance();
};

const getDefaultGuidance = () => ({
  when: ["When engaging with prospects"],
  how: ["Use the framework systematically"],
  why: ["To improve business outcomes"],
  conversationStarters: []
});