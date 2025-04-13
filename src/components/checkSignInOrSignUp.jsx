import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const textVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.3, duration: 0.5 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.5, duration: 0.5 } },
};

const CheckUserOrServicer = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-cyan-50 to-cyan-100">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="p-8 bg-white rounded-xl shadow-lg text-right w-full max-w-md border border-cyan-100 dark:bg-gray-800"
        dir="rtl"
      >
        <motion.h2
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="text-2xl font-bold text-cyan-800 mb-6 text-center dark:text-cyan-300"
        >
          تسجيل حساب جديد
        </motion.h2>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg mb-6 border border-cyan-100 dark:bg-gray-700"
        >
          <h3 className="text-xl text-gray-700 mb-6 text-center font-medium dark:text-gray-300">
            هل سبق لك التسجيل في الموقع؟
          </h3>

          <div className="flex justify-center gap-6 mt-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/nafany/login"
                className="inline-block px-8 py-3 text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 focus:bg-cyan-700 transition-colors duration-300 font-medium shadow-md cursor-pointer"
              >
                نعم
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/nafany/check_user"
                className="inline-block px-8 py-3 border-2 border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors duration-300 font-medium cursor-pointer"
              >
                لا
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CheckUserOrServicer;
