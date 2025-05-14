import React from "react";
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-red-800 to-red-600 shadow-lg">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo and Address Section */}
          <div className="space-y-4">
            <a href="https://www.cgc.ac.in/" 
               className="inline-block transform hover:scale-105 transition-transform duration-200">
              <img 
                src="https://www.cgc.ac.in/public/course/assets/images/header-footer/cgc-jhanjeri-logo-white.png" 
                className="h-12 w-auto" 
                alt="CGC Logo" 
              />
            </a>
            <p className="text-white/90 text-sm leading-relaxed">
              Chandigarh Group of Colleges Jhanjeri Mohali,<br/>
              State Highway 12A Jhanjeri,<br/>
              Sahibzada Ajit Singh Nagar,<br/>
              Punjab 140307
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold border-b border-red-400 pb-2 mb-4">
              Contact Us
            </h2>
            <div className="text-white/90 space-y-2">
              <p className="font-medium">Dr. Sarabpreet kaur</p>
              <a href="tel:+919779454366" 
                 className="block hover:text-white transition-colors duration-200">
                +91 9779454366
              </a>
              <a href="mailto:ietacs@cgc.ac.in" 
                 className="block hover:text-white transition-colors duration-200">
                ietacs@cgc.ac.in
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold border-b border-red-400 pb-2 mb-4">
              Quick Links
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Link to="/" 
                      className="block text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200">
                  Home
                </Link>
                <Link to="/about" 
                      className="block text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200">
                  About
                </Link>
                <Link to="/callforpaper" 
                      className="block text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200">
                  Call for Paper
                </Link>
              </div>
              <div className="space-y-3">
                <Link to="/papersubmission" 
                      className="block text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200">
                  Paper Submission
                </Link>
                <Link to="/registration" 
                      className="block text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200">
                  Registration
                </Link>
                <Link to="/contact" 
                      className="block text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8 border-red-400/30" />

        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-sm text-white/90">
          <span>
            © 2025 <a href="#" className="hover:text-white transition-colors duration-200">IETACS</a>. 
            All Rights Reserved.
          </span>
          <span>
            Designed by{" "}
            <a href="https://www.linkedin.com/in/shiven-kashyap-964819220/" 
               className="hover:text-white transition-colors duration-200">
              Shiven Kashyap
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;