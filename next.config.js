/** @type {import('next').NextConfig} */
const nextConfig = {
  // Builds de verificação (BUILD_CHECK=1 npm run build) escrevem noutra pasta,
  // para nunca corromper a cache do "next dev" que corre em paralelo na mesma pasta.
  distDir: process.env.BUILD_CHECK ? ".next-build-check" : ".next",
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://tsozqadxoujocwxqxorg.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      "sb_publishable_J5j1drDwSckQFZSdEPSbIQ_3yzT-8Tb",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzb3pxYWR4b3Vqb2N3eHF4b3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNTMwNTAsImV4cCI6MjEwNDgyOTA1MH0.RXebycS3ngNsbXxzNZuv8SbgKVNBm_1XnikWZiigp78",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tsozqadxoujocwxqxorg.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
