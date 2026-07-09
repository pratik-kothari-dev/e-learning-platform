import { useState, useEffect } from 'react';
import { Loader2, Headset } from 'lucide-react';

const Contact = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/api/content/contact`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || 'Content not found.');
        }
      } catch (err) {
        setContent('Unable to load content.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Hero Banner Area */}
      <div className="relative pt-24 pb-32 bg-primary-900 border-b border-primary-800 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Customer Support background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-900/90" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="bg-primary-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-primary-400">
             <Headset className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
             Get in Touch
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-primary-100 font-medium">
             Have questions about our platform? We're here to help you get the support you need instantly.
          </p>
        </div>
      </div>

      {/* Floating Content Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-14 mb-10 overflow-hidden relative">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>

          <div 
            className="prose prose-lg md:prose-xl prose-primary max-w-none text-gray-700 leading-relaxed font-sans whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
      
    </div>
  );
};

export default Contact;
