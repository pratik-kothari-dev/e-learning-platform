import { Star, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Link to={`/course/${course._id}`} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full transform hover:-translate-y-1 block">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 animate-pulse" /> {/* Placeholder while loading */}
        <img 
          src={course.thumbnailUrl ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${course.thumbnailUrl}` : `https://source.unsplash.com/random/400x300/?education,${course._id}`} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10"
        />
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-primary-700 shadow-sm border border-white/50">
            {course.category || 'Course'}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <img src={`https://ui-avatars.com/api/?name=${course.instructor?.name || 'Instructor'}&background=random&color=fff`} alt={course.instructor?.name} className="w-6 h-6 rounded-sm" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{course.instructor?.name || 'Unknown Instructor'}</span>
        </div>
        
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {course.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1 text-yellow-500 font-medium">
            <Star className={`w-4 h-4 ${course.rating > 0 ? 'fill-current' : 'text-gray-300'}`} />
            <span>{course.rating ? course.rating.toFixed(1) : 0}</span>
            <span className="text-gray-400 font-normal ml-1">({course.numReviews || 0})</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
