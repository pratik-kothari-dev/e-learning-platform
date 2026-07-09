import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Download, Printer, ArrowLeft, Award } from 'lucide-react';

const Certificate = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCertificate = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/api/enrollments/${id}/certificate`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to authorize mapping');
        }
        
        const data = await response.json();
        setCertData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCertificate();
  }, [id, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary-600 mb-4" />
        <p className="text-gray-500 font-medium">Validating completion status...</p>
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200 mb-6 max-w-md">
           <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
           <p className="text-red-600">{error || 'Certificate mapping failed.'}</p>
        </div>
        <Link to="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition">
          <ArrowLeft className="w-5 h-5" /> Return Home
        </Link>
      </div>
    );
  }
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center">
      
      {/* Control Tools - Hidden during print */}
      <div className="flex flex-col sm:flex-row justify-between w-full max-w-5xl mb-8 print:hidden gap-4">
         <Link to="/" className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium w-fit">
           <ArrowLeft className="w-4 h-4" /> Dashboard
         </Link>
         <button 
           onClick={handlePrint}
           className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition shadow-sm font-medium justify-center"
         >
           <Printer className="w-4 h-4" /> Print / Save as PDF
         </button>
      </div>

      {/* Certificate Container mapping A4 layout internally */}
      <div className="bg-white p-2 md:p-10 shadow-2xl relative w-full overflow-hidden flex items-center justify-center print:shadow-none print:p-0"
           style={{ aspectRatio: '1.414/1', maxWidth: '1122px', minHeight: '600px' }}>
           
        {/* Decorative inner border styling */}
        <div className="border-[14px] border-primary-900 w-full h-full relative p-6 flex flex-col items-center justify-center text-center bg-[#fdfdfc] z-10">
          
          {/* Faint background overlay artifact block */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
             <Award className="w-96 h-96" />
          </div>

          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-serif text-primary-900 font-bold uppercase tracking-widest border-b-2 border-primary-900 pb-6 inline-block mx-auto">Certificate of Completion</h1>
          </div>
          
          <p className="text-lg md:text-xl text-gray-600 mb-6 uppercase tracking-wider font-medium">This acknowledges that</p>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 italic">{certData.studentName}</h2>
          
          <p className="text-lg md:text-xl text-gray-600 mb-6 font-medium">has successfully completed the comprehensive module requirements for the course</p>
          
          <h3 className="text-2xl md:text-3xl font-bold text-primary-800 mb-12 max-w-3xl leading-snug">{certData.courseTitle}</h3>
          
          <div className="flex w-full max-w-4xl justify-between items-end mt-4 px-10 border-t border-gray-200 pt-8 relative">
             <div className="text-left">
               <p className="text-gray-900 font-bold border-b border-gray-400 pb-1 w-40 text-center mb-2">EduLearn Platform</p>
               <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Authorized Issuer</p>
             </div>
             <div>
               <Award className="w-16 h-16 text-primary-600 mx-auto" />
             </div>
             <div className="text-right">
               <p className="text-gray-900 font-bold border-b border-gray-400 pb-1 w-40 text-center mb-2">{new Date(certData.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
               <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date of Issue</p>
             </div>
          </div>
          
          <div className="absolute bottom-4 right-6 items-center flex gap-1 text-[10px] text-gray-400">
             <span>Verification ID: {certData.identifier}</span>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Certificate;
