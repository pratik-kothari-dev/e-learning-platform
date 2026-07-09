import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero';
import CourseCard from '../components/CourseCard';
import { Loader2, SearchX } from 'lucide-react';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/api/courses`);
        if (!response.ok) throw new Error('Failed to load courses');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const displayedCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(c => 
       c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [courses, searchTerm]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {!searchTerm && <Hero />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Courses</h2>
            <p className="text-gray-600 text-lg">Explore the highest-rated courses explicitly globally tracking.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
             <div className="col-span-full py-10 flex justify-center">
               <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
             </div>
          ) : displayedCourses.length === 0 ? (
             <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200">
               <SearchX className="h-16 w-16 text-gray-300 mb-4" />
               <h3 className="text-xl font-bold text-gray-700">No courses found matching "{searchTerm}"</h3>
               <p className="text-gray-500 mt-2">Try adjusting your search terms or explore our popular categories.</p>
             </div>
          ) : (
            [...displayedCourses]
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 4)
              .map(course => (
              <CourseCard key={course._id} course={course} />
            ))
          )}
        </div>
        
        {!searchTerm && displayedCourses.length > 0 && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => { window.location.href = '/courses'; }}
              className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-md font-semibold text-lg hover:bg-primary-50 transition"
            >
              Explore All Courses
            </button>
          </div>
        )}
      </div>

      {/* Another Section */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Trusted by over 1500 companies and millions of learners around the world</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
            <span className="text-2xl font-bold">Google</span>
            <span className="text-2xl font-bold">IBM</span>
            <span className="text-2xl font-bold">Meta</span>
            <span className="text-2xl font-bold">Salesforce</span>
            <span className="text-2xl font-bold">Stanford</span>
            <span className="text-2xl font-bold">Duke</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
