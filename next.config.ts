import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Adding config to resolve cross-origin warnings in development.
  allowedDevOrigins: [
      "https://*.cluster-htdgsbmflbdmov5xrjithceibm.cloudworkstations.dev"
  ]
};

export default nextConfig;
