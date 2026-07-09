import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Loader2, User, Key, Mail, Award, BookOpen, CheckCircle, Save, Settings } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states cleanly tracked
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  
  const [activeTab, setActiveTab] = useState('settings'); // settings, enrollments, certificates

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        
        // Fetch User Identity
        const profileRes = await fetch(`${backendUrl}/api/auth/profile`, { headers });
        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfileData(pData);
          setName(pData.name || '');
          setEmail(pData.email || '');
        }

        // Fetch User Progress Context
        const enrollRes = await fetch(`${backendUrl}/api/enrollments/my`, { headers });
        if (enrollRes.ok) {
          const eData = await enrollRes.json();
          // Filter out enrollments where course is null (deleted courses) to prevent frontend crash
          setEnrollments(eData.filter(e => e.course != null));
        }
        
      } catch (err) {
        console.error("Failed to map identity properties natively:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({ type: '', text: '' });
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const payload = { name, email };
      if (password.trim() !== '') {
         payload.password = password;
      }
      
      const response = await fetch(`${backendUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to successfully hook profile updates');
      
      // Update global context explicitly securely overwriting JWT layouts logically bypassing re-login
      login(data);
      
      setUpdateMessage({ type: 'success', text: 'Profile smoothly updated!' });
      setPassword(''); // clear password context explicitly securely
    } catch (err) {
      setUpdateMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">
        Session absent safely tracking. Wait directly or log in heavily properly.
      </div>
    );
  }

  const generatedCertificates = enrollments.filter(e => e.isCompleted === true);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Side Navigation Profile Card */}
        <div className="w-full md:w-1/3">
           <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
             <div className="bg-primary-900 p-8 text-center text-white relative">
               <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000')] bg-cover bg-center"></div>
               <div className="w-24 h-24 mx-auto bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-3xl font-extrabold border-4 border-white shadow-lg relative z-10 mb-4">
                 {name ? name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
               </div>
               <h2 className="text-xl font-bold relative z-10">{name}</h2>
               <p className="text-primary-200 text-sm font-medium relative z-10">@{user.username}</p>
             </div>
             
             <div className="p-4 flex flex-col gap-1 border-t border-gray-100">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition ${activeTab === 'settings' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Settings className="w-5 h-5" /> Account Settings
                </button>
                <button 
                  onClick={() => setActiveTab('enrollments')}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-left font-medium transition ${activeTab === 'enrollments' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-3"><BookOpen className="w-5 h-5" /> My Learning</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">{enrollments.length}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('certificates')}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-left font-medium transition ${activeTab === 'certificates' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-3"><Award className="w-5 h-5" /> Certificates</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">{generatedCertificates.length}</span>
                </button>
             </div>
           </div>
        </div>

        {/* Right Side Content Areas */}
        <div className="w-full md:w-2/3">
          
          {/* TAB 1: Account Settings */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 animate-fade-in relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
               <h2 className="text-2xl font-bold text-gray-900 mb-6 relative">Personal Identification</h2>
               
               {updateMessage.text && (
                 <div className={`p-4 rounded-xl mb-6 font-medium border ${updateMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                   {updateMessage.text}
                 </div>
               )}
               
               <form onSubmit={handleUpdateProfile} className="space-y-6 relative">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
                     <div className="relative">
                       <User className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400" />
                       <input 
                         type="text" 
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition" 
                         placeholder="Jane Doe" 
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                     <div className="relative">
                       <Mail className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400" />
                       <input 
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)} 
                         className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition bg-white" 
                         placeholder="jane@example.com" 
                       />
                     </div>
                   </div>
                   <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Update Password</label>
                     <div className="relative">
                       <Key className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400" />
                       <input 
                         type="password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)} 
                         className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition" 
                         placeholder="Leave strictly blank to retain current token" 
                       />
                     </div>
                   </div>
                 </div>
                 
                 <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isUpdating}
                      className="bg-primary-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-700 transition shadow flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Update Profile
                    </button>
                 </div>
               </form>
            </div>
          )}

          {/* TAB 2: Enrollments */}
          {activeTab === 'enrollments' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 animate-fade-in">
               <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"><BookOpen className="w-6 h-6 text-primary-600"/> Active Tracks</h2>
               
               {enrollments.length === 0 ? (
                 <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-10 text-center flex flex-col items-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-gray-700 font-bold text-lg mb-2">You haven't enrolled deeply yet.</h3>
                    <p className="text-gray-500 mb-6">Explore our global tracks correctly pushing boundaries inherently mapping seamlessly.</p>
                    <Link to="/" className="bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary-700 transition">Browse Courses</Link>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {enrollments.map(enr => {
                     const totalMods = enr.course?.modules?.length || 0;
                     const compMods = enr.completedModules?.length || 0;
                     const progress = totalMods === 0 ? 0 : Math.round((compMods / totalMods) * 100);

                     return (
                       <Link key={enr._id} to={`/course/${enr.course._id}`} className="block border border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-md transition bg-gray-50 group">
                         <div className="flex justify-between items-start mb-4">
                           <div>
                             <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-700 transition">{enr.course.title}</h3>
                             <p className="text-sm text-gray-500">{enr.course.category || 'General'}</p>
                           </div>
                           {enr.isCompleted && (
                             <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"><CheckCircle className="w-3 h-3"/> Complete</span>
                           )}
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
                           <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                         </div>
                         <div className="flex justify-between text-xs text-gray-500 font-medium">
                           <span>{progress}% explicitly completed</span>
                           <span>{compMods} / {totalMods} Modules</span>
                         </div>
                       </Link>
                     );
                   })}
                 </div>
               )}
            </div>
          )}

          {/* TAB 3: Certificates */}
          {activeTab === 'certificates' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 animate-fade-in">
               <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"><Award className="w-6 h-6 text-green-600"/> Verified Rewards</h2>
               
               {generatedCertificates.length === 0 ? (
                 <div className="bg-green-50 border border-green-100 border-dashed rounded-2xl p-10 text-center flex flex-col items-center">
                    <Award className="w-12 h-12 text-green-300 mb-4" />
                    <h3 className="text-green-800 font-bold text-lg mb-2">No certificates unlocked globally</h3>
                    <p className="text-green-600 text-sm">Finish all nested course modules implicitly generating verified tokens mapping correctly.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {generatedCertificates.map(cert => (
                      <div key={cert._id} className="border-2 border-green-100 rounded-2xl p-6 bg-gradient-to-b from-white to-green-50 flex flex-col justify-between h-56 relative group overflow-hidden">
                        
                        <div className="absolute -right-4 -bottom-4 text-green-200 opacity-50 pointer-events-none group-hover:scale-110 transition duration-500">
                          <Award className="w-32 h-32" />
                        </div>

                        <div className="relative z-10">
                          <p className="text-xs uppercase tracking-widest text-green-600 font-bold mb-2">Certificate of Completion</p>
                          <h3 className="font-bold text-gray-900 text-lg leading-snug">{cert.course.title}</h3>
                        </div>
                        
                        <div className="relative z-10">
                          <p className="text-xs text-gray-500 font-medium mb-3">Issued: {new Date(cert.updatedAt).toLocaleDateString()}</p>
                          <Link 
                            to={`/certificate/${cert._id}`}
                            className="bg-green-600 text-white font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-green-700 transition inline-block text-center w-full shadow-sm shadow-green-200"
                          >
                            View Certificate
                          </Link>
                        </div>
                      </div>
                   ))}
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
