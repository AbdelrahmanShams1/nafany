import React , {useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

const Header = ({ isLoggedIn, onLogout, userData }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showLogout, setShowLogout] = useState(false);


  // أنماط للأزرار
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.header 
      className="bg-gradient-to-r from-cyan-600 to-blue-700 shadow-lg px-4 md:px-8 py-3 md:py-4 flex justify-between items-center relative"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      dir="rtl" // تعيين اتجاه RTL للعنصر بالكامل
    >
      {/* العناصر الزخرفية */}
      <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-10 transform skew-x-12"></div>
      <div className="absolute left-0 bottom-0 h-24 w-24 bg-white opacity-10 rounded-full"></div>

      {/* الجزء الأيمن (الشعار والروابط) */}
      <div className="flex items-center justify-between w-full md:w-auto relative z-10">
        {/* الشعار */}
        <img 
          src="/nafany/IMG-20250322-WA0070.jpg" 
          alt="Logo" 
          className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain ml-2 md:ml-4 bg-white p-1 rounded-full border-2 border-white shadow-md" 
        />

        {/* روابط سطح المكتب - مخفية في الجوال */}
        <nav className="hidden md:flex items-center mr-4 space-x-reverse space-x-4 lg:space-x-6 font-bold text-base lg:text-xl">
          <button 
            onClick={() => navigate('/nafany/complaints')} 
            className="text-white hover:text-gray-200 transition-colors"
          >
            الشكاوى والاقتراحات
          </button>
          <button 
            onClick={() => navigate('/nafany/contact')} 
            className="text-white hover:text-gray-200 transition-colors"
          >
            تواصل معنا
          </button>
          <button 
            onClick={() => navigate('/nafany/settings')} 
            className="text-white hover:text-gray-200 transition-colors"
          >
            الإعدادات
          </button>
        </nav>

        {/* زر القائمة للجوال */}
        <button 
          className="md:hidden text-white mr-2 z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="القائمة"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* الجزء الأيسر (تحية المستخدم وزر تسجيل الدخول - يظهر فقط في وضع سطح المكتب) */}
    <div className="hidden md:flex flex-col items-end relative z-10 text-right">
  {isLoggedIn && (
    <div className="relative">
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => setShowLogout(prev => !prev)}
      >
        {userData?.profileImage ? (
          <img 
            src={userData.profileImage} 
            alt={userData.name} 
            className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover ml-3"
          />
        ) : (
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-white text-cyan-700 flex items-center justify-center text-2xl ml-3">
            <FaUserCircle />
          </div>
        )}
        <span className="text-white font-medium text-base ml-4">
          مرحبًا، {userData?.name || 'عزيزي المستخدم'}
        </span>
      </div>

      {/* قائمة تسجيل الخروج تظهر عند الضغط */}
      {showLogout && (
        <motion.button 
          onClick={() => {
            onLogout();
            navigate('/nafany/login');
          }}
          className="mt-2 bg-white text-cyan-700 px-5 py-2 rounded-md hover:bg-gray-100 text-sm font-semibold shadow-md transition-colors duration-300 w-[50%] text-right"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          تسجيل الخروج
        </motion.button>
      )}
    </div>
  )}
</div>

      {/* قائمة الجوال المنسدلة */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              className="absolute top-16 right-0 w-3/4 max-w-sm h-full bg-white shadow-lg z-50 overflow-y-auto overflow-x-hidden"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* تحية المستخدم في القائمة المنسدلة */}
              {isLoggedIn && (
                <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex items-center">
                  {userData?.profileImage ? (
                    <img 
                      src={userData.profileImage} 
                      alt={userData.name} 
                      className="w-12 h-12 rounded-full border-2 border-cyan-600 shadow-md object-cover ml-3"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-cyan-600 shadow-md bg-cyan-100 text-cyan-700 flex items-center justify-center text-2xl ml-3">
                      <FaUserCircle />
                    </div>
                  )}
                  <span className="text-gray-700 font-medium text-base block">
                    مرحبًا، {userData?.name || 'عزيزي المستخدم'}
                  </span>
                </div>
              )}
              
              {/* روابط القائمة المنسدلة */}
              <nav className="flex flex-col items-end p-6 space-y-6 font-bold text-lg">
                <button 
                  onClick={() => {
                    navigate('/nafany/settings');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="text-gray-700 hover:text-cyan-800 transition-colors w-full text-right flex items-center justify-end"
                >
                  <span>الإعدادات</span>
                </button>
                <button 
                  onClick={() => {
                    navigate('/nafany/contact');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="text-gray-700 hover:text-cyan-800 transition-colors w-full text-right flex items-center justify-end"
                >
                  <span>تواصل معنا</span>
                </button>
                <button 
                  onClick={() => {
                    navigate('/nafany/complaints');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="text-gray-700 hover:text-cyan-800 transition-colors w-full text-right flex items-center justify-end"
                >
                  <span>الشكاوى والاقتراحات</span>
                </button>
                
                {/* زر تسجيل الدخول/الخروج داخل القائمة */}
                <div className="w-full pt-4 border-t border-gray-200">
                  <motion.button 
                    onClick={() => {
                      if (isLoggedIn) {
                        onLogout();
                        navigate('/nafany/login');
                      } else {
                        navigate('/nafany/login');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-3 rounded-lg hover:opacity-90 text-base w-full text-center font-bold"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoggedIn ? 'تسجيل الخروج' : 'تسجيل الدخول'}
                  </motion.button>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;