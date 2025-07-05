import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, User, Mail, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeUsage } from '@/hooks/useResumeUsage';
import FileUpload from '@/components/FileUpload';
import UsageIndicator from '@/components/UsageIndicator';
import { apiClient } from '@/lib/api';

const UploadPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumeGenerated, setResumeGenerated] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showJobDescriptionForm, setShowJobDescriptionForm] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [userResumes, setUserResumes] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { canGenerateResume } = useResumeUsage();

  // Manual form state
  const [manualData, setManualData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: '',
    education: '',
    skills: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserResumes();
    }
  }, [user]);

  const fetchUserResumes = async () => {
    try {
      const resumes = await apiClient.getUserResumes();
      setUserResumes(resumes || []);
    } catch (error) {
      console.error('Error fetching user resumes:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    const canGenerate = await canGenerateResume();
    if (!canGenerate) {
      return;
    }

    console.log('Starting file upload and processing...');
    setIsProcessing(true);
    setResumeGenerated(false);

    try {
      // Upload file first
      const uploadResponse = await apiClient.uploadFile(file);
      console.log('File uploaded successfully:', uploadResponse);

      // Instead of generating immediately, show job description form
      setSelectedResumeId(uploadResponse.resumeId);
      setShowJobDescriptionForm(true);
      
      toast({
        title: "Resume Uploaded Successfully!",
        description: "Now enter a job description to tailor your resume.",
      });
    } catch (error: any) {
      console.error('Resume upload failed:', error);
      toast({
        title: "Resume Upload Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJobDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter a job description to tailor your resume.",
        variant: "destructive"
      });
      return;
    }

    const canGenerate = await canGenerateResume();
    if (!canGenerate) {
      return;
    }

    console.log('Starting resume generation with job description...');
    setIsProcessing(true);
    setResumeGenerated(false);

    try {
      const resumeData = await apiClient.generateResumeWithJobDescription({
        resumeId: selectedResumeId,
        jobDescription: jobDescription.trim()
      });

      console.log('Resume generated successfully:', resumeData);
      setGeneratedResume(resumeData);
      setResumeGenerated(true);
      setShowJobDescriptionForm(false);
      
      toast({
        title: "Resume Generated Successfully!",
        description: "Your resume has been tailored to the job description.",
      });
    } catch (error: any) {
      console.error('Resume generation failed:', error);
      toast({
        title: "Resume Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseExistingResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setShowJobDescriptionForm(true);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const canGenerate = await canGenerateResume();
    if (!canGenerate) {
      return;
    }

    console.log('Starting manual resume generation...');
    setIsProcessing(true);
    setResumeGenerated(false);

    try {
      const resumeData = await apiClient.generateResume({
        type: 'manual',
        data: manualData
      });

      console.log('Manual resume generated successfully:', resumeData);
      setGeneratedResume(resumeData);
      setResumeGenerated(true);
      
      toast({
        title: "Resume Generated Successfully!",
        description: "Your professional resume has been created from your information.",
      });
    } catch (error: any) {
      console.error('Manual resume generation failed:', error);
      toast({
        title: "Resume Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <UsageIndicator />
        </div>

        {/* Main Content */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
            AI Resume Generator
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Upload your resume or use an existing one, then provide a job description to generate a tailored, ATS-optimized resume
          </p>
        </div>

        {/* Job Description Form */}
        {showJobDescriptionForm && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-center">Enter Job Description</CardTitle>
              <p className="text-gray-300 text-center">
                Paste the job description to tailor your resume specifically for this position
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJobDescriptionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobDescription" className="text-white">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[200px]"
                    rows={8}
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowJobDescriptionForm(false);
                      setJobDescription('');
                      setSelectedResumeId('');
                    }}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Resume...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Tailored Resume</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Options when not showing job description form */}
        {!showJobDescriptionForm && (
          <>
            {/* Existing Resumes */}
            {user && userResumes.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-center">Use Existing Resume</CardTitle>
                  <p className="text-gray-300 text-center">
                    Select from your uploaded resumes to tailor for a specific job
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {userResumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <h4 className="text-white font-medium">{resume.title}</h4>
                          <p className="text-gray-400 text-sm">
                            Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleUseExistingResume(resume.id)}
                          size="sm"
                          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                        >
                          Use This Resume
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload or Manual Input Toggle */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => setShowManualForm(false)}
                variant={!showManualForm ? "default" : "outline"}
                className={!showManualForm 
                  ? "bg-gradient-to-r from-violet-500 to-purple-600" 
                  : "border-white/20 text-white hover:bg-white/10"
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
              <Button
                onClick={() => setShowManualForm(true)}
                variant={showManualForm ? "default" : "outline"}
                className={showManualForm 
                  ? "bg-gradient-to-r from-violet-500 to-purple-600" 
                  : "border-white/20 text-white hover:bg-white/10"
                }
              >
                <User className="mr-2 h-4 w-4" />
                Manual Entry
              </Button>
            </div>

            {/* Content based on selection */}
            {!showManualForm ? (
              <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            ) : (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-center">Enter Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-white flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={manualData.fullName}
                          onChange={(e) => setManualData({...manualData, fullName: e.target.value})}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={manualData.email}
                          onChange={(e) => setManualData({...manualData, email: e.target.value})}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={manualData.phone}
                          onChange={(e) => setManualData({...manualData, phone: e.target.value})}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-white flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          Location
                        </Label>
                        <Input
                          id="location"
                          type="text"
                          placeholder="City, State"
                          value={manualData.location}
                          onChange={(e) => setManualData({...manualData, location: e.target.value})}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Professional Summary */}
                    <div className="space-y-2">
                      <Label htmlFor="summary" className="text-white flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Professional Summary
                      </Label>
                      <Textarea
                        id="summary"
                        placeholder="Brief summary of your professional background and key achievements..."
                        value={manualData.summary}
                        onChange={(e) => setManualData({...manualData, summary: e.target.value})}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                        rows={4}
                      />
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-white flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Work Experience
                      </Label>
                      <Textarea
                        id="experience"
                        placeholder="List your work experience, including job titles, companies, dates, and key responsibilities..."
                        value={manualData.experience}
                        onChange={(e) => setManualData({...manualData, experience: e.target.value})}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[120px]"
                        rows={5}
                        required
                      />
                    </div>

                    {/* Education */}
                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-white flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Education
                      </Label>
                      <Textarea
                        id="education"
                        placeholder="List your education, including degrees, institutions, and graduation dates..."
                        value={manualData.education}
                        onChange={(e) => setManualData({...manualData, education: e.target.value})}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[80px]"
                        rows={3}
                      />
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <Label htmlFor="skills" className="text-white flex items-center">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Skills
                      </Label>
                      <Textarea
                        id="skills"
                        placeholder="List your key skills, separated by commas..."
                        value={manualData.skills}
                        onChange={(e) => setManualData({...manualData, skills: e.target.value})}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[80px]"
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Resume...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Generate Resume</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Resume Preview */}
        {resumeGenerated && generatedResume && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-center">Your Generated Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-8 rounded-lg shadow-lg text-black">
                <div className="space-y-6">
                  <div className="text-center border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">{generatedResume.personalInfo?.name || 'Professional Resume'}</h1>
                    <div className="text-gray-600 mt-2 space-x-4">
                      {generatedResume.personalInfo?.email && <span>{generatedResume.personalInfo.email}</span>}
                      {generatedResume.personalInfo?.phone && <span>{generatedResume.personalInfo.phone}</span>}
                      {generatedResume.personalInfo?.location && <span>{generatedResume.personalInfo.location}</span>}
                    </div>
                  </div>

                  {generatedResume.summary && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Professional Summary</h2>
                      <p className="text-gray-700">{generatedResume.summary}</p>
                    </div>
                  )}

                  {generatedResume.experience && generatedResume.experience.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">Work Experience</h2>
                      <div className="space-y-4">
                        {generatedResume.experience.map((exp: any, index: number) => (
                          <div key={index} className="border-l-2 border-blue-500 pl-4">
                            <h3 className="font-semibold text-gray-800">{exp.title}</h3>
                            <p className="text-gray-600">{exp.company} | {exp.duration}</p>
                            <p className="text-gray-700 mt-1">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedResume.education && generatedResume.education.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">Education</h2>
                      <div className="space-y-2">
                        {generatedResume.education.map((edu: any, index: number) => (
                          <div key={index}>
                            <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                            <p className="text-gray-600">{edu.institution} | {edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedResume.skills && generatedResume.skills.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {generatedResume.skills.map((skill: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-center space-x-4">
                <Button
                  onClick={() => window.print()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Print Resume
                </Button>
                <Button
                  onClick={() => {
                    setResumeGenerated(false);
                    setGeneratedResume(null);
                    setManualData({
                      fullName: '',
                      email: '',
                      phone: '',
                      location: '',
                      summary: '',
                      experience: '',
                      education: '',
                      skills: ''
                    });
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Generate Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
