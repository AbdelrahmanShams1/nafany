import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, setDoc, doc, query, where, getDocs, getDoc } from "firebase/firestore";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const RegisterUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    governorate: "",
    phoneNumber: "",
    chats: {},
  });

  const [errors, setErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const governorates = [
    "وسط البلد", "الزمالك"
  ];

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
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 }
  };

  const formCardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (formStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "الاسم مطلوب";
        isValid = false;
      }
      
      if (!formData.email.trim()) {
        newErrors.email = "البريد الإلكتروني مطلوب";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "البريد الإلكتروني غير صالح";
        isValid = false;
      }
    } else if (formStep === 2) {
      if (!formData.password.trim()) {
        newErrors.password = "كلمة المرور مطلوبة";
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = "يجب أن تكون كلمة المرور 6 أحرف على الأقل";
        isValid = false;
      }
      
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "رقم الهاتف مطلوب";
        isValid = false;
      }
      
      if (!formData.governorate) {
        newErrors.governorate = "يجب اختيار المنطقة";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const checkEmailExists = async (email) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkUsernameExists = async (username) => {
    const userDoc = await getDoc(doc(db, "users", username));
    return userDoc.exists();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (formStep === 1) {
      // Check if email exists before proceeding to next step
      const emailAlreadyExists = await checkEmailExists(formData.email);
      const username = formData.email.split('@')[0];
      const usernameAlreadyExists = await checkUsernameExists(username);
      
      if (emailAlreadyExists) {
        setEmailExists(true);
        return;
      }
      
      if (usernameAlreadyExists) {
        setUsernameExists(true);
        return;
      }
      
      setFormStep(2);
      return;
    }
    
    // Final submission
    try {
      setIsSubmitting(true);
      const username = formData.email.split('@')[0];
      await setDoc(doc(db, "users", username), {
        ...formData,
      });
      
      // Show success animation before navigating
      setTimeout(() => {
        navigate("/nafany/login");
      }, 1500);
    } catch (error) {
      console.error("Error adding user: ", error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "email") {
      setEmailExists(false);
      setUsernameExists(false);
    }
  };

  const renderFirstStep = () => (
    <motion.div
      variants={formCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="p-8 bg-gradient-to-br from-white to-cyan-50 rounded-xl shadow-xl text-right w-full max-w-lg border border-cyan-100 relative overflow-hidden"
      dir="rtl"
    >
      {/* Decorative Elements */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
      
      <motion.div className="relative z-10" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="flex justify-center mb-6" variants={itemVariants}>
          <div className="bg-cyan-600 text-white p-4 rounded-full shadow-md">
            <FaUser size={24} />
          </div>
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold text-center mb-8 text-cyan-800"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            بيانات المستخدم الأساسية
          </span>
        </motion.h2>
        
        <motion.div className="space-y-6" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaUser className="ml-2 text-cyan-600" />
              الاسم
            </label>
            <input
              type="text"
              name="name"
              placeholder="أدخل الاسم"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.name}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaEnvelope className="ml-2 text-cyan-600" />
              عنوان البريد
            </label>
            <input
              type="email"
              name="email"
              placeholder="أدخل عنوان البريد"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.email}
              </motion.p>
            )}
            {emailExists && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                البريد الإلكتروني مستخدم بالفعل
              </motion.p>
            )}
            {usernameExists && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                اسم المستخدم مستخدم بالفعل
              </motion.p>
            )}
          </motion.div>
          
          <motion.div className="pt-4 flex justify-between items-center" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={() => navigate(-1)}
              className="py-3 px-5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium shadow-md flex items-center justify-center transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <FaArrowRight className="ml-2" />
              رجوع
            </motion.button>
            
            <motion.button
              type="button"
              onClick={handleSubmit}
              className="py-3 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium shadow-md flex items-center justify-center transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              التالي
              <FaArrowLeft className="mr-2" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const renderSecondStep = () => (
    <motion.div
      variants={formCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="p-8 bg-gradient-to-br from-white to-cyan-50 rounded-xl shadow-xl text-right w-full max-w-lg border border-cyan-100 relative overflow-hidden"
      dir="rtl"
    >
      {/* Decorative Elements */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
      
      <motion.div className="relative z-10" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="flex justify-center mb-6" variants={itemVariants}>
          <div className="bg-cyan-600 text-white p-4 rounded-full shadow-md">
            <FaLock size={24} />
          </div>
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold text-center mb-8 text-cyan-800"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            إكمال بيانات التسجيل
          </span>
        </motion.h2>
        
        <motion.div className="space-y-6" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaLock className="ml-2 text-cyan-600" />
              كلمة المرور
            </label>
            <input
              type="password"
              name="password"
              placeholder="أدخل كلمة المرور"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaPhone className="ml-2 text-cyan-600" />
              رقم الهاتف
            </label>
            <input
              type="text"
              name="phoneNumber"
              placeholder="أدخل رقم الهاتف"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.phoneNumber}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaMapMarkerAlt className="ml-2 text-cyan-600" />
              المنطقة
            </label>
            <select
              name="governorate"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.governorate}
              onChange={handleChange}
            >
              <option value="" disabled>اختر المنطقة</option>
              {governorates.map((option, i) => (
                <option className={`${i < 3 && i !== 0 ? "text-red-600" : ""}`} key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.governorate && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.governorate}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div className="pt-4 flex justify-between items-center" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={() => setFormStep(1)}
              className="py-3 px-5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium shadow-md flex items-center justify-center transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={isSubmitting}
            >
              <FaArrowRight className="ml-2" />
              السابق
            </motion.button>
            
            <motion.button
              type="button"
              onClick={handleSubmit}
              className="py-3 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium shadow-md flex items-center justify-center transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  تسجيل
                  <FaArrowLeft className="mr-2" />
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // Success animation component
  const renderSuccessMessage = () => (
    <motion.div
      variants={formCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="p-8 bg-gradient-to-br from-white to-green-50 rounded-xl shadow-xl text-center w-full max-w-lg border border-green-100"
    >
      <motion.div 
        className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5 }}
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </motion.div>
      
      <motion.h2
        className="text-2xl font-bold mb-4 text-green-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        تم التسجيل بنجاح!
      </motion.h2>
      
      <motion.p
        className="text-gray-600 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        جاري تحويلك إلى صفحة تسجيل الدخول...
      </motion.p>
    </motion.div>
  );

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gradient-to-b from-cyan-100 to-blue-200 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Progress indicator */}
      {!isSubmitting && (
        <motion.div 
          className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
            <motion.div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep === 1 ? 'bg-cyan-600 text-white' : 'bg-cyan-100 text-cyan-600'}`}
              whileHover={{ scale: 1.1 }}
            >
              1
            </motion.div>
            
            <div className="w-8 h-1 bg-cyan-200"></div>
            
            <motion.div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep === 2 ? 'bg-cyan-600 text-white' : 'bg-cyan-100 text-cyan-600'}`}
              whileHover={{ scale: 1.1 }}
            >
              2
            </motion.div>
          </div>
        </motion.div>
      )}
      
      <AnimatePresence mode="wait">
        {isSubmitting ? (
          renderSuccessMessage()
        ) : (
          formStep === 1 ? renderFirstStep() : renderSecondStep()
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RegisterUser;