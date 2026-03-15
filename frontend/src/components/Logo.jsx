import { Link } from 'react-router-dom';
import { School } from 'lucide-react';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-3 group">
      {/* Icon Container */}
      <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-100 to-gray-200 rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500 ease-in-out group-hover:scale-105">
        <School
          size={28}
          className="text-slate-700 group-hover:text-slate-800 group-hover:scale-105 transition-all duration-500 ease-in-out"
        />
        {/* Subtle Inner Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br ease-in-out" />
        
      </div>

      {/* Text */}
      <span className="text-2xl font-bold tracking-tight text-slate-100 group-hover:text-white transition-all duration-500 ease-in-out">
        EduCloud
      </span>
    </Link>
  );
};

export default Logo;
