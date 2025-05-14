import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; 
import { db } from '../firebase'; 
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { 
  FaUserCircle, 
  FaArrowRight, 
  FaArrowDown, 
  FaArrowUp, 
  FaStar, 
  FaCommentDots,
  FaRegCalendarAlt 
} from 'react-icons/fa'; 

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// Service Cards Component with enhanced design
const ServiceCard = ({ title, description, image, bgColor }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className={`relative overflow-hidden rounded-xl shadow-lg ${bgColor} transform transition-all duration-300 cursor-pointer`}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.3 } 
      }}
      onClick={() => navigate(`/nafany/service_categories/${title}`)}
      variants={itemVariants}
    >
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      
      <div className="flex flex-col items-center p-6">
        <motion.img 
          src={image} 
          alt={title} 
          className="w-32 h-32 object-cover mb-4 rounded-full shadow-md border-4 border-white border-opacity-30"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        />
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-center text-white opacity-90">{description}</p>
      </div>
    </motion.div>
  );
};

// Offers Card Component with enhanced design
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
      className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-cyan-100 w-full relative"
      whileHover={{ 
        scale: 1.03, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.3 } 
      }}
      variants={itemVariants}
      dir="rtl"
    >
      <div className="absolute -right-6 -top-6 w-16 h-16 bg-cyan-200 opacity-30 rounded-full"></div>
      <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-blue-200 opacity-30 rounded-full"></div>
      
      <div className="p-6">
        <div className="flex flex-col items-start">
          <motion.h3 
            className="text-xl font-bold text-cyan-800 mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h3>
          <motion.p 
            className="text-gray-600 mb-4 flex-grow line-clamp-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {description}
          </motion.p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-4">
            <motion.div 
              className="bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 px-4 py-2 rounded-full text-sm font-bold flex items-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <FaStar className="ml-1 text-cyan-700" />
              خصم {discount}%
            </motion.div>
            <motion.button 
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-cyan-800 w-full sm:w-auto text-center"
              onClick={handleOfferClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {isLoggedIn ? 'استكشف العرض' : 'سجل للاستفادة'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Render rating stars helper function
const renderRatingStars = (rating) => {
  return [...Array(5)].map((_, i) => (
    <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
      <FaStar />
    </span>
  ));
};

// Chat List Component
const ChatItem = ({ chat, userData, handleStartChat }) => {
  const providerId = chat.participants[0] === userData.id ? chat.participants[0] : chat.participants[1];
  const providerName = chat.participantsNames[0] === userData.name ? chat.participantsNames[1] : chat.participantsNames[0];
  const providerEmail = chat.participantsEmails?.find(e => e !== userData.email);
  
  return (
    <motion.div 
      className="bg-gradient-to-r from-gray-50 to-cyan-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-all duration-300"
      onClick={() => handleStartChat(providerId, providerName, providerEmail)}
      whileHover={{ x: 5, backgroundColor: "#E6F7FF" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white rounded-full p-2 ml-3">
          <FaUserCircle className="text-xl" />
        </div>
        <div>
          <p className="font-medium text-cyan-800">{providerName}</p>
          <p className="text-sm text-gray-600 truncate max-w-xs">{chat.lastMessage}</p>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <FaRegCalendarAlt className="ml-1" size={10} />
            {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleDateString('ar-EG') : 'تاريخ غير معروف'}
          </div>
        </div>
      </div>
      <div className="bg-cyan-600 text-white rounded-full p-2 transition-all duration-300 hover:bg-cyan-700">
        <FaArrowRight className="text-sm" />
      </div>
    </motion.div>
  );
};

// Home Page Component
const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [showChats, setShowChats] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
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
            } else {
              // Fetch chats for regular users
              const userChats = await fetchUserChats(parsedUser.id || parsedUser.uid);
              setChats(userChats);
              console.log('User chats:', userChats);
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
  }, [navigate]);

  // Function to fetch user's chats
  const fetchUserChats = async (userId) => {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );
      
      const querySnapshot = await getDocs(chatsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate?.() || new Date()
      }));
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  };

  // Function to handle starting chat with a provider
  const handleStartChat = (providerId, providerName, providerEmail) => {
    // Get user ID safely
    const userId = userData.id || userData.uid;
    
    navigate(`/nafany/chat/${providerId}`, {
      state: {
        provider: {
          id: providerId,
          name: providerName,
          email: providerEmail || 'provider@example.com',
        },
        user: {
          id: userId,
          name: userData.name,
          email: userData.email,
          profileImage: userData.profileImage
        }
      }
    });
  };

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
      image: "/nafany/electric.jpg",
      bgColor: "bg-gradient-to-br from-[#2f4156] to-[#425b7c]"
    },
    {
      title: "خدمات صحية",
      description: "مستشفيات، عيادات، صيدليات، مراكز طبية",
      image: "/nafany/medicin.jpg",
      bgColor: "bg-gradient-to-br from-[#567c8d] to-[#78a2b4]"
    },
    {
      title: "خدمات عامة",
      description: "سوبر ماركت، مطاعم، كافيهات، مولات، خدمات تجارية",
      image: "/nafany/download.png",
      bgColor: "bg-gradient-to-br from-[#808080] to-[#a6a6a6]"
    },
    {
      title: "خدمات أخرى",
      description: "عطار، جزار، فكهاني، خضري، محل ألبان، خدمات متفرقة",
      image: "/nafany/download (1).png",
      bgColor: "bg-gradient-to-br from-[#62a2d3] to-[#89c4f0]"
    }
  ];

  const offers = [
    {
      title: "عرض الصيانة",
      description: "خصم خاص على خدمات الصيانة المنزلية الشاملة بما في ذلك السباكة والكهرباء والتنظيف",
      discount: 20
    },
    {
      title: "عرض التركيبات",
      description: "أسعار مخفضة للتركيبات الفنية المتكاملة مع ضمان الجودة والاحترافية",
      discount: 25
    },
    {
      title: "العروض الموسمية",
      description: "خصومات خاصة على الخدمات المنزلية المتنوعة خلال المواسم والمناسبات",
      discount: 15
    }
  ];

  // Chat section component with enhanced design
  const renderChatsSection = () => {
    if (!isLoggedIn) return null;
    
    return (
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Decorative Elements */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
          
          <motion.h2 
            className="text-2xl font-bold text-cyan-800 mb-6 relative z-10 flex items-center"
            variants={itemVariants}
          >
            <span className="bg-cyan-700 text-white p-1 mr-2 rounded-lg ml-2">
              <FaCommentDots />
            </span>
            محادثاتك مع مقدمي الخدمة
          </motion.h2>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-cyan-800 flex items-center">
              <span className="bg-cyan-700 text-white p-1 mr-2 rounded-lg ml-2 text-sm">
                <FaCommentDots />
              </span>
              آخر المحادثات
            </h3>
            <motion.button
              onClick={() => setShowChats(!showChats)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-cyan-700 hover:text-cyan-900 flex items-center text-sm font-medium"
            >
              {showChats ? 'إخفاء المحادثات' : 'عرض المحادثات'}
              <span className="mr-1">
                {showChats ? <FaArrowUp /> : <FaArrowDown />}
              </span>
            </motion.button>
          </div>
          
          <AnimatePresence>
            {showChats && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 max-h-[300px] overflow-y-auto"
              >
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      userData={userData}
                      handleStartChat={handleStartChat}
                    />
                  ))
                ) : (
                  <motion.div 
                    className="bg-white rounded-xl p-6 text-center"
                    variants={itemVariants}
                  >
                    <p className="text-gray-500">لا توجد محادثات حتى الآن</p>
                    <p className="text-cyan-600 mt-2 font-medium">ابحث عن مقدم خدمة للتواصل معه</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-50 to-blue-100">
        <motion.div 
          className="bg-white p-8 rounded-full shadow-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: [0, 360] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
          <div className="text-2xl text-cyan-800 font-bold">جاري التحميل...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} userData={userData} />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-6 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500 opacity-10 rounded-full"></div>
          <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-500 opacity-10 rounded-full"></div>
          
          <motion.h1 
            className="text-4xl font-bold text-center text-cyan-800 mb-4 relative z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {'مرحبًا بك في نفعني'}
          </motion.h1>
          
          <motion.p
            className="text-center text-cyan-600 text-lg mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            المنصة الأولى للخدمات المنزلية والمهنية
          </motion.p>
        </motion.div>

        {/* Services Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.h2 
            className="text-2xl font-bold text-center text-cyan-800 mb-6 flex items-center justify-center"
            variants={itemVariants}
          >
            <span className="bg-cyan-700 text-white p-1 mr-2 rounded-lg ml-2">
              <FaStar />
            </span>
            خدماتنا المميزة
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {serviceCards.map((card, index) => (
              <ServiceCard key={index} {...card} />
            ))}
          </motion.div>
        </motion.div>

        {/* Chats Section - Only shown for logged in users */}
        {renderChatsSection()}

        {/* Offers Section with enhanced design */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div
            className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Decorative Elements */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
            <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
            
            <motion.h2 
              className="text-2xl font-bold text-center text-cyan-800 mb-6 relative z-10 flex items-center justify-center"
              variants={itemVariants}
            >
              <span className="bg-cyan-700 text-white mr-2 p-1 rounded-lg ml-2">
                <FaStar />
              </span>
              العروض والتخفيضات الحالية
            </motion.h2>
            
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;