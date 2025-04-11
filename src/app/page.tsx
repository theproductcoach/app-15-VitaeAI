import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Craft Your Perfect Application
              <span className="block text-teal-600 mt-2">Powered by AI</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
              Transform your resume and create compelling cover letters tailored
              to each job application using advanced AI technology.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/upload"
                className="inline-flex items-center px-8 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Customization",
                description:
                  "Our AI analyzes job descriptions to tailor your application perfectly.",
              },
              {
                title: "Professional Templates",
                description:
                  "Generate polished cover letters that highlight your strengths.",
              },
              {
                title: "CV Enhancement",
                description:
                  "Get smart suggestions to improve your resume for each application.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="relative group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
