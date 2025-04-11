"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center px-2 text-2xl font-extrabold text-gray-900"
            >
              <span className="text-teal-600">Vitae</span>AI
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-colors duration-200"
            >
              Upload Documents
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
