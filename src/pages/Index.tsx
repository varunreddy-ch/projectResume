import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResumePreview from '@/components/ResumePreview';
import UsageIndicator from '@/components/UsageIndicator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Globe, User, LogOut, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeUsage } from '@/hooks/useResumeUsage';
import { Link } from 'react-router-dom';

// Mock data for demonstration - in real app, this would come from ChatGPT API
const mockResumeData = {
  name: "Sarah Johnson",
  title: "Senior Software Engineer",
  email: "sarah.johnson@email.com",
  phone: "(555) 123-4567",
  summary: "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.",
  experience: [
    {
      company: "Tech Innovations Inc.",
      position: "Senior Software Engineer",
      duration: "2021 - Present",
      description: "Led development of microservices architecture serving 1M+ users. Mentored 5 junior developers and improved system performance by 40%."
    },
    {
      company: "StartupCo",
      position: "Full Stack Developer",
      duration: "2019 - 2021",
      description: "Built responsive web applications using React and Node.js. Collaborated with design team to implement pixel-perfect UI components."
    }
  ],
  skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "PostgreSQL"],
  education: [
    {
      school: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      year: "2018"
    }
  ]
};

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { canGenerateResume } = useResumeUsage();

  const handleFileUpload = async (file: File) => {
    // Check if user can generate resume before processing
    const canGenerate = await canGenerateResume();
    if (!canGenerate) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate API processing time
    setTimeout(() => {
      setResumeData(mockResumeData);
      setIsProcessing(false);
      toast({
        title: "Resume processed successfully!",
        description: "Your professional website has been generated.",
      });
    }, 3000);
  };

  const handleNewResume = () => {
    setResumeData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
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
        {!resumeData ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-bold text-white mb-4">
                Transform Your Resume Into a
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Professional Website</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Upload your resume and let ChatGPT create a stunning, professional website that showcases your skills and experience in the best possible light.
              </p>
            </div>

            {/* Usage Indicator */}
            <div className="max-w-md mx-auto">
              <UsageIndicator />
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-blue-500/20 rounded-full inline-block mb-4">
                    <Zap className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
                  <p className="text-gray-300">ChatGPT analyzes and enhances your resume content for maximum impact.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-purple-500/20 rounded-full inline-block mb-4">
                    <Globe className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Professional Design</h3>
                  <p className="text-gray-300">Beautiful, responsive websites that look great on any device.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-green-500/20 rounded-full inline-block mb-4">
                    <Sparkles className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Instant Results</h3>
                  <p className="text-gray-300">Get your professional website in seconds, ready to share with employers.</p>
                </CardContent>
              </Card>
            </div>

            {/* Upload Section */}
            <div className="max-w-2xl mx-auto">
              <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <Button 
                onClick={handleNewResume}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Create New Resume
              </Button>
              <UsageIndicator />
            </div>
            <ResumePreview resumeData={resumeData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
