import React, { useState } from 'react';
import { Recommendation } from '../../services/recommendationService';
import { 
  TrendingDown, 
  Package, 
  Factory, 
  Shield, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  Zap,
  Clock,
  Target
} from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss: (id: string) => void;
  onAct: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onDismiss, 
  onAct 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActing, setIsActing] = useState(false);

  // Map type to icon
  const getIcon = () => {
    switch (recommendation.type) {
      case 'EMERGENCY_AUCTION':
        return <AlertTriangle className="w-5 h-5" />;
      case 'FLASH_SALE':
        return <Zap className="w-5 h-5" />;
      case 'BULK_MODE':
        return <Package className="w-5 h-5" />;
      case 'VALUE_ADDITION':
        return <Factory className="w-5 h-5" />;
      case 'INSURANCE':
        return <Shield className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  // Map priority to colors - matching UI design system
  const getPriorityStyles = () => {
    switch (recommendation.priority) {
      case 'CRITICAL':
        return {
          card: 'bg-white border border-red-200',
          icon: 'bg-red-100 text-red-600',
          badge: 'bg-red-100 text-red-700',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'HIGH':
        return {
          card: 'bg-white border border-orange-200',
          icon: 'bg-orange-100 text-orange-600',
          badge: 'bg-orange-100 text-orange-700',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'MEDIUM':
        return {
          card: 'bg-white border border-blue-200',
          icon: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'LOW':
        return {
          card: 'bg-white border border-purple-200',
          icon: 'bg-purple-100 text-purple-600',
          badge: 'bg-purple-100 text-purple-700',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      default:
        return {
          card: 'bg-white border border-gray-200',
          icon: 'bg-gray-100 text-gray-600',
          badge: 'bg-gray-100 text-gray-700',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const styles = getPriorityStyles();

  const handleAct = async () => {
    setIsActing(true);
    await onAct(recommendation._id);
    setIsActing(false);
  };

  return (
    <div className={`rounded-lg shadow-sm p-5 transition-all hover:shadow-md ${styles.card}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          {/* Icon with background */}
          <div className={`p-2.5 rounded-lg ${styles.icon}`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Title and Badge Row */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-base text-text-dark">
                {recommendation.title.replace(/[🚨⚡📦🏭🛡️]/g, '').trim()}
              </h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles.badge}`}>
                {recommendation.priority}
              </span>
            </div>
            
            {/* Message */}
            <p className="text-sm text-text-muted leading-relaxed mb-2">
              {recommendation.message}
            </p>
            
            {/* Product Info */}
            <div className="flex items-center text-xs text-text-muted">
              <Package className="w-3.5 h-3.5 mr-1" />
              <span>{recommendation.productName}</span>
            </div>
          </div>
        </div>
        
        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(recommendation._id)}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Data Preview - Grid Layout */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
        {recommendation.actionData.suggestedDiscount && (
          <div className="flex flex-col">
            <span className="text-xs text-text-muted mb-1">Suggested Discount</span>
            <span className="text-sm font-semibold text-text-dark">{recommendation.actionData.suggestedDiscount}%</span>
          </div>
        )}
        {recommendation.actionData.wholesalePrice && (
          <div className="flex flex-col">
            <span className="text-xs text-text-muted mb-1">Wholesale Price</span>
            <span className="text-sm font-semibold text-text-dark">₹{recommendation.actionData.wholesalePrice}</span>
          </div>
        )}
        {recommendation.actionData.potentialRevenue && (
          <div className="flex flex-col">
            <span className="text-xs text-text-muted mb-1">Potential Revenue</span>
            <span className="text-sm font-semibold text-primary">{recommendation.actionData.potentialRevenue}</span>
          </div>
        )}
        {recommendation.actionData.expectedOutcome && (
          <div className="flex flex-col col-span-2">
            <span className="text-xs text-text-muted mb-1 flex items-center">
              <Target className="w-3 h-3 mr-1" />
              Expected Outcome
            </span>
            <span className="text-xs text-text-dark">{recommendation.actionData.expectedOutcome}</span>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {recommendation.actionDetails && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 flex items-center justify-center space-x-2 text-sm font-medium text-text-muted hover:text-text-dark transition-colors border-t border-b border-border-color"
          >
            <span>{isExpanded ? 'Hide Action Steps' : 'View Action Steps'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-4">
              {/* Action Steps */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-sm text-text-dark mb-3 flex items-center">
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Action Steps
                </h4>
                <ol className="space-y-2">
                  {recommendation.actionDetails.steps.map((step, index) => (
                    <li key={index} className="flex text-sm text-text-dark">
                      <span className="font-semibold text-primary mr-2">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Implementation Time & Result */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center text-xs text-text-muted mb-1">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Implementation Time
                  </div>
                  <div className="text-sm font-semibold text-text-dark">
                    {recommendation.actionDetails.implementationTime}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-100 col-span-2">
                  <div className="flex items-center text-xs text-green-700 mb-1">
                    <Target className="w-3.5 h-3.5 mr-1" />
                    Expected Result
                  </div>
                  <div className="text-sm text-green-900">
                    {recommendation.actionDetails.expectedResult}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Button */}
      <button
        onClick={handleAct}
        disabled={isActing}
        className={`w-full mt-4 py-2.5 px-4 rounded-full font-semibold text-white transition-all flex items-center justify-center space-x-2 ${styles.button} ${
          isActing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
        }`}
      >
        {isActing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Take Action</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RecommendationCard;
