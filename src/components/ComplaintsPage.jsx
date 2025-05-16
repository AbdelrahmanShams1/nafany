import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from "firebase/firestore";
import { 
  FaPaperPlane, 
  FaClipboardList, 
  FaArrowRight, 
  FaLightbulb, 
  FaExclamationCircle,
  FaInbox,
  FaReply,
  FaClock,
  FaCheckCircle
} from "react-icons/fa";

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "complaint", // مبدئيًا "شكوى"
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({});
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } }
  };

  // جلب شكاوى واقتراحات المستخدم
  const fetchUserFeedbacks = async () => {
    try {
      setIsLoading(true);
      const storedUser = localStorage.getItem('currentUser');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (!currentUser || !currentUser.email) {
        setIsLoading(false);
        return;
      }
      
      const feedbacksQuery = query(
        collection(db, "feedbacks"),
        where("userId", "==", currentUser.email),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(feedbacksQuery);
      const feedbacks = [];
      
      querySnapshot.forEach((doc) => {
        feedbacks.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        });
      });
      
      setUserFeedbacks(feedbacks);
    } catch (error) {
      console.error("خطأ في جلب الشكاوى والاقتراحات:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // استدعاء الدالة عند تحميل الصفحة
  useEffect(() => {
    fetchUserFeedbacks();
  }, []);

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان الشكوى/الاقتراح مطلوب";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "تفاصيل الشكوى/الاقتراح مطلوبة";
      isValid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "يجب أن تحتوي التفاصيل على 10 أحرف على الأقل";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // مسح رسالة الخطأ عند التعديل
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError("");
      
      // الحصول على معلومات المستخدم الحالي من localStorage
      const storedUser = localStorage.getItem('currentUser');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      // إنشاء وثيقة جديدة في مجموعة الشكاوى والاقتراحات
      await addDoc(collection(db, "feedbacks"), {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        status: "new", // حالة مبدئية "جديد"
        timestamp: serverTimestamp(),
        userId: currentUser?.email || "anonymous",
        userName: currentUser?.name || "زائر",
        userRole: currentUser?.role || "guest",
        response: "", // حقل فارغ للرد
        responseTimestamp: null // وقت الرد
      });
      
      setSubmitSuccess(true);
      // إعادة تعيين النموذج
      setFormData({
        type: "complaint",
        title: "",
        description: ""
      });
      
      // تحديث قائمة الشكاوى والاقتراحات
      fetchUserFeedbacks();
      
      // إزالة رسالة النجاح بعد فترة
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 4000);
      
    } catch (error) {
      console.error("خطأ في إرسال الشكوى/الاقتراح:", error);
      setSubmitError("حدث خطأ أثناء إرسال الشكوى/الاقتراح. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return "غير محدد";
    
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // ترجمة حالة الشكوى/الاقتراح
  const getStatusText = (status) => {
    const statusMap = {
      'new': 'جديد',
      'inProgress': 'قيد المراجعة',
      'resolved': 'تم الرد',
      'closed': 'مغلق'
    };
    return statusMap[status] || status;
  };

  // لون حالة الشكوى/الاقتراح
  const getStatusColor = (status) => {
    const colorMap = {
      'new': 'bg-yellow-500',
      'inProgress': 'bg-blue-500',
      'resolved': 'bg-green-500',
      'closed': 'bg-gray-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  // أيقونة حالة الشكوى/الاقتراح
  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <FaInbox />;
      case 'inProgress':
        return <FaClock />;
      case 'resolved':
        return <FaReply />;
      case 'closed':
        return <FaCheckCircle />;
      default:
        return <FaInbox />;
    }
  };

  // Render Form Section
  const renderFormSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 h-full"
    >
      <motion.h2 
        className="text-xl font-bold text-cyan-800 mb-4 text-center relative z-10 flex items-center justify-center"
        variants={itemVariants}
      >
        <span className="bg-gradient-to-r from-cyan-700 to-blue-700 text-white p-2 rounded-lg ml-3">
          <FaPaperPlane />
        </span>
        إرسال شكوى/اقتراح جديد
      </motion.h2>
      
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <span className="bg-green-500 text-white p-2 rounded-full ml-3">
              <FaPaperPlane />
            </span>
            <span>تم إرسال {formData.type === "complaint" ? "الشكوى" : "الاقتراح"} بنجاح. شكراً لك!</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {submitError && (
          <motion.div
            className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <span className="bg-red-500 text-white p-2 rounded-full ml-3">
              <FaExclamationCircle />
            </span>
            <span>{submitError}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div 
          className="space-y-2"
          variants={itemVariants}
        >
          <label className="block text-gray-700 font-medium">نوع الرسالة</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <motion.label 
              className={`flex items-center cursor-pointer justify-center py-3 px-4 rounded-xl transition-all duration-300 ${formData.type === "complaint" ? 'bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-200 shadow-md' : 'bg-white border border-gray-200'}`}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name="type"
                value="complaint"
                checked={formData.type === "complaint"}
                onChange={handleInputChange}
                className="hidden"
              />
              <span className={`flex items-center ${formData.type === "complaint" ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                <FaExclamationCircle className={`ml-2 ${formData.type === "complaint" ? 'text-red-500' : 'text-gray-400'}`} />
                شكوى
              </span>
            </motion.label>
            
            <motion.label 
              className={`flex items-center cursor-pointer justify-center py-3 px-4 rounded-xl transition-all duration-300 ${formData.type === "suggestion" ? 'bg-gradient-to-r from-cyan-100 to-cyan-50 border-2 border-cyan-200 shadow-md' : 'bg-white border border-gray-200'}`}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name="type"
                value="suggestion"
                checked={formData.type === "suggestion"}
                onChange={handleInputChange}
                className="hidden"
              />
              <span className={`flex items-center ${formData.type === "suggestion" ? 'text-cyan-600 font-bold' : 'text-gray-600'}`}>
                <FaLightbulb className={`ml-2 ${formData.type === "suggestion" ? 'text-cyan-500' : 'text-gray-400'}`} />
                اقتراح
              </span>
            </motion.label>
          </div>
        </motion.div>
        
        <motion.div 
          className="space-y-2"
          variants={itemVariants}
        >
          <label className="block text-gray-700 font-medium flex items-center">
            العنوان
            <span className="text-red-500 mr-1">*</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="أدخل عنوان الشكوى/الاقتراح"
            className={`w-full border ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 shadow-sm`}
            value={formData.title}
            onChange={handleInputChange}
          />
          <AnimatePresence>
            {errors.title && (
              <motion.p 
                className="text-red-500 text-sm flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FaExclamationCircle className="ml-1" size={12} />
                {errors.title}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          className="space-y-2"
          variants={itemVariants}
        >
          <label className="block text-gray-700 font-medium flex items-center">
            التفاصيل
            <span className="text-red-500 mr-1">*</span>
          </label>
          <textarea
            name="description"
            placeholder="أدخل تفاصيل الشكوى/الاقتراح"
            className={`w-full border ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 shadow-sm h-32`}
            value={formData.description}
            onChange={handleInputChange}
          />
          <AnimatePresence>
            {errors.description && (
              <motion.p 
                className="text-red-500 text-sm flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FaExclamationCircle className="ml-1" size={12} />
                {errors.description}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.button
          type="submit"
          className={`w-full py-3 ${
            formData.type === "complaint"
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          } text-white rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center justify-center`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري الإرسال...
            </div>
          ) : (
            <div className="flex items-center">
              <FaPaperPlane className="ml-2" />
              إرسال {formData.type === "complaint" ? "الشكوى" : "الاقتراح"}
            </div>
          )}
        </motion.button>
      </form>
      
      {/* نصائح استخدام النظام */}
      <motion.div 
        className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100"
        variants={itemVariants}
      >
        <h3 className="text-blue-700 font-semibold mb-2 flex items-center text-sm">
          <FaLightbulb className="ml-2 text-blue-500" />
          إرشادات استخدام النظام
        </h3>
        <ul className="space-y-1 text-gray-600 text-xs list-inside list-disc">
          <li>ادخل معلومات واضحة ودقيقة لتسهيل معالجة طلبك.</li>
          <li>سيتم معالجة الشكاوى والاقتراحات خلال 3 أيام عمل.</li>
          <li>في حالة وجود استفسارات إضافية، يرجى إضافة طلب جديد.</li>
        </ul>
      </motion.div>
    </motion.div>
  );

  // Render History Section
  const renderHistorySection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-y-auto"
    >
      <motion.h2 
        className="text-xl font-bold text-cyan-800 mb-4 text-center relative z-10 flex items-center justify-center"
        variants={itemVariants}
      >
        <span className="bg-gradient-to-r from-cyan-700 to-blue-700 text-white p-2 rounded-lg ml-3">
          <FaInbox />
        </span>
        سجل الشكاوى والاقتراحات
      </motion.h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
        </div>
      ) : userFeedbacks.length === 0 ? (
        <motion.div 
          className="bg-gray-50 rounded-xl p-8 text-center text-gray-600"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaInbox className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد شكاوى أو اقتراحات مسجلة بعد</h3>
          <p className="text-sm">يمكنك إرسال شكوى أو اقتراح جديد من خلال النموذج المجاور</p>
        </motion.div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          <AnimatePresence>
            {userFeedbacks.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              >
                <div className={`p-3 ${feedback.type === 'complaint' ? 'bg-red-50' : 'bg-cyan-50'} border-b border-gray-200`}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">
                      <span className={`inline-flex items-center mr-2 ${feedback.type === 'complaint' ? 'text-red-500' : 'text-cyan-500'}`}>
                        {feedback.type === 'complaint' ? <FaExclamationCircle className="ml-1" /> : <FaLightbulb className="ml-1" />}
                        {feedback.type === 'complaint' ? 'شكوى:' : 'اقتراح:'}
                      </span>
                      {feedback.title}
                    </h4>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(feedback.status)}`}>
                        {getStatusIcon(feedback.status)}
                        <span className="mr-1">{getStatusText(feedback.status)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs mt-1 flex items-center">
                    <FaClock className="ml-1" />
                    {formatDate(feedback.timestamp)}
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-700 mb-1 text-sm">التفاصيل:</h5>
                    <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded-lg border border-gray-100 text-sm">
                      {feedback.description}
                    </p>
                  </div>
                  
                  {/* رد الإدارة */}
                  {feedback.response ? (
                    <div className="mt-4 border-t border-gray-200 pt-3">
                      <h5 className="font-medium text-green-700 mb-1 flex items-center text-sm">
                        <FaReply className="ml-2" />
                        رد الإدارة:
                      </h5>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-2">
                        <p className="text-gray-700 whitespace-pre-line text-sm">
                          {feedback.response}
                        </p>
                        {feedback.responseTimestamp && (
                          <div className="mt-2 text-xs text-gray-500 flex items-center">
                            <FaClock className="ml-1" />
                            {formatDate(feedback.responseTimestamp.toDate())}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    feedback.status !== 'new' && (
                      <div className="mt-3 text-center py-2 bg-yellow-50 border border-yellow-100 rounded-lg">
                        <p className="text-yellow-600 text-xs flex items-center justify-center">
                          <FaClock className="ml-2" />
                          {feedback.status === 'inProgress' ? 'جاري مراجعة هذه الرسالة من قبل الإدارة' : 'بانتظار الرد من الإدارة'}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
  
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-cyan-100 to-blue-200 py-12 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Decorative Elements */}
      <div className="absolute -right-24 -top-24 w-48 h-48 bg-cyan-500 opacity-10 rounded-full"></div>
      <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-blue-500 opacity-10 rounded-full"></div>
      <div className="absolute right-1/4 top-1/3 w-16 h-16 bg-purple-500 opacity-10 rounded-full"></div>
      <div className="absolute left-1/3 bottom-1/4 w-24 h-24 bg-cyan-400 opacity-10 rounded-full"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.button
          onClick={() => navigate('/nafany')}
          className="mb-6 flex items-center text-cyan-800 font-medium bg-white bg-opacity-60 px-4 py-2 rounded-lg shadow-md"
          whileHover={{ scale: 1.05, backgroundColor: "#ffffff", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowRight className="ml-2" />
          العودة للرئيسية
        </motion.button>
        
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto border border-cyan-100 relative overflow-hidden"
          dir="rtl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
          
          <motion.h1 
            className="text-2xl font-bold text-cyan-800 mb-6 text-center relative z-10 flex items-center justify-center"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-cyan-700 to-blue-700 text-white p-2 rounded-lg ml-3">
              <FaClipboardList />
            </span>
            الشكاوى والاقتراحات
          </motion.h1>
          
          {/* Main content with Form and History side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              {renderFormSection()}
            </div>
            <div className="md:col-span-1">
              {renderHistorySection()}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ComplaintsPage;