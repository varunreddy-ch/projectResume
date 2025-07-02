
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeUsage } from '@/hooks/useResumeUsage';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, FileText, Sparkles, User, CreditCard, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FileUpload from '@/components/FileUpload';
import UsageIndicator from '@/components/UsageIndicator';

// Mock resume data for demonstration
const mockResumeData = {
  name: "John Doe",
  title: "Senior Software Engineer",
  email: "john.doe@email.com",
  phone: "(555) 123-4567",
  location: "San Francisco, CA",
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

const UploadPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [manualInput, setManualInput] = useState({
    name: '',
    email: '',
    phone: '',
    summary: '',
    experience: '',
    skills: '',
    education: ''
  });
  const [useManualInput, setUseManualInput] = useState(false);
  
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { canGenerateResume } = useResumeUsage();
  const navigate = useNavigate();

  const handleFileUpload = async (file: File) => {
    console.log('File upload started:', file.name, file.type);
    
    const canGenerate = await canGenerateResume();
    if (!canGenerate) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate API processing time
    setTimeout(async () => {
      // Store the resume in database
      try {
        const resumeTitle = `Resume - ${new Date().toLocaleDateString()}`;
        const { error } = await supabase
          .from('resumes')
          .insert({
            user_id: user?.id || null,
            email: user?.email || null,
            title: resumeTitle,
            content: mockResumeData
          });

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        // Increment usage after successful generation
        const { error: usageError } = await supabase.rpc('increment_resume_usage', {
          user_email: user?.email || null,
          user_uuid: user?.id || null
        });

        if (usageError) {
          console.error('Usage increment error:', usageError);
        }

        setResumeData(mockResumeData);
        setIsProcessing(false);
        toast({
          title: "Resume generated successfully!",
          description: "Your professional resume has been created and saved.",
        });
      } catch (error) {
        console.error('Error saving resume:', error);
        setIsProcessing(false);
        toast({
          title: "Error generating resume",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    }, 3000);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Manual form submitted:', manualInput);
    
    const canGenerate = await canGenerateResume();
    if (!canGenerate) {
      return;
    }

    if (!manualInput.name || !manualInput.email) {
      toast({
        title: "Missing information",
        description: "Please fill in at least your name and email.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Create resume from manual input
    const customResumeData = {
      ...mockResumeData,
      name: manualInput.name,
      email: manualInput.email,
      phone: manualInput.phone || mockResumeData.phone,
      summary: manualInput.summary || mockResumeData.summary,
      // Parse experience and skills from text input
      experience: manualInput.experience ? 
        manualInput.experience.split('\n').filter(exp => exp.trim()).map((exp, index) => ({
          company: `Company ${index + 1}`,
          position: "Position",
          duration: "Duration",
          description: exp.trim()
        })) : mockResumeData.experience,
      skills: manualInput.skills ? 
        manualInput.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : 
        mockResumeData.skills
    };

    setTimeout(async () => {
      try {
        const resumeTitle = `Resume - ${manualInput.name} - ${new Date().toLocaleDateString()}`;
        const { error } = await supabase
          .from('resumes')
          .insert({
            user_id: user?.id || null,
            email: user?.email || null,
            title: resumeTitle,
            content: customResumeData
          });

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        // Increment usage after successful generation
        const { error: usageError } = await supabase.rpc('increment_resume_usage', {
          user_email: user?.email || null,
          user_uuid: user?.id || null
        });

        if (usageError) {
          console.error('Usage increment error:', usageError);
        }

        setResumeData(customResumeData);
        setIsProcessing(false);
        toast({
          title: "Resume generated successfully!",
          description: "Your professional resume has been created from your input.",
        });
      } catch (error) {
        console.error('Error saving resume:', error);
        setIsProcessing(false);
        toast({
          title: "Error generating resume",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const handleNewResume = () => {
    setResumeData(null);
    setManualInput({
      name: '',
      email: '',
      phone: '',
      summary: '',
      experience: '',
      skills: '',
      education: ''
    });
  };

  const handleDownloadPDF = () => {
    // Create a simple HTML version for PDF generation
    const resumeHTML = `
      <html>
        <head><title>${resumeData.name} - Resume</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>${resumeData.name}</h1>
          <h2>${resumeData.title}</h2>
          <p>${resumeData.email} | ${resumeData.phone}</p>
          <h3>Summary</h3>
          <p>${resumeData.summary}</p>
          <h3>Experience</h3>
          ${resumeData.experience.map(exp => `
            <div style="margin-bottom: 20px;">
              <h4>${exp.position} at ${exp.company}</h4>
              <p><em>${exp.duration}</em></p>
              <p>${exp.description}</p>
            </div>
          `).join('')}
          <h3>Skills</h3>
          <p>${resumeData.skills.join(', ')}</p>
        </body>
      </html>
    `;

    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.name}_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Resume downloaded!",
      description: "Your resume has been downloaded as an HTML file.",
    });
  };

  const handleShare = async () => {
    try {
      // Generate a shareable link (in a real app, this would be a proper sharing URL)
      const shareUrl = `${window.location.origin}/resume/${Date.now()}`;
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Share link copied!",
        description: "The resume share link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Share link generated",
        description: "Your resume is ready to share!",
      });
    }
  };

  if (resumeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleNewResume}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Create New Resume
                </Button>
              </div>
              <UsageIndicator />
            </div>
          </div>
        </div>

        {/* Resume Display */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white shadow-2xl animate-scale-in">
            <CardContent className="p-12">
              {/* Header */}
              <div className="text-center mb-8 pb-8 border-b-2 border-gray-200">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{resumeData.name}</h1>
                <h2 className="text-2xl text-blue-600 mb-4">{resumeData.title}</h2>
                <div className="flex justify-center space-x-4 text-gray-600">
                  <span>{resumeData.email}</span>
                  <span>•</span>
                  <span>{resumeData.phone}</span>
                  {resumeData.location && (
                    <>
                      <span>•</span>
                      <span>{resumeData.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Professional Summary</h3>
                <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
              </div>

              {/* Experience */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Professional Experience</h3>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{exp.position}</h4>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                      </div>
                      <span className="text-gray-600 font-medium">{exp.duration}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Education</h3>
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">{edu.degree}</h4>
                    <p className="text-blue-600 font-medium">{edu.school}</p>
                    <p className="text-gray-600">{edu.year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button
              onClick={handleDownloadPDF}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105"
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
            <Button
              onClick={handleShare}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Share Resume
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-white">Create Your Resume</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-white text-sm">
                    Welcome, {user.email}
                  </span>
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
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200 mb-8 animate-fade-in"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Usage Indicator */}
        <div className="max-w-md mx-auto mb-8 animate-scale-in">
          <UsageIndicator />
        </div>

        <div className="space-y-8">
          {/* Method Selection */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-scale-in">
            <CardHeader>
              <CardTitle className="text-center text-white text-2xl">
                How would you like to create your resume?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setUseManualInput(false)}
                  variant={!useManualInput ? "default" : "outline"}
                  className={`p-6 h-auto flex-col space-y-2 ${
                    !useManualInput 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600" 
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  <FileUp className="h-8 w-8" />
                  <span className="font-semibold">Upload Resume File</span>
                  <span className="text-sm opacity-80">Upload your existing resume (PDF, DOCX, etc.)</span>
                </Button>
                <Button
                  onClick={() => setUseManualInput(true)}
                  variant={useManualInput ? "default" : "outline"}
                  className={`p-6 h-auto flex-col space-y-2 ${
                    useManualInput 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600" 
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  <FileText className="h-8 w-8" />
                  <span className="font-semibold">Enter Information Manually</span>
                  <span className="text-sm opacity-80">Fill out a form with your details</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          {!useManualInput && (
            <div className="animate-fade-in">
              <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            </div>
          )}

          {/* Manual Input Section */}
          {useManualInput && (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-fade-in">
              <CardHeader>
                <CardTitle className="text-center text-white text-2xl">
                  Enter Your Resume Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Full Name *</Label>
                      <Input
                        id="name"
                        value={manualInput.name}
                        onChange={(e) => setManualInput({...manualInput, name: e.target.value})}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={manualInput.email}
                        onChange={(e) => setManualInput({...manualInput, email: e.target.value})}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      value={manualInput.phone}
                      onChange={(e) => setManualInput({...manualInput, phone: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary" className="text-white">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={manualInput.summary}
                      onChange={(e) => setManualInput({...manualInput, summary: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                      placeholder="Brief summary of your professional background and key achievements..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-white">Work Experience</Label>
                    <Textarea
                      id="experience"
                      value={manualInput.experience}
                      onChange={(e) => setManualInput({...manualInput, experience: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[120px]"
                      placeholder="Enter each job experience on a new line..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-white">Skills</Label>
                    <Input
                      id="skills"
                      value={manualInput.skills}
                      onChange={(e) => setManualInput({...manualInput, skills: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="JavaScript, React, Node.js, Python... (comma separated)"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Resume...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Professional Resume</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
