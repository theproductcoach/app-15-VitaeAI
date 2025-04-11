import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Tailor your resume and cover letter in seconds with AI
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-10">
                VitaeAI helps you land your next role faster by customising your
                application to the job description.
              </p>
              <Link
                href="/upload"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 transform hover:scale-105"
              >
                Get started
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
