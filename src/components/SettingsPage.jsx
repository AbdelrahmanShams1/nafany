import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaAddressCard, 
  FaBriefcase, 
  FaCogs,
  FaCheckCircle,
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
  FaIdCard,
  FaMoneyBillWave,
  FaMapMarkedAlt,
  FaBell,
  FaImage,
  FaFileAlt
} from "react-icons/fa";

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromProvider = location.state?.fromProvider || false;

  // Container and item animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  // الحقول الأساسية لجميع المستخدمين
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    governorate: "",
    phoneNumber: "",
    role: "" // 'user' أو 'provider'
  });

  // الحقول الخاصة بمقدمي الخدمة فقط
  const [providerData, setProviderData] = useState({
    nationalId: "",
    category: "",
    profession: "",
    subscriptionFee: "",
    idFrontImage: "",
    idBackImage: "",
    profileImage: "",
    bio: "",
    allowContact: false,
    address: "",
    workingAreas: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [idFrontImagePreview, setIdFrontImagePreview] = useState("");
  const [idBackImagePreview, setIdBackImagePreview] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [activeSection, setActiveSection] = useState("basic"); // basic, provider, images

  // قوائم الاختيارات
  const governorates = [
    "وسط البلد", "الزمالك"
  ];

  const serviceCategories = {
    "خدمات فنية": ["سباك", "نجار", "كهربائي", "ميكانيكي", "حداد"],
    "خدمات صحية": ["طبيب", "ممرض", "صيدلي", "فني مختبر"],
    "خدمات عامة": ["توصيل طلبات", "نقل", "تنظيف"]
  };

  const subscriptionFees = ["100 جنيه", "200 جنيه", "300 جنيه"];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          navigate('/nafany/login');
          return;
        }
  
        const currentUser = JSON.parse(storedUser);
        let docId;
        
        // تحديد اسم المجموعة بناءً على الدور
        const collectionName = currentUser.role === 'provider' ? 'serviceProviders' : 'users';
      
        if(collectionName === 'serviceProviders'){
          docId = currentUser.email;
        }
        else{
          docId = currentUser.email.split('@')[0]; // أو استخدام currentUser.uid إذا كان محفوظاً
        }
       
        const userDocRef = doc(db, collectionName, docId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          
          // تعيين البيانات الأساسية المشتركة
          setUserData({
            name: data.name || "",
            email: data.email || "",
            password: "",
            governorate: data.governorate || "",
            phone: data.phone || data.phoneNumber || "",
            role: currentUser.role // استخدام الدور من currentUser
          });
  
          // إذا كان مقدم خدمة، تعيين البيانات الإضافية
          if (currentUser.role === 'provider') {
            setProviderData({
              nationalId: data.nationalId || "",
              category: data.category || "",
              profession: data.profession || "",
              subscriptionFee: data.subscriptionFee || "",
              idFrontImage: data.idFrontImage || "",
              idBackImage: data.idBackImage || "",
              profileImage: data.profileImage || "",
              bio: data.bio || "",
              allowContact: data.allowContact || false,
              address: data.address || "",
              workingAreas: data.workingAreas || []
            });
  
            // تعيين معاينات الصور
            if (data.idFrontImage) setIdFrontImagePreview(data.idFrontImage);
            if (data.idBackImage) setIdBackImagePreview(data.idBackImage);
            if (data.profileImage) setProfileImagePreview(data.profileImage);
          }
        } else {
          alert("لم يتم العثور على بيانات المستخدم");
          navigate('/nafany');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserData();
  }, [navigate]);

  const validateForm = () => {
    let newErrors = {};

    // التحقق من الحقول الأساسية
    if (!userData.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!userData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }
    if (userData.password && userData.password.length < 6) {
      newErrors.password = "يجب أن تكون كلمة المرور 6 أحرف على الأقل";
    }
    if (!userData.governorate) newErrors.governorate = "يجب اختيار المحافظة";
    if (!userData.phone) newErrors.phone = "رقم الهاتف مطلوب";

    // التحقق من حقول مقدم الخدمة إذا كان المستخدم مقدم خدمة
    if (userData.role === 'provider') {
      if (!providerData.nationalId) newErrors.nationalId = "الرقم القومي مطلوب";
      if (!providerData.profession) newErrors.profession = "المهنة مطلوبة";
      if (!providerData.address) newErrors.address = "العنوان مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUserDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleProviderDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProviderData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setProviderData(prev => ({
      ...prev,
      category: selectedCategory,
      profession: serviceCategories[selectedCategory]?.[0] || ""
    }));
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;
      setProviderData(prev => ({ ...prev, [field]: base64Image }));
      
      if (field === 'idFrontImage') setIdFrontImagePreview(base64Image);
      else if (field === 'idBackImage') setIdBackImagePreview(base64Image);
      else if (field === 'profileImage') setProfileImagePreview(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const handleWorkingAreaChange = (e) => {
    const { value, checked } = e.target;
    setProviderData(prev => {
      if (checked) {
        return { ...prev, workingAreas: [...prev.workingAreas, value] };
      } else {
        return { ...prev, workingAreas: prev.workingAreas.filter(area => area !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      let username;
      
      if (userData.role === 'provider') {
       username = userData.email;
      }
      else {
        username = userData.email.split('@')[0];
      }
      const collectionName = userData.role === 'provider' ? 'serviceProviders' : 'users';
      
      const userDocRef = doc(db, collectionName, username);
      console.log("Document Reference:", userDocRef.path); // طباعة مسار الوثيقة في وحدة التحكم
      
      // تحضير بيانات التحديث
      const updateData = { 
        ...userData,
        ...(userData.role === 'provider' ? providerData : {})
      };

      // عدم تحديث كلمة المرور إذا كانت فارغة
      if (!updateData.password) {
        delete updateData.password;
      } else {
          // هنا يمكنك تشفير كلمة المرور قبل حفظها
      }
   
      await updateDoc(userDocRef, updateData);
      
      // تحديث localStorage
      const updatedUser = {
        ...userData,
        ...(userData.role === 'provider' ? providerData : {})
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setUpdateSuccess(true);
      setIsEditing(false);

      // إظهار رسالة النجاح لمدة 3 ثوان ثم إخفاؤها
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("حدث خطأ أثناء تحديث البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  // مكونات الشاشة المختلفة
  const renderBasicInfoSection = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaUser className="ml-2 text-cyan-600" />
          الاسم
        </label>
        <div className="relative group">
          <input
            type="text"
            name="name"
            placeholder="أدخل الاسم"
            className={`w-full border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 bg-white/80 backdrop-blur-sm transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={userData.name}
            onChange={handleUserDataChange}
            disabled={!isEditing}
          />
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaEnvelope className="ml-2 text-cyan-600" />
          البريد الإلكتروني
        </label>
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="أدخل البريد الإلكتروني"
            className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 bg-gray-50"
            value={userData.email}
            onChange={handleUserDataChange}
            disabled={true} // لا يمكن تعديل البريد الإلكتروني
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <FaLock />
          </div>
        </div>
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaLock className="ml-2 text-cyan-600" />
          كلمة المرور
          <span className="mr-1 text-xs text-gray-500">(اتركها فارغة إذا لم ترغب في تغييرها)</span>
        </label>
        <div className="relative group">
          <input
            type="password"
            name="password"
            placeholder="أدخل كلمة المرور الجديدة"
            className={`w-full border ${errors.password ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={userData.password}
            onChange={handleUserDataChange}
            disabled={!isEditing}
          />
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaPhone className="ml-2 text-cyan-600" />
          رقم الهاتف
        </label>
        <div className="relative group">
          <input
            type="tel"
            name="phone"
            placeholder="أدخل رقم الهاتف"
            className={`w-full border ${errors.phone ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={userData.phone}
            onChange={handleUserDataChange}
            disabled={!isEditing}
          />
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaMapMarkerAlt className="ml-2 text-cyan-600" />
          المحافظة
        </label>
        <div className="relative group">
          <select
            name="governorate"
            className={`w-full border ${errors.governorate ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={userData.governorate}
            onChange={handleUserDataChange}
            disabled={!isEditing}
          >
            <option value="" disabled>اختر المحافظة</option>
            {governorates.map((gov, i) => (
              <option key={i} value={gov}>{gov}</option>
            ))}
          </select>
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
        {errors.governorate && <p className="text-red-500 text-sm">{errors.governorate}</p>}
      </motion.div>
    </motion.div>
  );

  const renderProviderSection = () => (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-6"
    >
      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaIdCard className="ml-2 text-cyan-600" />
          الرقم القومي
        </label>
        <div className="relative group">
          <input
            type="text"
            name="nationalId"
            placeholder="أدخل الرقم القومي"
            className={`w-full border ${errors.nationalId ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={providerData.nationalId}
            onChange={handleProviderDataChange}
            disabled={!isEditing}
          />
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
        {errors.nationalId && <p className="text-red-500 text-sm">{errors.nationalId}</p>}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaBriefcase className="ml-2 text-cyan-600" />
          التصنيف
        </label>
        <div className="relative group">
          <select
            name="category"
            className={`w-full border ${errors.category ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={providerData.category}
            onChange={handleCategoryChange}
            disabled={!isEditing}
          >
            <option value="" disabled>اختر التصنيف</option>
            {Object.keys(serviceCategories).map((category, i) => (
              <option key={i} value={category}>{category}</option>
            ))}
          </select>
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaBriefcase className="ml-2 text-cyan-600" />
          المهنة
        </label>
        <div className="relative group">
          <select
            name="profession"
            className={`w-full border ${errors.profession ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={providerData.profession}
            onChange={handleProviderDataChange}
            disabled={!isEditing}
          >
            <option value="" disabled>اختر المهنة</option>
            {providerData.category && serviceCategories[providerData.category]?.map((profession, i) => (
              <option key={i} value={profession}>{profession}</option>
            ))}
          </select>
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
        {errors.profession && <p className="text-red-500 text-sm">{errors.profession}</p>}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaMoneyBillWave className="ml-2 text-cyan-600" />
          رسوم الاشتراك
        </label>
        <div className="relative group">
          <select
            name="subscriptionFee"
            className={`w-full border ${errors.subscriptionFee ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={providerData.subscriptionFee}
            onChange={handleProviderDataChange}
            disabled={!isEditing}
          >
            {subscriptionFees.map((fee, i) => (
              <option key={i} value={fee}>{fee}</option>
            ))}
          </select>
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaMapMarkedAlt className="ml-2 text-cyan-600" />
          العنوان
        </label>
        <div className="relative group">
          <input
            type="text"
            name="address"
            placeholder="أدخل العنوان بالتفصيل"
            className={`w-full border ${errors.address ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md ${!isEditing && 'bg-gray-50'}`}
            value={providerData.address}
            onChange={handleProviderDataChange}
            disabled={!isEditing}
          />
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
        {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <label className="block text-gray-700 font-medium text-sm flex items-center">
          <FaFileAlt className="ml-2 text-cyan-600" />
          نبذة عنك
        </label>
        <div className="relative group">
          <textarea
            name="bio"
            placeholder="أدخل نبذة عنك وخبراتك"
            className={`w-full border ${errors.bio ? 'border-red-400' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 group-hover:shadow-md h-24 ${!isEditing && 'bg-gray-50'}`}
            value={providerData.bio}
            onChange={handleProviderDataChange}
            disabled={!isEditing}
          />
          <div className="absolute left-3 top-3 text-gray-400">
            {isEditing && <FaEdit />}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            name="allowContact"
            checked={providerData.allowContact}
            onChange={handleProviderDataChange}
            disabled={!isEditing}
            className="rounded text-cyan-600 focus:ring-cyan-500 h-5 w-5"
          />
          <div className="flex items-center">
            <FaBell className="ml-2 text-cyan-600" />
            <span className="text-gray-700">السماح بالتواصل المباشر مع العملاء</span>
          </div>
        </label>
      </motion.div>
    </motion.div>
  );

  const renderImagesSection = () => (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-xl font-semibold text-cyan-800 mb-4 flex items-center">
          <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2">
            <FaIdCard />
          </span>
          صور البطاقة الشخصية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className="space-y-2"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block font-medium text-gray-700">صورة البطاقة من الأمام</label>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-1 shadow-md overflow-hidden">
              {idFrontImagePreview ? (
                <img src={idFrontImagePreview} alt="Front ID" className="h-48 w-full object-contain rounded-lg" />
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-48 flex items-center justify-center">
                  <span className="text-gray-500 flex flex-col items-center">
                    <FaIdCard className="text-4xl mb-2 text-gray-400" />
                    لا توجد صورة
                  </span>
                </div>
              )}
            </div>
            {isEditing && (
              <div className="relative mt-2">
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'idFrontImage')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="image/*"
                />
                <button className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition flex items-center justify-center">
                  <FaImage className="ml-2" />
                  اختر صورة
                </button>
              </div>
            )}
          </motion.div>
        
          <motion.div 
            className="space-y-2"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block font-medium text-gray-700">صورة البطاقة من الخلف</label>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-1 shadow-md overflow-hidden">
              
{idBackImagePreview ? (
                <img src={idBackImagePreview} alt="Back ID" className="h-48 w-full object-contain rounded-lg" />
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-48 flex items-center justify-center">
                  <span className="text-gray-500 flex flex-col items-center">
                    <FaIdCard className="text-4xl mb-2 text-gray-400" />
                    لا توجد صورة
                  </span>
                </div>
              )}
            </div>
            {isEditing && (
              <div className="relative mt-2">
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'idBackImage')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="image/*"
                />
                <button className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition flex items-center justify-center">
                  <FaImage className="ml-2" />
                  اختر صورة
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-xl font-semibold text-cyan-800 mb-4 flex items-center">
          <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2">
            <FaUser />
          </span>
          الصورة الشخصية
        </h3>
        <div className="flex justify-center">
          <motion.div 
            className="space-y-2 w-full max-w-sm"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl p-1 shadow-md overflow-hidden">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="h-48 w-full object-contain rounded-lg" />
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-48 flex items-center justify-center">
                  <span className="text-gray-500 flex flex-col items-center">
                    <FaUser className="text-4xl mb-2 text-gray-400" />
                    لا توجد صورة
                  </span>
                </div>
              )}
            </div>
            {isEditing && (
              <div className="relative mt-2">
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'profileImage')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="image/*"
                />
                <button className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition flex items-center justify-center">
                  <FaImage className="ml-2" />
                  اختر صورة
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderWorkingAreasSection = () => (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-4"
    >
      <motion.h3 variants={itemVariants} className="text-xl font-semibold text-cyan-800 mb-4 flex items-center">
        <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2">
          <FaMapMarkedAlt />
        </span>
        مناطق العمل
      </motion.h3>

      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {governorates.map((area, index) => (
            <label key={index} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                value={area}
                checked={providerData.workingAreas.includes(area)}
                onChange={handleWorkingAreaChange}
                disabled={!isEditing}
                className="rounded text-cyan-600 focus:ring-cyan-500 h-5 w-5"
              />
              <span className="text-gray-700">{area}</span>
            </label>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  // المكون الرئيسي للصفحة
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* الرأس مع زر العودة */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-cyan-700 hover:text-cyan-900"
          >
            <FaArrowLeft className="ml-1" /> العودة
          </button>
          <h1 className="text-3xl font-bold text-cyan-800">إعدادات الحساب</h1>
        </div>

        {isLoading ? (
          // شاشة التحميل
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* رسالة التحديث الناجح */}
            <AnimatePresence>
              {updateSuccess && (
                <motion.div 
                  className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center shadow-md"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FaCheckCircle className="text-green-500 ml-2 text-xl" />
                  تم تحديث بياناتك بنجاح
                </motion.div>
              )}
            </AnimatePresence>

            {/* أزرار التحرير والحفظ */}
            <div className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
              <div className="text-lg font-medium text-gray-700 flex items-center">
                <FaCogs className="ml-2 text-cyan-700" />
                {isEditing ? "تعديل البيانات" : "بيانات الحساب"}
              </div>
              <div className="space-x-2 flex">
                {isEditing ? (
                  <>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleSubmit}
                      className="bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition flex items-center"
                    >
                      <FaSave className="ml-1" /> حفظ
                    </motion.button>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition flex items-center"
                    >
                      <FaTimes className="ml-1" /> إلغاء
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setIsEditing(true)}
                    className="bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition flex items-center"
                  >
                    <FaEdit className="ml-1" /> تعديل
                  </motion.button>
                )}
              </div>
            </div>

            {/* علامات التبويب */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveSection("basic")}
                  className={`flex-1 py-3 px-4 font-medium transition-colors duration-300 ${
                    activeSection === "basic" 
                      ? "bg-cyan-100 text-cyan-800 border-b-2 border-cyan-600" 
                      : "text-gray-600 hover:bg-cyan-50"
                  }`}
                >
                  البيانات الأساسية
                </button>
                {userData.role === 'provider' && (
                  <>
                    <button
                      onClick={() => setActiveSection("provider")}
                      className={`flex-1 py-3 px-4 font-medium transition-colors duration-300 ${
                        activeSection === "provider" 
                          ? "bg-cyan-100 text-cyan-800 border-b-2 border-cyan-600" 
                          : "text-gray-600 hover:bg-cyan-50"
                      }`}
                    >
                      بيانات مقدم الخدمة
                    </button>
                    <button
                      onClick={() => setActiveSection("images")}
                      className={`flex-1 py-3 px-4 font-medium transition-colors duration-300 ${
                        activeSection === "images" 
                          ? "bg-cyan-100 text-cyan-800 border-b-2 border-cyan-600" 
                          : "text-gray-600 hover:bg-cyan-50"
                      }`}
                    >
                      الصور والوثائق
                    </button>
                    <button
                      onClick={() => setActiveSection("areas")}
                      className={`flex-1 py-3 px-4 font-medium transition-colors duration-300 ${
                        activeSection === "areas" 
                          ? "bg-cyan-100 text-cyan-800 border-b-2 border-cyan-600" 
                          : "text-gray-600 hover:bg-cyan-50"
                      }`}
                    >
                      مناطق العمل
                    </button>
                  </>
                )}
              </div>

              {/* محتوى التبويب النشط */}
              <div className="p-6">
                {activeSection === "basic" && renderBasicInfoSection()}
                {activeSection === "provider" && userData.role === 'provider' && renderProviderSection()}
                {activeSection === "images" && userData.role === 'provider' && renderImagesSection()}
                {activeSection === "areas" && userData.role === 'provider' && renderWorkingAreasSection()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;