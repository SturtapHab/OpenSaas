/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'framer-motion',
    ],
  },
  // Робокасса возвращает покупателя на Success/Fail URL магазина (обычно /billing).
  // Покупатель курса не залогинен, поэтому такие возвраты уводим на публичные страницы:
  // /payment/success сам решает: показать, куда ушло письмо с доступом, или вернуть в кабинет.
  async redirects() {
    return [
      {
        source: "/billing",
        has: [{ type: "query", key: "SignatureValue" }],
        destination: "/payment/success",
        permanent: false,
      },
      {
        source: "/billing",
        has: [{ type: "query", key: "InvId" }],
        missing: [{ type: "query", key: "SignatureValue" }],
        destination: "/payment/fail",
        permanent: false,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
  },
};

export default nextConfig;
