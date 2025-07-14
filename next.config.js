/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Build output configuration
    reactStrictMode: false, // Enable React strict mode
    env: {}, // Environment variables if needed
    // Add rewrites for proxy configuration if needed in development
    async rewrites() {
        return [
            {
                source: '/api/proxy/:path*',
                destination: 'https://www.youtube.com/:path*',
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
