import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Prescriptions and pharmacy documents go up through server actions. The default limit is 1MB.
    serverActions: { bodySizeLimit: "20mb" },
  },
  async redirects() {
    return [
      { source: "/pharmacist", destination: "/dashboard/prescriptions", permanent: false },
      { source: "/pharmacist/chats", destination: "/dashboard/chats", permanent: false },
    ];
  },
};

export default nextConfig;
