import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { GraduationCap, Briefcase, MapPin } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <img
                src={logo}
                alt="NITS Logo"
                className="w-32 sm:w-40 md:w-48 object-contain"
              />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-slate-600 hover:text-red-600 px-3 sm:px-4 py-2 font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-bold shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl mb-6">
              <span className="block mb-2">Accelerate your career with</span>
              <span className="block text-red-600">
                NITS Placement Cell
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto mb-10">
              The centralized platform for students to explore top-tier
              internships, high-paying jobs, and career-defining skill courses,
              all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 border border-transparent text-lg font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 border-2 border-slate-200 text-lg font-bold rounded-lg text-slate-700 bg-white hover:border-red-600 hover:text-red-600 shadow-sm transition-all"
              >
                Access Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900">
                Everything you need to succeed
              </h2>
              <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
                Tailored specifically for NITS students to bridge the gap
                between academic learning and industry requirements.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#f1f5f9] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-slate-100">
                <div className="w-16 h-16 inline-flex items-center justify-center rounded-xl bg-white shadow-sm text-red-600 mb-6">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Premium Jobs
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Direct access to placement drives and job postings from top
                  product and service-based companies.
                </p>
              </div>

              <div className="bg-[#f1f5f9] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-slate-100">
                <div className="w-16 h-16 inline-flex items-center justify-center rounded-xl bg-white shadow-sm text-red-600 mb-6">
                  <MapPin size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Internship Opportunities
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Find short-term and long-term paid internships to build
                  real-world experience before graduation.
                </p>
              </div>

              <div className="bg-[#f1f5f9] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-slate-100">
                <div className="w-16 h-16 inline-flex items-center justify-center rounded-xl bg-white shadow-sm text-red-600 mb-6">
                  <GraduationCap size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Skill Courses
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Enroll in industry-vetted technical and soft-skill courses
                  prepared by experienced mentors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-red-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:divide-x divide-red-500">
              <div className="px-4">
                <div className="text-4xl font-extrabold text-white mb-2">
                  95%
                </div>
                <div className="text-red-100 font-medium">Placement Rate</div>
              </div>
              <div className="px-4">
                <div className="text-4xl font-extrabold text-white mb-2">
                  350+
                </div>
                <div className="text-red-100 font-medium">
                  Recruiting Partners
                </div>
              </div>
              <div className="px-4">
                <div className="text-4xl font-extrabold text-white mb-2">
                  55 LPA
                </div>
                <div className="text-red-100 font-medium">Highest Package</div>
              </div>
              <div className="px-4">
                <div className="text-4xl font-extrabold text-white mb-2">
                  12 LPA
                </div>
                <div className="text-red-100 font-medium">Average Package</div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-10 lg:mb-0">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                  Empowering students to reach their full potential
                </h2>
                <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                  The Training and Placement Cell of NIT Silchar is dedicated to
                  providing students with the best possible opportunities to
                  kickstart their professional careers.
                </p>
                <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                  We collaborate closely with top-tier corporations, research
                  organizations, and fast-growing startups to bring premium
                  opportunities directly to our campus. Whether you are looking
                  for your first internship, seeking to upgrade your technical
                  skills, or ready for a full-time role, our platform
                  streamlines the entire process.
                </p>
                <div className="mt-8">
                  <Link
                    to="/about"
                    className="inline-flex items-center text-red-600 font-bold hover:text-red-700"
                  >
                    Learn more about our mission
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Students collaborating"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#f1f5f9] rounded-2xl -z-10"></div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-red-50 rounded-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#f1f5f9] py-16 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-xl text-slate-500 mb-8">
              Join thousands of NITS students exploring their next big
              opportunity.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-md transition-all transform hover:-translate-y-0.5"
            >
              Create Your Account Now
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} NITS Placement Cell. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
