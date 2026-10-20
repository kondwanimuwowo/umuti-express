import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/pharmacist", destination: "/dashboard/prescriptions", permanent: false },
      { source: "/pharmacist/chats", destination: "/dashboard/chats", permanent: false },
    ];
  },
};

export default nextConfig;
