/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/car-accessories",
        destination: "/collections/car-accessories",
        permanent: true,
      },
      {
        source: "/car-parts",
        destination: "/collections/car-parts",
        permanent: true,
      },
      {
        source: "/tyres",
        destination: "/collections/tyres",
        permanent: true,
      },
      {
        source: "/lubricant",
        destination: "/collections/lubricant",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
