/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set BUILD_STATIC=true for Netlify/static export; omit for Docker/Pi dev server (needs API routes)
  ...(process.env.BUILD_STATIC === "true" ? { output: "export", trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
