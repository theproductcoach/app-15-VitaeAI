/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ensure pdf.js worker is available
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Handle PDF.js worker
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource'
    });

    return config;
  },
}

module.exports = nextConfig 