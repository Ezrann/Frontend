import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center bg-white p-8 md:p-16 rounded-xl shadow-sm">
        
        {/* Left Side: Illustration */}
        <div className="hidden md:flex justify-center items-center">
          <div className="relative w-full aspect-square max-w-lg">
            <img 
              src="/illustration.png" 
              alt="Marketplace Illustration" 
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Create an Account</h1>
            <p className="text-gray-500 text-sm">join marketplace</p>
          </div>

          {/* Social Register Button */}
          <button 
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors mb-6 shadow-sm"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" 
              alt="Google" 
              className="w-5 h-5" 
            />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">Or register with email</span>
            </div>
          </div>

          <form className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter you full name" 
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 bg-gray-50/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">Email</label>
              <input 
                type="email" 
                placeholder="Enter your Email Address" 
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 bg-gray-50/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 bg-gray-50/50"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">Confirm Password</label>
              <input 
                type="password" 
                placeholder="Re-type Password" 
                className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 bg-gray-50/50"
              />
            </div>

            {/* Register Button */}
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg shadow-blue-100 transition-colors mt-6"
            >
              Register
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;