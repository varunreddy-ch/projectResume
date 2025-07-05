
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Crown, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

const Payment = () => {
  const { user, subscriptionStatus, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-gray-300 text-lg">Upgrade to Premium for unlimited resume generation</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">Free Plan</CardTitle>
              <div className="text-center">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-300">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  5 resumes per day
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  Basic templates
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  PDF download
                </div>
              </div>
              <Button 
                disabled
                className="w-full bg-gray-600 cursor-not-allowed"
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg border-purple-400/30 shadow-2xl relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl flex items-center justify-center">
                <Crown className="mr-2 h-6 w-6 text-yellow-400" />
                Premium Plan
              </CardTitle>
              <div className="text-center">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-gray-300">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  50 resumes per day
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  Premium templates
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  PDF & Word download
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  Priority support
                </div>
                <div className="flex items-center text-white">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  Advanced customization
                </div>
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4" />
                    <span>Upgrade to Premium</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {subscriptionStatus && (
          <div className="mt-8 text-center">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl inline-block">
              <CardContent className="p-6">
                <h3 className="text-white text-lg font-semibold mb-2">Current Status</h3>
                <p className="text-gray-300">
                  {subscriptionStatus.subscribed 
                    ? `Premium subscription active until ${new Date(subscriptionStatus.subscription_end!).toLocaleDateString()}`
                    : 'Free plan active'
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
