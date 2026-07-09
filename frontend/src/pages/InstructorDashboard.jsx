import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Plus, Edit2, Trash2, Video, Users, Image, MinusCircle, FileText, BookOpen, Star, MessageSquare } from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  // Modules Array State
  const [modules, setModules] = useState([
    { title: '', description: '', videoUrl: '', studyMaterialsFiles: [], studyMaterials: [] }
  ]);
  
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    if (!user || user.role !== 'Instructor') {
      navigate('/');
      return;
    }
    if (user.approvalStatus === 'Approved') {
      fetchCourses();
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/courses/instructor`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudyMaterialUpload = async (file) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch(`${backendUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    if (!uploadRes.ok) throw new Error('Failed to upload study material file');
    return uploadRes.text();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      let uploadedThumbnailUrl = undefined;
      
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        
        const uploadRes = await fetch(`${backendUrl}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error('Failed to upload thumbnail');
        uploadedThumbnailUrl = await uploadRes.text();
      }

      // Process all modules sequentially mapping their distinct file batches
      const uploadedModules = await Promise.all(modules.map(async (mod) => {
        const compiledMaterials = [...(mod.studyMaterials || [])];
        if (mod.studyMaterialsFiles && mod.studyMaterialsFiles.length > 0) {
          for (const file of mod.studyMaterialsFiles) {
            const fileUrl = await handleStudyMaterialUpload(file);
            compiledMaterials.push(fileUrl);
          }
        }
        return {
          title: mod.title,
          description: mod.description,
          videoUrl: mod.videoUrl,
          studyMaterials: compiledMaterials
        };
      }));

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${backendUrl}/api/courses/${editingId}` : `${backendUrl}/api/courses`;
      
      const payload = { 
        title, 
        description, 
        category, 
        thumbnailUrl: uploadedThumbnailUrl,
        modules: uploadedModules
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save course');
      
      closeModal();
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete course');
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditModal = (course) => {
    setEditingId(course._id);
    setTitle(course.title);
    setDescription(course.description);
    setCategory(course.category || 'General');
    
    // Parse existing nested modules scaling legacy support to minimum 1 module visually
    const mappedModules = course.modules && course.modules.length > 0 
      ? course.modules.map(m => ({
          title: m.title,
          description: m.description,
          videoUrl: m.videoUrl || '',
          studyMaterialsFiles: [],
          studyMaterials: m.studyMaterials || []
        }))
      : [{ title: '', description: '', videoUrl: '', studyMaterialsFiles: [], studyMaterials: [] }];
      
    setModules(mappedModules);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('General');
    setThumbnailFile(null);
    setModules([{ title: '', description: '', videoUrl: '', studyMaterialsFiles: [], studyMaterials: [] }]);
  };

  const handleModuleChange = (index, field, value) => {
    const newModules = [...modules];
    newModules[index][field] = value;
    setModules(newModules);
  };

  const addModule = () => {
    setModules([...modules, { title: '', description: '', videoUrl: '', studyMaterialsFiles: [], studyMaterials: [] }]);
  };

  const removeModule = (index) => {
    if (modules.length === 1) return; // Prevent removing last module
    setModules(modules.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
      </div>
    );
  }

  if (user?.approvalStatus === 'Pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-2xl max-w-md text-center shadow-sm">
          <Loader2 className="animate-spin h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Waiting for Admin Approval</h2>
          <p className="text-yellow-700">Your registration as an instructor is currently pending. Please check back later once an admin has reviewed your request.</p>
        </div>
      </div>
    );
  }

  if (user?.approvalStatus === 'Rejected') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-red-50 border border-red-200 p-8 rounded-2xl max-w-md text-center shadow-sm">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Request Rejected</h2>
          <p className="text-red-700">Your registration as an instructor has been declined by the administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your modular courses, resources, and track enrollments.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Modular Course
          </button>
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-fit mb-6">
            <button 
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'courses' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              My Courses
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'feedback' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Student Feedback
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* TAB 1: COURSES */}
        {activeTab === 'courses' && (
          <>
            {courses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No courses added yet</h3>
                <p className="mt-1 text-gray-500">Get started by creating your first course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {courses.map((course) => (
                  <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition hover:shadow-md">
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                      
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500 gap-2">
                           <Users className="h-4 w-4" />
                           <span>{course.studentsEnrolled?.length || 0} students enrolled</span>
                        </div>
                        <div className="flex items-center text-sm text-indigo-600 gap-2">
                           <FileText className="h-4 w-4" />
                           <span>{course.modules?.length || 0} Modules Constructed</span>
                        </div>
                        <div className="flex items-center text-sm text-yellow-600 gap-2">
                           <Star className="h-4 w-4" />
                           <span>{(course.rating || 0).toFixed(1)} Avg Rating</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
                      <button 
                        onClick={() => openEditModal(course)}
                        className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <Edit2 className="h-4 w-4" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(course._id)}
                        className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: INSTRUCTOR FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="animate-fade-in space-y-8">
             {courses.every(c => !c.reviews || c.reviews.length === 0) ? (
               <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Feedback Received Yet</h3>
                  <p className="mt-1 text-gray-500">Students have not explicitly rated or reviewed your courses natively securely yet.</p>
               </div>
             ) : (
                courses.filter(c => c.reviews && c.reviews.length > 0).map(course => (
                  <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="bg-gray-50 p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h3 className="font-bold text-gray-900 text-xl">{course.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                             <span className="font-bold text-gray-700">{course.numReviews}</span> total reviews natively parsed.
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center bg-white border border-yellow-200 rounded-xl px-4 py-2 shadow-sm">
                          <Star className="w-6 h-6 text-yellow-500 fill-current mr-2" />
                          <span className="font-extrabold text-xl text-gray-900">{(course.rating || 0).toFixed(1)}</span>
                          <span className="text-gray-400 text-sm ml-1">/ 5.0</span>
                        </div>
                     </div>
                     <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {course.reviews.map(rev => (
                              <div key={rev._id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition">
                                 <div className="flex justify-between items-start mb-3">
                                   <p className="font-bold text-gray-900">{rev.name}</p>
                                   <div className="flex text-yellow-400">
                                      {[...Array(5)].map((_, i) => (
                                         <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                                      ))}
                                   </div>
                                 </div>
                                 <p className="text-xs text-gray-500 mb-3">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                 <p className="text-gray-700 text-sm bg-white p-3 border border-gray-100 rounded-lg italic">"{rev.comment}"</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                ))
             )}
          </div>
        )}

        {/* Modular Editing Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">
              
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h2 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Modular Course' : 'Create New Course'}</h2>
                 <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">✕</button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="courseForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Global Course Details */}
                  <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 uppercase tracking-wide text-xs">Global Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        required
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                        >
                          <option value="General">General</option>
                          <option value="Programming">Programming</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Design">Design</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => setThumbnailFile(e.target.files[0])}
                          className="block w-full py-1 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modules Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-primary-50 p-4 rounded-xl border border-primary-100">
                       <h3 className="font-bold text-primary-800 flex items-center gap-2"><BookOpen className="w-5 h-5"/> Course Modules</h3>
                       <button 
                         type="button" 
                         onClick={addModule}
                         className="flex items-center gap-1 bg-white border border-primary-300 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary-100 transition"
                       >
                         <Plus className="w-4 h-4" /> Add Module
                       </button>
                    </div>

                    {modules.map((mod, index) => (
                      <div key={index} className="p-5 border border-indigo-100 rounded-xl shadow-sm bg-white relative group">
                        
                        {modules.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeModule(index)}
                            className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition shadow border border-red-200"
                            title="Remove Module"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        )}
                        
                        <div className="flex items-center gap-3 mb-4">
                           <span className="bg-indigo-600 text-white font-bold h-6 w-6 flex items-center justify-center rounded-full text-xs shrink-0">{index + 1}</span>
                           <h4 className="font-bold text-gray-800 text-lg">Module details</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Module Title</label>
                            <input
                              type="text"
                              required
                              value={mod.title}
                              onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                              placeholder="E.g. Introduction to Variables"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Module Description</label>
                            <textarea
                              required
                              rows="2"
                              value={mod.description}
                              onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Video Resource (URL)</label>
                              <div className="flex items-center relative">
                                <Video className="absolute ml-3 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={mod.videoUrl}
                                  onChange={(e) => handleModuleChange(index, 'videoUrl', e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                  placeholder="Secure URL link"
                                />
                              </div>
                            </div>
                            <div>
                               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Supporting Materials (PDF)</label>
                               <input
                                 type="file"
                                 multiple
                                 accept=".pdf,.doc,.docx"
                                 onChange={(e) => handleModuleChange(index, 'studyMaterialsFiles', Array.from(e.target.files))}
                                 className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                               />
                               {mod.studyMaterials?.length > 0 && (
                                  <p className="text-xs text-green-600 mt-1">{mod.studyMaterials.length} file(s) saved</p>
                               )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </form>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="courseForm"
                  className="px-5 py-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl font-medium shadow-sm transition"
                >
                  {editingId ? 'Modify Modular Course' : 'Publish Course'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InstructorDashboard;
