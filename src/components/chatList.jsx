import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { FaUserCircle, FaComment, FaClock, FaArrowLeft } from 'react-icons/fa';

const ChatsList = ({ userId, onChatSelect }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const fetchChats = async (userId) => {
    try {
      setLoading(true);
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );
      
      const querySnapshot = await getDocs(chatsQuery);
      const chatsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate?.() || new Date()
      }));
      
      setChats(chatsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('فشل تحميل المحادثات');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChats(userId);
    }
  }, [userId]);

  // Format date to appropriate time string
  const formatMessageTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'الأمس';
    } else if (diffDays < 7) {
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      return days[messageDate.getDay()];
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-cyan-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-cyan-800 mt-3 font-medium">جاري تحميل المحادثات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-6 bg-red-50 rounded-xl border border-red-100">
        <p className="font-medium">{error}</p>
        <button 
          onClick={() => fetchChats(userId)}
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-1 rounded-full text-sm transition-colors duration-300"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-3 max-h-[400px] overflow-y-auto pr-1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {chats.length > 0 ? (
        chats.map((chat) => {
          // Determine if this user is the provider or the client
          const isProvider = chat.providerData?.id === userId;
          const otherParticipant = isProvider ? chat.userData : chat.providerData;
          
          return (
            <motion.div 
              key={chat.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-gradient-to-r from-white to-cyan-50 p-4 rounded-xl border border-cyan-100 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center cursor-pointer"
              onClick={() => onChatSelect(
                otherParticipant?.id, 
                otherParticipant?.name,
                otherParticipant?.email
              )}
            >
              <div className="flex items-center">
                {otherParticipant?.profileImage ? (
                  <img 
                    src={otherParticipant.profileImage} 
                    alt={otherParticipant.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-cyan-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white border-2 border-cyan-200">
                    <FaUserCircle className="text-2xl" />
                  </div>
                )}
                
                <div className="mr-3 flex-1">
                  <p className="font-semibold text-cyan-800">{otherParticipant?.name || 'مستخدم'}</p>
                  <div className="flex items-center text-sm text-gray-600 truncate max-w-xs">
                    <FaComment className="text-xs text-cyan-500 ml-1" />
                    <span className="truncate">{chat.lastMessage}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-500 flex items-center mb-1">
                  <FaClock className="ml-1 text-cyan-400" />
                  {formatMessageTime(chat.lastMessageTime)}
                </div>
                <div className="bg-cyan-600 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  <FaArrowLeft />
                </div>
              </div>
            </motion.div>
          );
        })
      ) : (
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-white to-cyan-50 p-6 rounded-xl border border-cyan-100 text-center"
        >
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaComment className="text-3xl text-cyan-500" />
          </div>
          <p className="text-gray-600 font-medium">لا توجد محادثات بعد</p>
          <p className="text-sm text-gray-500 mt-1">عندما تبدأ محادثة، ستظهر هنا</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChatsList;