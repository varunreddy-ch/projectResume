
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Check, Loader2, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import Navigation from '@/components/Navigation';

const Payment = () => {
  const { user, subscriptionStatus, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleUpgrade = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { checkout_url } = await apiClient.createCheckoutSession();
      window.location.href = checkout_url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await checkSubscription();
      toast({
        title: "Status Updated",
        description: "Your subscription status has been refreshed.",
      });
    } catch (error) {
      console.error('Error refreshing status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation showBackButton={true} title="Choose Your Plan" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-gray-300 text-lg mb-6">
            Get the perfect plan for your resume generation needs
          </p>
          <Button
            onClick={handleRefreshStatus}
            disabled={refreshing}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {refreshing ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Status</span>
              </div>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl relative">
            {subscriptionStatus && !subscriptionStatus.subscribed && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Current
                </div>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-fit">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl mb-2">Free</CardTitle>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-300">/forever</span>
              </div>
              <p className="text-gray-400 text-sm">5 resumes per day</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>5 resumes per day</span>
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>AI-powered generation</span>
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Basic templates</span>
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>PDF download</span>
                </div>
              </div>
              <Button 
                disabled={subscriptionStatus && !subscriptionStatus.subscribed}
                className={
                  subscriptionStatus && !subscriptionStatus.subscribed 
                    ? "w-full bg-green-600 cursor-default text-white" 
                    : "w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                }
              >
                {subscriptionStatus && !subscriptionStatus.subscribed ? 'Current Plan' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg border-purple-400/30 shadow-2xl relative">
            {!subscriptionStatus?.subscribed && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
            )}
            {subscriptionStatus?.subscribed && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Current
                </div>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl mb-2">Premium</CardTitle>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-white">$7.99</span>
                <span className="text-gray-300">/month</span>
              </div>
              <p className="text-gray-400 text-sm">50 resumes per day</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>50 resumes per day</span>
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Premium templates</span>
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Advanced customization</span>
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Analytics dashboard</span>
                </div>
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={loading || subscriptionStatus?.subscribed}
                className={
                  subscriptionStatus?.subscribed
                    ? "w-full bg-green-600 cursor-default text-white"
                    : "w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                }
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : subscriptionStatus?.subscribed ? (
                  'Current Plan'
                ) : (
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4" />
                    <span>Subscribe Now</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {subscriptionStatus && (
          <div className="mt-12 text-center">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl inline-block">
              <CardContent className="p-6">
                <h3 className="text-white text-lg font-semibold mb-2">Current Status</h3>
                <p className="text-gray-300">
                  {subscriptionStatus.subscribed 
                    ? `Premium subscription active until ${new Date(subscriptionStatus.subscription_end!).toLocaleDateString()}`
                    : 'Free plan active - 5 resumes per day'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
