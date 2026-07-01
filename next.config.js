/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/generate_strategy",
        destination: "/api/generate_strategy",
      },
    ];
  },
};

module.exports = nextConfig;
