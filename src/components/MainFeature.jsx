import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

// Icons
const ThumbsUp = getIcon('thumbs-up');
const ThumbsDown = getIcon('thumbs-down');
const BookOpen = getIcon('book-open');
const BookMarked = getIcon('bookmark');
const CheckCircle = getIcon('check-circle');
const Clock = getIcon('clock');
const Archive = getIcon('archive');
const BookX = getIcon('book-x');
const Search = getIcon('search');
const Filter = getIcon('filter');
const RefreshCcw = getIcon('refresh-ccw');

// Sample book data
const SAMPLE_BOOKS = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    blurb: "Between life and death there is a library. When Nora Seed finds herself in the Midnight Library, she has a chance to make different choices.",
    genre: ["Fiction", "Fantasy", "Contemporary"],
    mood: ["Thoughtful", "Hopeful"]
  },
  {
    id: 2,
    title: "Educated",
    author: "Tara Westover",
    coverUrl: "https://images.unsplash.com/photo-1585779034823-7e9ac8faec70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    blurb: "A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    genre: ["Memoir", "Biography", "Nonfiction"],
    mood: ["Inspiring", "Emotional"]
  },
  {
    id: 3,
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    blurb: "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.",
    genre: ["Self-Help", "Productivity", "Psychology"],
    mood: ["Motivational", "Practical"]
  },
  {
    id: 4,
    title: "Dune",
    author: "Frank Herbert",
    coverUrl: "https://images.unsplash.com/photo-1589203832464-86b643a8fb35?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    blurb: "Set on the desert planet Arrakis, a world of sand, heat, and deadly creatures. Paul Atreides must fight for control of the most important element in the universe.",
    genre: ["Science Fiction", "Fantasy", "Classic"],
    mood: ["Epic", "Political"]
  },
  {
    id: 5,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    blurb: "A woman shoots her husband, then never speaks another word. A criminal psychotherapist is determined to get her to talk and unravel the mystery.",
    genre: ["Thriller", "Mystery", "Psychological Fiction"],
    mood: ["Suspenseful", "Dark"]
  }
];

// Book status options
const BOOK_STATUS = {
  TO_READ: "TO_READ",
  READING: "READING",
  FINISHED: "FINISHED"
};

// Available genres and moods for filtering
const AVAILABLE_GENRES = ["Fiction", "Fantasy", "Contemporary", "Memoir", "Biography", "Nonfiction", 
  "Self-Help", "Productivity", "Psychology", "Science Fiction", "Classic", "Thriller", "Mystery"];

const AVAILABLE_MOODS = ["Thoughtful", "Hopeful", "Inspiring", "Emotional", "Motivational", 
  "Practical", "Epic", "Political", "Suspenseful", "Dark"];

