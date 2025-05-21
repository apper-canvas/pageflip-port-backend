import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

const Book = getIcon('book');
const Glasses = getIcon('glasses');

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Page transition animation
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen"
    >
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white shadow-md">
        <div className="container mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Book className="h-7 w-7" />
            <h1 className="text-2xl md:text-3xl font-bold">PageFlip</h1>
          </div>
          <div className="flex items-center">
            <Glasses className="h-6 w-6" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="relative w-16 h-16">
              <div className="animate-spin absolute border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full w-16 h-16"></div>
              <div className="animate-ping absolute border-4 border-primary rounded-full w-16 h-16 opacity-20"></div>
              <Book className="absolute top-4 left-4 h-8 w-8 text-primary" />
            </div>
            <p className="mt-4 text-lg text-surface-600 dark:text-surface-400">Loading your book recommendations...</p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            <MainFeature />
          </div>
        )}
      </main>

      <footer className="bg-surface-100 dark:bg-surface-800 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-surface-600 dark:text-surface-400">
            &copy; {new Date().getFullYear()} PageFlip. Discover your next great read.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}

export default Home;