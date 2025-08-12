import React, { useState, useEffect } from 'react';
import { Calendar, Award, TrendingUp, Clock, Filter, Search } from 'lucide-react';
import { milestoneService } from '../../services/milestoneService';

const MilestoneGallery = ({ customerId, className = '' }) => {
  const [milestones, setMilestones] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMilestones = async () => {
      if (!customerId) return;

      try {
        setLoading(true);
        await milestoneService.initializeMilestones(customerId);
        
        const milestoneData = milestoneService.milestones;
        const progress = milestoneService.userProgress;
        const milestoneStats = milestoneService.getMilestoneStats();

        // Combine milestone definitions with progress
        const enrichedMilestones = Object.entries(milestoneData).map(([id, milestone]) => ({
          ...milestone,
          progress: progress[id] || { current: 0, required: 1, achieved: false },
          progressPercent: Math.min(((progress[id]?.current || 0) / (milestone.requirement?.count || milestone.requirement?.days || milestone.requirement?.amount || 1)) * 100, 100)
        }));

        setMilestones(enrichedMilestones);
        setStats(milestoneStats);
      } catch (error) {
        console.error('Error loading milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMilestones();
  }, [customerId]);

  const filteredAndSortedMilestones = () => {
    let filtered = milestones;

    // Apply filters
    if (filter === 'achieved') {
      filtered = filtered.filter(m => m.progress.achieved);
    } else if (filter === 'in_progress') {
      filtered = filtered.filter(m => !m.progress.achieved && m.progress.current > 0);
    } else if (filter === 'available') {
      filtered = filtered.filter(m => !m.progress.achieved);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          const aTime = new Date(a.progress.achievedAt || a.progress.lastUpdate || 0);
          const bTime = new Date(b.progress.achievedAt || b.progress.lastUpdate || 0);
          return bTime - aTime;
        case 'progress':
          return b.progressPercent - a.progressPercent;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getCategoryStats = () => {
    const categories = {};
    milestones.forEach(milestone => {
      if (!categories[milestone.category]) {
        categories[milestone.category] = { total: 0, achieved: 0 };
      }
      categories[milestone.category].total++;
      if (milestone.progress.achieved) {
        categories[milestone.category].achieved++;
      }
    });
    return categories;
  };

  const MilestoneCard = ({ milestone }) => {
    const isAchieved = milestone.progress.achieved;
    const progress = milestone.progressPercent;

    return (
      <div className={`relative overflow-hidden rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
        isAchieved 
          ? 'bg-gray-800 border-gray-600 shadow-lg' 
          : 'bg-gray-900 border-gray-700 hover:border-gray-600'
      }`}>
        
        {/* Achievement glow */}
        {isAchieved && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30" />
        )}

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`text-3xl p-2 rounded-lg ${
                isAchieved 
                  ? 'bg-yellow-900/50 border border-yellow-700' 
                  : 'bg-gray-800 border border-gray-600'
              }`}>
                {milestone.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  isAchieved ? 'text-white' : 'text-gray-300'
                }`}>
                  {milestone.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isAchieved 
                      ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                      : 'bg-gray-700 text-gray-400 border border-gray-600'
                  }`}>
                    {milestone.category}
                  </span>
                  {milestone.hiddenRank && isAchieved && (
                    <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full border border-purple-700">
                      Rank {milestone.hiddenRank}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isAchieved 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : progress > 0
                  ? 'bg-blue-900 text-blue-300 border border-blue-700'
                  : 'bg-gray-700 text-gray-400 border border-gray-600'
            }`}>
              {isAchieved ? 'Achieved' : progress > 0 ? 'In Progress' : 'Available'}
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm mb-4 leading-relaxed ${
            isAchieved ? 'text-gray-300' : 'text-gray-400'
          }`}>
            {milestone.description}
          </p>

          {/* Progress bar (for non-achieved milestones) */}
          {!isAchieved && progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {milestone.progress.current} / {milestone.progress.required || milestone.requirement?.count || milestone.requirement?.days || milestone.requirement?.amount || 1}
              </div>
            </div>
          )}

          {/* Achievement details */}
          {isAchieved && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <Award className="w-4 h-4" />
                <span>Professional Milestone Achieved</span>
              </div>
              
              {milestone.progress.achievedAt && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(milestone.progress.achievedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {milestone.reward.badge && (
                <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 rounded-full border border-yellow-700">
                  <Award className="w-3 h-3 text-yellow-400 mr-2" />
                  <span className="text-xs font-medium text-yellow-300">
                    {milestone.reward.badge}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reward preview (for non-achieved) */}
          {!isAchieved && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-400 mb-2">Milestone Rewards:</div>
              <div className="flex flex-wrap gap-2">
                {milestone.reward.progressPoints && (
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-800">
                    +{milestone.reward.progressPoints} Points
                  </span>
                )}
                {milestone.reward.badge && (
                  <span className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded border border-yellow-800">
                    {milestone.reward.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{milestone.unlocks}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-gray-900 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categoryStats = getCategoryStats();
  const filteredMilestones = filteredAndSortedMilestones();

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Professional Development History
            </h2>
            <p className="text-gray-400">
              Track your systematic methodology advancement and achievements
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.totalAchieved || 0}
            </div>
            <div className="text-sm text-gray-400">Milestones Achieved</div>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(categoryStats).map(([category, stat]) => (
            <div key={category} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="text-lg font-semibold text-white">
                {stat.achieved}/{stat.total}
              </div>
              <div className="text-xs text-gray-400">{category}</div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full"
                  style={{ width: `${(stat.achieved / stat.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search milestones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Milestones</option>
              <option value="achieved">Achieved</option>
              <option value="in_progress">In Progress</option>
              <option value="available">Available</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="progress">By Progress</option>
            <option value="category">By Category</option>
            <option value="name">By Name</option>
          </select>
        </div>
      </div>

      {/* Milestone grid */}
      <div className="p-6">
        {filteredMilestones.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredMilestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              {searchTerm || filter !== 'all' 
                ? 'No milestones match your criteria' 
                : 'No milestones available'
              }
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneGallery;