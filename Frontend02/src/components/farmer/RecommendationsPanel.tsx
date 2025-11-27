import React, { useState, useEffect } from 'react';
import { 
  Recommendation, 
  getRecommendations, 
  dismissRecommendation,
  markAsActed
} from '../../services/recommendationService';
import RecommendationCard from './RecommendationCard';
import { RefreshCw, Filter, BarChart3, AlertCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const RecommendationsPanel: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const { addNotification } = useNotification();

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getRecommendations();
      
      if (response.success) {
        setRecommendations(response.recommendations);
        setFilteredRecommendations(response.recommendations);
        setStats(response.stats);
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to fetch recommendations'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Filter recommendations by priority
  useEffect(() => {
    if (selectedPriority === 'ALL') {
      setFilteredRecommendations(recommendations);
    } else {
      setFilteredRecommendations(
        recommendations.filter(rec => rec.priority === selectedPriority)
      );
    }
  }, [selectedPriority, recommendations]);

  // Handle dismiss
  const handleDismiss = async (id: string) => {
    try {
      const response = await dismissRecommendation(id);
      
      if (response.success) {
        setRecommendations(prev => prev.filter(rec => rec._id !== id));
        addNotification({
          type: 'success',
          message: 'Recommendation dismissed'
        });
      }
    } catch (error: any) {
      console.error('Error dismissing recommendation:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to dismiss recommendation'
      });
    }
  };

  // Handle act
  const handleAct = async (id: string) => {
    try {
      const response = await markAsActed(id);
      
      if (response.success) {
        setRecommendations(prev => prev.filter(rec => rec._id !== id));
        addNotification({
          type: 'success',
          message: 'Great! Recommendation marked as acted upon'
        });
      }
    } catch (error: any) {
      console.error('Error marking recommendation as acted:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to mark as acted'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-border-color rounded-lg p-8">
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-text-muted">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white border border-border-color rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-3">
          <BarChart3 className="w-12 h-12 text-text-muted" />
          <h3 className="text-lg font-semibold text-text-dark">No Recommendations Yet</h3>
          <p className="text-sm text-text-muted text-center max-w-md">
            Add products to your inventory to receive smart recommendations for maximizing your revenue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-color rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-dark">Smart Recommendations</h2>
            <p className="text-sm text-text-muted">AI-powered insights to maximize your revenue</p>
          </div>
        </div>
        <button
          onClick={fetchRecommendations}
          className="p-2.5 rounded-lg border border-border-color hover:bg-gray-50 transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className="w-4 h-4 text-text-dark" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="border border-border-color rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-text-dark">{stats.total}</div>
          <div className="text-xs text-text-muted mt-1">Total</div>
        </div>
        <div className="border border-red-200 bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-xs text-red-700 mt-1">Critical</div>
        </div>
        <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-xs text-orange-700 mt-1">High</div>
        </div>
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.medium}</div>
          <div className="text-xs text-blue-700 mt-1">Medium</div>
        </div>
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.low}</div>
          <div className="text-xs text-purple-700 mt-1">Low</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-3 py-2">
        <Filter className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-medium text-text-dark">Priority:</span>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
            <button
              key={priority}
              onClick={() => setSelectedPriority(priority)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedPriority === priority
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200 border border-border-color'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Grid */}
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRecommendations.map(recommendation => (
            <RecommendationCard
              key={recommendation._id}
              recommendation={recommendation}
              onDismiss={handleDismiss}
              onAct={handleAct}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 space-y-3 border border-border-color rounded-lg bg-gray-50">
          <AlertCircle className="w-12 h-12 text-text-muted" />
          <p className="text-text-muted">No recommendations found for selected priority</p>
          <button
            onClick={() => setSelectedPriority('ALL')}
            className="px-4 py-2 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors"
          >
            View all recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;
