import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import ChatsList from './chatList';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
} from 'firebase/firestore';
import { 
  FaStar, 
  FaRegStar, 
  FaEdit, 
  FaTrash, 
  FaUserCircle, 
  FaArrowRight, 
  FaArrowUp,
  FaPlus, 
  FaImage, 
  FaRegCalendarAlt, 
  FaClock, 
  FaCommentDots,
  FaArrowLeft,
  FaArrowDown,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import Header from './Header';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  hover: {
    scale: 1.03,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 }
};

const ProviderPortfolio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [works, setWorks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [hasMoreBookings, setHasMoreBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('works'); // 'works', 'bookings', 'ratings'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedWorkId, setExpandedWorkId] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [showChats, setShowChats] = useState(false);

  const [newWork, setNewWork] = useState({
    title: '',
    description: '',
    images: [],
    previewImages: []
  });

   const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/nafany');
  };

  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editWorkData, setEditWorkData] = useState({
    title: '',
    description: '',
    images: [],
    previewImages: []
  });

  const [providersData, setProvidersData] = useState({
    allProviders: [],
    currentProvider: null,
    totalProviders: 0
  });

  useEffect(() => {
    const abortController = new AbortController();
    
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');

        if (storedUser && storedUser !== '""') {
         
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
           setIsLoggedIn(true);
           console.log('User found in localStorage:', isLoggedIn);

          
          // تحميل البيانات الأساسية أولاً
          await fetchProviderWorks(parsedUser.email);
          setLoading(false);
          
          // تحميل البيانات الأخرى في الخلفية
          fetchAllProviders(parsedUser.email).then(providersData => {
            if (providersData) setProvidersData(providersData);
          });
        } else {
          navigate('/nafany/login');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
          setLoading(false);
        }
      }
    };
    
    checkUser();
    
    return () => abortController.abort();
  }, [navigate, location, bookingsPage]);
   console.log('User found in localStorage:', isLoggedIn);

  const fetchAllProviders = async (currentProviderEmail) => {
  try {
    const providersQuery = query(collection(db, 'serviceProviders'));
    const providersSnapshot = await getDocs(providersQuery);

    const providersData = providersSnapshot.docs.map(doc => {
      const provider = doc.data();
      const providerReviews = provider.reviews || [];
      
      // حساب التقييمات
      const ratingsCount = providerReviews.length;
      const ratingsTotal = providerReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = ratingsCount > 0 ? (ratingsTotal / ratingsCount) : 0;

      return {
        id: doc.id,
        ...provider,
        ratingsCount,
        ratingsTotal,
        averageRating: Number(averageRating.toFixed(1)) // تحويل إلى رقم مع منزلة عشرية واحدة
      };
    });

    // ترتيب المقدمين تنازلياً حسب متوسط التقييم
    providersData.sort((a, b) => {
      // إذا كان التقييم متساوي، نرتب حسب عدد التقييمات (الأكثر أولاً)
      if (b.averageRating === a.averageRating) {
        return b.ratingsCount - a.ratingsCount;
      }
      return b.averageRating - a.averageRating;
    });

    // إيجاد ترتيب المقدم الحالي
    const currentProvider = providersData.find(p => p.email === currentProviderEmail);
    const currentRank = providersData.findIndex(p => p.email === currentProviderEmail) + 1;

    return {
      allProviders: providersData,
      currentProvider,
      currentRank, // إضافة ترتيب المقدم الحالي
      totalProviders: providersData.length
    };
  } catch (error) {
    console.error('Error fetching providers:', error);
    return null;
  }
};

  const fetchProviderWorks = async (email) => {
    try {
      const q = query(collection(db, 'serviceProviders'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const providerDoc = querySnapshot.docs[0];
        const providerData = providerDoc.data();
        
        // استخراج الأعمال والتقييمات
        const fetchedWorks = providerData.works || [];
        const fetchedReviews = providerData.reviews || [];
        
        // إضافة رقم تعريفي لكل عمل وتقييم إذا لم يكن موجوداً
        const worksWithIds = fetchedWorks.map((work, index) => ({
          id: work.id || `work-${index}-${Date.now()}`,
          ...work
        }));
        
        const reviewsWithIds = fetchedReviews.map((review, index) => ({
          id: review.id || `review-${index}-${Date.now()}`,
          ...review
        }));
        
        setWorks(worksWithIds);
        setReviews(reviewsWithIds);
        setBookings(providerData.bookings || []);
        
        return worksWithIds;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching works:', error);
      return [];
    }
  };
    
  const handleStartChat = (clientId, clientName, clientEmail) => {
    const providerId = userData.id || userData.uid;
    
    navigate(`/nafany/chat/${clientId}`, {
      state: {
        provider: {
          id: providerId,
          name: userData.name,
          email: userData.email,
          profileImage: userData.profileImage
        },
        user: {
          id: clientId,
          name: clientName,
          email: clientEmail || 'client@example.com'
        }
      }
    });
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      // 1. الحصول على بيانات مقدم الخدمة
      const providersQuery = query(collection(db, 'serviceProviders'), where('email', '==', userData.email));
      const providersSnapshot = await getDocs(providersQuery);
      
      if (providersSnapshot.empty) {
        console.error('Provider not found');
        return;
      }
      
      const providerDoc = providersSnapshot.docs[0];
      const providerRef = doc(db, 'serviceProviders', providerDoc.id);
      const providerData = providerDoc.data();
      
      // 2. تحديث الحجز المطلوب في مصفوفة الحجوزات
      const updatedBookings = providerData.bookings.map(booking => {
        if (booking.id === bookingId) {
          return {
            ...booking,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return booking;
      });
      
      // 3. تحديث المستند في Firestore
      await updateDoc(providerRef, {
        bookings: updatedBookings
      });
      
      // 4. تحديث الحالة المحلية
      setBookings(updatedBookings);
      
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleImageUpload = async (files, isEditing = false) => {
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const reader = new FileReader();
        
        // استخدام وعد لتحويل عملية قراءة الملف إلى وعد يمكن انتظاره
        const readFileAsDataURL = () => {
          return new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
          });
        };
        
        const base64Image = await readFileAsDataURL();
        uploadedUrls.push(base64Image);
      }
      
      if (isEditing) {
        setEditWorkData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
          previewImages: [...prev.previewImages, ...uploadedUrls]
        }));
      } else {
        setNewWork(prev => ({
          ...prev,
          images: uploadedUrls,
          previewImages: uploadedUrls
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const handleAddWork = async (e) => {
    e.preventDefault();
    if (!userData) return;
  
    try {
      // البحث عن وثيقة مقدم الخدمة
      const providersQuery = query(collection(db, 'serviceProviders'), where('email', '==', userData.email));
      const providersSnapshot = await getDocs(providersQuery);
      
      if (providersSnapshot.empty) {
        console.error('Provider not found');
        return;
      }
      
      const providerDoc = providersSnapshot.docs[0];
      const providerRef = doc(db, 'serviceProviders', providerDoc.id);
      const providerData = providerDoc.data();
      
      // إنشاء بيانات العمل الجديد
      const workData = {
        id: `work-${Date.now()}`,
        title: newWork.title,
        description: newWork.description,
        images: newWork.images,
        createdAt: new Date(),
        comments: [],
        ratings: []
      };
      
      // إضافة العمل الجديد إلى مصفوفة الأعمال الحالية
      const updatedWorks = [...(providerData.works || []), workData];
      
      // تحديث وثيقة مقدم الخدمة
      await updateDoc(providerRef, {
        works: updatedWorks,
        worksCount: updatedWorks.length
      });
      
      // تحديث واجهة المستخدم
      await fetchProviderWorks(userData.email);
      setNewWork({ title: '', description: '', images: [], previewImages: [] });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding work:', error);
    }
  };

  const handleEditWork = (work) => {
    setEditingWorkId(work.id);
    setEditWorkData({
      title: work.title,
      description: work.description,
      images: work.images,
      previewImages: work.images
    });
    setIsFormOpen(true);
  };

  const handleUpdateWork = async (e) => {
    e.preventDefault();
    try {
      // البحث عن وثيقة مقدم الخدمة
      const providersQuery = query(collection(db, 'serviceProviders'), where('email', '==', userData.email));
      const providersSnapshot = await getDocs(providersQuery);
      
      if (providersSnapshot.empty) {
        console.error('Provider not found');
        return;
      }
      
      const providerDoc = providersSnapshot.docs[0];
      const providerRef = doc(db, 'serviceProviders', providerDoc.id);
      const providerData = providerDoc.data();
      
      // تحديث العمل المطلوب في مصفوفة الأعمال
      const updatedWorks = (providerData.works || []).map(work => {
        if (work.id === editingWorkId) {
          return {
            ...work,
            title: editWorkData.title,
            description: editWorkData.description,
            images: editWorkData.images,
          };
        }
        return work;
      });
      
      // تحديث وثيقة مقدم الخدمة
      await updateDoc(providerRef, {
        works: updatedWorks
      });
      
      // تحديث واجهة المستخدم
      await fetchProviderWorks(userData.email);
      setEditingWorkId(null);
      setEditWorkData({ title: '', description: '', images: [], previewImages: [] });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating work:', error);
    }
  };

  const handleDeleteWork = async (workId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العمل؟')) {
      try {
        // البحث عن وثيقة مقدم الخدمة
        const providersQuery = query(collection(db, 'serviceProviders'), where('email', '==', userData.email));
        const providersSnapshot = await getDocs(providersQuery);
        
        if (providersSnapshot.empty) {
          console.error('Provider not found');
          return;
        }
        
        const providerDoc = providersSnapshot.docs[0];
        const providerRef = doc(db, 'serviceProviders', providerDoc.id);
        const providerData = providerDoc.data();
        
        // حذف العمل من مصفوفة الأعمال
        const updatedWorks = (providerData.works || []).filter(work => work.id !== workId);
        
        // تحديث وثيقة مقدم الخدمة
        await updateDoc(providerRef, {
          works: updatedWorks,
          worksCount: updatedWorks.length
        });
        
        // تحديث واجهة المستخدم
        await fetchProviderWorks(userData.email);
      } catch (error) {
        console.error('Error deleting work:', error);
      }
    }
  };

  const renderRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>
        {i < rating ? <FaStar /> : <FaRegStar />}
      </span>
    ));
  };

  const renderRatingStats = () => {
    if (!userData) return null;

    // حساب متوسط التقييم من التقييمات المحفوظة
    const ratingsTotal = Number(reviews.reduce((sum, review) => sum + (review.rating || 0), 0));
    const ratingsCount = Number(reviews.length);
    const averageRating = ratingsCount > 0 ? (ratingsTotal / ratingsCount).toFixed(1) : 0;
    console.log('Average Rating:', averageRating , 'Count:', ratingsCount , 'Total:', ratingsTotal);
    // حساب الترتيب (إذا كان لديك بيانات جميع المقدمين)
    const currentRank = providersData.allProviders.findIndex(
      p => p.email === userData.email
    ) + 1;

    return (
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
          <span className="bg-cyan-700 text-white p-2 rounded-lg mr-2">
            <FaStar />
          </span>
          تصنيفك وتقييمك
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <motion.div 
            className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl text-center relative overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg"
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.2,
              ease: "easeOut"
            }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute -right-6 -top-6 w-12 h-12 bg-cyan-200 rounded-full"></div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="text-5xl font-bold text-cyan-600 mb-3"
            >
              {averageRating}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex justify-center mb-3 text-xl"
            >
              {renderRatingStars(Math.floor(averageRating))}
            </motion.div>
            <p className="text-gray-700 font-medium">متوسط التقييم</p>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center relative overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg"
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.6,
              ease: "easeOut"
            }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute -right-6 -top-6 w-12 h-12 bg-blue-200 rounded-full"></div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="text-5xl font-bold text-blue-600 mb-3"
            >
              {ratingsCount}
            </motion.div>
            <p className="text-gray-700 font-medium">عدد التقييمات</p>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center relative overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg"
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 1.0,
              ease: "easeOut"
            }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute -right-6 -top-6 w-12 h-12 bg-purple-200 rounded-full"></div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="text-5xl font-bold text-purple-600 mb-3"
            >
              {providersData.currentRank || 
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ...
                </motion.span>
              }
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.3 }}
              className="text-gray-700 font-medium"
            >
              {providersData.currentRank ? 
                `من أصل ${providersData.totalProviders} مقدم خدمة` : 
                'جاري الحساب...'}
            </motion.p>
            {providersData.currentProvider?.averageRating && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.4 }}
                className="text-sm text-purple-500 mt-1"
              >
                (متوسط التقييم: {providersData.currentProvider.averageRating})
              </motion.p>
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-8"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-cyan-800 flex items-center">
              <span className="bg-cyan-700 text-white p-1 rounded-lg mr-2 text-sm">
                <FaCommentDots />
              </span>
              أحدث التعليقات
            </h3>
            <motion.button
              onClick={() => setShowReviews(!showReviews)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-cyan-700 hover:text-cyan-900 flex items-center text-sm font-medium"
            >
              {showReviews ? 'إخفاء التعليقات' : 'عرض التعليقات'}
              <span className="mr-1">
                {showReviews ? <FaArrowUp /> : <FaArrowDown />}  
              </span>
            </motion.button>
          </div>
          
          <AnimatePresence>
            {showReviews && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 max-h-[300px] overflow-y-auto pr-2"
              >
                {reviews.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {reviews.map((review, index) => (
                      <motion.div 
                        key={review.id || `review_${index}`} 
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-cyan-800 flex items-center">
                            <FaUserCircle className="mr-2 text-cyan-600" />
                            {review.clientName}
                          </span>
                          <div className="flex text-lg">
                            {renderRatingStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.review}</p>
                        <div className="text-xs text-gray-500 mt-2 flex items-center">
                          <FaRegCalendarAlt className="mr-1" />
                          {new Date(review.createdAt).toLocaleDateString('ar-EG') || 'تاريخ غير معروف'}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.p 
                    className="text-center text-gray-500 py-4"
                    variants={itemVariants}
                  >
                    لا توجد تعليقات بعد
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      <motion.div className="mt-8" variants={itemVariants}>
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-semibold text-cyan-800 flex items-center">
      <span className="bg-cyan-700 text-white p-1 rounded-lg mr-2 text-sm">
        <FaCommentDots />
      </span>
      المحادثات الحديثة
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
      >
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <ChatsList 
            userId={userData.id || userData.uid} 
            onChatSelect={handleStartChat} 
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>

      </motion.div>
    );
  };

  const renderWorkCards = () => {
    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {works.map((work, index) => (
          <motion.div 
            key={work.id}
            layoutId={`work-card-${work.id}`}
            variants={cardVariants}
            whileHover="hover"
            className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
              expandedWorkId === work.id ? 'md:col-span-2' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-cyan-800 flex items-center">
                  {work.title}
                </h3>
                <div className="flex space-x-2">
                  <motion.button 
                    onClick={() => handleEditWork(work)}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    title="تعديل"
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button 
                    onClick={() => handleDeleteWork(work.id)}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                    title="حذف"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </div>
              
              <motion.p 
                className={`text-gray-600 mt-2 ${
                  expandedWorkId === work.id ? '' : 'line-clamp-2'
                }`}
              >
                {work.description}
              </motion.p>
              
              <motion.button
                onClick={() => setExpandedWorkId(expandedWorkId === work.id ? null : work.id)}
                className="text-cyan-600 hover:text-cyan-800 mt-2 flex items-center text-sm font-medium"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {expandedWorkId === work.id ? 'عرض أقل' : 'عرض المزيد'}
                <span className="mr-1">
                  {expandedWorkId === work.id ? <FaArrowUp /> : <FaArrowDown />}
                </span>
              </motion.button>
            </div>
            
            <AnimatePresence>
              {(expandedWorkId === work.id || work.images.length <= 3) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {work.images.map((img, imgIndex) => (
                      <motion.div 
                        key={imgIndex} 
                        className="rounded-xl overflow-hidden aspect-square shadow-md"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: imgIndex * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img 
                          src={img} 
                          alt={`Work ${imgIndex + 1}`}
                          className="w-full h-full object-cover" 
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderWorkForm = () => {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {/* Decorative Elements */}
        <div className="absolute -left-16 -top-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
        <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
        
        <h2 className="text-2xl font-bold text-cyan-800 mb-6 relative z-10 flex items-center">
         <span className="bg-cyan-700 text-white p-2 rounded-lg mr-2">
  {editingWorkId ? <FaEdit /> : <FaPlus />}
</span>
{editingWorkId ? 'تعديل العمل' : 'إضافة عمل جديد'}
</h2>

<form onSubmit={editingWorkId ? handleUpdateWork : handleAddWork} className="relative z-10">
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
      عنوان العمل
    </label>
    <input
      type="text"
      id="title"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
      placeholder="أدخل عنوان العمل"
      value={editingWorkId ? editWorkData.title : newWork.title}
      onChange={(e) => 
        editingWorkId 
          ? setEditWorkData({...editWorkData, title: e.target.value}) 
          : setNewWork({...newWork, title: e.target.value})
      }
      required
    />
  </div>

  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
      وصف العمل
    </label>
    <textarea
      id="description"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[100px]"
      placeholder="أدخل وصف العمل"
      value={editingWorkId ? editWorkData.description : newWork.description}
      onChange={(e) => 
        editingWorkId 
          ? setEditWorkData({...editWorkData, description: e.target.value}) 
          : setNewWork({...newWork, description: e.target.value})
      }
      required
    />
  </div>

  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-bold mb-2">
      صور العمل
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      <input
        type="file"
        id="images"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e.target.files, editingWorkId ? true : false)}
      />
      <label htmlFor="images" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center">
          <FaImage className="text-gray-400 text-4xl mb-2" />
          <p className="text-gray-500">انقر لاختيار الصور أو اسحبها هنا</p>
        </div>
      </label>
    </div>

    {/* Preview Images */}
    {(editingWorkId ? editWorkData.previewImages : newWork.previewImages).length > 0 && (
      <div className="mt-4 grid grid-cols-3 gap-4">
        {(editingWorkId ? editWorkData.previewImages : newWork.previewImages).map((img, index) => (
          <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
            <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              onClick={() => {
                if (editingWorkId) {
                  const newImages = [...editWorkData.previewImages];
                  newImages.splice(index, 1);
                  setEditWorkData({
                    ...editWorkData,
                    images: newImages,
                    previewImages: newImages
                  });
                } else {
                  const newImages = [...newWork.previewImages];
                  newImages.splice(index, 1);
                  setNewWork({
                    ...newWork,
                    images: newImages,
                    previewImages: newImages
                  });
                }
              }}
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="flex justify-end space-x-2">
    <motion.button
      type="button"
      onClick={() => {
        setIsFormOpen(false);
        setEditingWorkId(null);
        setEditWorkData({ title: '', description: '', images: [], previewImages: [] });
        setNewWork({ title: '', description: '', images: [], previewImages: [] });
      }}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 mr-2"
    >
      إلغاء
    </motion.button>
    <motion.button
      type="submit"
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-300"
    >
      {editingWorkId ? 'تحديث العمل' : 'إضافة العمل'}
    </motion.button>
  </div>
</form>
</motion.div>
    );
  };

  const renderBookings = () => {
    return (
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <motion.div 
              key={booking.id || `booking-${index}`}
              layoutId={`booking-card-${booking.id}`}
              variants={cardVariants}
              whileHover="hover"
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                expandedBookingId === booking.id ? 'border-2 border-cyan-400' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start">
                  <h3 className="text-xl font-bold text-cyan-800 mb-2 flex items-center">
                    {booking.profession || 'خدمة غير محددة'}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      booking.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {booking.status === 'pending' ? 'قيد الانتظار' : 
                     booking.status === 'approved' ? 'تمت الموافقة' : 
                     booking.status === 'completed' ? 'مكتمل' : 
                     booking.status === 'cancelled' ? 'ملغي' : 
                     'غير معروف'}
                  </div>
                </div>
                
                <div className="flex flex-wrap text-gray-600 mt-2">
                  <div className="flex items-center mr-4 mb-2">
                    <FaUserCircle className="text-cyan-600 mr-1" />
                    <span>{booking.clientName || 'عميل غير معروف'}</span>
                  </div>
                  <div className="flex items-center mr-4 mb-2">
                    <FaRegCalendarAlt className="text-cyan-600 mr-1" />
                    <span>{
                      booking.bookingDate || 
                      'تاريخ غير محدد'
                    }</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <FaClock className="text-cyan-600 mr-1" />
                    <span>{booking.bookingTime || 'وقت غير محدد'}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <motion.button
                    onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                    className="text-cyan-600 hover:text-cyan-800 flex items-center text-sm font-medium"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {expandedBookingId === booking.id ? 'عرض أقل' : 'عرض المزيد'}
                    <span className="mr-1">
                      {expandedBookingId === booking.id ? <FaArrowUp /> : <FaArrowDown />}
                    </span>
                  </motion.button>
                </div>
              </div>
              
              <AnimatePresence>
                {expandedBookingId === booking.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 border-t border-gray-100 pt-4"
                  >
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">تفاصيل الحجز:</h4>
                      <p className="text-gray-600">{booking.note || 'لا توجد تفاصيل إضافية'}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="flex items-center space-x-2 mb-2">
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => handleStartChat(booking.clientId, booking.clientName, booking.clientEmail)}
                          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                        >
                          <FaCommentDots className="ml-1" />
                          محادثة مع العميل
                        </motion.button>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'approved')}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 mr-2"
                          >
                            <FaCheck className="ml-1" />
                            قبول
                          </motion.button>
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                          >
                            <FaTimes className="ml-1" />
                            رفض
                          </motion.button>
                        </div>
                      )}
                      
                      {booking.status === 'approved' && (
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                        >
                          <FaCheck className="ml-1" />
                          تحديث كمكتمل
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="text-center py-8"
            variants={itemVariants}
          >
            <FaRegCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد حجوزات</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              لم يتم العثور على أي حجوزات حالية. عندما يقوم العملاء بحجز خدماتك ستظهر هنا.
            </p>
          </motion.div>
        )}
        
       
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
    <div className="min-h-screen bg-gray-50 rtl">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} userData={userData}  />

      <main className="container mx-auto p-4 pb-20">
        {/* Profile Header */}
        <motion.div 
          className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white mb-6 shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-10 transform skew-x-12"></div>
          <div className="absolute left-0 bottom-0 h-24 w-24 bg-white opacity-10 rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              {userData?.profileImage ? (
                <img 
                  src={userData.profileImage} 
                  alt={userData.name} 
                  className="w-20 mr-4 h-20 rounded-full border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white text-cyan-700 flex items-center justify-center text-4xl">
                  <FaUserCircle />
                </div>
              )}
              <div className="mr-4">
                <h1 className="text-2xl md:text-3xl font-bold">{userData?.name || 'مقدم خدمة'}</h1>
                <p className="opacity-80">{userData?.email || 'لا يوجد بريد إلكتروني'}</p>
              </div>
            </div>
            
            <motion.button
              onClick={() => navigate('/nafany/settings')}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="bg-white text-cyan-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors duration-300 flex items-center"
            >
              <FaEdit className="ml-2" />
              تعديل الملف الشخصي
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics */}
        {renderRatingStats()}

        {/* Tabs */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex space-x-4 rtl:space-x-reverse mb-4 md:mb-0">
              <motion.button 
                onClick={() => setActiveTab('works')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'works' 
                    ? 'bg-cyan-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                أعمالي
              </motion.button>
              <motion.button 
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'bookings' 
                    ? 'bg-cyan-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                الحجوزات
              </motion.button>
            </div>
            
            {activeTab === 'works' && (
              <motion.button 
                onClick={() => {
                  setEditingWorkId(null);
                  setEditWorkData({ title: '', description: '', images: [], previewImages: [] });
                  setIsFormOpen(!isFormOpen);
                }}
                className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isFormOpen ? (
                  <>
                    <FaTimes className="ml-2" />
                    إلغاء
                  </>
                ) : (
                  <>
                    <FaPlus className="ml-2" />
                    إضافة عمل جديد
                  </>
                )}
              </motion.button>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {isFormOpen && activeTab === 'works' && renderWorkForm()}
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            {activeTab === 'works' ? (
              <motion.div
                key="works"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {works.length > 0 ? (
                  renderWorkCards()
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants}>
                      <FaImage className="text-5xl text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد أعمال بعد</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        أضف أعمالك لعرضها للعملاء المحتملين وزيادة فرصك في الحصول على المزيد من الحجوزات.
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="bookings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderBookings()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default ProviderPortfolio;