const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable API routes for static export
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
