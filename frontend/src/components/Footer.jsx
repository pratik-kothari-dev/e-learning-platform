import { Link } from 'react-router-dom';
import { BookOpen, Share2, Globe, MessageCircle, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
             <Link to="/" className="flex items-center gap-2 group mb-4">
               <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition">
                 <BookOpen className="h-6 w-6 text-white" />
               </div>
               <span className="font-bold text-2xl tracking-tight text-slate-900 group-hover:text-primary-600 transition">
                 EduLearn
               </span>
             </Link>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
               Empowering students explicitly mapping global skill acquisitions securely launching modern careers dynamically.
             </p>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-500 hover:text-primary-600 transition text-sm">All Courses</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-primary-600 transition text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-primary-600 transition text-sm">Contact Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Account</h3>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-gray-500 hover:text-primary-600 transition text-sm">Log In</Link></li>
              <li><Link to="/signup" className="text-gray-500 hover:text-primary-600 transition text-sm">Join for Free</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-gray-500 text-sm">
             &copy; {new Date().getFullYear()} EduLearn Inc. All rights reserved.
           </p>
           <p className="text-gray-400 text-xs">Platform natively tracking secure validations.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
