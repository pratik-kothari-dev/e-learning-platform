import { ArrowRight, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="relative bg-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-slate-900 mix-blend-multiply" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-600 opacity-20 blur-3xl animate-pulse delay-75" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-20 lg:py-32 flex flex-col lg:flex-row items-center">
          
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Learn without <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary-400">limits</span>
            </h1>
            <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-10">
              Start, switch, or advance your career with more than 5,000 courses, Professional Certificates, and degrees from world-class universities and companies.
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-primary-500 transition shadow-lg shadow-primary-600/30 transform hover:-translate-y-1">
                  Join for Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>

          <div className="lg:w-1/2 mt-16 lg:mt-0 hidden lg:block">
            {/* Abstract visual representing learning or dashboard */}
            <div className="relative w-full h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-blue-400/20 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl transform rotate-3 scale-105 transition hover:rotate-0 hover:scale-100 duration-500"></div>
              <div className="absolute inset-0 bg-slate-800 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
                {/* Mockup UI */}
                <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="w-1/3 h-6 rounded bg-slate-700 animate-pulse"></div>
                  <div className="flex gap-4">
                    <div className="w-1/2 h-32 rounded-lg bg-primary-600/20 border border-primary-500/30"></div>
                    <div className="w-1/2 h-32 rounded-lg bg-blue-400/20 border border-blue-400/30"></div>
                  </div>
                  <div className="w-full h-24 rounded-lg bg-slate-700/50"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
