/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SLACK_TOKEN: process.env.SLACK_TOKEN,
    CHANNEL_ID: process.env.CHANNEL_ID,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [
      "puppeteer-extra",
      "puppeteer-extra-plugin-stealth",
      "puppeteer-extra-plugin-recaptcha",
    ],
  },
};
  
  module.exports = nextConfig;
  