import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { FaUserCircle, FaArrowRight } from 'react-icons/fa';

const ChatsList = ({ userId, onChatSelect }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChats = async (userId) => {
    try {
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

  if (loading) return <div className="text-center py-4">جاري تحميل المحادثات...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
      {chats.length > 0 ? (
        chats.map((chat) => {
          const clientId = chat.participants[0] === userId ? chat.participants[1] : chat.participants[0];
          const clientName = chat.participantsNames[0] === userId ? chat.participantsNames[1] : chat.participantsNames[0];
          
          return (
            <motion.div 
              key={chat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => onChatSelect(
                clientId, 
                clientName, 
                chat.participantsEmails?.find(e => e !== userId)
              )}
            >
              <div className="flex items-center">
                <FaUserCircle className="text-gray-400 text-2xl mr-3" />
                <div>
                  <p className="font-medium text-cyan-800">{clientName}</p>
                  <p className="text-sm text-gray-600 truncate max-w-xs">{chat.lastMessage}</p>
                </div>
              </div>
              <FaArrowRight className="text-cyan-600" />
            </motion.div>
          );
        })
      ) : (
        <p className="text-center text-gray-500 py-4">لا توجد محادثات بعد</p>
      )}
    </div>
  );
};

export default ChatsList;