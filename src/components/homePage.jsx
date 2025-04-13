import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from './header'; // Assuming you have a Header component

// Service Cards Component
const ServiceCard = ({ title, description, image, bgColor }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className={`relative overflow-hidden rounded-xl shadow-lg p-6 ${bgColor} transform transition-all duration-300 cursor-pointer`}
      whileHover={{ 
        scale: 1.05, 
        transition: { duration: 0.3 } 
      }}
      onClick={() => navigate(`/nafany/services_jobs/${title}`)}
    >
      <div className="flex flex-col items-center">
        <img 
          src={image} 
          alt={title} 
          className="w-32 h-32 object-cover mb-4 rounded-full shadow-md"
        />
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-center text-white opacity-80">{description}</p>
      </div>
    </motion.div>
  );
};

// Header Component


// Offers Card Component


const OfferCard = ({ title, description, discount, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleOfferClick = () => {
    if (!isLoggedIn) {
      alert('يجب تسجيل الدخول أولاً للاستفادة من العروض');
      navigate('/nafany/login');
    } else {
      // تنفيذ إجراء العرض للمستخدم المسجل
      navigate('/nafany');
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden border-2 border-cyan-100 w-full"
      whileHover={{ 
        scale: 1.03, 
        transition: { duration: 0.3 } 
      }}
      dir="rtl"
    >
      <div className="flex flex-col items-start">
        <h3 className="text-lg sm:text-xl font-bold text-cyan-800 mb-2 sm:mb-3">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 flex-grow line-clamp-3">{description}</p>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0">
          <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
            خصم {discount}%
          </span>
          <button 
            className="bg-cyan-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm hover:bg-cyan-700 w-full sm:w-auto text-center"
            onClick={handleOfferClick}
          >
            {isLoggedIn ? 'استكشف العرض' : 'سجل للاستفادة'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};



// Home Page Component
const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser && storedUser !== '""') {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser) {
            setUserData(parsedUser);
            setIsLoggedIn(true);
            
            // تحقق من الدور بعد تعيين بيانات المستخدم
            if (parsedUser.role === 'provider') {
              navigate('/nafany/servicer_page');
            }
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    };
  
    checkLoginStatus();
  
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        checkLoginStatus();
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]); // تأكد من إضافة navigate إلى dependencies

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/nafany');
  };

  const serviceCards = [
    {
      title: "خدمات فنية",
      description: "سباك، نجار، كهربائي، ميكانيكي، حداد، فني تكييفات، نقاش، ترزي",
      image: "/nafany/public/electric.jpg",
      bgColor: "bg-[#2f4156]"
    },
    {
      title: "خدمات صحية",
      description: "مستشفيات، عيادات، صيدليات، مراكز طبية",
      image: "/nafany/public/medicin.jpg",
      bgColor: "bg-[#567c8d]"
    },
    {
      title: "خدمات عامة",
      description: "سوبر ماركت، مطاعم، كافيهات، مولات، خدمات تجارية",
      image: "/nafany/public/download.png",
      bgColor: "bg-[#808080]"
    },
    {
      title: "خدمات أخرى",
      description: "عطار، جزار، فكهاني، خضري، محل ألبان، خدمات متفرقة",
      image: "/nafany/public/download (1).png",
      bgColor: "bg-[#62a2d3]"
    }
  ];

  const offers = [
    {
      title: "عرض الصيانة",
      description: "خصم خاص على خدمات الصيانة المنزلية الشاملة",
      discount: 20
    },
    {
      title: "عرض التركيبات",
      description: "أسعار مخفضة للتركيبات الفنية المتكاملة",
      discount: 25
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-cyan-800">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-cyan-100 to-blue-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} userData={userData} />
      
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-3xl font-bold text-center text-cyan-800 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {'مرحبًا بك في  نفعني'}
        </motion.h1>

        {/* Services Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
              }
            }
          }}
        >
          {serviceCards.map((card, index) => (
            <ServiceCard key={index} {...card} />
          ))}
        </motion.div>

        {/* Offers Section */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-center text-cyan-800 mb-6">
            العروض والتخفيضات الحالية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <OfferCard 
                key={index} 
                {...offer} 
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;