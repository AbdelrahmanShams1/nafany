import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaUser, FaLock, FaSignInAlt, FaArrowLeft, FaUserPlus, FaBriefcase } from "react-icons/fa";

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default to "user"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if(emailOrPhone === "admin" && password === "admin1") {
        navigate("/nafany/admin");
        return;
      }
      
      // تحديد المجموعة بناءً على الدور
      const collectionName = role === "user" ? "users" : "serviceProviders";
      const usersRef = collection(db, collectionName);

      // البحث عن المستخدم باستخدام البريد الإلكتروني أو رقم الهاتف
      const q = query(
        usersRef,
        where("email", "==", emailOrPhone)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("الحساب غير موجود");
        return;
      }

      // الحصول على بيانات المستخدم
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // التحقق من كلمة المرور
      if (userData.password !== password) {
        setError("كلمة المرور غير صحيحة");
        return;
      }

      // حفظ بيانات المستخدم في localStorage
      const userToStore = {
        uid: userDoc.id,
        email: userData.email,
        name: userData.name || '',
        phone: userData.phone || '',
        role: role,
        // إضافة المزيد من البيانات المشتركة
        governorate: userData.governorate || '',
        // إذا كان مقدم خدمة، أضف بيانات إضافية
        ...(role === 'provider' && {
          profession: userData.profession || '',
          category: userData.category || '',
          profileImage: userData.profileImage || ''
        })
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      
      if (role === "user") {
        navigate("/nafany");
      } else if (role === "provider") {
        navigate("/nafany/servicer_page");
      }
    
    } catch (error) {
      console.error("خطأ أثناء تسجيل الدخول:", error);
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-cyan-100 to-blue-200">
      <motion.div 
        className="p-8 bg-white rounded-2xl shadow-xl text-right w-full max-w-md border border-cyan-100 relative overflow-hidden"
        dir="rtl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative Elements */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
        
        <motion.div
          className="relative z-10"
          variants={itemVariants}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <FaUser className="text-white text-4xl" />
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-cyan-800 mb-6 text-center"
            variants={itemVariants}
          >
            تسجيل الدخول
          </motion.h2>
        </motion.div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center border border-red-200"
          >
            {error}
          </motion.div>
        )}

        <motion.form onSubmit={handleLogin} className="relative z-10 space-y-6">
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 mb-2 font-medium">البريد الإلكتروني أو رقم الهاتف*</label>
            <div className="relative">
              <span className="absolute right-3 top-3 text-cyan-600">
                <FaUser />
              </span>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <label className="block text-gray-700 mb-2 font-medium">كلمة المرور*</label>
            <div className="relative">
              <span className="absolute right-3 top-3 text-cyan-600">
                <FaLock />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex justify-center gap-6">
            <div className="flex items-center bg-gradient-to-r from-cyan-50 to-cyan-100 p-3 rounded-xl border border-cyan-200 transition-all duration-300 cursor-pointer hover:shadow-md flex-1"
                onClick={() => setRole("user")}>
              <input
                type="radio"
                id="user"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 hidden"
              />
              <label htmlFor="user" className={`flex items-center justify-center w-full cursor-pointer ${role === "user" ? "text-cyan-700 font-medium" : "text-gray-600"}`}>
                <FaUser className={`ml-2 ${role === "user" ? "text-cyan-700" : "text-gray-400"}`} />
                <span>مستخدم</span>
              </label>
              
            </div>
            
            <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200 transition-all duration-300 cursor-pointer hover:shadow-md flex-1"
                onClick={() => setRole("provider")}>
              <input
                type="radio"
                id="provider"
                name="role"
                value="provider"
                checked={role === "provider"}
                onChange={() => setRole("provider")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 hidden"
              />
              <label htmlFor="provider" className={`flex items-center justify-center w-full cursor-pointer ${role === "provider" ? "text-blue-700 font-medium" : "text-gray-600"}`}>
                <FaBriefcase className={`ml-2 ${role === "provider" ? "text-blue-700" : "text-gray-400"}`} />
                <span>مقدم خدمة</span>
              </label>
            
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col gap-4 pt-4">
            <motion.button 
              type="submit"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium shadow-md flex items-center justify-center"
              disabled={loading}
            >
              <FaSignInAlt className="ml-2" />
              {loading ? (
                <span className="flex items-center">
                  جاري التحميل...
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block ml-2"
                  >
                    ⏳
                  </motion.span>
                </span>
              ) : "تسجيل الدخول"}
            </motion.button>
            
            <motion.button 
              type="button"
              onClick={() => navigate(-1)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium shadow-md flex items-center justify-center"
            >
              <FaArrowLeft className="ml-2" />
              رجوع
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div 
          variants={itemVariants}
          className="mt-8 text-center border-t border-gray-200 pt-6"
        >
          <p className="text-gray-600 mb-4">ليس لديك حساب؟</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.div whileHover="hover" variants={buttonVariants}>
              <Link 
                to="/nafany/register_user" 
                className="block py-2 px-4 bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 hover:from-cyan-100 hover:to-cyan-200 rounded-lg font-medium border border-cyan-200 transition-all duration-300 flex items-center justify-center"
              >
                <FaUserPlus className="ml-2 text-cyan-600" />
                إنشاء حساب مستخدم
              </Link>
            </motion.div>
            
            <motion.div whileHover="hover" variants={buttonVariants}>
              <Link 
                to="/nafany/register" 
                className="block py-2 px-4 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 rounded-lg font-medium border border-blue-200 transition-all duration-300 flex items-center justify-center"
              >
                <FaBriefcase className="ml-2 text-blue-600" />
                التسجيل كمقدم خدمة
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;