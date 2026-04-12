import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import FloatingBackground from '../../components/ui/FloatingBackground'; // Імпортуємо наш фон

const AuthPage = () => {
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');
  const [prevKey, setPrevKey] = useState(location.key);

  if (location.key !== prevKey) {
    setPrevKey(location.key); 
    
    if (location.state?.mode) {
      setIsLogin(location.state.mode !== 'register');
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-start pt-10 pb-20 px-6 bg-slate-100 w-full flex-grow">
      
      
      <FloatingBackground />

      <div className="relative z-10 flex flex-col items-center w-full">
        
        <div className="flex bg-white p-1.5 rounded-2xl mb-8 shadow-sm border border-slate-200 w-full max-w-[400px]">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
              isLogin ? 'bg-pine text-white shadow-lg' : 'text-slate-400 hover:text-pine'
            }`}
          >
            Увійти
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
              !isLogin ? 'bg-pine text-white shadow-lg' : 'text-slate-400 hover:text-pine'
            }`}
          >
            Реєстрація
          </button>
        </div>

        <motion.div 
          layout 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="w-full flex justify-center min-h-[600px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center items-start"
            > 
              {isLogin ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;