import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Crown, Zap, Star, ExternalLink, RefreshCw, ArrowLeft, CreditCard, Shield, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const { user, subscriptionStatus, checkSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to subscribe.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });
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
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      resumeLimit: user ? 5 : 3,
      features: [
        user ? "5 resumes per day" : "3 resumes per day",
        "AI-powered generation",
        "Basic templates",
        "Download as HTML",
        "Email support"
      ],
      buttonText: user ? "Current Plan" : "Sign Up Free",
      popular: false,
      current: !subscriptionStatus?.subscribed,
      disabled: Boolean(user)
    },
    {
      id: "premium_monthly",
      name: "Premium Monthly",
      price: "$9.99",
      period: "month",
      resumeLimit: 50,
      originalPrice: "$19.99",
      features: [
        "50 resumes per day",
        "Premium AI templates",
        "PDF & HTML downloads",
        "Resume sharing links",
        "Priority support",
        "Advanced customization",
        "LinkedIn optimization"
      ],
      buttonText: subscriptionStatus?.subscribed ? "Current Plan" : "Start Free Trial",
      popular: true,
      current: Boolean(subscriptionStatus?.subscribed && subscriptionStatus?.subscription_tier === "Premium"),
      priceId: "price_premium_monthly"
    },
    {
      id: "premium_yearly",
      name: "Premium Yearly",
      price: "$99.99",
      period: "year",
      resumeLimit: 50,
      originalPrice: "$239.88",
      savings: "Save $139.89",
      features: [
        "50 resumes per day",
        "Premium AI templates",
        "PDF & HTML downloads",
        "Resume sharing links",
        "Priority support",
        "Advanced customization",
        "LinkedIn optimization",
        "Career coaching session",
        "Resume review service"
      ],
      buttonText: subscriptionStatus?.subscribed ? "Upgrade Plan" : "Get Best Value",
      popular: false,
      current: Boolean(subscriptionStatus?.subscribed && subscriptionStatus?.subscription_tier === "Premium Yearly"),
      priceId: "price_premium_yearly"
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-green-400" />,
      title: "Secure Payment",
      description: "Your payment information is encrypted and secure"
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-blue-400" />,
      title: "Cancel Anytime",
      description: "No long-term commitment, cancel whenever you want"
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-400" />,
      title: "30-Day Trial",
      description: "Try premium features risk-free for 30 days"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
          <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
            Unlock Premium Features
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan to supercharge your career with unlimited resume generation 
            and premium features designed for professionals.
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

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Status */}
        {user && subscriptionStatus && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8 shadow-xl animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Current Subscription Status
                  </h3>
                  <p className="text-gray-300">
                    {subscriptionStatus.subscribed 
                      ? `Premium subscriber (${subscriptionStatus.subscription_tier})` 
                      : 'Free plan user'
                    }
                  </p>
                  {subscriptionStatus.subscription_end && (
                    <p className="text-sm text-gray-400">
                      {subscriptionStatus.subscribed 
                        ? `Renews on: ${new Date(subscriptionStatus.subscription_end).toLocaleDateString()}`
                        : `Trial ends: ${new Date(subscriptionStatus.subscription_end).toLocaleDateString()}`
                      }
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">
                    {subscriptionStatus.subscribed ? '50' : '5'}
                  </p>
                  <p className="text-gray-300 text-sm">resumes/day</p>
                  {subscriptionStatus.subscribed && (
                    <Button
                      onClick={handleManageSubscription}
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Manage
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`relative bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl animate-scale-in ${
                plan.current ? 'ring-2 ring-green-500 ring-opacity-50' : ''
              } ${plan.popular ? 'border-purple-500/50 scale-105' : ''}`}
              style={{ animationDelay: `${0.8 + index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center shadow-lg animate-pulse">
                    <Star className="mr-1 h-4 w-4" />
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

              {plan.savings && (
                <div className="absolute -top-3 left-4">
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
                    {plan.savings}
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
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-400 line-through">{plan.originalPrice}/{plan.period}</div>
                  )}
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">{plan.price}</span>
                    <span className="text-gray-300 ml-1">/{plan.period}</span>
                  </div>
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
                  onClick={() => {
                    if (plan.id === 'free') {
                      navigate('/auth');
                    } else if (plan.current && subscriptionStatus?.subscribed) {
                      handleManageSubscription();
                    } else {
                      handleSubscribe(plan.priceId);
                    }
                  }}
                  disabled={loading || plan.disabled}
                  className={`w-full transition-all duration-200 hover:scale-105 shadow-lg ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : plan.current && subscriptionStatus?.subscribed
                        ? 'bg-green-600 hover:bg-green-700'
                        : plan.disabled
                          ? 'bg-gray-600 cursor-not-allowed'
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
                      {plan.current && subscriptionStatus?.subscribed ? (
                        <ExternalLink className="h-4 w-4" />
                      ) : plan.id !== 'free' ? (
                        <CreditCard className="h-4 w-4" />
                      ) : null}
                      <span>{plan.buttonText}</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-300 text-sm">Yes, you can cancel your subscription at any time. Your account will remain active until the end of your billing period.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-gray-300 text-sm">Yes, all premium plans come with a 30-day free trial. You won't be charged until the trial period ends.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-300 text-sm">We accept all major credit cards, PayPal, and other secure payment methods through our payment processor Stripe.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-gray-300 text-sm">Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!user && (
          <div className="text-center mt-12 animate-fade-in">
            <p className="text-gray-300 mb-4 text-lg">
              Ready to supercharge your career?
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-xl text-lg px-8 py-4"
            >
              Get Started Free
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
