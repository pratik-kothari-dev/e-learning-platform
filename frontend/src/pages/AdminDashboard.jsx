import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, GraduationCap, BookOpen, Loader2, ShieldAlert, Trash2, Edit, Save, CheckCircle, List, UserMinus } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, instructors: 0, courses: 0 });
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [contentAbout, setContentAbout] = useState('');
  const [contentContact, setContentContact] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, enrollments, content
  const [saveStatusAbout, setSaveStatusAbout] = useState('');
  const [saveStatusContact, setSaveStatusContact] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        
        const [statsRes, pendingRes, usersRes, enrollmentsRes, aboutRes, contactRes] = await Promise.all([
          fetch(`${backendUrl}/api/admin/stats`, { headers }),
          fetch(`${backendUrl}/api/admin/instructors/pending`, { headers }),
          fetch(`${backendUrl}/api/admin/users`, { headers }),
          fetch(`${backendUrl}/api/admin/enrollments`, { headers }),
          fetch(`${backendUrl}/api/content/about`),
          fetch(`${backendUrl}/api/content/contact`)
        ]);

        if (!statsRes.ok || !pendingRes.ok || !usersRes.ok || !enrollmentsRes.ok) {
          throw new Error('Failed to fetch comprehensive admin data');
        }

        setStats(await statsRes.json());
        setPendingInstructors(await pendingRes.json());
        setAllUsers(await usersRes.json());
        setEnrollments(await enrollmentsRes.json());
        
        const aboutData = await aboutRes.json();
        const contactData = await contactRes.json();
        setContentAbout(aboutData.content || '');
        setContentContact(contactData.content || '');

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleAction = async (id, action) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const response = await fetch(`${backendUrl}/api/admin/instructors/${id}/${action}`, {
        method: 'PUT',
        headers,
      });

      if (!response.ok) throw new Error(`Failed to ${action} instructor`);
      
      setPendingInstructors(pendingInstructors.filter(inst => inst._id !== id));
      if (action === 'approve') {
        setStats(prev => ({ ...prev, instructors: prev.instructors + 1 }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUserBlockToggle = async (id) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/admin/users/${id}/block`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to toggle block status');
      
      setAllUsers(allUsers.map(u => u._id === id ? { ...u, isBlocked: !u.isBlocked } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? All their courses will be dropped.')) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete user');
      
      setAllUsers(allUsers.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRevokeEnrollment = async (id) => {
    if (!window.confirm('Are you sure you want to revoke access? This will permanently drop all internal progress mappings for the user in this course.')) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/admin/enrollments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to revoke enrollment');
      
      setEnrollments(enrollments.filter(e => e._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveContent = async (pageId, content) => {
    try {
      if (pageId === 'about') setSaveStatusAbout('Saving...');
      else setSaveStatusContact('Saving...');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/content/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error(`Failed to save ${pageId} content`);
      
      if (pageId === 'about') {
        setSaveStatusAbout('Saved Successfully!');
        setTimeout(() => setSaveStatusAbout(''), 2000);
      } else {
        setSaveStatusContact('Saved Successfully!');
        setTimeout(() => setSaveStatusContact(''), 2000);
      }
    } catch (error) {
      alert(error.message);
      if (pageId === 'about') setSaveStatusAbout('');
      else setSaveStatusContact('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Overview, User Control, and Content Management.</p>
          </div>
          
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'overview' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'users' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Manage Users
            </button>
            <button 
              onClick={() => setActiveTab('enrollments')}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'enrollments' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Manage Enrollments
            </button>
            <button 
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'content' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Manage Content
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center">
            {error}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-fade-in relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center transition hover:shadow-md">
                <div className="bg-blue-100 p-4 rounded-xl mr-5">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.users}</h3>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center transition hover:shadow-md">
                <div className="bg-purple-100 p-4 rounded-xl mr-5">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Instructors</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.instructors}</h3>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center transition hover:shadow-md">
                <div className="bg-green-100 p-4 rounded-xl mr-5">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Courses added</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.courses}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Pending Instructor Registrations</h2>
              </div>
              {pendingInstructors.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No pending requests at the moment.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 h-96 overflow-y-auto">
                  {pendingInstructors.map(instructor => (
                    <li key={instructor._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{instructor.name}</p>
                        <p className="text-sm text-gray-500">@{instructor.username}</p>
                        {instructor.resumeUrl && (
                          <a 
                            href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${instructor.resumeUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 text-sm hover:underline mt-1 inline-block"
                          >
                            View Resume
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAction(instructor._id, 'approve')}
                          className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(instructor._id, 'reject')}
                          className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in relative h-[600px] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Manage Platform Accounts</h2>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Username</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-medium text-gray-900">{u.name}</td>
                      <td className="p-4 text-gray-500">@{u.username}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'Instructor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 gap-1">
                            <ShieldAlert className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleUserBlockToggle(u._id)}
                          className={`p-2 rounded-lg transition-colors border ${u.isBlocked ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-orange-600 border-orange-200 hover:bg-orange-50'}`}
                          title={u.isBlocked ? 'Unblock Account' : 'Block Account'}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUserDelete(u._id)}
                          className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Account Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ENROLLMENTS TAB */}
        {activeTab === 'enrollments' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in relative h-[600px] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><List className="w-5 h-5 text-gray-500" /> Active Platform Enrollments</h2>
            </div>
            <div className="overflow-x-auto flex-1">
              {enrollments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No active course enrollments found.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                      <th className="p-4 font-medium">Student Name</th>
                      <th className="p-4 font-medium">Course Title</th>
                      <th className="p-4 font-medium">Instructor</th>
                      <th className="p-4 font-medium">Progress completed</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {enrollments.map((enr) => (
                      <tr key={enr._id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 font-medium text-gray-900">{enr.user ? enr.user.name : 'Unknown User'}</td>
                        <td className="p-4 text-gray-700">{enr.course ? enr.course.title : 'Course Deleted'}</td>
                        <td className="p-4 text-gray-500 text-sm">{enr.course?.instructor?.name || 'Unknown'}</td>
                        <td className="p-4">
                          {enr.isCompleted ? (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                               Completed
                             </span>
                          ) : (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                               Pending ({enr.completedModules?.length || 0} mods)
                             </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => handleRevokeEnrollment(enr._id)}
                            className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            title="Revoke Course Access"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in relative">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                <Edit className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-900">About Us Page</h2>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <textarea 
                  className="flex-1 w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none text-gray-700"
                  placeholder="Enter the Markdown or HTML content for the About Us page..."
                  value={contentAbout}
                  onChange={(e) => setContentAbout(e.target.value)}
                />
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-green-600 text-sm font-semibold">{saveStatusAbout}</span>
                  <button 
                    onClick={() => handleSaveContent('about', contentAbout)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition"
                  >
                    <Save className="w-4 h-4" /> Save Content
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                <Edit className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-900">Contact Us Page</h2>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <textarea 
                  className="flex-1 w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none text-gray-700"
                  placeholder="Enter the Markdown or HTML content for the Contact Us page..."
                  value={contentContact}
                  onChange={(e) => setContentContact(e.target.value)}
                />
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-green-600 text-sm font-semibold">{saveStatusContact}</span>
                  <button 
                    onClick={() => handleSaveContent('contact', contentContact)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition"
                  >
                    <Save className="w-4 h-4" /> Save Content
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
