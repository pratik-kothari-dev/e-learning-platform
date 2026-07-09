import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, PlayCircle, FileText, CheckCircle, Lock, ChevronDown, ChevronUp, Award, Star, MessageSquare } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');
  
  const [expandedModule, setExpandedModule] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/api/courses/${id}`);
        if (!response.ok) throw new Error('Course not found');
        const courseData = await response.json();
        setCourse(courseData);

        if (user) {
          const enrollResponse = await fetch(`${backendUrl}/api/enrollments/my`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (enrollResponse.ok) {
            const enrollments = await enrollResponse.json();
            const activeEnrollment = enrollments.find(e => e.course?._id === id);
            if (activeEnrollment) {
              setEnrollment(activeEnrollment);
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, user]);

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setIsEnrolling(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to enroll');
      
      alert(data.message);
      // Auto-reload to fetch native secure enrollment object
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  const markModuleComplete = async (moduleId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/enrollments/course/${id}/module/${moduleId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to update progress');
      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleModule = (idx) => {
    setExpandedModule(expandedModule === idx ? null : idx);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingReview(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/courses/${course._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Review failed natively');
      
      alert(data.message);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Course Unavailable'}</h2>
        <Link to="/" className="text-primary-600 hover:underline">Return Home</Link>
      </div>
    );
  }

  // Calculate Progress Percentages safely
  const isEnrolled = !!enrollment;
  const completedModulesCount = enrollment?.completedModules?.length || 0;
  const totalModulesCount = course.modules?.length || 0;
  const progressPercentage = totalModulesCount === 0 ? 0 : Math.round((completedModulesCount / totalModulesCount) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Block Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="relative h-64 md:h-96 relative">
            <div className="absolute inset-0 bg-gray-900/60 z-10" />
            <img 
              src={course.thumbnailUrl ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${course.thumbnailUrl}` : `https://source.unsplash.com/random/1200x800/?education,${course._id}`} 
              alt={course.title}
              className="w-full h-full object-cover relative z-0"
            />
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
              <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm mb-4 inline-block">
                {course.category || 'General'}
              </span>
              <h1 className="text-4xl font-extrabold text-white mb-2">{course.title}</h1>
              <p className="text-gray-200 text-lg mb-4">Instructor: {course.instructor?.name || 'Unknown'}</p>
              
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(course.rating || 0) ? 'fill-current' : 'text-gray-400 opacity-50'}`} />
                  ))}
                </div>
                <span className="text-white font-medium">{course.rating ? course.rating.toFixed(1) : 0} ({course.numReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Course Curriculum ({totalModulesCount} Modules)</h3>
            
            {course.modules?.map((mod, idx) => {
              const isComp = enrollment?.completedModules?.includes(mod._id);
              const isExpanded = expandedModule === idx;

              return (
                <div key={mod._id} className="bg-white border text-gray-800 border-gray-200 rounded-2xl overflow-hidden transition-shadow hover:shadow-md">
                  <div 
                    className={`flex items-center justify-between p-5 cursor-pointer ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : ''}`}
                    onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-4">
                      {isComp ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                          <span className="text-xs text-gray-500 font-bold">{idx + 1}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-lg">{mod.title}</h4>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </div>

                  {isExpanded && (
                    <div className="p-6">
                      <p className="text-gray-600 mb-6">{mod.description}</p>
                      
                      {!isEnrolled ? (
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                          <Lock className="w-5 h-5 text-orange-500 mt-0.5" />
                          <p className="text-orange-800 text-sm">Enroll securely to unlock this module's video resources and study materials.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          
                          {/* Protected Video Playback */}
                          {mod.videoUrl && (
                            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 p-1">
                              {(() => {
                                const ytMatch = mod.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                                if (ytMatch && ytMatch[1]) {
                                  return (
                                    <iframe
                                      className="w-full aspect-video rounded-lg bg-black"
                                      src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`}
                                      title="Course Video"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    ></iframe>
                                  );
                                }
                                return (
                                  <video 
                                    controls 
                                    controlsList="nodownload" 
                                    onContextMenu={(e) => e.preventDefault()} 
                                    className="w-full aspect-video rounded-lg bg-black"
                                    src={mod.videoUrl}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                );
                              })()}
                            </div>
                          )}

                          {/* Protected PDF Viewing */}
                          {mod.studyMaterials?.length > 0 && (
                            <div>
                               <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-primary-500" /> Protected Study Materials</h4>
                               <div className="space-y-3">
                                 {mod.studyMaterials.map((url, i) => {
                                   const fullUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${url}`;
                                   // We append #toolbar=0 enforcing the browser PDF viewer explicitly hiding standard download toggles.
                                   return (
                                     <div key={i} className="border border-gray-200 rounded-xl overflow-hidden h-96 relative group">
                                       <div className="absolute inset-x-0 top-0 h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 justify-between z-10">
                                         <span className="text-xs font-bold text-gray-600">Document viewer (download restricted)</span>
                                       </div>
                                       <iframe src={`${fullUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full pt-10" title={`Document ${i+1}`} />
                                     </div>
                                   )
                                 })}
                               </div>
                            </div>
                          )}

                          {/* Completion Toggle */}
                          <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                              onClick={() => markModuleComplete(mod._id)}
                              disabled={isComp}
                              className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition ${isComp ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}
                            >
                              <CheckCircle className="w-5 h-5" />
                              {isComp ? 'Completed' : 'Mark Module Complete'}
                            </button>
                          </div>
                          
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Reviews Section organically mapped mapping structures iteratively safely globally */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-primary-600"/> Student Feedback</h3>
              
              {isEnrolled && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                  <h4 className="font-bold text-gray-900 mb-4">Write a Review</h4>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                      <select 
                         value={ratingInput} 
                         onChange={(e) => setRatingInput(Number(e.target.value))}
                         className="w-full md:w-32 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      >
                         <option value="5">5 - Excellent</option>
                         <option value="4">4 - Very Good</option>
                         <option value="3">3 - Good</option>
                         <option value="2">2 - Fair</option>
                         <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
                      <textarea 
                         required
                         value={commentInput}
                         onChange={(e) => setCommentInput(e.target.value)}
                         className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                         placeholder="How was your experience taking this specific course linearly?"
                      ></textarea>
                    </div>
                    <button 
                       type="submit" 
                       disabled={isSubmittingReview}
                       className="bg-primary-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                       {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                       Submit Review
                    </button>
                  </form>
                </div>
              )}

              {course.reviews && course.reviews.length > 0 ? (
                <div className="space-y-4 className">
                  {course.reviews.map((r) => (
                     <div key={r._id} className="bg-white border text-gray-800 border-gray-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold">{r.name}</p>
                          <div className="flex text-yellow-500">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-gray-300'}`} />
                             ))}
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs mb-3">{new Date(r.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                   <p className="text-gray-500">No reviews found securely accurately. Be the first!</p>
                </div>
              )}
            </div>

          </div>

          <div className="space-y-6">
            
            {isEnrolled ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Your Progress</h3>
                <div className="relative pt-1 mb-6">
                  <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-gray-100">
                    <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>{progressPercentage}% Completed</span>
                    <span>{completedModulesCount}/{totalModulesCount}</span>
                  </div>
                </div>

                {enrollment.isCompleted ? (
                   <div className="mt-6 bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                     <Award className="w-12 h-12 text-green-500 mx-auto mb-2" />
                     <h4 className="font-bold text-green-800 mb-2">Course Completed!</h4>
                     <Link to={`/certificate/${enrollment._id}`} className="inline-block bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition">
                       View Certificate
                     </Link>
                   </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center mt-4">Complete all modules to unlock your certificate.</p>
                )}
              </div>
            ) : (
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 text-center flex flex-col items-center sticky top-24">
                <h3 className="text-xl font-bold text-primary-900 mb-2">Ready to Start?</h3>
                <p className="text-primary-700 text-sm mb-6">Join thousands mapping successful careers explicitly following our guided platforms today.</p>
                <button
                  onClick={handleEnrollment}
                  disabled={isEnrolling}
                  className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isEnrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Course Features</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Interactive nested modules</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Self-paced video tracking</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Verified Certificate of Completion</li>
              </ul>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
