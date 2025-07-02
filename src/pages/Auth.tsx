
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowLeft, Chrome, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      if (!email) {
        toast({
          title: "Missing email",
          description: "Please enter your email address.",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?reset=true`
        });

        if (error) {
          toast({
            title: "Password reset failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Password reset email sent",
            description: "Check your email for the password reset link.",
          });
          setIsForgotPassword(false);
        }
      } catch (error) {
        toast({
          title: "An error occurred",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      toast({
        title: "Missing information",
        description: "Please enter your first and last name.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, firstName, lastName);

      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const getTitle = () => {
    if (isForgotPassword) return 'Reset Password';
    return isLogin ? 'Welcome Back' : 'Create Account';
  };

  const getDescription = () => {
    if (isForgotPassword) return 'Enter your email to receive a password reset link';
    return isLogin 
      ? 'Sign in to access your resume generator' 
      : 'Join us to create professional resumes';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200 animate-fade-in"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
            {getTitle()}
          </h1>
          <p className="text-gray-300">
            {getDescription()}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-center text-white">
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Sign In' : 'Sign Up'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isForgotPassword && (
              <>
                {/* Google Login Button */}
                <Button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 border-gray-300 transition-all duration-200 hover:scale-105"
                >
                  {googleLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Chrome className="h-4 w-4 text-blue-500" />
                      <span>Continue with Google</span>
                    </div>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-gray-300">Or continue with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields for signup */}
              {!isLogin && !isForgotPassword && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">First Name</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">Last Name</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isForgotPassword ? 'Sending...' : isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              {!isForgotPassword && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </Button>
                  {isLogin && (
                    <Button
                      variant="ghost"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-purple-300 hover:text-purple-200 hover:bg-white/10 transition-all duration-200 text-sm"
                    >
                      Forgot your password?
                    </Button>
                  )}
                </>
              )}
              {isForgotPassword && (
                <Button
                  variant="ghost"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
                >
                  Back to Sign In
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
