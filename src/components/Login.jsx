import { useState } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import { useAuth } from '../contexts/AuthContext';

const Book = getIcon('book');
const Google = getIcon('google');
const Loader = getIcon('loader');

function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white shadow-md">
        <div className="container mx-auto px-4 py-5 flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <Book className="h-7 w-7" />
            <h1 className="text-2xl md:text-3xl font-bold">PageFlip</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card max-w-md w-full p-8 shadow-neu-light dark:shadow-neu-dark"
        >
          <div className="text-center mb-8">
            <Book className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold text-surface-800 dark:text-surface-100 mb-2">Welcome to PageFlip</h2>
            <p className="text-surface-600 dark:text-surface-400">
              Discover your next great read with personalized book recommendations
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 btn bg-white text-surface-800 hover:bg-surface-100 border border-surface-300 dark:bg-surface-700 dark:text-white dark:hover:bg-surface-600 shadow-card"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Google className="h-5 w-5" />
            )}
            <span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
          </button>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default Login;