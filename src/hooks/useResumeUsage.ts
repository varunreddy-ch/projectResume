
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UsageResult {
  can_generate: boolean;
  current_usage: number;
  daily_limit: number;
  remaining: number;
}

export const useResumeUsage = () => {
  const [usageData, setUsageData] = useState<UsageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkUsage = useCallback(async (): Promise<UsageResult | null> => {
    setLoading(true);
    try {
      const data = await apiClient.checkResumeUsage();
      console.log('Usage data received:', data);
      setUsageData(data);
      return data;
    } catch (error) {
      console.error('Error checking usage:', error);
      toast({
        title: "Error checking usage",
        description: "Please try again later.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const canGenerateResume = useCallback(async (): Promise<boolean> => {
    const usage = await checkUsage();
    
    if (!usage) {
      console.log('No usage data available, denying generation');
      return false;
    }
    
    console.log('Checking generation eligibility:', {
      can_generate: usage.can_generate,
      current_usage: usage.current_usage,
      daily_limit: usage.daily_limit
    });

    if (!usage.can_generate) {
      const planType = user ? (usage.daily_limit === 50 ? 'Premium' : 'Free') : 'Anonymous';
      toast({
        title: "Daily limit reached",
        description: `You've reached your daily limit of ${usage.daily_limit} resumes. ${
          planType === 'Anonymous' ? 'Sign up to get 5 resumes per day!' :
          planType === 'Free' ? 'Upgrade to Premium for 50 resumes per day!' :
          'Try again tomorrow!'
        }`,
        variant: "destructive",
        duration: 5000
      });
    }
    
    return usage.can_generate;
  }, [user, toast, checkUsage]);

  return {
    usageData,
    loading,
    checkUsage,
    canGenerateResume
  };
};
