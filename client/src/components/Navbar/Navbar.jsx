import React, { useState, useEffect, useRef } from 'react';
import ieeelogo from '../../assets/ieeelogo.png';
import ceclogo from '../../assets/ceclogo.png';
import naac from '../../assets/naac.png';
import nirf from '../../assets/nirf.png';
import cgclogo from '../../assets/cgclogo.png';

import { Link } from 'react-router-dom';

function Navbar() {
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  let dropdownRef = useRef();
  const toggleBurger = () => setIsBurgerOpen(!isBurgerOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const handleOptionClick = () => setIsDropdownOpen(false);
  
  useEffect(() => {
    let handler = (e) => {
      // to properly check if the click is outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);
  const closeBurger = () => {
    setIsBurgerOpen(false);
  };
  
  return (
    <div>
      {/* Top Banner */}
      <div id="sticky-banner" className="fixed top-0 left-0 w-full p-2 border-b border-gray-200 bg-gradient-to-r from-red-700 to-red-500 transition-transform duration-300 z-50">
  <div className="flex flex-col sm:flex-row justify-between items-center mx-auto gap-4 sm:gap-32 text-white">
    <div className='flex gap-2 sm:gap-2 items-center'>
      <p className="text-sm sm:text-xs">Dr. Sarabpreet kaur</p>
      <p className="hidden sm:block">|</p>
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="0.75em" width="0.75em" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" d="M0 0h24v24H0V0z"></path>
        <path d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57a.84.84 0 0 0-.31-.05c-.26 0-.51.1-.71.29l-2.2 2.2a15.149 15.149 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1z"></path>
      </svg>
      <p className="text-sm sm:text-xs">+91 9779454366</p>
    </div>
    <div className="text-center ">
      <Link to="./" className="sm:order-1 text-[#F1F1F1] flex-none text-xs sm:text-sm font-semibold focus:outline-none focus:opacity-80">
      IETACS 2025 | 
        <a> ietacs@cgc.ac.in</a>
      </Link>
    </div>
    <div className='flex gap-2 sm:gap-2 items-center'>
      <p className="text-sm sm:text-xs">Dr. Shivani Goyal</p>
      <p className="hidden sm:block">|</p>
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="0.75em" width="0.75em" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" d="M0 0h24v24H0V0z"></path>
        <path d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57a.84.84 0 0 0-.31-.05c-.26 0-.51.1-.71.29l-2.2 2.2a15.149 15.149 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1z"></path>
      </svg>
      <p className="text-sm sm:text-xs">+91 8264239901</p>
    </div>
  </div>
</div>
      {/* Main Navbar */}
      <div className="fixed top-0 md:pt-14 sm:pt-10 left-0 w-full flex p-4 text-sm bg-white shadow-md z-40">
      <div className="w-full mx-auto px-4 flex basis-full items-center justify-between">
        {/* left side logo */}
        <div className="block">
      <a href="./">
        <img src={cgclogo} alt="CGC Logo" className="w-[100px] sm:w-[250px]" />
      </a>
    </div>
        {/* Nav Items */}
        <div className='flex-2'>
          <div className="flex justify-between items-center">
            {/* Burger Icon */}
            <button type="button" onClick={toggleBurger} className="sm:hidden flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
              <svg className={`${isBurgerOpen ? 'hidden' : 'block'} shrink-0`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              <svg className={`${isBurgerOpen ? 'block' : 'hidden'} shrink-0`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">Toggle</span>
            </button>
          </div>
          <div className={`${isBurgerOpen ? 'block' : 'hidden'} hs-collapse overflow-hidden transition-all duration-300 sm:basis-auto sm:block sm:order-3`}>
            <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:mt-0 sm:ps-5">
              <ul className="flex flex-col sm:flex-row gap-5 sm:items-center">
                <li className="cursor-pointer">
                  <Link to="./" className="font-medium text-gray-600 hover:text-gray-400 focus:outline-none" onClick={closeBurger}>
                    Home
                  </Link>
                </li>
                <li className="cursor-pointer">
                  <Link to="./about" className="font-medium text-gray-600 hover:text-gray-400 focus:outline-none" onClick={closeBurger}>
                    About
                  </Link>
                </li>
                <li className="cursor-pointer">
                  <Link to="./keynotespeaker" className="font-medium text-gray-600 hover:text-gray-400 focus:outline-none" onClick={closeBurger}>
                    Keynote Speaker
                  </Link>
                </li>
                <li className="cursor-pointer">
                  <Link to="./organizing" className="font-medium text-gray-600 hover:text-gray-400 focus:outline-none" onClick={closeBurger}>
                    Committee
                  </Link>
                </li>
                <li className="cursor-pointer">
                  <Link className="font-medium text-gray-600 hover:text-gray-400 focus:outline-none" to="./callforpaper" onClick={closeBurger}>
                    Call for Paper
                  </Link>
                </li>
                <li className="cursor-pointer">
                  <Link to="./papersubmission" className="font-medium text-gray-600 hover:text-gray-400 focus:outline-none" onClick={closeBurger}>
                    Paper Submission
                  </Link>
                </li>
                <li className="cursor-pointer">
                  <Link to="./registration" className="font-medium text-gray-600 hover:text-gray-400 focus:outline-none" onClick={closeBurger}>
                    Registration
                  </Link>
                </li>
                <li className="cursor-pointer">
                  <Link to="./contact" className="font-medium text-gray-600 hover:text-gray-400 focus:outline-none" onClick={closeBurger}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* right side logos */}
    <div className="hidden sm:flex items-center justify-end gap-4 sm:pl-20">
      <img src={ceclogo} className="hidden sm:block w-[3em] sm:w-[4em]" alt="CGC Logo" />
      <div className="hidden sm:block ms-2">
        <div className="slick-list draggable h-10 overflow-hidden">
          <div className="slick-track opacity-100 h-48 transform transition-transform duration-500 ease-in-out">
            <div className="slick-slide w-24">
              <a href="https://www.cgc.ac.in">
                <img src={nirf} alt="NIRF Logo" className="w-20 h-8 sm:w-28 sm:h-10" />
              </a>
            </div>
            <div className="slick-slide w-24">
              <a href="https://www.cgc.ac.in">
                <img src={naac} alt="NAAC Logo" className="w-20 h-8 sm:w-28 sm:h-10" />
              </a>
            </div>
            <div className="slick-slide w-24">
              <a href="https://www.cgc.ac.in">
                <img src={nirf} alt="NIRF Logo" className="w-20 h-8 sm:w-28 sm:h-10" />
              </a>
            </div>
            <div className="slick-slide w-24">
              <a href="https://www.cgc.ac.in">
                <img src={naac} alt="NAAC Logo" className="w-20 h-8 sm:w-28 sm:h-10" />
              </a>
            </div>
            <div className="slick-slide w-24">
              <a href="https://www.cgc.ac.in">
                <img src={nirf} alt="NIRF Logo" className="w-20 h-8 sm:w-28 sm:h-10" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
      {/* Add margin-top to the content below */}
      <div className='mt-40 hidden sm:block'>
  {/* Main content goes here */}
</div>
    </div>
  );
}

export default Navbar;