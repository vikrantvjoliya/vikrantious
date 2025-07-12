import { useGuestAuth } from '../utils/useGuestAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Brush, FolderOpen, Gamepad2, Sparkles, BookOpen } from 'lucide-react';
import '../styles/global.css';

const features = [
  {
    name: 'Text Notes',
    description: 'Quickly jot down and organize your thoughts with markdown support.',
    icon: FileText,
    href: '/text-notes',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    name: 'Drawing Notes',
    description: 'Sketch ideas and diagrams with a simple, intuitive canvas.',
    icon: Brush,
    href: '/drawing-notes',
    color: 'bg-green-50 text-green-600'
  },
  {
    name: 'File Notes',
    description: 'Upload and manage files, PDFs, and more for your projects.',
    icon: FolderOpen,
    href: '/file-notes',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    name: 'Blog & Insights',
    description: 'Discover tips, tutorials, and insights to enhance your productivity.',
    icon: BookOpen,
    href: '/blog',
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    name: 'Suika Game',
    description: 'Take a break and play the Suika Game for fun and relaxation.',
    icon: Gamepad2,
    href: '/suika-game',
    color: 'bg-orange-50 text-orange-600'
  }
];

export default function HomePage() {
  const userId = useGuestAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  
  useEffect(() => { 
    setShow(true); 
  }, []);

  return (
    <div className={`transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Welcome to <span className="text-blue-600">Vikrantious</span>
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          A modern, minimal note-taking and productivity suite designed for simplicity and efficiency.
        </p>
        <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 text-sm font-medium text-gray-700">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Guest ID: <span className="text-blue-600 ml-1">{userId}</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
            onClick={() => navigate(feature.href)}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${feature.color} group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">5</div>
          <div className="text-sm text-gray-600 mt-1">Tools Available</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">∞</div>
          <div className="text-sm text-gray-600 mt-1">Notes Capacity</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">100%</div>
          <div className="text-sm text-gray-600 mt-1">Free to Use</div>
        </div>
      </div>
    </div>
  );
}
