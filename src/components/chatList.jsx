import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { FaRegClock, FaCheck, FaCheckDouble } from 'react-icons/fa';

const ChatsListPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProvider, setIsProvider] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // تحقق من بيانات المستخدم المخزنة
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser || storedUser === '""') {
          navigate('/nafany/login');
          return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        
        // تحقق إذا كان المستخدم هو مقدم خدمة
        try {
          const providerDoc = await getDoc(doc(db, 'serviceProviders', parsedUser.uid));
          if (providerDoc.exists()) {
            setIsProvider(true);
          }
        } catch (providerError) {
          console.log('User is not a service provider');
        }
        
        // جلب المحادثات
        const chatsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', parsedUser.email),
          orderBy('lastMessageTime', 'desc')
        );
        
        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const chatsList = [];
          
          for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();
            
            // جلب آخر رسالة في المحادثة (يمكن أيضًا استخدام lastMessage المخزنة)
            const messagesQuery = query(
              collection(db, 'messages'),
              where('chatId', '==', chatDoc.id),
              orderBy('timestamp', 'desc')
            );
            
            const messagesSnapshot = await getDocs(messagesQuery);
            let lastMessage = null;
            
            if (!messagesSnapshot.empty) {
              lastMessage = {
                id: messagesSnapshot.docs[0].id,
                ...messagesSnapshot.docs[0].data()
              };
            }
            
            // تحديد الطرف الآخر في المحادثة
            const otherParticipantEmail = chatData.participants.find(
              email => email !== parsedUser.email
            );
            
            chatsList.push({
              id: chatDoc.id,
              otherParticipantName: chatData.participantNames[otherParticipantEmail],
              otherParticipantEmail: otherParticipantEmail,
              otherParticipantImage: chatData.participantImages?.[otherParticipantEmail] || '/default-profile.png',
              otherParticipantId: chatData.participantIds?.[otherParticipantEmail],
              lastMessage: lastMessage,
              lastMessageTime: chatData.lastMessageTime,
              unreadCount: 0 // سيتم حسابها لاحقًا
            });
          }
          
          setChats(chatsList);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleChatClick = (chat) => {
    const otherParticipantId = chat.otherParticipantId;
    
    if (isProvider) {
      navigate(`/nafany/chat/${otherParticipantId}`, {
        state: {
          user: {
            uid: otherParticipantId,
            email: chat.otherParticipantEmail,
            name: chat.otherParticipantName
          }
        }
      });
    } else {
      navigate(`/nafany/chat/${otherParticipantId}`, {
        state: {
          provider: {
            id: otherParticipantId,
            email: chat.otherParticipantEmail,
            name: chat.otherParticipantName,
            profileImage: chat.otherParticipantImage
          }
        }
      });
    }
  };
  
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // اليوم - إظهار الوقت
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // الأمس
      return 'الأمس';
    } else if (diffDays < 7) {
      // هذا الأسبوع - إظهار اسم اليوم
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      return days[date.getDay()];
    } else {
      // التاريخ الكامل
      return date.toLocaleDateString();
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-cyan-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">المحادثات</h1>
      </div>
      
      <div className="max-w-xl mx-auto p-4">
        {chats.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">ليس لديك محادثات حالية</p>
            {isProvider ? (
              <p className="text-gray-500">سيظهر عملاؤك هنا عندما يبدأون محادثة معك</p>
            ) : (
              <button
                onClick={() => navigate('/nafany/providers')}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
              >
                ابحث عن مقدمي الخدمة
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3">
                  <img
                    src={chat.otherParticipantImage}
                    alt={chat.otherParticipantName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-gray-800 truncate">
                      {chat.otherParticipantName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <p className="text-gray-600 text-sm truncate flex-1">
                      {chat.lastMessage?.text || 'بدء محادثة جديدة'}
                    </p>
                    
                    {chat.lastMessage && (
                      <div className="ml-2 text-gray-400">
                        {chat.lastMessage.sender === userData.email ? (
                          chat.lastMessage.isRead ? (
                            <FaCheckDouble size={12} />
                          ) : (
                            <FaCheck size={12} />
                          )
                        ) : (
                          chat.unreadCount > 0 && (
                            <span className="bg-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {chat.unreadCount}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsListPage;
