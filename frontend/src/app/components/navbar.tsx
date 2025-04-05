'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-black border-b border-red-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/vercel.svg" className="h-8" width={32} height={32} alt="AstroGuard Logo" />
          <span className="text-2xl font-extrabold text-red-500">AstroGuard</span>
        </Link>

        {/* Profile + Hamburger Button */}
        <div className="flex items-center space-x-4 md:order-2">
          {/* Profile Button */}
          <button
            type="button"
            className="flex text-sm bg-red-600 rounded-full focus:ring-4 focus:ring-red-400"
            id="user-menu-button"
            aria-expanded="false"
            data-dropdown-toggle="user-dropdown"
            data-dropdown-placement="bottom"
          >
            <span className="sr-only">Open user menu</span>
            <Image
              className="w-8 h-8 rounded-full"
              src="/vercel.svg"
              width={32}
              height={32}
              alt="User Avatar"
            />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            data-collapse-toggle="navbar-user"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-red-400 rounded-lg md:hidden hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-controls="navbar-user"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {/* Add an icon here if desired */}
          </button>
        </div>

        {/* Dropdown Menu */}
        <div
          className="z-50 hidden my-4 text-base list-none bg-black divide-y divide-red-700 rounded-lg shadow-md"
          id="user-dropdown"
        >
          <div className="px-4 py-3">
            <span className="block text-sm text-white">Bonnie Green</span>
            <span className="block text-sm text-red-400 truncate">name@astroguard.com</span>
          </div>
          <ul className="py-2" aria-labelledby="user-menu-button">
            {['Dashboard', 'Settings', 'Earnings', 'Sign out'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-red-300 hover:bg-red-800 hover:text-white transition"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation Links (optional) */}
        <div
          className="hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-user"
        >
          {/* You can add menu items here if needed */}
        </div>
      </div>
    </nav>
  );
}
