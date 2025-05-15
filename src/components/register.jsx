import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, setDoc, query, where, getDocs, doc } from "firebase/firestore";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaArrowRight, FaArrowLeft, FaIdCard, FaBriefcase, FaBuilding, FaMoneyBillWave } from "react-icons/fa";

const RegisterProvider = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nationalId: "",
    governorate: "",
    category: "",
    profession: "",
    subscriptionFee: "",
    idFrontImage: null,
    idBackImage: null,
    profileImage: null,
    bio: "",
    allowContact: false,
    phone: "",
    address: "",
    ratings: {},
    chats: {},
    worksCount: 0,
    averageRating: 0,
    totalRatings: 0,
    role: "user",
    works: [],
    worksCount: 0,
  });

  const [previewFrontImage, setPreviewFrontImage] = useState(null);
  const [previewBackImage, setPreviewBackImage] = useState(null);
  const [previewProfileImage, setPreviewProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const governorates = [
    "وسط البلد", "الزمالك"
  ];

  const serviceCategories = {
    "خدمات فنية": [
      "سباك", "نجار", "كهربائي", "ميكانيكي", "حداد",
      "فني تكييفات", "نقاش", "ترزي",
    ],
    "خدمات صحية": [
      "طبيب عام", "صيدلي", "أخصائي تغذية",
      "ممرض", "أخصائي علاج طبيعي", "طبيب أسنان"
    ],
    "خدمات عامة": [
      "سوبر ماركت", "مطعم", "كافيه", "مولات",
    ],
    "خدمات أخرى": [
      "عطار", "جزار", "فكهاني", "خضري",
      "محل ألبان",
    ]
  };

  const subscriptionFees = ["100 جنيه", "200 جنيه", "300 جنيه"];

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      governorate: governorates[0],
      category: Object.keys(serviceCategories)[0],
      profession: serviceCategories[Object.keys(serviceCategories)[0]][0],
      subscriptionFee: subscriptionFees[0],
    }));
  }, []);

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
      
      if (!formData.password.trim()) {
        newErrors.password = "كلمة المرور مطلوبة";
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = "يجب أن تكون كلمة المرور 6 أحرف على الأقل";
        isValid = false;
      }
    } else if (formStep === 2) {
      if (!formData.nationalId.trim()) {
        newErrors.nationalId = "الرقم القومي مطلوب";
        isValid = false;
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = "رقم الهاتف مطلوب";
        isValid = false;
      }
      
      if (!formData.address.trim()) {
        newErrors.address = "العنوان مطلوب";
        isValid = false;
      }
    } else if (formStep === 3) {
      if (!formData.idFrontImage) {
        newErrors.idFrontImage = "صورة البطاقة الأمامية مطلوبة";
        isValid = false;
      }
      
      if (!formData.idBackImage) {
        newErrors.idBackImage = "صورة البطاقة الخلفية مطلوبة";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const checkEmailExists = async (email) => {
    const q = query(collection(db, "serviceProviders"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleImageUpload = (file, field) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;
      setFormData((prev) => ({
        ...prev,
        [field]: base64Image,
      }));

      if (field === "idFrontImage") {
        setPreviewFrontImage(base64Image);
        setErrors({...errors, idFrontImage: ""});
      } else if (field === "idBackImage") {
        setPreviewBackImage(base64Image);
        setErrors({...errors, idBackImage: ""});
      } else if (field === "profileImage") {
        setPreviewProfileImage(base64Image);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: selectedCategory,
      profession: serviceCategories[selectedCategory][0],
      allowContact: selectedCategory === "خدمات فنية" ? prev.allowContact : false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (formStep < 3) {
      setFormStep(formStep + 1);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const emailAlreadyExists = await checkEmailExists(formData.email);
      
      if (emailAlreadyExists) {
        setEmailExists(true);
        setIsSubmitting(false);
        return;
      }
  
      if (!formData.idFrontImage || !formData.idBackImage) {
        setErrors({
          ...errors,
          idFrontImage: !formData.idFrontImage ? "صورة البطاقة الأمامية مطلوبة" : "",
          idBackImage: !formData.idBackImage ? "صورة البطاقة الخلفية مطلوبة" : ""
        });
        setIsSubmitting(false);
        return;
      }
  
      const providerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password, 
        nationalId: formData.nationalId,
        governorate: formData.governorate,
        category: formData.category,
        profession: formData.profession,
        subscriptionFee: formData.subscriptionFee,
        idFrontImage: formData.idFrontImage,
        idBackImage: formData.idBackImage,
        profileImage: formData.profileImage,
        bio: formData.bio,
        phone: formData.phone,
        address: formData.address,
        createdAt: new Date(),
        ratings: {},
        chats: {},
        works: [],
        worksCount: 0,
        averageRating: 0,
        totalRatings: 0,
        bookings: [],
        reviews: [],
        ratingsCount: 0,
        ratingsTotal: 0
      };

      if (formData.category === "خدمات فنية") {
        providerData.allowContact = formData.allowContact;
      }
  
      await setDoc(doc(db, "serviceProviders", formData.email), providerData);
      
      // Success animation before navigation
      setTimeout(() => {
        navigate("/nafany/login");
      }, 1500);
    } catch (e) {
      console.error("حدث خطأ أثناء التسجيل: ", e);
      alert("حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    if (name === "email" && emailExists) {
      setEmailExists(false);
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
            بيانات مقدم الخدمة الأساسية
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
          </motion.div>
          
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
            <FaBriefcase size={24} />
          </div>
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold text-center mb-8 text-cyan-800"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            بيانات الخدمة والاتصال
          </span>
        </motion.h2>
        
        <motion.div className="space-y-6" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaIdCard className="ml-2 text-cyan-600" />
              الرقم القومي
            </label>
            <input
              type="text"
              name="nationalId"
              placeholder="أدخل الرقم القومي"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.nationalId}
              onChange={handleChange}
            />
            {errors.nationalId && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.nationalId}
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
              name="phone"
              placeholder="أدخل رقم الهاتف"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.phone}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaMapMarkerAlt className="ml-2 text-cyan-600" />
              العنوان
            </label>
            <input
              type="text"
              name="address"
              placeholder="أدخل العنوان"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.address}
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
              onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
            >
              {governorates.map((option, i) => (
                <option className={`${i < 3 && i !== 0 ? "text-red-600" : ""}`} key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </motion.div>
          
          <motion.div className="pt-4 flex justify-between items-center" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={() => setFormStep(1)}
              className="py-3 px-5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium shadow-md flex items-center justify-center transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
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
            >
              التالي
              <FaArrowLeft className="mr-2" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const renderThirdStep = () => (
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
            <FaBuilding size={24} />
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
              <FaBriefcase className="ml-2 text-cyan-600" />
              التصنيف
            </label>
            <select
              name="category"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.category}
              onChange={handleCategoryChange}
            >
              {Object.keys(serviceCategories).map((category, i) => (
                <option key={i} value={category}>{category}</option>
              ))}
            </select>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaBriefcase className="ml-2 text-cyan-600" />
              المهنة/الخدمة
            </label>
            <select
              name="profession"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            >
              {serviceCategories[formData.category]?.map((profession, i) => (
                <option key={i} value={profession}>{profession}</option>
              ))}
            </select>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <FaMoneyBillWave className="ml-2 text-cyan-600" />
              رسوم الاشتراك
            </label>
            <select
              name="subscriptionFee"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              required
              value={formData.subscriptionFee}
              onChange={(e) => setFormData({ ...formData, subscriptionFee: e.target.value })}
            >
              {subscriptionFees.map((fee, i) => (
                <option key={i} value={fee}>{fee}</option>
              ))}
            </select>
          </motion.div>
          
          {formData.category === "خدمات فنية" && (
            <motion.div variants={itemVariants} className="bg-cyan-50 p-3 rounded-lg">
              <label className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.allowContact}
                  onChange={(e) => setFormData({ ...formData, allowContact: e.target.checked })}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-gray-700 mr-2">السماح بالتواصل المباشر بين الفني والعميل</span>
              </label>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 font-medium mb-2">تعريف شخصي</label>
            <textarea
              name="bio"
              placeholder="أدخل تعريفاً شخصياً مختصراً عنك وخبراتك"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 h-24"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-4">
           <label className="block text-gray-700 font-medium mb-2">الصور</label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2">صورة شخصية (اختيارية)</label>
                <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg hover:border-cyan-500 transition-colors duration-300">
                  {previewProfileImage ? (
                    <div className="relative w-full">
                      <img src={previewProfileImage} alt="Profile Preview" className="rounded-lg h-32 mx-auto" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewProfileImage(null);
                          setFormData({ ...formData, profileImage: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-xs text-gray-500">اضغط لتحميل صورة</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0], "profileImage")}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">صورة البطاقة (الأمامية) *</label>
                <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg hover:border-cyan-500 transition-colors duration-300">
                  {previewFrontImage ? (
                    <div className="relative w-full">
                      <img src={previewFrontImage} alt="ID Front Preview" className="rounded-lg h-32 mx-auto" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewFrontImage(null);
                          setFormData({ ...formData, idFrontImage: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-xs text-gray-500">اضغط لتحميل صورة</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0], "idFrontImage")}
                      />
                    </label>
                  )}
                </div>
                {errors.idFrontImage && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.idFrontImage}
                  </motion.p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">صورة البطاقة (الخلفية) *</label>
                <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg hover:border-cyan-500 transition-colors duration-300">
                  {previewBackImage ? (
                    <div className="relative w-full">
                      <img src={previewBackImage} alt="ID Back Preview" className="rounded-lg h-32 mx-auto" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewBackImage(null);
                          setFormData({ ...formData, idBackImage: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-xs text-gray-500">اضغط لتحميل صورة</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0], "idBackImage")}
                      />
                    </label>
                  )}
                </div>
                {errors.idBackImage && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.idBackImage}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div className="pt-6 flex justify-between items-center" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={() => setFormStep(2)}
              className="py-3 px-5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium shadow-md flex items-center justify-center transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <FaArrowRight className="ml-2" />
              السابق
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`py-3 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium shadow-md flex items-center justify-center transition-all duration-300 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              variants={buttonVariants}
              whileHover={!isSubmitting && "hover"}
              whileTap={!isSubmitting && "tap"}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري التسجيل...
                </span>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-cyan-800 mb-4">
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent inline-block">
              إنضم إلينا كمقدم خدمة
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            قم بإكمال المعلومات التالية للانضمام إلى منصتنا
          </p>
        </div>
        
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="w-full absolute top-1/2 transform -translate-y-1/2">
              <div className="h-1 bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${((formStep - 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-500 ${
                  step <= formStep
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                    : "bg-white text-gray-400 border border-gray-300"
                } ${step < formStep ? "cursor-pointer" : ""}`}
                style={{ width: "40px", height: "40px" }}
                onClick={() => step < formStep && setFormStep(step)}
              >
                {step}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mt-2 px-2">
            <div className="text-center">
              <span className={formStep >= 1 ? "text-cyan-700 font-medium" : ""}>البيانات الأساسية</span>
            </div>
            <div className="text-center">
              <span className={formStep >= 2 ? "text-cyan-700 font-medium" : ""}>بيانات الاتصال</span>
            </div>
            <div className="text-center">
              <span className={formStep >= 3 ? "text-cyan-700 font-medium" : ""}>إكمال التسجيل</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {formStep === 1 && renderFirstStep()}
            {formStep === 2 && renderSecondStep()}
            {formStep === 3 && renderThirdStep()}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export default RegisterProvider;
              