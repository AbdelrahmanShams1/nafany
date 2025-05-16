import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaUserTie, 
  FaCommentDots, 
  FaStar, 
  FaArrowDown, 
  FaArrowUp, 
  FaEdit,
  FaTrash,
  FaEye,
  FaReply,
  FaCheck,
  FaTimes,
  FaBars,
  FaSignOutAlt,
  FaExclamationTriangle, 
  FaCheckCircle,
  FaExclamationCircle 
} from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  // حالات الصفحة
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [notification, setNotification] = useState(null);
  const [reviewSource, setReviewSource] = useState("embedded"); // "embedded" or "collection"
  const [showExpanded, setShowExpanded] = useState({
    users: false,
    providers: false,
    feedbacks: false,
    reviews: false
  });

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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // جلب المستخدمين
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);

        // جلب مقدمي الخدمة
        const providersSnapshot = await getDocs(collection(db, "serviceProviders"));
        const providersData = providersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProviders(providersData);
        
        // محاولة جلب التقييمات من كوليكشن منفصل
        try {
         
          {
            // استخراج جميع التقييمات من داخل بيانات مقدمي الخدمة
            const allReviews = [];
            providersData.forEach(provider => {
              if (provider.reviews && Array.isArray(provider.reviews)) {
                const providerReviews = provider.reviews.map(review => ({
                  ...review,
                  providerName: provider.name,
                  providerEmail: provider.email,
                  providerId: provider.id
                }));
                allReviews.push(...providerReviews);
              }
            });
            setReviews(allReviews);
            setReviewSource("embedded");
          }
        } catch (error) {
          console.error("خطأ في جلب التقييمات:", error);
          // استخراج جميع التقييمات من داخل بيانات مقدمي الخدمة كخطة بديلة
          const allReviews = [];
          providersData.forEach(provider => {
            if (provider.reviews && Array.isArray(provider.reviews)) {
              const providerReviews = provider.reviews.map(review => ({
                ...review,
                providerName: provider.name,
                providerEmail: provider.email,
                providerId: provider.id
              }));
              allReviews.push(...providerReviews);
            }
          });
          setReviews(allReviews);
          setReviewSource("embedded");
        }

        // جلب الشكاوى والاقتراحات
        const feedbacksSnapshot = await getDocs(collection(db, "feedbacks"));
        const feedbacksData = feedbacksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedbacks(feedbacksData);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        alert("حدث خطأ أثناء تحميل البيانات");
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // حذف عنصر
  const handleDelete = (itemId, collectionName) => {
    setItemToDelete({ itemId, collectionName });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        if (itemToDelete.collectionName === "reviews") {
          if (reviewSource === "embedded") {
            // العثور على مقدم الخدمة الذي يحتوي على التقييم
            const reviewInfo = reviews.find(review => review.id === itemToDelete.itemId);
            if (reviewInfo && reviewInfo.providerId) {
              const providerRef = doc(db, "serviceProviders", reviewInfo.providerId);
              const providerSnap = await getDoc(providerRef);
              
              if (providerSnap.exists()) {
                const providerData = providerSnap.data();
                // حذف التقييم من مصفوفة التقييمات
                const updatedReviews = (providerData.reviews || []).filter(
                  review => review.id !== itemToDelete.itemId
                );
                
                // تحديث متوسط التقييم والعدد الإجمالي للتقييمات
                let ratingsTotal = 0;
                updatedReviews.forEach(review => {
                  ratingsTotal += review.rating || 0;
                });
                const averageRating = updatedReviews.length > 0 
                  ? ratingsTotal / updatedReviews.length 
                  : 0;
                
                // تحديث بيانات مقدم الخدمة
                await updateDoc(providerRef, {
                  reviews: updatedReviews,
                  ratingsCount: updatedReviews.length,
                  ratingsTotal: ratingsTotal,
                  averageRating: averageRating
                });
              }
            }
          } else {
            // حذف من كوليكشن التقييمات المنفصل
            await deleteDoc(doc(db, "reviews", itemToDelete.itemId));
          }
          
          // تحديث قائمة التقييمات في الواجهة
          setReviews(reviews.filter(review => review.id !== itemToDelete.itemId));
        } else {
          // حذف عنصر من collection آخر
          await deleteDoc(doc(db, itemToDelete.collectionName, itemToDelete.itemId));
          
          // تحديث الواجهة بعد الحذف
          if (itemToDelete.collectionName === "users") {
            setUsers(users.filter(user => user.id !== itemToDelete.itemId));
          } else if (itemToDelete.collectionName === "serviceProviders") {
            setProviders(providers.filter(provider => provider.id !== itemToDelete.itemId));
          } else if (itemToDelete.collectionName === "feedbacks") {
            setFeedbacks(feedbacks.filter(feedback => feedback.id !== itemToDelete.itemId));
          }
        }
        
        setIsDeleteModalOpen(false);
        setNotification({ type: 'success', message: 'تم الحذف بنجاح' });
      } catch (error) {
        console.error("خطأ في الحذف:", error);
        setNotification({ type: 'error', message: 'حدث خطأ أثناء الحذف' });
      }
    }
  };

  // تحرير عنصر
  const handleEdit = (item, collectionName) => {
    setSelectedItem({ item, collectionName });
    setEditFormData(item);
    setIsEditModalOpen(true);
  };

  // حفظ التحرير
  const handleSaveEdit = async () => {
    try {
      const { item, collectionName } = selectedItem;
      
      if (collectionName === "reviews" && reviewSource === "embedded") {
        // تحديث التقييم داخل مقدم الخدمة
        const reviewInfo = reviews.find(review => review.id === item.id);
        if (reviewInfo && reviewInfo.providerId) {
          const providerRef = doc(db, "serviceProviders", reviewInfo.providerId);
          const providerSnap = await getDoc(providerRef);
          
          if (providerSnap.exists()) {
            const providerData = providerSnap.data();
            // تحديث التقييم في مصفوفة التقييمات
            const updatedReviews = (providerData.reviews || []).map(review => 
              review.id === item.id ? { ...review, ...editFormData } : review
            );
            
            // إعادة حساب متوسط التقييم
            let ratingsTotal = 0;
            updatedReviews.forEach(review => {
              ratingsTotal += review.rating || 0;
            });
            const averageRating = updatedReviews.length > 0 
              ? ratingsTotal / updatedReviews.length 
              : 0;
            
            // تحديث بيانات مقدم الخدمة
            await updateDoc(providerRef, {
              reviews: updatedReviews,
              ratingsTotal: ratingsTotal,
              averageRating: averageRating
            });
          }
        }
      } else {
        // تحديث في collection منفصل
        await updateDoc(doc(db, collectionName, item.id), editFormData);
      }
      
      // تحديث واجهة المستخدم بعد التحرير
      if (collectionName === "users") {
        setUsers(users.map(user => user.id === item.id ? { ...user, ...editFormData } : user));
      } else if (collectionName === "serviceProviders") {
        setProviders(providers.map(provider => provider.id === item.id ? { ...provider, ...editFormData } : provider));
      } else if (collectionName === "feedbacks") {
        setFeedbacks(feedbacks.map(feedback => feedback.id === item.id ? { ...feedback, ...editFormData } : feedback));
      } else if (collectionName === "reviews") {
        setReviews(reviews.map(review => review.id === item.id ? { ...review, ...editFormData } : review));
      }
      
      setIsEditModalOpen(false);
      setNotification({ type: 'success', message: 'تم التحديث بنجاح' });
    } catch (error) {
      console.error("خطأ في التحديث:", error);
      setNotification({ type: 'error', message: 'حدث خطأ أثناء التحديث' });
    }
  };

  // عرض التفاصيل
  const handleViewDetails = async (itemId, collectionName) => {
    try {
      let data = null;
      
      if (collectionName === "reviews" && reviewSource === "embedded") {
        // جلب بيانات التقييم من المصفوفة الحالية
        data = reviews.find(review => review.id === itemId);
        
        // جلب تفاصيل إضافية عن مقدم الخدمة إذا لزم الأمر
        if (data && data.providerId) {
          const providerRef = doc(db, "serviceProviders", data.providerId);
          const providerSnap = await getDoc(providerRef);
          if (providerSnap.exists()) {
            data.providerDetails = providerSnap.data();
          }
        }
      } else {
        // جلب البيانات من collection
        const docRef = doc(db, collectionName, itemId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          data = { id: docSnap.id, ...docSnap.data() };
          
          // إذا كان مقدم خدمة، قم بجلب تقييماته
          if (collectionName === "serviceProviders") {
            if (reviewSource === "collection") {
              // جلب التقييمات من كوليكشن منفصل
              const providerReviews = reviews.filter(review => 
                review.providerId === data.id || review.providerEmail === data.email
              );
              data.reviewsDetails = providerReviews;
            } else {
              // التقييمات موجودة بالفعل داخل بيانات مقدم الخدمة
              data.reviewsDetails = data.reviews || [];
            }
          }
        } else {
          throw new Error("لم يتم العثور على البيانات");
        }
      }
      
      if (data) {
        setDetailData(data);
        setIsDetailModalOpen(true);
      } else {
        throw new Error("لم يتم العثور على البيانات");
      }
    } catch (error) {
      console.error("خطأ في جلب التفاصيل:", error);
      setNotification({ type: 'error', message: 'حدث خطأ أثناء جلب التفاصيل' });
    }
  };

  // فتح نافذة الرد على الشكوى
  const handleOpenResponseModal = (feedback) => {
    setDetailData(feedback);
    setResponseText(feedback.response || "");
    setIsResponseModalOpen(true);
  };

  // حفظ الرد على الشكوى
  const handleSaveResponse = async () => {
    try {
      const now = new Date();
      
      await updateDoc(doc(db, "feedbacks", detailData.id), {
        response: responseText,
        respondedAt: now,
        status: "resolved" // تغيير الحالة إلى "تم الرد"
      });
      
      // تحديث واجهة المستخدم
      setFeedbacks(feedbacks.map(feedback => 
        feedback.id === detailData.id 
          ? { ...feedback, response: responseText, respondedAt: now, status: "resolved" } 
          : feedback
      ));
      
      setIsResponseModalOpen(false);
      alert("تم إرسال الرد بنجاح");
    } catch (error) {
      console.error("خطأ في إرسال الرد:", error);
      alert("حدث خطأ أثناء إرسال الرد");
    }
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return "غير محدد";
    if (date instanceof Date) {
      return date.toLocaleDateString('ar-EG');
    } else if (date.toDate) {
      return date.toDate().toLocaleDateString('ar-EG');
    } else {
      return "غير محدد";
    }
  };

  // تبديل عرض البيانات
  const toggleExpand = (section) => {
    setShowExpanded({
      ...showExpanded,
      [section]: !showExpanded[section]
    });
  };

  // المكونات الرئيسية للصفحة
  const renderTabs = () => (
    <div className="hidden md:flex mb-8  bg-white rounded-2xl shadow-lg p-1">
      {[
        { id: "users", label: "المستخدمين", icon: <FaUsers /> },
        { id: "providers", label: "مقدمي الخدمة", icon: <FaUserTie /> },
        { id: "complaints", label: "الشكاوى والاقتراحات", icon: <FaCommentDots /> },
        { id: "reviews", label: "التقييمات", icon: <FaStar /> }
      ].map(tab => (
        <motion.button
          key={tab.id}
          className={`flex items-center justify-center rounded-xl transition-all py-3 px-6 ${
            activeTab === tab.id 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab(tab.id)}
          whileHover={{ scale: activeTab !== tab.id ? 1.03 : 1 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="ml-2"> {tab.icon}</span>
          {tab.label}
        </motion.button>
      ))}
    </div>
  );

  // Mobile tabs
  const renderMobileTabs = () => (
    <div className="md:hidden bg-white rounded-2xl shadow-md p-3 mb-4 relative">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-gray-700">
          {activeTab === "users" && "المستخدمين"}
          {activeTab === "providers" && "مقدمي الخدمة"}
          {activeTab === "complaints" && "الشكاوى والاقتراحات"}
          {activeTab === "reviews" && "التقييمات"}
        </h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-600 p-2"
        >
          <FaBars />
        </button>
      </div>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-xl z-50 mt-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {[
              { id: "users", label: "المستخدمين", icon: <FaUsers /> },
              { id: "providers", label: "مقدمي الخدمة", icon: <FaUserTie /> },
              { id: "complaints", label: "الشكاوى والاقتراحات", icon: <FaCommentDots /> },
              { id: "reviews", label: "التقييمات", icon: <FaStar /> }
            ].map(tab => (
              <motion.button
                key={tab.id}
                className={`flex items-center w-full text-right p-3 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="ml-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // عرض المستخدمين
  const renderUsers = () => (
    <motion.div
      className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative Elements */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
      
      <motion.div
        className="flex justify-between items-center mb-6 relative z-10"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold text-cyan-800 flex items-center">
          <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2 mr-2">
            <FaUsers />
          </span>
          المستخدمين
        </h2>
        <motion.button
          onClick={() => toggleExpand("users")}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="text-cyan-700 hover:text-cyan-900 flex items-center"
        >
          {showExpanded.users ? 'عرض أقل' : 'عرض الكل'}
          <span className="mr-1">
            {showExpanded.users ? <FaArrowUp /> : <FaArrowDown />}
          </span>
        </motion.button>
      </motion.div>

      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="bg-white bg-opacity-60">
              <th className="py-3 px-4 text-right font-semibold text-gray-600 rounded-r-lg">الاسم</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">البريد الإلكتروني</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">المحافظة</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600 rounded-l-lg">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, showExpanded.users ? users.length : 5).map((user, index) => (
              <motion.tr 
                key={user.id}
                variants={itemVariants}
                className={index % 2 === 0 ? 'bg-white bg-opacity-40' : 'bg-cyan-50 bg-opacity-30'}
              >
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4 text-cyan-700">{user.email}</td>
                <td className="py-3 px-4">{user.governorate}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"
                      onClick={() => handleViewDetails(user.id, "users")}
                      title="عرض التفاصيل"
                    >
                      <FaEye size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-green-100 text-green-600 p-1.5 rounded-lg"
                      onClick={() => handleEdit(user, "users")}
                      title="تعديل"
                    >
                      <FaEdit size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-100 text-red-600 p-1.5 rounded-lg"
                      onClick={() => handleDelete(user.id, "users")}
                      title="حذف"
                    >
                      <FaTrash size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length > 5 && !showExpanded.users && (
        <div className="text-center mt-4">
          <span className="text-gray-500 text-sm">عرض {Math.min(5, users.length)} من {users.length}</span>
        </div>
      )}
    </motion.div>
  );

  // عرض مقدمي الخدمة
  const renderProviders = () => (
    <motion.div
      className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative Elements */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
      
      <motion.div
        className="flex justify-between items-center mb-6 relative z-10"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold text-cyan-800 flex items-center">
          <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2 mr-2">
            <FaUserTie />
          </span>
          مقدمي الخدمة
        </h2>
        <motion.button
          onClick={() => toggleExpand("providers")}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="text-cyan-700 hover:text-cyan-900 flex items-center"
        >
          {showExpanded.providers ? 'عرض أقل' : 'عرض الكل'}
          <span className="mr-1">
            {showExpanded.providers ? <FaArrowUp /> : <FaArrowDown />}
          </span>
        </motion.button>
      </motion.div>

      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="bg-white bg-opacity-60">
              <th className="py-3 px-4 text-right font-semibold text-gray-600 rounded-r-lg">الاسم</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">المهنة</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">التصنيف</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600 rounded-l-lg">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {providers.slice(0, showExpanded.providers ? providers.length : 5).map((provider, index) => (
              <motion.tr 
                key={provider.id}
                variants={itemVariants}
                className={index % 2 === 0 ? 'bg-white bg-opacity-40' : 'bg-cyan-50 bg-opacity-30'}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {provider.profileImage && (
                      <img src={provider.profileImage} alt="" className="h-10 w-10 rounded-full object-cover ml-2" />
                    )}
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-500">{provider.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{provider.profession}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {provider.category}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"
                      onClick={() => handleViewDetails(provider.id, "serviceProviders")}
                      title="عرض التفاصيل"
                    >
                      <FaEye size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-green-100 text-green-600 p-1.5 rounded-lg"
                      onClick={() => handleEdit(provider, "serviceProviders")}
                      title="تعديل"
                    >
                      <FaEdit size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-100 text-red-600 p-1.5 rounded-lg"
                      onClick={() => handleDelete(provider.id, "serviceProviders")}
                      title="حذف"
                    >
                      <FaTrash size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {providers.length > 5 && !showExpanded.providers && (
        <div className="text-center mt-4">
          <span className="text-gray-500 text-sm">عرض {Math.min(5, providers.length)} من {providers.length}</span>
        </div>
      )}
    </motion.div>
  );

  // عرض الشكاوى والاقتراحات
  const renderFeedbacks = () => (
    <motion.div
      className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative Elements */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
      
      <motion.div
        className="flex justify-between items-center mb-6 relative z-10"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold text-cyan-800 flex items-center">
          <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2 mr-2">
            <FaCommentDots />
          </span>
          الشكاوى والاقتراحات
        </h2>
        <motion.button
          onClick={() => toggleExpand("feedbacks")}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="text-cyan-700 hover:text-cyan-900 flex items-center"
        >
          {showExpanded.feedbacks ? 'عرض أقل' : 'عرض الكل'}
          <span className="mr-1">
            {showExpanded.feedbacks ? <FaArrowUp /> : <FaArrowDown />}
          </span>
        </motion.button>
      </motion.div>

      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="bg-white bg-opacity-60">
              <th className="py-3 px-4 text-right font-semibold text-gray-600 rounded-r-lg">النوع</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">المستخدم</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">التاريخ</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">العنوان</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">الحالة</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600 rounded-l-lg">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.slice(0, showExpanded.feedbacks ? feedbacks.length : 5).map((feedback, index) => (
              <motion.tr 
                key={feedback.id}
                variants={itemVariants}
                className={index % 2 === 0 ? 'bg-white bg-opacity-40' : 'bg-cyan-50 bg-opacity-30'}
              >
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    feedback.type === "complaint" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {feedback.type === "complaint" ? "شكوى" : "اقتراح"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{feedback.userName}</div>
                  <div className="text-sm text-cyan-700">{feedback.userId}</div>
                </td>
                <td className="py-3 px-4 text-gray-500">{formatDate(feedback.timestamp)}</td>
                <td className="py-3 px-4">
                  <div className="font-medium truncate max-w-xs">{feedback.title}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    feedback.status === "new" 
                      ? "bg-gray-100 text-gray-800" 
                      : feedback.status === "in_progress" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : feedback.status === "resolved" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                  }`}>
                    {feedback.status === "new" 
                      ? "جديد" 
                      : feedback.status === "in_progress" 
                        ? "قيد المعالجة" 
                        : feedback.status === "resolved" 
                          ? "تم الحل" 
                          : "مرفوض"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"
                      onClick={() => handleViewDetails(feedback.id, "feedbacks")}
                      title="عرض التفاصيل"
                    >
                      <FaEye size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg"
                      onClick={() => handleOpenResponseModal(feedback)}
                      title="الرد"
                    >
                      <FaReply size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-100 text-red-600 p-1.5 rounded-lg"
                      onClick={() => handleDelete(feedback.id, "feedbacks")}
                      title="حذف"
                    >
                      <FaTrash size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {feedbacks.length > 5 && !showExpanded.feedbacks && (
        <div className="text-center mt-4">
          <span className="text-gray-500 text-sm">عرض {Math.min(5, feedbacks.length)} من {feedbacks.length}</span>
        </div>
      )}
    </motion.div>
  );

  // عرض التقييمات
  const renderReviews = () => (
    <motion.div
      className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative Elements */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500 opacity-10 rounded-full"></div>
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-500 opacity-10 rounded-full"></div>
      
      <motion.div
        className="flex justify-between items-center mb-6 relative z-10"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold text-cyan-800 flex items-center">
          <span className="bg-cyan-700 text-white p-2 rounded-lg ml-2 mr-2">
            <FaStar />
          </span>
          التقييمات
        </h2>
        <motion.button
          onClick={() => toggleExpand("reviews")}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="text-cyan-700 hover:text-cyan-900 flex items-center"
        >
          {showExpanded.reviews ? 'عرض أقل' : 'عرض الكل'}
          <span className="mr-1">
            {showExpanded.reviews ? <FaArrowUp /> : <FaArrowDown />}
          </span>
        </motion.button>
      </motion.div>

      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="bg-white bg-opacity-60">
              <th className="py-3 px-4 text-right font-semibold text-gray-600 rounded-r-lg">المستخدم</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">مقدم الخدمة</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">التقييم</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600">التاريخ</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600 rounded-l-lg">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {reviews.slice(0, showExpanded.reviews ? reviews.length : 5).map((review, index) => (
              <motion.tr 
                key={review.id}
                variants={itemVariants}
                className={index % 2 === 0 ? 'bg-white bg-opacity-40' : 'bg-cyan-50 bg-opacity-30'}
              >
                <td className="py-3 px-4">{review.userName}</td>
                <td className="py-3 px-4">{review.providerName}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 ml-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} opacity={i < review.rating ? 1 : 0.3} size={16} />
                      ))}
                    </div>
                    <span className="font-medium">{review.rating}/5</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500">{formatDate(review.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"
                      onClick={() => handleViewDetails(review.id, "reviews")}
                      title="عرض التفاصيل"
                    >
                      <FaEye size={16} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-100 text-red-600 p-1.5 rounded-lg"
                      onClick={() => handleDelete(review.id, "reviews")}
                      title="حذف"
                    >
                      <FaTrash size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {reviews.length > 5 && !showExpanded.reviews && (
        <div className="text-center mt-4">
          <span className="text-gray-500 text-sm">عرض {Math.min(5, reviews.length)} من {reviews.length}</span>
        </div>
      )}
    </motion.div>
  );

  // Modal عرض التفاصيل
  const renderDetailsModal = () => (
    <AnimatePresence>
      {isDetailModalOpen && detailData && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">
                التفاصيل
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Content based on the type of item */}
              {Object.entries(detailData).map(([key, value]) => {
                // Skip specific keys
                if (["id", "reviewsDetails", "password", "createdAt", "timestamp", "uid"].includes(key)) {
                  return null;
                }
                
                // Format date values
                if (value instanceof Date) {
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">
                        {key === "timestamp" ? "التاريخ" : 
                         key === "createdAt" ? "تاريخ الإنشاء" : 
                         key}
                      </span>
                      <span className="text-gray-800">{formatDate(value)}</span>
                    </div>
                  );
                }
                
                // Display simple values
                if (
                  typeof value === "string" || 
                  typeof value === "number" || 
                  typeof value === "boolean"
                ) {
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">
                        {key === "name" ? "الاسم" :
                         key === "email" ? "البريد الإلكتروني" :
                         key === "phone" ? "رقم الهاتف" :
                         key === "address" ? "العنوان" :
                         key === "governorate" ? "المحافظة" :
                         key === "profession" ? "المهنة" :
                         key === "category" ? "التصنيف" :
                         key === "rating" ? "التقييم" :
                         key === "content" ? "المحتوى" :
                         key === "description" ? "الوصف" :
                         key === "status" ? "الحالة" :
                         key === "title" ? "العنوان" :
                         key === "type" ? "النوع" :
                         key === "response" ? "الرد" :
                         key}
                      </span>
                      {/* Display rating stars if it's a rating */}
                      {key === "rating" ? (
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 ml-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} opacity={i < value ? 1 : 0.3} size={16} />
                            ))}
                          </div>
                          <span className="font-medium">{value}/5</span>
                        </div>
                      ) : (
                        <span className="text-gray-800">{value.toString()}</span>
                      )}
                    </div>
                  );
                }
                
                // Display image if it's a URL
                if (key === "profileImage" && typeof value === "string") {
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">الصورة الشخصية</span>
                      <img src={value} alt="Profile" className="h-40 w-40 object-cover rounded-lg mt-2" />
                    </div>
                  );
                }
                
                return null;
              })}
              
              {/* Display reviews if this is a service provider */}
              {detailData.reviewsDetails && detailData.reviewsDetails.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-lg mb-3">التقييمات</h4>
                  <div className="space-y-4">
                    {detailData.reviewsDetails.map(review => (
                      <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">{review.userName}</div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} opacity={i < review.rating ? 1 : 0.3} size={14} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.content}</p>
                        <div className="mt-1 text-xs text-gray-500">{formatDate(review.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <motion.button
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDetailModalOpen(false)}
              >
                إغلاق
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Modal تعديل البيانات
  const renderEditModal = () => (
    <AnimatePresence>
      {isEditModalOpen && selectedItem && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">
                تعديل {selectedItem.collectionName === "users" ? "بيانات المستخدم" : 
                      selectedItem.collectionName === "serviceProviders" ? "بيانات مقدم الخدمة" :
                      selectedItem.collectionName === "feedbacks" ? "بيانات الشكوى" :
                      selectedItem.collectionName === "reviews" ? "بيانات التقييم" : "البيانات"}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setIsEditModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(editFormData).map(([key, value]) => {
                // Skip id and other non-editable fields
                if (["id", "createdAt", "timestamp", "uid", "password"].includes(key)) {
                  return null;
                }
                
                // Skip object and array values
                if (typeof value === "object") {
                  return null;
                }
                
                return (
                  <div key={key} className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">
                      {key === "name" ? "الاسم" :
                       key === "email" ? "البريد الإلكتروني" :
                       key === "phone" ? "رقم الهاتف" :
                       key === "address" ? "العنوان" :
                       key === "governorate" ? "المحافظة" :
                       key === "profession" ? "المهنة" :
                       key === "category" ? "التصنيف" :
                       key === "rating" ? "التقييم" :
                       key === "content" ? "المحتوى" :
                       key === "description" ? "الوصف" :
                       key === "status" ? "الحالة" :
                       key === "title" ? "العنوان" :
                       key === "type" ? "النوع" :
                       key}
                    </label>
                    
                    {/* Different input types based on the field */}
                    {key === "status" ? (
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={value}
                        onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                      >
                        <option value="new">جديد</option>
                        <option value="in_progress">قيد المعالجة</option>
                        <option value="resolved">تم الحل</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    ) : key === "type" && selectedItem.collectionName === "feedbacks" ? (
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={value}
                        onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                      >
                        <option value="complaint">شكوى</option>
                        <option value="suggestion">اقتراح</option>
                      </select>
                    ) : key === "rating" ? (
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="text-2xl focus:outline-none"
                            onClick={() => setEditFormData({ ...editFormData, [key]: star })}
                          >
                            <FaStar 
                              className={star <= value ? "text-yellow-400" : "text-gray-300"} 
                              size={24}
                            />
                          </button>
                        ))}
                      </div>
                    ) : key === "content" || key === "description" ? (
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={value || ""}
                        rows={4}
                        onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                      />
                    ) : (
                      <input
                        type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={value || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <motion.button
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditModalOpen(false)}
              >
                إلغاء
              </motion.button>
              <motion.button
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveEdit}
              >
                حفظ التغييرات
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Modal الرد على الشكوى
  const renderResponseModal = () => (
    <AnimatePresence>
      {isResponseModalOpen && detailData && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsResponseModalOpen(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">
                الرد على {detailData.type === "complaint" ? "الشكوى" : "الاقتراح"}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setIsResponseModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-bold mb-2">تفاصيل {detailData.type === "complaint" ? "الشكوى" : "الاقتراح"}</h4>
                <p className="text-gray-600 mb-1"><span className="font-medium">العنوان:</span> {detailData.title}</p>
                <p className="text-gray-600 mb-1"><span className="font-medium">المحتوى:</span> {detailData.content}</p>
                <p className="text-gray-600"><span className="font-medium">المستخدم:</span> {detailData.userName}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  الرد
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  placeholder="اكتب الرد هنا..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <motion.button
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsResponseModalOpen(false)}
              >
                إلغاء
              </motion.button>
              <motion.button
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveResponse}
                disabled={!responseText.trim()}
              >
                إرسال الرد
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // التسجيل الخروج
  const handleLogout = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في تسجيل الخروج؟")) {
      // يمكن إضافة منطق إضافي لتسجيل الخروج هنا
      navigate("/nafany/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header and navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="mr-2 bg-gradient-to-r  from-cyan-500 to-blue-600 text-white h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              <FaUserTie />
            </div>
            <div className="mr-3">
              <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
              <p className="text-gray-500">إدارة التطبيق</p>
            </div>
          </div>
          
          <motion.button
            className="bg-red-50 text-red-600 py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-red-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
          >
            <span className="ml-1"><FaSignOutAlt /></span>
            <span>تسجيل الخروج</span>
          </motion.button>
        </div>
        
        {/* Stats overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 mb-1">المستخدمين</p>
              <h3 className="text-3xl font-bold text-gray-800">{users.length}</h3>
            </div>
            <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
              <FaUsers />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 mb-1">مقدمي الخدمة</p>
              <h3 className="text-3xl font-bold text-gray-800">{providers.length}</h3>
            </div>
            <div className="h-14 w-14 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center text-2xl">
              <FaUserTie />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 mb-1">الشكاوى والاقتراحات</p>
              <h3 className="text-3xl font-bold text-gray-800">{feedbacks.length}</h3>
            </div>
            <div className="h-14 w-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">
              <FaCommentDots />
            </div>
          </div>
          
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between">
    <div>
      <p className="text-gray-500 mb-1">التقييمات</p>
      <h3 className="text-3xl font-bold text-gray-800">{reviews.length}</h3>
    </div>
    <div className="h-14 w-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-2xl">
      <FaStar />
    </div>
  </div>
</motion.div>

{/* Main content area */}
<div className="space-y-6">
  {/* المستخدمين */}
  {renderUsers()}
  
  {/* مقدمي الخدمة */}
  {renderProviders()}
  
  {/* الشكاوى والاقتراحات */}
  {renderFeedbacks()}
  
  {/* التقييمات */}
  {renderReviews()}
</div>

{/* Modals */}
{renderDetailsModal()}
{renderEditModal()}
{renderResponseModal()}

{/* Modal تأكيد الحذف */}
<AnimatePresence>
  {isDeleteModalOpen && (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setIsDeleteModalOpen(false)}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4 text-red-500">
            <FaExclamationTriangle size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">تأكيد الحذف</h3>
          <p className="text-gray-600 mb-6">
            هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          
          <div className="flex justify-center gap-3">
            <motion.button
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              إلغاء
            </motion.button>
            <motion.button
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={confirmDelete}
            >
              حذف
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* رسالة تنبيه بنجاح العملية */}
<AnimatePresence>
  {notification && (
    <motion.div
      className={`fixed bottom-4 left-4 p-4 rounded-lg shadow-lg ${
        notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      } text-white max-w-md z-50`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
    >
      <div className="flex items-center">
        <div className="ml-3">
          {notification.type === 'success' ? <FaCheckCircle size={24} /> : <FaExclamationCircle size={24} />}
        </div>
        <div className="flex-1 ml-3">
          <p className="font-medium">{notification.message}</p>
        </div>
        <button 
          onClick={() => setNotification(null)}
          className="ml-auto"
        >
          <FaTimes />
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
</motion.div>
</div>
);
}

export default AdminDashboard;