
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Crown, Zap, Star, ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const { user, subscriptionStatus, checkSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to subscribe.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast({
      title: "Status refreshed",
      description: "Your subscription status has been updated.",
    });
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      resumeLimit: user ? 5 : 3,
      features: [
        user ? "5 resumes per day" : "3 resumes per day",
        "AI-powered generation",
        "Basic templates",
        "PDF download"
      ],
      buttonText: user ? "Current Plan" : "Sign Up Free",
      popular: false,
      current: !subscriptionStatus?.subscribed,
    },
    {
      name: "Premium",
      price: "$7.99",
      period: "month",
      resumeLimit: 50,
      features: [
        "50 resumes per day",
        "Premium templates",
        "Priority support",
        "Advanced customization",
        "Analytics dashboard"
      ],
      buttonText: subscriptionStatus?.subscribed ? "Manage Subscription" : "Subscribe Now",
      popular: true,
      current: Boolean(subscriptionStatus?.subscribed),
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Button */}
        <div className="mb-8 animate-fade-in">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get the perfect plan for your resume generation needs
          </p>
          
          {user && (
            <div className="flex justify-center">
              <Button
                onClick={handleRefreshStatus}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            </div>
          )}
        </div>

        {/* Current Status */}
        {user && subscriptionStatus && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8 shadow-xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Current Status</h3>
                  <p className="text-gray-300">
                    {subscriptionStatus.subscribed 
                      ? `Premium subscriber (${subscriptionStatus.subscription_tier})` 
                      : 'Free plan user'
                    }
                  </p>
                  {subscriptionStatus.subscription_end && (
                    <p className="text-sm text-gray-400">
                      Subscription ends: {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {subscriptionStatus.subscribed ? '50' : '5'} resumes/day
                  </p>
                  <p className="text-gray-300 text-sm">Daily limit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl animate-scale-in ${
                plan.current ? 'ring-2 ring-green-500 ring-opacity-50' : ''
              } ${plan.popular ? 'border-purple-500/50' : ''}`}
              style={{ animationDelay: `${0.6 + index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center shadow-lg animate-pulse">
                    <Star className="mr-1 h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-lg">
                    <Check className="mr-1 h-3 w-3" />
                    Current
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {plan.name === 'Free' ? (
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <div className="text-center">
                  <span className="text-4xl font-bold text-white bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">{plan.price}</span>
                  <span className="text-gray-300">/{plan.period}</span>
                </div>
                <p className="text-lg font-semibold text-purple-300 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {plan.resumeLimit} resumes per day
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="mr-3 h-4 w-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={
                    plan.name === 'Free' 
                      ? undefined
                      : plan.current 
                        ? handleManageSubscription 
                        : handleSubscribe
                  }
                  disabled={loading || (plan.name === 'Free' && Boolean(user))}
                  className={`w-full transition-all duration-200 hover:scale-105 shadow-lg ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : plan.current
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {plan.current && plan.name === 'Premium' ? (
                        <ExternalLink className="h-4 w-4" />
                      ) : null}
                      <span>{plan.buttonText}</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!user && (
          <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
            <p className="text-gray-300 mb-4">
              Sign up to unlock more daily resumes and premium features
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Get Started Free
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
