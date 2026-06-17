const nextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-neon',
    '@neondatabase/serverless',
    'ws',
  ],
} as const;

export default nextConfig;
