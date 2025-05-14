import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaWrench, FaHammer, FaBolt, FaCogs, FaTools, 
  FaSnowflake, FaPaintRoller, FaTshirt, FaUserMd, 
  FaPills, FaFirstAid, FaCarrot, FaRunning, FaTooth,
  FaShoppingCart, FaUtensils, FaCoffee, FaStore,
  FaLeaf, FaDrumstickBite, FaAppleAlt, FaSeedling, FaGlassWhiskey,
  FaChevronRight, FaChevronLeft, FaStar, FaCommentDots
} from 'react-icons/fa';

const ServiceCategoriesPage = () => {
  const { serviceType } = useParams();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);

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
    visible: { opacity: 1, y: 0 }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // تخصيص أيقونات مختلفة للخدمات
  const serviceCategories = {
    "خدمات فنية": [
      { name: "سباك", icon: <FaWrench size={28} /> },
      { name: "نجار", icon: <FaHammer size={28} /> },
      { name: "كهربائي", icon: <FaBolt size={28} /> },
      { name: "ميكانيكي", icon: <FaCogs size={28} /> },
      { name: "حداد", icon: <FaTools size={28} /> },
      { name: "فني تكييفات", icon: <FaSnowflake size={28} /> },
      { name: "نقاش", icon: <FaPaintRoller size={28} /> },
      { name: "ترزي", icon: <FaTshirt size={28} /> }
    ],
    "خدمات صحية": [
      { name: "طبيب عام", icon: <FaUserMd size={28} /> },
      { name: "صيدلي", icon: <FaPills size={28} /> },
      { name: "ممرض", icon: <FaFirstAid size={28} /> },
      { name: "أخصائي تغذية", icon: <FaCarrot size={28} /> },
      { name: "أخصائي علاج طبيعي", icon: <FaRunning size={28} /> },
      { name: "طبيب أسنان", icon: <FaTooth size={28} /> }
    ],
    "خدمات عامة": [
      { name: "سوبر ماركت", icon: <FaShoppingCart size={28} /> },
      { name: "مطعم", icon: <FaUtensils size={28} /> },
      { name: "كافيه", icon: <FaCoffee size={28} /> },
      { name: "مولات", icon: <FaStore size={28} /> }
    ],
    "خدمات أخرى": [
      { name: "عطار", icon: <FaLeaf size={28} /> },
      { name: "جزار", icon: <FaDrumstickBite size={28} /> },
      { name: "فكهاني", icon: <FaAppleAlt size={28} /> },
      { name: "خضري", icon: <FaSeedling size={28} /> },
      { name: "محل ألبان", icon: <FaGlassWhiskey size={28} /> }
    ]
  };

  // الحصول على قائمة الخدمات المناسبة للنوع المحدد
  const categories = serviceCategories[serviceType] || [];

  // تخصيص الألوان لكل نوع خدمة رئيسية
  const serviceColors = {
    "خدمات فنية": {
      gradient: "from-blue-50 to-blue-100",
      accent: "bg-blue-500", 
      text: "text-blue-600",
      icon: "bg-blue-50 text-blue-600",
      header: "from-blue-500 to-blue-600"
    },
    "خدمات صحية": {
      gradient: "from-cyan-50 to-cyan-100",
      accent: "bg-cyan-500",
      text: "text-cyan-600",
      icon: "bg-cyan-50 text-cyan-600",
      header: "from-cyan-500 to-cyan-600"
    },
    "خدمات عامة": {
      gradient: "from-purple-50 to-purple-100",
      accent: "bg-purple-500",
      text: "text-purple-600",
      icon: "bg-purple-50 text-purple-600",
      header: "from-purple-500 to-purple-600"
    },
    "خدمات أخرى": {
      gradient: "from-emerald-50 to-emerald-100",
      accent: "bg-emerald-500",
      text: "text-emerald-600",
      icon: "bg-emerald-50 text-emerald-600",
      header: "from-emerald-500 to-emerald-600"
    }
  };

  // الحصول على مجموعة الألوان المناسبة للنوع المحدد
  const currentColors = serviceColors[serviceType] || serviceColors["خدمات فنية"];

  // عناوين مخصصة لكل نوع خدمة
  const serviceTitles = {
    "خدمات فنية": "الخدمات الفنية والحرفية",
    "خدمات صحية": "الخدمات الصحية والطبية",
    "خدمات عامة": "الخدمات العامة والتجارية",
    "خدمات أخرى": "خدمات متنوعة أخرى"
  };

  // تعريف الأيقونات لكل نوع خدمة رئيسية
  const serviceIcons = {
    "خدمات فنية": <FaTools className={currentColors.text} size={24} />,
    "خدمات صحية": <FaUserMd className={currentColors.text} size={24} />,
    "خدمات عامة": <FaStore className={currentColors.text} size={24} />,
    "خدمات أخرى": <FaLeaf className={currentColors.text} size={24} />
  };

  const handleCategoryClick = (category) => {
    // الانتقال إلى صفحة مقدمي الخدمة
    navigate(`/nafany/services_jobs/${serviceType}/${category.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header gradient background */}
      <div className={`h-48 bg-gradient-to-br ${currentColors.header} w-full absolute top-0 left-0 z-0 opacity-90`}></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* شريط العودة */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 bg-white rounded-lg py-2 px-4 shadow-md border border-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronLeft className="ml-1" />
            <span>رجوع</span>
          </motion.button>
          
          <motion.div
            className="flex items-center text-white text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>نفعني</span>
            <span className="mx-1">{'>'}</span>
            <span className="font-medium">{serviceType}</span>
          </motion.div>
        </div>

        {/* عنوان الصفحة - Card with enhanced styling */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-12 relative overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative Circles */}
          <div className={`absolute -right-16 -top-16 w-32 h-32 ${currentColors.accent} opacity-10 rounded-full`}></div>
          <div className={`absolute -left-16 -bottom-16 w-32 h-32 ${currentColors.accent} opacity-10 rounded-full`}></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-center md:items-start text-center md:text-right mb-6 md:mb-0">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentColors.icon} mb-4`}>
                {serviceIcons[serviceType]}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{serviceTitles[serviceType] || serviceType}</h1>
              <p className="text-gray-500">اختر الخدمة التي تحتاجها من الخيارات المتاحة</p>
            </div>
            
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`px-4 py-2 rounded-lg ${currentColors.gradient} shadow-md flex items-center`}>
                <FaStar className={currentColors.text} />
                <span className={`mr-2 font-bold ${currentColors.text}`}>{categories.length}</span>
                <span className="text-gray-600 text-sm">خدمة متاحة</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* شبكة الخدمات */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              className={`bg-white rounded-xl shadow-md border border-gray-100 
                overflow-hidden cursor-pointer transition-all duration-300`}
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="p-6 flex flex-col items-center text-center h-full relative overflow-hidden">
                {/* Background decoration */}
                <div className={`absolute -right-6 -top-6 w-12 h-12 ${currentColors.accent} opacity-10 rounded-full`}></div>
                
                {/* أيقونة الخدمة */}
                <motion.div 
                  className={`flex items-center justify-center w-16 h-16 rounded-full 
                    ${currentColors.gradient} ${currentColors.text} mb-4 shadow-md`}
                  animate={{ 
                    scale: hoveredCategory === index ? 1.1 : 1,
                    y: hoveredCategory === index ? -5 : 0
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {category.icon}
                </motion.div>
                
                {/* اسم الخدمة */}
                <h3 className="text-xl font-bold text-gray-800 mb-1">{category.name}</h3>
                
                {/* خط فاصل مخصص */}
                <motion.div 
                  className={`h-0.5 w-12 ${currentColors.accent} opacity-20 rounded-full my-2`}
                  animate={{ width: hoveredCategory === index ? 24 : 12 }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
                
                {/* زر الخدمة */}
                <motion.div
                  className={`text-sm ${currentColors.text} mt-2 flex items-center`}
                  animate={{ opacity: hoveredCategory === index ? 1 : 0.8 }}
                >
                  <span>عرض المزودين</span>
                  <FaChevronRight className="mr-1 text-xs" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* رسالة عدم وجود خدمات */}
        <AnimatePresence>
          {categories.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center mt-12 max-w-lg mx-auto"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${currentColors.gradient} mb-6`}>
                <FaTools className={currentColors.text} size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد خدمات متاحة</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على خدمات متاحة في هذه الفئة حالياً</p>
              <motion.button
                onClick={() => navigate(-1)}
                className={`${currentColors.gradient} ${currentColors.text} px-6 py-3 rounded-lg font-medium transition-colors shadow-md`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                العودة للقائمة الرئيسية
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Statistics Section (Optional - Similar to the rating stats) */}
        {categories.length > 0 && (
          <motion.div 
            className={`bg-gradient-to-br from-white to-${currentColors.gradient.split(' ')[1]} rounded-2xl shadow-xl p-6 mt-12 relative overflow-hidden`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Decorative Elements */}
            <div className={`absolute -right-16 -top-16 w-32 h-32 ${currentColors.accent} opacity-10 rounded-full`}></div>
            <div className={`absolute -left-16 -bottom-16 w-32 h-32 ${currentColors.accent} opacity-10 rounded-full`}></div>
            
            <motion.h2 
              className={`text-2xl font-bold ${currentColors.text} mb-6 relative z-10 flex items-center`}
              variants={itemVariants}
            >
              <span className={`${currentColors.accent} text-white p-2 rounded-lg mr-2`}>
                <FaCommentDots />
              </span>
              إحصائيات الخدمات
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className={`bg-gradient-to-br ${currentColors.gradient} p-6 rounded-xl text-center relative overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg`}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className={`absolute -right-6 -top-6 w-12 h-12 ${currentColors.accent} opacity-20 rounded-full`}></div>
                <motion.div 
                  className={`text-4xl font-bold ${currentColors.text} mb-3`}
                >
                  {categories.length}
                </motion.div>
                <p className="text-gray-700 font-medium">عدد الخدمات المتاحة</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ServiceCategoriesPage;