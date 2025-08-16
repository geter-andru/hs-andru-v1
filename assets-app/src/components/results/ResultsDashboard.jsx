import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Download, 
  Share2, 
  Calendar,
  Mail,
  Users,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Shield,
  Zap
} from 'lucide-react';

const ResultsDashboard = ({
  companyName = 'Acme Corporation',
  icpScore = 85,
  annualRisk = 2500000,
  roiPercent = 312,
  roiTimeline = '8 months',
  selectedTemplate = 'Enterprise',
  analysisDate = new Date(),
  onExport,
  onShare
}) => {
  const { onResultsGenerated, onExport: contextOnExport, onShare: contextOnShare } = useOutletContext() || {};
  
  // Track results generation on mount
  useEffect(() => {
    if (onResultsGenerated) {
      onResultsGenerated({
        timeSpent: 0
      }).catch(console.error);
    }
  }, [onResultsGenerated]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [shareOptions, setShareOptions] = useState({
    team: false,
    crm: false,
    calendar: false,
    email: false
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    icp: 0,
    risk: 0,
    roi: 0
  });

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedValues({
        icp: Math.round(icpScore * progress),
        risk: Math.round(annualRisk * progress),
        roi: Math.round(roiPercent * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [icpScore, annualRisk, roiPercent]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format large numbers
  const formatLargeNumber = (num) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return formatCurrency(num);
  };

  // Get status color based on score
  const getScoreStatus = (score) => {
    if (score >= 80) return { color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700', label: 'Excellent' };
    if (score >= 60) return { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700', label: 'Good' };
    if (score >= 40) return { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700', label: 'Moderate' };
    return { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700', label: 'Poor' };
  };

  // Get ROI status
  const getRoiStatus = (roi) => {
    if (roi >= 300) return { color: 'text-green-400', icon: TrendingUp, trend: 'up' };
    if (roi >= 200) return { color: 'text-blue-400', icon: TrendingUp, trend: 'up' };
    if (roi >= 100) return { color: 'text-yellow-400', icon: ArrowUpRight, trend: 'moderate' };
    return { color: 'text-red-400', icon: ArrowDownRight, trend: 'down' };
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    setExportFormat(format);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const exportData = {
        format,
        data: {
          companyName,
          icpScore,
          annualRisk,
          roiPercent,
          roiTimeline,
          selectedTemplate,
          analysisDate
        }
      };
      
      // Call prop callback first
      if (onExport) {
        await onExport(exportData);
      }
      
      // Call context callback for tracking
      if (contextOnExport) {
        await contextOnExport(exportData);
      }
      
      console.log(`Exporting as ${format}...`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const selectedPlatforms = Object.entries(shareOptions)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform);
    
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform to share');
      return;
    }
    
    const shareData = {
      platforms: selectedPlatforms,
      data: {
        companyName,
        icpScore,
        annualRisk,
        roiPercent,
        roiTimeline
      }
    };
    
    // Call prop callback first
    if (onShare) {
      await onShare(shareData);
    }
    
    // Call context callback for tracking
    if (contextOnShare) {
      await contextOnShare(shareData);
    }
    
    setShowShareModal(false);
    setShareOptions({ team: false, crm: false, calendar: false, email: false });
  };

  const icpStatus = getScoreStatus(icpScore);
  const roiStatus = getRoiStatus(roiPercent);

  // Generate insights based on scores
  const insights = [
    {
      type: icpScore >= 80 ? 'success' : icpScore >= 60 ? 'info' : 'warning',
      text: `${companyName} shows ${icpStatus.label.toLowerCase()} alignment with your ICP framework`
    },
    {
      type: annualRisk > 1000000 ? 'danger' : 'warning',
      text: `Annual revenue at risk: ${formatLargeNumber(annualRisk)}`
    },
    {
      type: roiPercent >= 300 ? 'success' : 'info',
      text: `Expected ROI of ${roiPercent}% within ${roiTimeline}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-gray-700 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Export Dashboard</h1>
              <p className="text-gray-300">
                Revenue Intelligence ready for {companyName} • Export to your tech stack
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center space-x-2 transition-colors border border-gray-600"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <div className="relative group">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </>
                  )}
                </button>
                {/* Export dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 hidden group-hover:block z-20">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-t-lg flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export as PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport('pptx')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Export as PPTX</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 rounded-b-lg flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export as Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ICP Score Card */}
        <div className={`relative overflow-hidden rounded-xl ${icpStatus.bg} backdrop-blur-sm border ${icpStatus.border} p-6`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-300">ICP Alignment Score</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${icpStatus.bg} ${icpStatus.color} border ${icpStatus.border}`}>
                {icpStatus.label}
              </span>
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold ${icpStatus.color}`}>{animatedValues.icp}</span>
              <span className="text-xl text-gray-400 mb-1">/100</span>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-2000 ease-out ${
                    icpScore >= 80 ? 'bg-green-500' : 
                    icpScore >= 60 ? 'bg-blue-500' : 
                    icpScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${animatedValues.icp}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Based on {selectedTemplate} template criteria
            </p>
          </div>
        </div>

        {/* Annual Risk Card */}
        <div className="relative overflow-hidden rounded-xl bg-red-900/20 backdrop-blur-sm border border-red-700 p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Annual Revenue at Risk</h3>
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-bold text-red-400">
                {formatLargeNumber(animatedValues.risk)}
              </span>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">High exposure</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Potential revenue loss without action
            </p>
          </div>
        </div>

        {/* ROI Potential Card */}
        <div className={`relative overflow-hidden rounded-xl ${roiStatus.color === 'text-green-400' ? 'bg-green-900/20 border-green-700' : 'bg-blue-900/20 border-blue-700'} backdrop-blur-sm border p-6`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-300">ROI Potential</h3>
              <Zap className={`w-5 h-5 ${roiStatus.color}`} />
            </div>
            <div className="flex items-end space-x-2">
              <span className={`text-4xl font-bold ${roiStatus.color}`}>
                {animatedValues.roi}%
              </span>
              <roiStatus.icon className={`w-6 h-6 mb-2 ${roiStatus.color}`} />
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{roiTimeline}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Expected return on investment
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
          Executive Intelligence Summary
        </h2>
        
        <div className="space-y-4">
          {/* Insights */}
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-900/20 border border-green-800' :
                  insight.type === 'danger' ? 'bg-red-900/20 border border-red-800' :
                  insight.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-800' :
                  'bg-blue-900/20 border border-blue-800'
                }`}
              >
                {insight.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : insight.type === 'danger' ? (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                ) : insight.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <BarChart3 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-gray-300">{insight.text}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Strategic Recommendations</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span className="text-gray-300">
                  Prioritize engagement with {companyName} based on {icpStatus.label.toLowerCase()} ICP alignment
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span className="text-gray-300">
                  Implement risk mitigation strategies to address {formatLargeNumber(annualRisk)} potential revenue loss
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span className="text-gray-300">
                  Target {roiPercent}% ROI achievement within {roiTimeline} through focused execution
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Share Results</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={shareOptions.team}
                  onChange={(e) => setShareOptions({ ...shareOptions, team: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-white">Share with Team</span>
              </label>
              
              <label className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={shareOptions.crm}
                  onChange={(e) => setShareOptions({ ...shareOptions, crm: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-white">Update CRM</span>
              </label>
              
              <label className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={shareOptions.calendar}
                  onChange={(e) => setShareOptions({ ...shareOptions, calendar: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-white">Add to Calendar</span>
              </label>
              
              <label className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={shareOptions.email}
                  onChange={(e) => setShareOptions({ ...shareOptions, email: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-white">Send via Email</span>
              </label>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Share Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;