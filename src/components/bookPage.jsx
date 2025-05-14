import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { 
  FaStar, 
  FaRegStar, 
  FaCalendarAlt, 
  FaComments, 
  FaCheckCircle, 
  FaTimesCircle,
  FaArrowLeft,
  FaUserCircle,
  FaRegCalendarAlt,
  FaArrowDown,
  FaArrowUp,
  FaCommentDots
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ModalImage from "react-modal-image";

const ProviderDetailsPage = () => {
  const { providerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [providerData, setProviderData] = useState(null);
  const [works, setWorks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [bookingNote, setBookingNote] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('works');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [allowChat, setAllowChat] = useState(false);
  // New state variables for expanded features
  const [showReviews, setShowReviews] = useState(false);
  const [expandedWorkId, setExpandedWorkId] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const cardVariants = {
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let provider;

        if (location.state && location.state.provider && location.state.bool) {
          provider = location.state.provider;
          setAllowChat(location.state.bool);
        } else {
          const providerDoc = await getDoc(doc(db, 'serviceProviders', providerId));
          if (providerDoc.exists()) {
            provider = { id: providerDoc.id, ...providerDoc.data() };
          } else {
            throw new Error('مقدم الخدمة غير موجود');
          }
        }

        setProviderData(provider);
        setWorks(provider.works || []);
        
        // جلب التقييمات من بيانات مقدم الخدمة مباشرة
        setReviews(provider.reviews || []);

        const storedUser = localStorage.getItem('currentUser');
        if (storedUser && storedUser !== '""') {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching provider data:', error);
        setErrorMessage('حدث خطأ أثناء تحميل البيانات');
        setLoading(false);
      }
    };

    fetchData();
  }, [providerId, location]);

  const calculateAverageRating = () => {
    if (!providerData?.reviews || providerData.reviews.length === 0) return 0;
    const totalRating = providerData.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / providerData.reviews.length).toFixed(1);
  };

  const checkAppointmentAvailability = async (date, time) => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('providerEmail', '==', providerData.email),
        where('bookingDate', '==', date),
        where('bookingTime', '==', time),
        where('status', 'in', ['pending', 'confirmed'])
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking appointment availability:', error);
      return false;
    }
  };

  const handleBooking = async () => {
    if (!userData) {
      setErrorMessage('يرجى تسجيل الدخول أولاً للحجز');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setErrorMessage('يرجى اختيار التاريخ والوقت للحجز');
      return;
    }

    try {
      // تحويل التاريخ إلى تنسيق مناسب مع المنطقة الزمنية
      const formattedDate = selectedDate.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // تنسيق التاريخ للتخزين في Firebase (بدون مشاكل المنطقة الزمنية)
      const dateForFirestore = selectedDate.toISOString().split('T')[0];
      
      setIsCheckingAvailability(true);
      const isAvailable = await checkAppointmentAvailability(dateForFirestore, selectedTime);
      setIsCheckingAvailability(false);
      
      if (!isAvailable) {
        setBookingResult({
          success: false,
          message: 'هذا الموعد محجوز بالفعل، يرجى اختيار وقت آخر'
        });
        setShowResultModal(true);
        return;
      }

      const bookingData = {
        id: `booking-${Date.now()}`, // إضافة معرف فريد
        providerEmail: providerData.email,
        providerName: providerData.name,
        clientEmail: userData.email,
        clientName: userData.name,
        bookingDate: dateForFirestore,
        bookingTime: selectedTime,
        note: bookingNote,
        status: 'pending',
        createdAt: new Date().toISOString(),
        clientId: userData.uid,
        profession: providerData.profession || 'غير محدد',
      };

      // تحديث وثيقة مقدم الخدمة مباشرةً
      const providerRef = doc(db, 'serviceProviders', providerId);
      
      await updateDoc(providerRef, {
        bookings: arrayUnion(bookingData)
      });

      // يمكنك أيضاً تحديث وثيقة المستخدم إذا لزم الأمر
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        bookings: arrayUnion({
          ...bookingData,
          providerId: providerId
        })
      });

      setBookingResult({
        success: true,
        message: `تم الحجز بنجاح مع ${providerData.name} في ${formattedDate} الساعة ${selectedTime}`
      });
      setShowResultModal(true);
      
      setShowBookingModal(false);
      setBookingNote('');
      setSelectedDate(null);
      setSelectedTime('');
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      setBookingResult({
        success: false,
        message: 'حدث خطأ أثناء إجراء الحجز، يرجى المحاولة مرة أخرى'
      });
      setShowResultModal(true);
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!userData) {
      setErrorMessage('يرجى تسجيل الدخول أولاً لإضافة تقييم');
      return;
    }

    if (rating === 0) {
      setErrorMessage('يرجى تحديد التقييم النجمي');
      return;
    }

    try {
      setIsSubmittingReview(true);
      
      const newReview = {
        id: Date.now().toString(),
        providerEmail: providerData.email,
        providerName: providerData.name,
        clientEmail: userData.email,
        clientName: userData.name,
        rating: rating,
        review: reviewText,
        createdAt: new Date().toISOString()
      };

      const providerRef = doc(db, 'serviceProviders', providerId);
      
      await updateDoc(providerRef, {
        reviews: arrayUnion(newReview),
        ratingsCount: increment(1),
        ratingsTotal: increment(rating)
      });

      // تحديث الحالة المحلية مباشرة
      setReviews([...reviews, newReview]);
      setProviderData({
        ...providerData,
        reviews: [...reviews, newReview],
        ratingsCount: (providerData.ratingsCount || 0) + 1,
        ratingsTotal: (providerData.ratingsTotal || 0) + rating
      });

      setRating(0);
      setReviewText('');
      setSuccessMessage('تم إضافة تقييمك بنجاح!');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorMessage('حدث خطأ أثناء إرسال التقييم');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOpenBookingModal = () => {
    if (!userData) {
      setErrorMessage('يرجى تسجيل الدخول أولاً للحجز');
      return;
    }

    const defaultTimes = [
      '9:00 صباحاً',
      '10:00 صباحاً',
      '11:00 صباحاً',
      '12:00 ظهراً',
      '1:00 مساءً',
      '2:00 مساءً',
      '3:00 مساءً',
      '4:00 مساءً',
      '5:00 مساءً',
      '6:00 مساءً',
      '7:00 مساءً'
    ];
    
    setAvailableTimes(defaultTimes);
    setShowBookingModal(true);
  };

  // تأكد من أنك تمرر البيانات بشكل صحيح
  const handleStartChat = () => {
    if (!userData || !providerData) return;

    // توحيد المعرفات
    const userId = userData.uid || userData.id;
    const providerId = providerData.id || providerData.uid;

    navigate(`/nafany/chat/${providerId}`, {
      state: {
        provider: {
          id: providerId,
          email: providerData.email,
          name: providerData.name,
          profileImage: providerData.profileImage || '/default-profile.png'
        },
        user: {
          id: userId,
          email: userData.email,
          name: userData.name,
          profileImage: userData.profileImage || '/default-profile.png'
        }
      }
    });
  };

  const renderRatingStars = (current, onClickFn = null, onHoverFn = null, size = "") => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span 
        key={star} 
        onClick={onClickFn ? () => onClickFn(star) : undefined}
        onMouseEnter={onHoverFn ? () => onHoverFn(star) : undefined}
        onMouseLeave={onHoverFn ? () => onHoverFn(0) : undefined}
        className={`cursor-pointer ${size === "lg" ? "text-2xl" : "text-xl"}`}
        style={{ color: star <= current ? '#FFD700' : '#C0C0C0' }}
      >
        {star <= current ? <FaStar /> : <FaRegStar />}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-cyan-100 to-blue-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center"
        >
          <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-800 text-xl font-semibold">جاري تحميل البيانات...</p>
        </motion.div>
      </div>
    );
  }

  if (!providerData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-cyan-100 to-blue-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
        >
          <div className="text-red-500 text-5xl mb-4">
            <FaTimesCircle className="mx-auto" />
          </div>
          <p className="text-red-600 text-xl font-semibold mb-4">لم يتم العثور على مقدم الخدمة</p>
          <p className="text-gray-600 mb-6">يرجى التحقق من الرابط والمحاولة مرة أخرى.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="bg-cyan-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-cyan-700 transition-colors"
          >
            العودة للصفحة السابقة
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-100 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center mb-6 bg-white hover:bg-gray-50 px-5 py-3 rounded-xl shadow-md transition-all"
        >
          <FaArrowLeft className="ml-2" />
          <span className="font-medium">رجوع</span>
        </motion.button>
        
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-md mb-6 flex items-center"
          >
            <FaCheckCircle className="text-green-500 text-xl ml-3" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-md mb-6 flex items-center"
          >
            <FaTimesCircle className="text-red-500 text-xl ml-3" />
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}

        <motion.div
          className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Decorative Elements */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start relative z-10">
            <motion.div 
              className="w-40 h-40 rounded-full border-4 border-white overflow-hidden mb-6 md:mb-0 md:ml-8 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={providerData.profileImage || '../../public/IMG-20250322-WA0070.jpg'} 
                alt={providerData.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = '../../public/IMG-20250322-WA0070.jpg'
                }}
              />
            </motion.div>
            
            <div className="flex-1 text-center md:text-right">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl font-bold text-cyan-800 mb-3"
              >
                {providerData.name}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap items-center justify-center md:justify-end gap-2 mb-3"
              >
                <span className="bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  {providerData.profession || providerData.category}
                </span>
                <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  {providerData.governorate || 'غير محدد المنطقة'}
                </span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center justify-center md:justify-end mb-5"
              >
                <div className="flex items-center bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 py-2 rounded-xl shadow-sm">
                  {renderRatingStars(Math.round(calculateAverageRating()))}
                  <span className="mx-2 text-yellow-600 font-bold">
                    {calculateAverageRating()}
                  </span>
                  <span className="text-gray-600">
                    ({reviews.length} تقييم)
                  </span>
                </div>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-gray-600 mb-6 max-w-2xl mx-auto md:mr-0"
              >
                {providerData.bio || 'لا يوجد وصف لمقدم الخدمة'}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-wrap justify-center md:justify-end gap-4"
              >
                {allowChat && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenBookingModal}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl shadow-md flex items-center text-lg transition-all duration-300"
                  >
                    <FaCalendarAlt className="ml-2" />
                    احجز موعد
                  </motion.button>
                )}
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartChat}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-md flex items-center text-lg transition-all duration-300"
                >
                  <FaComments className="ml-2" />
                  محادثة
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="mb-8">
          <motion.div 
            className="bg-white rounded-2xl shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex overflow-x-auto">
              {["works", "reviews", "about"].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ backgroundColor: "#f0f9ff" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 font-medium whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab
                      ? 'text-cyan-600 border-b-3 border-cyan-600 bg-cyan-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === "works" && "الأعمال السابقة"}
                  {tab === "reviews" && "التقييمات"}
                  {tab === "about" && "عن مقدم الخدمة"}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {activeTab === 'works' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.h2 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="text-2xl font-bold text-cyan-800 mb-6 flex items-center"
            >
              <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2 mr-2 text-sm">
                <FaCalendarAlt />
              </span>
              الأعمال السابقة
            </motion.h2>
            
            {works.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {works.map((work, index) => (
                  <motion.div 
                    key={work.id}
                    variants={cardVariants}
                    whileHover="hover"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                      expandedWorkId === work.id ? 'md:col-span-2' : ''
                    }`}
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-cyan-800 mb-4">{work.title}</h3>
                      
                      <p className={`text-gray-600 mb-4 ${
                        expandedWorkId === work.id ? '' : 'line-clamp-2'
                      }`}>
                        {work.description}
                      </p>
                      
                      <motion.button
                        onClick={() => setExpandedWorkId(expandedWorkId === work.id ? null : work.id)}
                        className="text-cyan-600 hover:text-cyan-800 flex items-center text-sm font-medium"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        {expandedWorkId === work.id ? 'عرض أقل' : 'عرض المزيد'}
                        <span className="mr-1">
                          {expandedWorkId === work.id ? <FaArrowUp /> : <FaArrowDown />}
                        </span>
                      </motion.button>
                      
                      {work.images && work.images.length > 0 && expandedWorkId === work.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {work.images.map((image, imgIndex) => (
                              <motion.div 
                                key={imgIndex}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: imgIndex * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="rounded-xl overflow-hidden shadow-md aspect-square"
                              >
                                <ModalImage
                                  small={image}
                                  large={image}
                                  alt={`${work.title} - صورة ${imgIndex + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  imageBackgroundColor="#fff"
                                />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      
                      <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-200 mt-4">
                        <div className="flex items-center mb-2 md:mb-0">
                         <FaRegCalendarAlt className="text-cyan-600 ml-2 mr-2" />
                         <span className="text-gray-600 text-sm">
  {new Date(work.createdAt.seconds * 1000).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
</span>

                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full">
                            {work.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl shadow-md p-8 text-center"
              >
                <div className="text-cyan-500 text-5xl mb-4">
                  <FaCalendarAlt className="mx-auto" />
                </div>
                <p className="text-xl font-semibold text-gray-600 mb-2">لا توجد أعمال سابقة حالياً</p>
                <p className="text-gray-500">سيتم عرض الأعمال السابقة لمقدم الخدمة هنا.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.h2 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="text-2xl font-bold text-cyan-800 mb-6 flex items-center"
            >
              <span className="bg-yellow-500 text-white p-2 rounded-lg ml-2 mr-2 text-sm">
                <FaStar />
              </span>
              التقييمات والمراجعات
            </motion.h2>
            
          
            
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-800 mb-2">تقييمات العملاء</h2>
          <div className="flex items-center">
            {renderRatingStars(Math.round(calculateAverageRating()), 'lg')}
            <span className="mx-3 text-2xl font-bold text-gray-800">
              {calculateAverageRating()}
            </span>
            <span className="text-gray-500">
              بناءً على {reviews.length} تقييم
            </span>
          </div>
        </div>
      </div>

      {/* توزيع التقييمات */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-cyan-700 mb-3">توزيع التقييمات</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter(r => r.rating === stars).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            
            return (
              <div key={stars} className="flex items-center">
                <div className="w-10">
                  <span className="text-gray-600">{stars} نجوم</span>
                </div>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-right">
                  <span className="text-gray-600">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* قائمة التقييمات */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          [...reviews]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // ترتيب من الأحدث للأقدم
            .map((review) => (
              <div 
                key={review.id} 
                className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-cyan-800">{review.clientName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex">
                    {renderRatingStars(review.rating)}
                  </div>
                </div>
                
                {review.review && (
                  <p className="text-gray-700 mt-3">{review.review}</p>
                )}
              </div>
            ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد تقييمات حتى الآن</p>
          </div>
        )}
      </div>
    </div>
            </motion.div>

              <motion.div 
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 className="text-xl font-bold text-cyan-800 mb-4">أضف تقييمك</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">تقييمك</label>
                <div className="flex items-center">
                  {renderRatingStars(hoverRating || rating, setRating, setHoverRating, "lg")}
                  <span className="mr-3 ml-2 text-lg text-gray-500">{hoverRating || rating || 0} </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">رأيك في مقدم الخدمة</label>
                <textarea 
                  rows="4"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  placeholder="اكتب تقييمك هنا..."
                />
              </div>
              
              <motion.button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className={`bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-xl shadow-md flex items-center justify-center transition-all ${
                  isSubmittingReview ? 'opacity-70 cursor-not-allowed' : 'hover:from-cyan-600 hover:to-cyan-700'
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin ml-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <FaStar className="ml-2" />
                    إرسال التقييم
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.h2 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="text-2xl font-bold text-cyan-800 mb-6 flex items-center"
            >
              <span className="bg-blue-600 text-white p-2 rounded-lg ml-2 mr-2 text-sm">
                <FaUserCircle />
              </span>
              عن مقدم الخدمة
            </motion.h2>
            
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-cyan-800 mb-4">المعلومات الشخصية</h3>
                  
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-40 text-gray-500 font-medium">الاسم</div>
                      <div className="flex-1 font-semibold">{providerData.name}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-40 text-gray-500 font-medium">المهنة</div>
                      <div className="flex-1 font-semibold">{providerData.profession || providerData.category}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-40 text-gray-500 font-medium">المنطقة</div>
                      <div className="flex-1 font-semibold">{providerData.governorate || 'غير محدد'}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-40 text-gray-500 font-medium">العنوان</div>
                      <div className="flex-1 font-semibold">{providerData.address || 'غير محدد'}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-40 text-gray-500 font-medium">معدل التقييم</div>
                      <div className="flex-1 font-semibold flex items-center">
                        {renderRatingStars(Math.round(calculateAverageRating()))}
                        <span className="mx-2">
                          {calculateAverageRating()} ({reviews.length} تقييم)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-cyan-800 mb-4">نبذة شخصية</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {providerData.bio || 'لا يوجد وصف متاح لمقدم الخدمة.'}
                  </p>
                  
                  {providerData.skills && providerData.skills.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-gray-700 mb-3">المهارات</h4>
                      <div className="flex flex-wrap gap-2">
                        {providerData.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-gradient-to-r from-blue-100 to-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {providerData.education && (
                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-gray-700 mb-3">المؤهلات العلمية</h4>
                      <p className="text-gray-600">{providerData.education}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-800">حجز موعد</h2>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">اختر التاريخ</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholderText="اختر تاريخ الحجز"
                  locale="ar"
                />
              </div>
              
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">اختر الوقت</label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <motion.button
                        key={time}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          selectedTime === time
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">ملاحظات الحجز</label>
                <textarea 
                  rows="3"
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  placeholder="أضف أي ملاحظات إضافية هنا..."
                />
              </div>
              
              <motion.button
                onClick={handleBooking}
                disabled={isCheckingAvailability}
                className={`w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-xl shadow-md flex items-center justify-center transition-all ${
                  isCheckingAvailability ? 'opacity-70 cursor-not-allowed' : 'hover:from-cyan-600 hover:to-cyan-700'
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isCheckingAvailability ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin ml-2"></div>
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="ml-2" />
                    تأكيد الحجز
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Result Modal */}
      <AnimatePresence>
        {showResultModal && bookingResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center ${
                bookingResult.success ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'
              }`}
            >
              <div className={`text-5xl mb-6 ${
                bookingResult.success ? 'text-green-500' : 'text-red-500'
              }`}>
                {bookingResult.success ? <FaCheckCircle /> : <FaTimesCircle />}
              </div>
              
              <h2 className={`text-2xl font-bold mb-4 ${
                bookingResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {bookingResult.success ? 'تم الحجز بنجاح' : 'حدثت مشكلة'}
              </h2>
              
              <p className="text-gray-600 mb-6">{bookingResult.message}</p>
              
              <motion.button
                onClick={() => {
                  setShowResultModal(false);
                  if (bookingResult.success) {
                    setShowBookingModal(false);
                  }
                }}
                className={`px-6 py-3 rounded-xl shadow-md text-white ${
                  bookingResult.success 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {bookingResult.success ? 'حسناً' : 'حاول مرة أخرى'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProviderDetailsPage;