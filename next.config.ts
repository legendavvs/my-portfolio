import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Дозволяємо фото з Cloudinary
      },
    ],
  },
};

export default nextConfig;