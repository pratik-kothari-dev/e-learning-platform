import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardRedirect = () => {
    if (user.role === 'Admin') navigate('/admin');
    else if (user.role === 'Instructor') navigate('/instructor');
    else navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900 group-hover:text-primary-600 transition">
                EduLearn
              </span>
            </Link>
            
            {/* Search Bar (Desktop) */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const term = e.target.search.value.trim();
                if (term) navigate(`/courses?search=${encodeURIComponent(term)}`);
                else navigate(`/courses`);
              }}
              className="hidden md:flex ml-8 relative group"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                name="search"
                autoComplete="off"
                placeholder="What do you want to learn?"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-80 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-gray-50 hover:bg-white focus:bg-white"
              />
            </form>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/courses" className="text-gray-600 hover:text-primary-600 font-medium transition">All Courses</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-600 font-medium transition">About Us</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600 font-medium transition">Contact</Link>
            {(user?.role === 'Admin' || user?.role === 'Instructor') && (
              <Link to={user.role === 'Admin' ? '/admin' : '/instructor'} className="text-primary-600 font-bold hover:text-primary-700 transition">
                Dashboard
              </Link>
            )}
            {user ? (
              <div className="relative group ml-4">
                <button className="flex items-center gap-2 focus:outline-none">
                  <div className="h-10 w-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-primary-500 shadow-sm transition hover:scale-105">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                  </div>
                </button>
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform origin-top-right z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                      <span className="mt-1 inline-block bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full font-medium">{user.role}</span>
                    </div>
                    {user.role === 'Admin' || user.role === 'Instructor' ? (
                      <button onClick={handleDashboardRedirect} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition">Dashboard</button>
                    ) : (
                      <>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition">My Profile</Link>
                      </>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition mt-1 border-t border-gray-50"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative group/login">
                  <button className="text-primary-600 font-semibold hover:text-primary-700 transition py-2">
                    Log In
                  </button>
                  <div className="absolute right-0 mt-0 w-40 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover/login:opacity-100 group-hover/login:visible transition-all duration-200 ease-in-out transform origin-top-right z-50">
                    <div className="py-2">
                      <Link to="/login?role=User" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition">User Login</Link>
                      <Link to="/login?role=Admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition">Admin Login</Link>
                      <Link to="/login?role=Instructor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition">Instructor Login</Link>
                    </div>
                  </div>
                </div>
                <Link to="/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-primary-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                  Join for Free
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
