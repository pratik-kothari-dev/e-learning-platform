import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { Loader2, SearchX, Search } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
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
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      {/* Search Header Banner */}
      <div className="bg-primary-900 border-b border-primary-800 py-16 mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Explore the Complete Catalog</h1>

          <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
            </div>
            <input
              type="text"
              name="search"
              value={searchTerm}
              onChange={(e) => {
                const query = e.target.value;
                if (query) setSearchParams({ search: query });
                else setSearchParams({});
              }}
              placeholder="Search across programming, business, design, and more..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-lg shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-500/50 bg-white/95 backdrop-blur-sm transition"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-primary-600 hover:bg-primary-700 text-white px-6 rounded-lg font-bold transition shadow-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Results Info */}
        <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'All Available Courses'}
            </h2>
            <p className="text-gray-500 mt-1">
              {displayedCourses.length} {displayedCourses.length === 1 ? 'course' : 'courses'} found.
            </p>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 flex justify-center">
              <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-200 shadow-sm">
              <SearchX className="h-20 w-20 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-700">No courses mapped globally</h3>
              <p className="text-gray-500 mt-2 max-w-sm text-center">Try adjusting your filters internally naturally correctly finding matches linearly correctly.</p>
            </div>
          ) : (
            displayedCourses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Courses;
