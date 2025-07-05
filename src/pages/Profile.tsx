
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, FileText, Crown, Save, Edit, Trash2, ExternalLink, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Resume } from '@/types';
import UsageIndicator from '@/components/UsageIndicator';

interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
}

const Profile = () => {
  const { user, subscriptionStatus, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProfile();
    fetchResumes();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      // For now, use user data directly since we don't have a separate profile endpoint
      const profileData = {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setProfile(profileData);
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const fetchResumes = async () => {
    if (!user) return;
    
    try {
      const data = await apiClient.getUserResumes();
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: "Error loading resumes",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    try {
      await apiClient.updateProfile({ firstName, lastName });
      
      setProfile({
        ...profile,
        firstName,
        lastName,
        updatedAt: new Date().toISOString()
      });

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await apiClient.uploadFile(file);
      await fetchResumes(); // Refresh the resumes list
      
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been added to your profile.",
      });
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error uploading resume",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await apiClient.deleteResume(resumeId);
      setResumes(resumes.filter(resume => resume.id !== resumeId));
      
      toast({
        title: "Resume deleted",
        description: "The resume has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Error deleting resume",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleShareResume = async (resume: Resume) => {
    try {
      const shareUrl = `${window.location.origin}/resume/${resume.id}`;
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:text-gray-300 hover:bg-white/10 transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button 
              onClick={signOut}
              variant="outline" 
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {profile?.firstName && profile?.lastName 
                ? `${profile.firstName} ${profile.lastName}` 
                : 'Your Profile'}
            </h1>
            <p className="text-gray-300 flex items-center justify-center">
              <Mail className="mr-2 h-4 w-4" />
              {user.email}
            </p>
          </div>

          {/* Usage Overview */}
          <div className="max-w-md mx-auto animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <UsageIndicator />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </div>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Full Name</Label>
                      <p className="text-white text-lg">
                        {profile?.firstName && profile?.lastName 
                          ? `${profile.firstName} ${profile.lastName}` 
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Email</Label>
                      <p className="text-white text-lg">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Account Type</Label>
                      <p className="text-white text-lg flex items-center">
                        {subscriptionStatus?.subscribed ? (
                          <>
                            <Crown className="mr-2 h-4 w-4 text-yellow-400" />
                            Premium Member
                          </>
                        ) : (
                          'Free Member'
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload New Resume */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload New Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Add a new resume to your profile. Supported formats: PDF, DOC, DOCX.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="resume-upload" className="text-white">Choose Resume File</Label>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                  />
                </div>
                {uploading && (
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading resume...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resume History */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-scale-in" style={{ animationDelay: '0.8s' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                My Resumes ({resumes.length})
              </CardTitle>
              <Button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Create Tailored Resume
              </Button>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No resumes yet</h3>
                  <p className="text-gray-300 mb-6">Upload your first resume or create a tailored one for specific jobs.</p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Upload Resume
                    </Button>
                    <Button
                      onClick={() => navigate('/upload')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Create Tailored Resume
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.map((resume, index) => (
                    <div 
                      key={resume.id} 
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${1 + index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{resume.title}</h4>
                          <p className="text-gray-300 text-sm">
                            Created on {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Last updated {new Date(resume.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleShareResume(resume)}
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Share
                          </Button>
                          <Button
                            onClick={() => handleDeleteResume(resume.id)}
                            variant="outline"
                            size="sm"
                            className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
