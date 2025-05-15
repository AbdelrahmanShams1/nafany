// ChatPage Component
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc,
  doc, 
  getDoc, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { FaPaperPlane, FaArrowRight, FaUserCircle, FaRegClock, FaCheckDouble } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';

const ChatPage = () => {
  const { providerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState('');
  const chatContainerRef = useRef(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 }
    },
    exit: { opacity: 0 }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const createChatId = (id1, id2) => {
    return [id1, id2].sort().join('_');
  };

  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) return null;
      
      const user = JSON.parse(storedUser);
      
      // تحقق من وجود معرف المستخدم بأي صيغة (uid أو id)
      if (!user) return null;
      
      // توحيد المعرفات
      if (user.uid && !user.id) {
        user.id = user.uid;
      } else if (user.id && !user.uid) {
        user.uid = user.id;
      } else if (!user.uid && !user.id) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // جلب بيانات المستخدم والرسائل
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = getUserData();
        if (!user) {
          navigate('/nafany/login');
          return;
        }

        setUserData(user);

        // تعديل في كيفية تحديد مقدم الخدمة والعميل
        let provider, client;

        // التأكد من وجود بيانات مقدم الخدمة في location.state
        if (location.state?.provider) {
          // تحديد من هو مقدم الخدمة ومن هو العميل
          provider = location.state.provider;
          
          // التأكد من وجود بيانات العميل
          if (location.state.user) {
            client = location.state.user;
          } else {
            client = { id: user.uid || user.id, name: user.name, email: user.email };
          }
        } else {
          // إذا كان المستخدم الحالي هو مقدم الخدمة
          provider = { id: user.uid || user.id, name: user.name, email: user.email };
          
          // جلب بيانات العميل
          try {
            const clientDoc = await getDoc(doc(db, 'users', providerId));
            if (clientDoc.exists()) {
              client = { id: clientDoc.id, ...clientDoc.data() };
            } else {
              // محاولة البحث في جدول مقدمي الخدمة
              const providerDoc = await getDoc(doc(db, 'serviceProviders', providerId));
              if (!providerDoc.exists()) throw new Error('User not found');
              client = { id: providerDoc.id, ...providerDoc.data() };
            }
          } catch (error) {
            console.error('Error fetching client data:', error);
            throw error;
          }
        }

        // توحيد المعرفات - ضمان وجود حقل id دائماً
        provider.id = provider.id || provider.uid;
        client.id = client.id || client.uid;

        setProviderData(provider);

        // إنشاء معرف المحادثة بشكل صحيح دائماً باستخدام الدالة المساعدة
        const chatId = createChatId(provider.id, client.id);

        console.log('Chat participants:', { provider, client });
        console.log('Generated chatId:', chatId);

        // حفظ معرف المحادثة في متغير حالة (state) لاستخدامه لاحقاً
        setChatId(chatId);

        // الاشتراك في الرسائل مع تحسينات
        const messagesQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          }));
          
          console.log('Real-time messages update:', messagesData);
          setMessages(messagesData);
        });

        setLoading(false);
        return unsubscribe;
      } catch (error) {
        console.error('Chat init error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [providerId, location.state, navigate]);

  // التمرير إلى أحدث رسالة
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // إرسال رسالة جديدة
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userData || !providerData || !chatId) return;
  
    try {
      console.log('Sending message with chatId:', chatId);
      console.log('From:', userData.id || userData.uid, 'To:', providerData.id || providerData.uid);
  
      // إضافة الرسالة الجديدة
      const messageRef = await addDoc(
        collection(db, 'chats', chatId, 'messages'), 
        {
          text: newMessage,
          senderId: userData.id || userData.uid,
          senderName: userData.name,
          receiverId: providerData.id || providerData.uid,
          timestamp: serverTimestamp(),
          isRead: false
        }
      );
  
      // تحديث بيانات المحادثة الرئيسية
      await setDoc(doc(db, 'chats', chatId), {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
        providerData: {
          id: providerData.id || providerData.uid,
          name: providerData.name,
          email: providerData.email,
          profileImage: providerData.profileImage || null,
          profession: providerData.profession || providerData.category || null
        },
        userData: {
          id: userData.id || userData.uid,
          name: userData.name,
          email: userData.email,
          profileImage: userData.profileImage || null
        },
        participants: [userData.id || userData.uid, providerData.id || providerData.uid],
        participantsNames: [userData.name, providerData.name]
      }, { merge: true });
  
      setNewMessage('');
      console.log('Message sent successfully:', messageRef.id);
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  // محاكاة حالة الكتابة من مقدم الخدمة
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].senderId === userData?.id) {
      const timer = setTimeout(() => {
        setIsTyping(true);
        
        const replyTimer = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        
        return () => clearTimeout(replyTimer);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [messages, userData]);

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';
    
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // تحديد إذا كان يجب عرض التاريخ بين الرسائل
  const shouldShowDate = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.timestamp).toLocaleDateString();
    const prevDate = new Date(prevMsg.timestamp).toLocaleDateString();
    
    return currentDate !== prevDate;
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex justify-center items-center bg-gradient-to-b from-cyan-50 to-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-4 h-4 bg-cyan-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <div className="text-cyan-800 font-semibold text-xl">جاري تحميل المحادثة...</div>
          <p className="text-cyan-600 text-sm mt-2">يرجى الانتظار قليلاً</p>
        </div>
      </motion.div>
    );
  }

  if (!providerData || !userData) {
    return (
      <motion.div 
        className="min-h-screen flex justify-center items-center bg-gradient-to-b from-cyan-50 to-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserCircle className="text-red-500 text-4xl" />
          </div>
          <div className="text-red-600 font-semibold text-xl mb-2">حدث خطأ في تحميل بيانات المحادثة</div>
          <p className="text-gray-600 mb-4">لم نتمكن من العثور على المستخدم المطلوب</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-colors duration-300"
          >
            العودة للخلف
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-gradient-to-b from-cyan-50 to-blue-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* شريط العنوان */}
      <div className="bg-white shadow-lg p-4 flex items-center sticky top-0 z-10">
        <motion.button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 mr-2 transition-colors duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowRight className="text-cyan-700 text-xl" />
        </motion.button>
        
        <div className="flex items-center mx-2">
          {providerData.profileImage ? (
            <img 
              src={providerData.profileImage} 
              alt={providerData.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-cyan-200"
            />
          ) : (
            <div className=" mr-2 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white border-2 border-cyan-200">
              <FaUserCircle className="text-3xl " />
            </div>
          )}
          <div className="mr-3">
            <h2 className="font-bold text-lg text-cyan-800">{providerData.name}</h2>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full ml-1"></span>
              <p className="text-xs text-cyan-600">{providerData.profession || providerData.category || 'متصل الآن'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* منطقة الرسائل */}
      <div className="flex-1 p-4 overflow-y-auto" ref={chatContainerRef}>
        <div className="max-w-3xl mx-auto space-y-4 pb-2">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center bg-white rounded-2xl shadow-md py-10 px-6 my-8"
            >
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPaperPlane className="text-cyan-500 text-3xl" />
              </div>
              <div className="text-cyan-800 font-semibold text-xl mb-2">لا توجد رسائل بعد</div>
              <p className="text-gray-600 mb-6">ابدأ المحادثة مع {providerData.name} الآن</p>
              <motion.div 
                className="text-sm bg-cyan-50 text-cyan-700 rounded-full py-2 px-4 inline-block"
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2
                }}
              >
                جرب إرسال "مرحباً! أود التحدث معك"
              </motion.div>
            </motion.div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isCurrentUser = message.senderId === userData.id || message.senderId === userData.uid;
                const showDate = shouldShowDate(message, index > 0 ? messages[index - 1] : null);
                
                return (
                  <React.Fragment key={message.id}>
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <div className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">
                          {new Date(message.timestamp).toLocaleDateString('ar', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    )}
                    
                    <motion.div
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && (
                        <div className="mr-2 self-end mb-1">
                          {providerData.profileImage ? (
                            <img 
                              src={providerData.profileImage} 
                              alt={providerData.name}
                              className="w-8 h-8 rounded-full object-cover border border-cyan-200"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white">
                              <FaUserCircle className="text-xl" />
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div
                        className={`max-w-xs md:max-w-md rounded-2xl p-3 shadow-sm ${
                          isCurrentUser 
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <div className={`text-xs mt-1 flex items-center justify-end ${
                          isCurrentUser ? 'text-cyan-100' : 'text-gray-500'
                        }`}>
                          <span className="ml-1">{formatMessageDate(message.timestamp)}</span>
                          {isCurrentUser && (
                            <FaCheckDouble className={`ml-1 ${message.isRead ? 'text-blue-300' : 'text-cyan-300'}`} />
                          )}
                        </div>
                      </div>
                      
                      {isCurrentUser && (
                        <div className="ml-2 self-end mb-1">
                          {userData.profileImage ? (
                            <img 
                              src={userData.profileImage} 
                              alt={userData.name}
                              className="w-8 h-8 rounded-full object-cover border border-cyan-200"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                              <FaUserCircle className="text-xl" />
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </React.Fragment>
                );
              })}
              
              <AnimatePresence>
                {isTyping && (
                  <motion.div 
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mr-2 self-end mb-1">
                      {providerData.profileImage ? (
                        <img 
                          src={providerData.profileImage} 
                          alt={providerData.name}
                          className="w-8 h-8 rounded-full object-cover border border-cyan-200"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white">
                          <FaUserCircle className="text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm p-3 border border-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* منطقة إدخال الرسالة */}
      <div className="bg-white p-4 border-t border-gray-200 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex items-center max-w-3xl mx-auto relative">
<input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 border-2 border-cyan-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-full py-3 px-5 text-gray-700 outline-none transition-colors duration-300"
            dir="rtl"
          />
          <motion.button
            type="submit"
            className="absolute left-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-3 ml-2 hover:shadow-lg transition-all duration-300"
            disabled={!newMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              opacity: newMessage.trim() ? 1 : 0.7,
            }}
          >
            <IoMdSend className="text-xl transform rotate-180" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatPage;