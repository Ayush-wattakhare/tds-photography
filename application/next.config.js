/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow unoptimized images in public folder so html2canvas can capture them fully
    unoptimized: true,
  },
}

module.exports = nextConfig
