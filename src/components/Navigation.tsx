
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, User, Crown, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UsageIndicator from '@/components/UsageIndicator';

interface NavigationProps {
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
}

const Navigation = ({ showBackButton = false, backTo = '/', title }: NavigationProps) => {
  const navigate = useNavigate();
  const { user, signOut, subscriptionStatus } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                onClick={() => navigate(backTo)}
                variant="ghost"
                className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            )}
            {title && (
              <h1 className="text-xl font-semibold text-white">{title}</h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user && <UsageIndicator />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {user.firstName || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <Crown className="mr-2 h-4 w-4" />
                    {subscriptionStatus?.subscribed ? 'Manage Subscription' : 'Upgrade to Premium'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
