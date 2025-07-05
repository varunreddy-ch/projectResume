
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useResumeUsage } from '@/hooks/useResumeUsage';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Zap, AlertCircle } from 'lucide-react';

const UsageIndicator = () => {
  const { usageData, checkUsage, loading } = useResumeUsage();
  const { user, subscriptionStatus } = useAuth();

  useEffect(() => {
    if (user) {
      checkUsage();
    }
  }, [checkUsage, user]);

  if (!user) return null;

  if (loading || !usageData) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 min-w-[200px]">
        <CardContent className="p-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300/20 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-300/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressValue = (usageData.current_usage / usageData.daily_limit) * 100;
  const isNearLimit = progressValue > 80;
  const isPremium = subscriptionStatus?.subscribed;

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 min-w-[220px]">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isPremium ? (
                <Crown className="h-4 w-4 text-yellow-400" />
              ) : (
                <Zap className="h-4 w-4 text-blue-400" />
              )}
              <span className="text-sm font-medium text-white">
                {isPremium ? 'Premium' : 'Free'}
              </span>
            </div>
            {isNearLimit && (
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Daily Usage</span>
              <span className="font-medium">
                {usageData.current_usage} / {usageData.daily_limit}
              </span>
            </div>
            
            <Progress 
              value={progressValue} 
              className="h-2 bg-white/10"
            />
            
            <div className="text-xs text-gray-400 text-center">
              {usageData.remaining > 0 ? (
                `${usageData.remaining} remaining today`
              ) : (
                "Daily limit reached"
              )}
            </div>
          </div>

          {!isPremium && (
            <div className="text-xs text-purple-300 text-center">
              Upgrade to Premium for more resumes!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageIndicator;
