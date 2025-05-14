import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaWhatsapp, 
  FaLinkedin, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaArrowLeft, 
  FaStar
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-cyan-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative Elements */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
        
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-cyan-700 to-cyan-800 py-8 px-8 text-center relative overflow-hidden"
          variants={itemVariants}
        >
          <div className="absolute -right-6 -top-6 w-12 h-12 bg-cyan-500 opacity-20 rounded-full"></div>
          <div className="absolute -left-6 -bottom-6 w-12 h-12 bg-cyan-900 opacity-20 rounded-full"></div>
          
          <motion.h1 
            className="text-3xl font-bold text-white flex items-center justify-center gap-3"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-white text-cyan-700 p-2 rounded-lg">
              <FaEnvelope />
            </span>
            تواصل معنا
          </motion.h1>
        </motion.div>

        {/* About Project Section */}
        <motion.div 
          className="p-8 border-b border-gray-100" 
          dir="rtl"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-2xl font-bold text-cyan-800 mb-4 flex items-center"
            variants={itemVariants}
          >
            <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2">
              <FaStar />
            </span>
            نبذة عن المشروع
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 text-lg mb-6"
            variants={itemVariants}
          >
            موقعنا هو منصة متكاملة تتيح للمستخدمين العثور على مختلف الخدمات المتوفرة في منطقتهم بسهولة وسرعة. 
            سواء كنت تبحث عن خدمات صيانة منزلية، أو خدمات طبية، أو أي نوع آخر من الخدمات،
            فإن منصتنا تساعدك في العثور على أفضل مقدمي الخدمات القريبين من موقعك.
          </motion.p>
          
          <motion.p 
            className="text-gray-600 text-lg mb-6"
            variants={itemVariants}
          >
            نهدف إلى ربط المستخدمين بمقدمي الخدمات المؤهلين والموثوقين، مما يوفر الوقت والجهد ويضمن الحصول على خدمة ذات جودة عالية.
            نحن نعمل باستمرار على توسيع قاعدة بياناتنا وتحسين تجربة المستخدم لجعل عملية البحث عن الخدمات أكثر سهولة ومتعة.
          </motion.p>
        </motion.div>

        {/* Contact Links Section */}
        <motion.div 
          className="p-8" 
          dir="rtl"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-2xl font-bold text-cyan-800 mb-6 flex items-center"
            variants={itemVariants}
          >
            <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2">
              <FaPhone />
            </span>
            وسائل التواصل
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Social Media Links */}
            <motion.div 
              className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl text-center relative overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="absolute -right-6 -top-6 w-12 h-12 bg-cyan-200 rounded-full"></div>
              
              <motion.h3 
                className="text-xl font-semibold text-cyan-800 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                تابعنا على مواقع التواصل الاجتماعي
              </motion.h3>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                variants={containerVariants}
              >
                <motion.a 
                  href="https://facebook.com/projectname" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <FaFacebookF /> فيسبوك
                </motion.a>
                
                <motion.a 
                  href="https://instagram.com/projectname" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <FaInstagram /> انستجرام
                </motion.a>
                
                <motion.a 
                  href="https://wa.me/+201234567890" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <FaWhatsapp /> واتساب
                </motion.a>
                
                <motion.a 
                  href="https://linkedin.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <FaLinkedin /> لينكدين
                </motion.a>
                
                <motion.a 
                  href="mailto:info@projectname.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <FaEnvelope /> البريد الإلكتروني
                </motion.a>
              </motion.div>
            </motion.div>
            
            {/* Contact Info */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl relative overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="absolute -right-6 -top-6 w-12 h-12 bg-blue-200 rounded-full"></div>
              
              <motion.h3 
                className="text-xl font-semibold text-cyan-800 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                معلومات الاتصال
              </motion.h3>
              
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
              >
                <motion.div 
                  className="bg-white p-4 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="bg-red-100 text-red-500 p-3 rounded-lg ml-4">
                    <FaEnvelope />
                  </span>
                  <div>
                    <p className="text-gray-500 text-sm">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-800">info@projectname.com</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-4 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="bg-green-100 text-green-500 p-3 rounded-lg ml-4">
                    <FaPhone />
                  </span>
                  <div>
                    <p className="text-gray-500 text-sm">رقم الهاتف</p>
                    <p className="font-medium text-gray-800">+20 123 456 7890</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-4 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="bg-blue-100 text-blue-500 p-3 rounded-lg ml-4">
                    <FaMapMarkerAlt />
                  </span>
                  <div>
                    <p className="text-gray-500 text-sm">العنوان</p>
                    <p className="font-medium text-gray-800">المنطقة الرئيسية، المدينة، البلد</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Send Message Form */}
        <motion.div 
          className="p-8 bg-gradient-to-br from-gray-50 to-gray-100" 
          dir="rtl"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-2xl font-bold text-cyan-800 mb-6 flex items-center"
            variants={itemVariants}
          >
            <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2">
              <FaEnvelope />
            </span>
            أرسل لنا رسالة
          </motion.h2>
          
          <motion.form 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            <motion.div
              className="md:col-span-1"
              variants={itemVariants}
            >
              <label className="block text-gray-700 font-medium mb-2">الاسم</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all duration-300"
                placeholder="أدخل اسمك الكامل"
              />
            </motion.div>
            
            <motion.div
              className="md:col-span-1"
              variants={itemVariants}
            >
              <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all duration-300"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </motion.div>
            
            <motion.div
              className="md:col-span-2"
              variants={itemVariants}
            >
              <label className="block text-gray-700 font-medium mb-2">الموضوع</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all duration-300"
                placeholder="أدخل موضوع الرسالة"
              />
            </motion.div>
            
            <motion.div
              className="md:col-span-2"
              variants={itemVariants}
            >
              <label className="block text-gray-700 font-medium mb-2">الرسالة</label>
              <textarea 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all duration-300 h-32 resize-none"
                placeholder="اكتب رسالتك هنا..."
              ></textarea>
            </motion.div>
            
            <motion.div
              className="md:col-span-2 text-center"
              variants={itemVariants}
            >
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-8 py-3 rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 shadow-md hover:shadow-lg"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                إرسال الرسالة
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
        
        {/* Back Button */}
        <motion.div 
          className="p-8 text-center bg-gray-50"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => navigate('/nafany')}
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-3 rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FaArrowLeft />
            العودة للصفحة الرئيسية
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Contact;