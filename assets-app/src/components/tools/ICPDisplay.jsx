import React, { useState, useEffect } from 'react';
import ContentDisplay, { Callout } from '../common/ContentDisplay';
import LoadingSpinner, { CardSkeleton } from '../common/LoadingSpinner';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';

const ICPDisplay = () => {
  const [icpData, setIcpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [ratingResult, setRatingResult] = useState(null);
  const [isRating, setIsRating] = useState(false);

  const session = authService.getCurrentSession();

  useEffect(() => {
    const loadICPData = async () => {
      try {
        setLoading(true);
        const customerAssets = await airtableService.getCustomerAssets(
          session.customerId,
          new URLSearchParams(window.location.search).get('token')
        );
        setIcpData(customerAssets.icpContent);
        setError(null);
      } catch (err) {
        console.error('Failed to load ICP data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadICPData();
    }
  }, [session]);

  const calculateFitScore = async (companyName) => {
    setIsRating(true);
    setRatingResult(null);

    try {
      // Simulate company analysis (in real implementation, this would call an AI service or external API)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock rating calculation based on company name characteristics
      const mockRating = {
        companyName,
        overallScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
        criteria: [
          {
            name: 'Company Size',
            score: Math.floor(Math.random() * 30) + 70,
            description: 'Based on estimated employee count and revenue'
          },
          {
            name: 'Technology Stack',
            score: Math.floor(Math.random() * 40) + 60,
            description: 'Alignment with target tech requirements'
          },
          {
            name: 'Market Segment',
            score: Math.floor(Math.random() * 35) + 65,
            description: 'Fit within ideal customer segments'
          },
          {
            name: 'Growth Stage',
            score: Math.floor(Math.random() * 30) + 70,
            description: 'Company maturity and growth trajectory'
          }
        ],
        recommendation: 'High Priority',
        nextSteps: [
          'Schedule discovery call within 2 weeks',
          'Prepare customized demo focusing on scalability',
          'Research recent company news and initiatives'
        ]
      };

      setRatingResult(mockRating);
      
      // Save rating to user progress
      await airtableService.saveUserProgress(
        session.customerId,
        'icp_rating',
        { companyName, rating: mockRating }
      );

    } catch (err) {
      console.error('Rating calculation failed:', err);
      setError('Failed to calculate company fit score');
    } finally {
      setIsRating(false);
    }
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (companyName.trim()) {
      calculateFitScore(companyName.trim());
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ICP Identification & Rating</h1>
            <p className="text-gray-600">Analyze and rate potential customers against your ideal profile</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !icpData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">ICP Identification & Rating</h1>
        <Callout type="error" title="Error Loading ICP Data">
          {error}
        </Callout>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ICP Identification & Rating System</h1>
          <p className="text-gray-600">Analyze and rate potential customers against your ideal customer profile</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: ICP Framework Content */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your ICP Framework</h2>
            {icpData ? (
              <ContentDisplay content={icpData} />
            ) : (
              <p className="text-gray-500">No ICP framework data available</p>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Rating Tool */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Fit Calculator</h2>
            
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name to analyze"
                  className="form-input"
                  disabled={isRating}
                />
              </div>
              
              <button
                type="submit"
                disabled={!companyName.trim() || isRating}
                className="btn btn-primary w-full"
              >
                {isRating ? 'Analyzing...' : 'Calculate Fit Score'}
              </button>
            </form>

            {isRating && (
              <div className="mt-4">
                <LoadingSpinner message="Analyzing company fit..." />
              </div>
            )}

            {ratingResult && (
              <div className="mt-6 space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Fit Analysis: {ratingResult.companyName}
                  </h3>
                  
                  {/* Overall Score */}
                  <div className={`rounded-lg p-4 mb-4 ${getScoreBackground(ratingResult.overallScore)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Fit Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(ratingResult.overallScore)}`}>
                        {ratingResult.overallScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Criteria Breakdown */}
                  <div className="space-y-3">
                    {ratingResult.criteria.map((criterion, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{criterion.name}</span>
                          <span className={`font-semibold ${getScoreColor(criterion.score)}`}>
                            {criterion.score}/100
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{criterion.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  <div className="mt-4">
                    <Callout type="success" title={`Recommendation: ${ratingResult.recommendation}`}>
                      <ul className="mt-2 space-y-1">
                        {ratingResult.nextSteps.map((step, index) => (
                          <li key={index} className="text-sm">• {step}</li>
                        ))}
                      </ul>
                    </Callout>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICPDisplay;