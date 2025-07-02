
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Globe, User, LogOut, CreditCard, Upload, FileText, Shield, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import UsageIndicator from '@/components/UsageIndicator';

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-400" />,
      title: "AI-Powered Generation",
      description: "Advanced AI analyzes your resume and creates professional, tailored resumes that stand out."
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-400" />,
      title: "Professional Templates",
      description: "Choose from expertly designed templates that impress recruiters and hiring managers."
    },
    {
      icon: <Globe className="h-8 w-8 text-green-400" />,
      title: "Share & Download",
      description: "Easily share your resume with a link or download as PDF for job applications."
    },
    {
      icon: <Shield className="h-8 w-8 text-orange-400" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy measures."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content: "This tool helped me land my dream job! The AI suggestions were spot-on.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Marketing Manager",
      content: "Professional results in minutes. I've recommended it to all my colleagues.",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Designer",
      content: "The templates are beautiful and the sharing feature makes networking easy.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg animate-pulse">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">ResumeAI Generator</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-white text-sm">
                    Welcome, {user.email}
                  </span>
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/subscription">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Plans
                    </Button>
                  </Link>
                  <Button 
                    onClick={signOut}
                    variant="outline" 
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/subscription">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Plans
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16 animate-fade-in">
          <h2 className="text-6xl font-bold text-white mb-6">
            Create Your Perfect
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block"> Professional Resume</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your career with AI-powered resume generation. Upload your existing resume and let our advanced AI create a stunning, professional version that gets you noticed by employers.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-xl text-lg px-8 py-4"
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Creating Resume
            </Button>
            {!user && (
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105 text-lg px-8 py-4"
              >
                <User className="mr-2 h-5 w-5" />
                Sign Up Free
              </Button>
            )}
          </div>
        </div>

        {/* Usage Indicator */}
        {user && (
          <div className="max-w-md mx-auto mb-16 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <UsageIndicator />
          </div>
        )}

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Why Choose Our AI Resume Generator?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-black/20 rounded-full inline-block mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">{feature.title}</h4>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12 animate-fade-in">
            What Our Users Say
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-12 border border-white/20 animate-fade-in">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have successfully landed their dream jobs with our AI-powered resume generator.
          </p>
          <Button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-xl text-lg px-12 py-4"
          >
            <Upload className="mr-2 h-5 w-5" />
            Create Your Resume Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
