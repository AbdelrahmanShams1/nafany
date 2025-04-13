import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } },
};

const CheckUserOrServicer = () => {
  const [accountType, setAccountType] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (accountType === "user") navigate("/nafany/register_user");
    else if (accountType === "provider") navigate("/nafany/register");
    else alert("الرجاء اختيار نوع الحساب");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-cyan-50 to-cyan-100">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 bg-white rounded-lg shadow-md text-right w-full max-w-[40rem] border border-cyan-100 dark:bg-gray-800"
        dir="rtl"
      >
        <motion.h2
          variants={cardVariants}
          className="text-2xl font-bold text-cyan-900 mb-8 text-center dark:text-cyan-300"
        >
          تسجيل حساب جديد
        </motion.h2>

        <h3 className="text-xl text-gray-700 mb-4 text-center dark:text-gray-300">اختر نوع الحساب</h3>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          {[
            { type: "user", label: "مستخدم خدمة", desc: "أبحث عن مقدمي الخدمات" },
            { type: "provider", label: "مقدم خدمة", desc: "أقدم خدماتي للعملاء" },
          ].map(({ type, label, desc }) => (
            <motion.div
              key={type}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`border-2 p-4 rounded-lg cursor-pointer transition-all ${
                accountType === type ? "border-cyan-600 bg-cyan-50" : "border-gray-200"
              }`}
              onClick={() => setAccountType(type)}
            >
              <div className="flex items-center gap-4 mb-2">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    accountType === type ? "border-cyan-600" : "border-gray-300"
                  }`}
                >
                  {accountType === type && <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>}
                </div>
                <h4 className="text-lg font-medium dark:text-gray-200">{label}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mr-10">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <motion.button
            onClick={handleContinue}
            whileHover={{ scale: accountType ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              accountType
                ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!accountType}
          >
            متابعة
          </motion.button>
          <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="px-8 py-3 rounded-full font-bold bg-gray-500 hover:bg-gray-600 text-white"
        >
          رجوع
        </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckUserOrServicer;