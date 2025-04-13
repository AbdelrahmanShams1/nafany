import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaArrowRight } from 'react-icons/fa';

const Header = ({ isLoggedIn, onLogout, userData }) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    if (userData?.role === 'provider') {
      navigate('/nafany/settings', { state: { fromProvider: true } });
    } else {
      navigate('/nafany/settings');
    }
  };

  return (
    <motion.header 
      className="bg-white shadow-md px-8 py-4 flex justify-between items-center"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-4">
        {isLoggedIn && (
          <span className="text-gray-700 font-medium">
            مرحبًا، {userData?.name || 'عزيزي المستخدم'}
          </span>
        )}
        <motion.button 
          onClick={() => {
            onLogout();
            navigate('/nafany/login');
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoggedIn ? 'تسجيل الخروج' : 'تسجيل الدخول'}
        </motion.button>
      </div>

      <div className="flex items-center space-x-8">
        <nav className="flex items-center space-x-9 font-black text-2xl">
          <button 
            onClick={handleSettingsClick}
            className="text-gray-700 hover:text-cyan-800 transition-colors"
          >
            الإعدادات
          </button>
          <button 
            onClick={() => navigate('/nafany/contact')} 
            className="text-gray-700 hover:text-cyan-800 transition-colors"
          >
            تواصل معنا
          </button>
          <button 
            onClick={() => navigate('/nafany/complaints')} 
            className="text-gray-700 hover:text-cyan-800 transition-colors"
          >
            الشكاوى والاقتراحات
          </button>
        </nav>
        <img 
          src="/nafany/IMG-20250322-WA0070.jpg" 
          alt="Logo" 
          className="h-24 w-24 object-contain" 
        />
      </div>
    </motion.header>
  );
};

export default Header;