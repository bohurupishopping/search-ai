import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/@:query*',
        destination: '/#search=:query*',
        permanent: false
      },
      {
        source: '/extract/:url*',
        destination: '/#extract=:url*',
        permanent: false
      }
    ];
  }
};

export default nextConfig;
