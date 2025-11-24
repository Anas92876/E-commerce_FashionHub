import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">

            {/* Left Side - Illustration/Animation */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-2 lg:order-1"
            >
              {/* Animated 404 Illustration */}
              <div className="relative w-full aspect-square max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">

                {/* Background Circle */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/20 dark:to-purple-900/20"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Center 404 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 1,
                      delay: 0.2,
                      type: "spring",
                      stiffness: 100,
                    }}
                  >
                    <h1 className="text-[5rem] xs:text-[6rem] sm:text-[7rem] md:text-[8rem] lg:text-[9rem] xl:text-[10rem] font-black bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-none">
                      404
                    </h1>
                  </motion.div>
                </div>

                {/* Floating Elements - Responsive */}
                <motion.div
                  className="absolute top-4 sm:top-8 lg:top-10 right-4 sm:right-8 lg:right-10 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-primary-500/20 backdrop-blur-sm"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute bottom-12 sm:bottom-16 lg:bottom-20 left-4 sm:left-6 lg:left-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-purple-500/20 backdrop-blur-sm"
                  animate={{
                    y: [0, 20, 0],
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />

                <motion.div
                  className="absolute top-1/2 left-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-pink-500/20 backdrop-blur-sm"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />

                <motion.div
                  className="absolute bottom-6 sm:bottom-8 lg:bottom-10 right-10 sm:right-14 lg:right-20 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-blue-500/20 backdrop-blur-sm"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                />
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="space-y-6 sm:space-y-8 order-1 lg:order-2 text-center lg:text-left"
            >
              <div class="my-4"></div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex mx-auto lg:mx-0"
              >
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold">
                  Error 404
                </span>
              </motion.div>



              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 sm:space-y-4"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Oops! Page
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Not Found
                  </span>
                </h2>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                  The page you're looking for doesn't exist or has been moved. Use the navigation to find what you need.
                </p>
              </motion.div>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-2.5 sm:space-y-3 max-w-md mx-auto lg:mx-0"
              >
                {[
                  { icon: '🏠', text: 'Browse our homepage' },
                  { icon: '🛍️', text: 'Explore our products' },
                  { icon: '📧', text: 'Contact our support' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-xl sm:text-2xl">{item.icon}</span>
                    <span className="text-sm sm:text-base">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Status Bar */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="pt-4 sm:pt-6"
              >
                <div className="h-1.5 sm:h-2 w-full max-w-md mx-auto lg:mx-0 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '60%' }}
                    transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Suggestion: Use the navigation menu above
                </p>

                <div class="my-12"></div>

              </motion.div>

            </motion.div>

          </div>
        </div>
        <div class="my-12"></div>
      </main>



      <Footer />
    </div>
  );
};

export default NotFound;
