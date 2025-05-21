import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const BookX = getIcon('book-x');
const ArrowLeft = getIcon('arrow-left');

function NotFound() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <BookX className="h-24 w-24 text-accent" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-surface-800 dark:text-surface-100"
        >
          Page Not Found
        </motion.h1>
        
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg mb-8 text-surface-600 dark:text-surface-400"
        >
          Looks like this page has been misplaced on our bookshelf.
        </motion.p>
        
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium transition-all hover:bg-primary-dark">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default NotFound;