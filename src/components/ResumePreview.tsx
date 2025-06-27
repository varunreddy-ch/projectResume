
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Globe, Share2 } from 'lucide-react';

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  education: Array<{
    school: string;
    degree: string;
    year: string;
  }>;
}

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  const handleDownload = () => {
    // Placeholder for download functionality
    console.log('Download resume website');
  };

  const handleShare = () => {
    // Placeholder for share functionality
    console.log('Share resume website');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Your Generated Website</h2>
        <div className="flex space-x-2">
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleDownload} className="bg-green-500 hover:bg-green-600" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-lg">
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="text-center border-b pb-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{resumeData.name}</h1>
            <h2 className="text-xl text-blue-600 mb-4">{resumeData.title}</h2>
            <div className="flex justify-center space-x-6 text-gray-600">
              <span>{resumeData.email}</span>
              <span>{resumeData.phone}</span>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-4">
              Professional Summary
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">{resumeData.summary}</p>
          </div>

          {/* Experience Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-4">
              Experience
            </h3>
            <div className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-semibold text-gray-800">{exp.position}</h4>
                    <span className="text-gray-500 font-medium">{exp.duration}</span>
                  </div>
                  <h5 className="text-lg text-blue-600 mb-3">{exp.company}</h5>
                  <p className="text-gray-700">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-4">
              Skills
            </h3>
            <div className="flex flex-wrap gap-3">
              {resumeData.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-4">
              Education
            </h3>
            <div className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{edu.degree}</h4>
                    <p className="text-blue-600">{edu.school}</p>
                  </div>
                  <span className="text-gray-500 font-medium">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumePreview;
