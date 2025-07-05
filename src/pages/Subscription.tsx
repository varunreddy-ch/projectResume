
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Check } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Subscription = () => {
  const { user, subscriptionStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation showBackButton={true} title="Subscription Management" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <p className="text-gray-300 text-lg">
            {subscriptionStatus?.subscribed 
              ? 'Manage your Premium subscription'
              : 'Upgrade to Premium for unlimited features'
            }
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center">
              <Crown className="mr-2 h-6 w-6 text-yellow-400" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {subscriptionStatus?.subscribed ? 'Premium Plan' : 'Free Plan'}
              </h3>
              {subscriptionStatus?.subscribed && subscriptionStatus.subscription_end && (
                <p className="text-gray-300">
                  Active until {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-white">
                <Check className="mr-2 h-4 w-4 text-green-400" />
                {subscriptionStatus?.subscribed ? '50' : '5'} resumes per day
              </div>
              <div className="flex items-center text-white">
                <Check className="mr-2 h-4 w-4 text-green-400" />
                {subscriptionStatus?.subscribed ? 'Premium' : 'Basic'} templates
              </div>
              <div className="flex items-center text-white">
                <Check className="mr-2 h-4 w-4 text-green-400" />
                PDF download
              </div>
              {subscriptionStatus?.subscribed && (
                <>
                  <div className="flex items-center text-white">
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Word download
                  </div>
                  <div className="flex items-center text-white">
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Priority support
                  </div>
                  <div className="flex items-center text-white">
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Advanced customization
                  </div>
                </>
              )}
            </div>

            <div className="text-center space-y-4">
              {!subscriptionStatus?.subscribed ? (
                <Button
                  onClick={() => navigate('/payment')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate('/payment')}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Manage Subscription
                  </Button>
                  <p className="text-gray-400 text-sm">
                    Access billing portal to update payment method or cancel subscription
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;