function MainFeature() {
  // App state
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [myReads, setMyReads] = useState([]);
  const [activeView, setActiveView] = useState('discover'); // 'discover' or 'myreads'
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  
  // Refs for swipe handling
  const dragConstraintRef = useRef(null);
  const initialX = useRef(0);
  const currentX = useRef(0);
  
  // State for drag animation
  const [dragOffset, setDragOffset] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [swipeResult, setSwipeResult] = useState(null);

  const handleStartDrag = (event) => {
    initialX.current = event.clientX || event.touches[0].clientX;
    currentX.current = initialX.current;
  };

  const handleDrag = (event) => {
    if (!initialX.current) return;
    
    const clientX = event.clientX || event.touches[0].clientX;
    currentX.current = clientX;
    
    const offset = currentX.current - initialX.current;
    setDragOffset(offset);
    
    // Add a slight rotation based on drag
    setRotation(offset * 0.05);
  };

  const handleEndDrag = () => {
    const offset = currentX.current - initialX.current;
    
    // Threshold for a swipe
    if (offset > 100) {
      // Swipe right - like
      handleLikeBook();
    } else if (offset < -100) {
      // Swipe left - skip
      handleSkipBook();
    } else {
      // Reset if the swipe wasn't decisive
      setDragOffset(0);
      setRotation(0);
    }
    
    initialX.current = 0;
    currentX.current = 0;
  };

  const getNextBook = () => {
    if (currentBookIndex < books.length - 1) {
      setCurrentBookIndex(prev => prev + 1);
    } else {
      // Out of books to show
      toast.info("You've viewed all available books! Refreshing the list.");
      setCurrentBookIndex(0);
    }
    
    // Reset card position
    setDragOffset(0);
    setRotation(0);
    setSwipeResult(null);
  };

  const handleLikeBook = () => {
    const currentBook = books[currentBookIndex];
    setSwipeResult('like');
    
    setMyReads(prev => [
      ...prev, 
      { ...currentBook, status: BOOK_STATUS.TO_READ, dateAdded: new Date() }
    ]);
    
    toast.success(`"${currentBook.title}" added to your reading list!`);
    
    // Animate card off-screen to the right
    setDragOffset(window.innerWidth);
    
    // Move to next book after animation
    setTimeout(getNextBook, 300);
  };

  const handleSkipBook = () => {
    setSwipeResult('skip');
    
    // Animate card off-screen to the left
    setDragOffset(-window.innerWidth);
    
    // Move to next book after animation
    setTimeout(getNextBook, 300);
  };

  const updateBookStatus = (bookId, newStatus) => {
    setMyReads(prev => 
      prev.map(book => 
        book.id === bookId 
          ? { ...book, status: newStatus, dateStatusChanged: new Date() }
          : book
      )
    );
    
    const statusMessages = {
      [BOOK_STATUS.TO_READ]: "Added to your 'To Read' list",
      [BOOK_STATUS.READING]: "Moved to 'Currently Reading'",
      [BOOK_STATUS.FINISHED]: "Marked as 'Finished'! Great job!"
    };
    
    toast.success(statusMessages[newStatus]);
  };

  const removeBook = (bookId) => {
    const bookToRemove = myReads.find(book => book.id === bookId);
    
    setMyReads(prev => prev.filter(book => book.id !== bookId));
    
    toast.info(`"${bookToRemove.title}" removed from your reading list`);
  };

  const completeOnboarding = () => {
    // Filter books based on preferences
    if (selectedGenres.length > 0 || selectedMoods.length > 0) {
      const filteredBooks = SAMPLE_BOOKS.filter(book => {
        const hasSelectedGenre = selectedGenres.length === 0 || 
          book.genre.some(g => selectedGenres.includes(g));
          
        const hasSelectedMood = selectedMoods.length === 0 || 
          book.mood.some(m => selectedMoods.includes(m));
          
        return hasSelectedGenre && hasSelectedMood;
      });
      
      // If we have matching books, use those; otherwise use all books
      if (filteredBooks.length > 0) {
        setBooks(filteredBooks);
      }
    }
    
    setIsOnboarding(false);
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleMood = (mood) => {
    setSelectedMoods(prev => 
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  // Get current book to display
  const currentBook = books[currentBookIndex];

  // Group books by status for the My Reads view
  const booksByStatus = myReads.reduce((acc, book) => {
    if (!acc[book.status]) {
      acc[book.status] = [];
    }
    acc[book.status].push(book);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-md md:max-w-2xl relative pb-10">
      {/* Onboarding View */}
      {isOnboarding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 md:p-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-primary">Welcome to PageFlip</h2>
          <p className="text-surface-600 dark:text-surface-300 mb-8 text-center">
            Let's personalize your book discovery experience. Select your preferred genres and moods below.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">What genres do you enjoy?</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary text-white'
                        : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">What moods are you looking for?</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MOODS.map(mood => (
                  <button
                    key={mood}
                    onClick={() => toggleMood(mood)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedMoods.includes(mood)
                        ? 'bg-secondary text-white'
                        : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={completeOnboarding}
              className="btn btn-primary flex items-center space-x-2"
            >
              <span>Start Discovering Books</span>
              <BookOpen className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Main App (after onboarding) */}
      {!isOnboarding && (
        <div>
          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="bg-surface-100 dark:bg-surface-800 p-1.5 rounded-xl shadow-sm">
              <button
                onClick={() => setActiveView('discover')}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'discover'
                    ? 'bg-white dark:bg-surface-700 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-white/50 dark:hover:bg-surface-700/50'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setActiveView('myreads')}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'myreads'
                    ? 'bg-white dark:bg-surface-700 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-white/50 dark:hover:bg-surface-700/50'
                }`}
              >
                My Reads{myReads.length > 0 && ` (${myReads.length})`}
              </button>
            </div>
          </div>
          
          {/* Discover View */}
          {activeView === 'discover' && (
            <div>
              {/* Filter Button */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setFilterVisible(!filterVisible)}
                  className="flex items-center space-x-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
              
              {/* Filter Panel */}
              <AnimatePresence>
                {filterVisible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-4 mb-6 overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Genres</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {AVAILABLE_GENRES.map(genre => (
                            <button
                              key={genre}
                              onClick={() => toggleGenre(genre)}
                              className={`px-2 py-1 rounded-full text-xs transition-all ${
                                selectedGenres.includes(genre)
                                  ? 'bg-primary text-white'
                                  : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Moods</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {AVAILABLE_MOODS.map(mood => (
                            <button
                              key={mood}
                              onClick={() => toggleMood(mood)}
                              className={`px-2 py-1 rounded-full text-xs transition-all ${
                                selectedMoods.includes(mood)
                                  ? 'bg-secondary text-white'
                                  : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                              }`}
                            >
                              {mood}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedGenres([]);
                            setSelectedMoods([]);
                          }}
                          className="text-xs text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                        >
                          Reset filters
                        </button>
                        
                        <button
                          onClick={() => {
                            // Apply filters by just closing the filter panel
                            // The filtering logic would be applied here in a real app
                            setFilterVisible(false);
                          }}
                          className="ml-auto text-xs bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark transition-colors"
                        >
                          Apply filters
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Book Swiping Area */}
              {books.length > 0 && (
                <div className="relative h-[500px] md:h-[550px] bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800 rounded-2xl overflow-hidden shadow-card"
                     ref={dragConstraintRef}>
                  {/* Current book card */}
                  <motion.div 
                    className="swipe-card-shadow absolute inset-0 m-auto bg-white dark:bg-surface-800 rounded-xl overflow-hidden max-w-[90%] h-[90%] cursor-grab active:cursor-grabbing"
                    style={{
                      x: dragOffset,
                      rotate: rotation,
                      zIndex: 10
                    }}
                    drag="x"
                    dragConstraints={dragConstraintRef}
                    onDragStart={handleStartDrag}
                    onDrag={handleDrag}
                    onDragEnd={handleEndDrag}
                  >
                    <div className="relative h-full flex flex-col">
                      {/* Swipe indicators */}
                      <AnimatePresence>
                        {dragOffset > 50 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-4 left-4 z-20 bg-green-500 text-white p-2 rounded-full"
                          >
                            <ThumbsUp className="h-6 w-6" />
                          </motion.div>
                        )}
                        
                        {dragOffset < -50 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-4 right-4 z-20 bg-red-500 text-white p-2 rounded-full"
                          >
                            <ThumbsDown className="h-6 w-6" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Book Cover */}
                      <div className="relative w-full h-[60%] overflow-hidden">
                        <img 
                          src={currentBook.coverUrl}
                          alt={`Cover of ${currentBook.title}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        
                        {/* Book genres */}
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                          {currentBook.genre.slice(0, 2).map(genre => (
                            <span key={genre} className="px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Book Info */}
                      <div className="flex-1 p-4 flex flex-col">
                        <h3 className="text-xl font-bold mb-1 line-clamp-1">{currentBook.title}</h3>
                        <p className="text-surface-600 dark:text-surface-400 text-sm mb-3">by {currentBook.author}</p>
                        <p className="text-surface-700 dark:text-surface-300 text-sm line-clamp-3">
                          {currentBook.blurb}
                        </p>
                        
                        <div className="mt-auto flex justify-between items-center pt-3">
                          <div className="flex space-x-1.5">
                            {currentBook.mood.map(mood => (
                              <span key={mood} className="px-2 py-0.5 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 text-xs rounded-full">
                                {mood}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Action buttons */}
                  <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-4">
                    <button
                      onClick={handleSkipBook}
                      className="p-4 bg-white dark:bg-surface-800 rounded-full shadow-soft hover:shadow-card transition-all"
                      aria-label="Skip this book"
                    >
                      <ThumbsDown className="h-6 w-6 text-red-500" />
                    </button>
                    
                    <button
                      onClick={handleLikeBook}
                      className="p-4 bg-white dark:bg-surface-800 rounded-full shadow-soft hover:shadow-card transition-all"
                      aria-label="Like this book"
                    >
                      <ThumbsUp className="h-6 w-6 text-green-500" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Empty state when no more books */}
              {books.length === 0 && (
                <div className="h-[400px] flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-800 rounded-2xl p-6">
                  <BookX className="h-16 w-16 text-surface-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No books match your filters</h3>
                  <p className="text-surface-600 dark:text-surface-400 text-center mb-6">
                    Try adjusting your genre and mood preferences to see more books.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedGenres([]);
                      setSelectedMoods([]);
                      setBooks(SAMPLE_BOOKS);
                    }}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
              
              {/* Swipe instructions */}
              <div className="mt-6 bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card">
                <h3 className="font-medium mb-2 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  How to Use PageFlip
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Swipe right to add books to your reading list, or swipe left to skip. 
                  You can also use the buttons below each book.
                </p>
              </div>
            </div>
          )}
          
          {/* My Reads View */}
          {activeView === 'myreads' && (
            <div>
              {/* Empty state */}
              {myReads.length === 0 && (
                <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 text-center shadow-card">
                  <BookMarked className="h-16 w-16 text-surface-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Your reading list is empty</h3>
                  <p className="text-surface-600 dark:text-surface-400 mb-6">
                    Swipe right on books you like to add them to your reading list.
                  </p>
                  <button
                    onClick={() => setActiveView('discover')}
                    className="btn btn-primary"
                  >
                    Discover Books
                  </button>
                </div>
              )}
              
              {/* Reading List */}
              {myReads.length > 0 && (
                <div className="space-y-8">
                  {/* Search and filter controls */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search your books..."
                      className="input-field py-3 pl-10 w-full"
                    />
                  </div>
                
                  {/* To Read Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <BookMarked className="h-5 w-5 mr-2 text-primary" />
                      To Read
                    </h3>
                    
                    <div className="space-y-3">
                      {booksByStatus[BOOK_STATUS.TO_READ]?.map(book => (
                        <div key={book.id} className="bg-white dark:bg-surface-800 rounded-xl shadow-card overflow-hidden flex">
                          <img 
                            src={book.coverUrl} 
                            alt={`Cover of ${book.title}`} 
                            className="w-20 h-28 object-cover"
                          />
                          <div className="p-3 flex-1">
                            <h4 className="font-semibold line-clamp-1">{book.title}</h4>
                            <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">by {book.author}</p>
                            <div className="mt-1 flex items-center justify-between">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => updateBookStatus(book.id, BOOK_STATUS.READING)}
                                  className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                  aria-label="Mark as currently reading"
                                >
                                  <BookOpen className="h-4 w-4 text-primary" />
                                </button>
                                
                                <button 
                                  onClick={() => updateBookStatus(book.id, BOOK_STATUS.FINISHED)}
                                  className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                  aria-label="Mark as finished"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => removeBook(book.id)}
                                className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                aria-label="Remove from reading list"
                              >
                                <BookX className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                          <p className="text-surface-500 dark:text-surface-400 text-sm">
                            No books in your "To Read" list yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Currently Reading Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-secondary" />
                      Currently Reading
                    </h3>
                    
                    <div className="space-y-3">
                      {booksByStatus[BOOK_STATUS.READING]?.map(book => (
                        <div key={book.id} className="bg-white dark:bg-surface-800 rounded-xl shadow-card overflow-hidden flex">
                          <img 
                            src={book.coverUrl} 
                            alt={`Cover of ${book.title}`} 
                            className="w-20 h-28 object-cover"
                          />
                          <div className="p-3 flex-1">
                            <h4 className="font-semibold line-clamp-1">{book.title}</h4>
                            <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">by {book.author}</p>
                            <div className="mt-1 flex items-center justify-between">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => updateBookStatus(book.id, BOOK_STATUS.TO_READ)}
                                  className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                  aria-label="Move back to To Read"
                                >
                                  <BookMarked className="h-4 w-4 text-primary" />
                                </button>
                                
                                <button 
                                  onClick={() => updateBookStatus(book.id, BOOK_STATUS.FINISHED)}
                                  className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                  aria-label="Mark as finished"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => removeBook(book.id)}
                                className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                aria-label="Remove from reading list"
                              >
                                <BookX className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                          <p className="text-surface-500 dark:text-surface-400 text-sm">
                            No books in your "Currently Reading" list
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Finished Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Archive className="h-5 w-5 mr-2 text-green-600" />
                      Finished
                    </h3>
                    
                    <div className="space-y-3">
                      {booksByStatus[BOOK_STATUS.FINISHED]?.map(book => (
                        <div key={book.id} className="bg-white dark:bg-surface-800 rounded-xl shadow-card overflow-hidden flex">
                          <img 
                            src={book.coverUrl} 
                            alt={`Cover of ${book.title}`} 
                            className="w-20 h-28 object-cover"
                          />
                          <div className="p-3 flex-1">
                            <h4 className="font-semibold line-clamp-1">{book.title}</h4>
                            <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">by {book.author}</p>
                            <div className="mt-1 flex items-center justify-between">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => updateBookStatus(book.id, BOOK_STATUS.TO_READ)}
                                  className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                  aria-label="Move back to To Read"
                                >
                                  <BookMarked className="h-4 w-4 text-primary" />
                                </button>
                                
                                <button 
                                  onClick={() => updateBookStatus(book.id, BOOK_STATUS.READING)}
                                  className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                  aria-label="Mark as currently reading"
                                >
                                  <BookOpen className="h-4 w-4 text-secondary" />
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => removeBook(book.id)}
                                className="p-1.5 bg-surface-100 dark:bg-surface-700 rounded-full"
                                aria-label="Remove from reading list"
                              >
                                <BookX className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                          <p className="text-surface-500 dark:text-surface-400 text-sm">
                            No books in your "Finished" list yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MainFeature;