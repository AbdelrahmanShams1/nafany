import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaFilter, FaMapMarkerAlt, FaStar, FaUserCircle, FaArrowLeft } from 'react-icons/fa';

const JobsPage = () => {
  const { serviceType, professionType } = useParams();
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState('الكل');
  const [selectedGovernorate, setSelectedGovernorate] = useState('الكل');
  const [professionsList, setProfessionsList] = useState([]);
  const [governoratesList, setGovernoratesList] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [reviews, setReviews] = useState([]);

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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px rgba(0, 156, 222, 0.15)",
      transition: { duration: 0.3 }
    }
  };
  
  // قائمة المحافظات المصرية
  const governorates = [
    "وسط البلد", "الزمالك"
  ];

 useEffect(() => {
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      const q = query(
        collection(db, 'serviceProviders'),
        where('category', '==', serviceType),
        where('profession', '==', professionType)
      );

      const querySnapshot = await getDocs(q);
      const jobsData = [];
      const professions = new Set(['الكل']);
      const governorates = new Set(['الكل']);
    
      querySnapshot.forEach((doc) => {
        const provider = doc.data();
        const profession = provider.profession || 'بدون تخصص';
        const governorate = provider.governorate || 'غير محدد';
        const fetchedReviews = provider.reviews || [];
        
        // حساب التقييمات مباشرة من fetchedReviews
        const ratingsTotal = fetchedReviews.reduce((sum, review) => {
          return sum + (Number(review.rating) || 0 ); // تأكد من تحويل التقييم إلى رقم
        }, 0);
        
        const ratingsCount = fetchedReviews.length || 1; // تجنب القسمة على صفر
        
        const averageRating = ratingsCount > 0 
          ? (ratingsTotal / ratingsCount).toFixed(1) 
          : "0.0";

        jobsData.push({
          id: doc.id,
          title: profession,
          description: provider.bio || 'لا يوجد وصف',
          imageUrl: provider.profileImage || provider.idFrontImage || '../../public/IMG-20250322-WA0070.jpg',
          governorate: governorate,
          rating: averageRating,
          reviewsCount: ratingsCount,
          providerData: { ...provider, id: doc.id }
        });
        
        professions.add(profession);
        governorates.add(governorate);
      });
      
      setAllJobs(jobsData);
      setFilteredJobs(jobsData);
      setProfessionsList(Array.from(professions));
      setGovernoratesList(Array.from(governorates));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setLoading(false);
    }
  };

  fetchJobs();
}, [serviceType, professionType]);
  useEffect(() => {
    // تطبيق الفلتر عند تغيير المهنة أو المحافظة
    let filtered = [...allJobs];
    
    if (selectedProfession !== 'الكل') {
      filtered = filtered.filter(job => job.title === selectedProfession);
    }
    
    if (selectedGovernorate !== 'الكل') {
      filtered = filtered.filter(job => job.governorate === selectedGovernorate);
    }
    
    setFilteredJobs(filtered);
  }, [selectedProfession, selectedGovernorate, allJobs]);

  const handleDetailsClick = (provider, bool) => {
    navigate(`/nafany/book_page/${provider.id}`, { state: { provider, bool } });
  };

  // دالة لإنشاء عنوان الصفحة بناءً على حالة الفلتر
  const getPageTitle = () => {
    let title = `${professionType} - ${serviceType}`;
    
    if (selectedGovernorate !== 'الكل') {
      title += ` في ${selectedGovernorate}`;
    } else {
      title += ' في جميع المناطق السكنية';
    }
    
    return title;
  };

  // دالة لعرض نجوم التقييم
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // ملء النجوم الكاملة
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }
    
    // إضافة نصف نجمة إذا لزم الأمر
    if (hasHalfStar) {
      stars.push(<FaStar key="half-star" className="text-yellow-400 opacity-50" />);
    }
    
    // إضافة النجوم الفارغة
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-star-${i}`} className="text-gray-300" />);
    }
    
    return <div className="flex">{stars}</div>;
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-cyan-100 to-blue-200 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="flex items-center ml-10 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-md transition-colors"
      >
        <FaArrowLeft className="ml-2" />
        رجوع
      </motion.button>

      <div className="container mx-auto px-4">
        {/* Page Title */}
        <motion.div 
          className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-6 mb-8 relative overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Decorative Elements */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
          
          <motion.h1 
            className="text-3xl font-bold text-center text-cyan-800 mb-4 relative z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {getPageTitle()}
          </motion.h1>

          {/* Filter Toggle Button */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-full shadow-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter className="ml-2 mr-2" />
              {showFilters ? 'إخفاء خيارات التصفية' : 'عرض خيارات التصفية'}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-lg mb-8 relative overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Decorative Elements */}
              <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-cyan-500 opacity-10 rounded-full"></div>
              
              <motion.h2 
                className="text-xl font-bold text-cyan-800 mb-4 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="bg-cyan-700 text-white p-1 rounded-lg ml-2 mr-2">
                  <FaFilter />
                </span>
                خيارات التصفية
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تصفية حسب المنطقة السكنية:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedGovernorate}
                      onChange={(e) => setSelectedGovernorate(e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white"
                    >
                      {governoratesList.map((gov, index) => (
                        <option 
                          className={`${index < 3 && index != 0 ? "text-red-600" : ""}`} 
                          key={`gov-${index}`} 
                          value={gov}
                        >
                          {gov}
                        </option>
                      ))}
                    </select>
                   
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="flex justify-between items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button 
                  onClick={() => {
                    setSelectedProfession('الكل');
                    setSelectedGovernorate('الكل');
                  }}
                  className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  إعادة تعيين الفلتر
                </motion.button>
                
                <motion.span 
                  className="bg-cyan-100 text-cyan-800 px-4 py-1 rounded-full text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.4 }}
                >
                  {filteredJobs.length} نتيجة متاحة
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jobs List */}
        {loading ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl text-cyan-800 font-medium">جاري تحميل البيانات...</p>
          </motion.div>
        ) : filteredJobs.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id || index}
                variants={cardVariants}
                whileHover="hover"
                layoutId={`job-${job.id || index}`}
                className="bg-gradient-to-br from-white to-cyan-50 rounded-xl shadow-lg overflow-hidden relative"
              >
                {/* Decorative Elements */}
                <div className="absolute -right-8 -top-8 w-16 h-16 bg-cyan-500 opacity-10 rounded-full"></div>
                
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-cyan-200 shadow-md mr-4">
                      <motion.img 
                        src={job.imageUrl} 
                        alt={job.title} 
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '../../public/IMG-20250322-WA0070.jpg'
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-cyan-800">{job.title}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex mr-1">
                          {renderRatingStars(job.rating)}
                        </div>
                        <span className="text-sm text-gray-600 mr-1">
                          ({job.rating})
                        </span>
                        <span className="text-xs text-gray-500">
                          {job.reviewsCount} تقييم
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <FaMapMarkerAlt className="text-cyan-600 ml-1 mr-1" />
                      <span>{job.governorate}</span>
                    </div>
                    <p className={`text-gray-700 ${expandedJobId === job.id ? '' : 'line-clamp-2'}`}>
                      {job.description}
                    </p>
                  </div>
                  
                  {job.description.length > 100 && (
                    <button 
                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      className="text-sm text-cyan-600 hover:text-cyan-800 mb-4 font-medium"
                    >
                      {expandedJobId === job.id ? 'عرض أقل' : 'عرض المزيد...'}
                    </button>
                  )}
                  
                  <div className="flex justify-end">
                    <motion.button 
                      onClick={() => handleDetailsClick(job.providerData, job.providerData.category === "خدمات صحية" || job.providerData.category === "خدمات فنية" ? true : false)}
                      className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-5 py-2 rounded-lg text-sm transition-colors shadow-md flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaUserCircle className="ml-1 mr-1" />
                      عرض الملف الشخصي
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl text-cyan-200 mb-4 flex justify-center">
              <FaFilter />
            </div>
            <h3 className="text-2xl font-bold text-cyan-800 mb-2">لا توجد نتائج مطابقة</h3>
            <p className="text-gray-600 mb-4">
              جرب تغيير معايير البحث للحصول على نتائج أكثر
            </p>
            <motion.button
              onClick={() => {
                setSelectedProfession('الكل');
                setSelectedGovernorate('الكل');
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              إعادة تعيين البحث
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default JobsPage;