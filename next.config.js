/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      SLACK_TOKEN: process.env.SLACK_TOKEN,
      CHANNEL_ID: process.env.CHANNEL_ID,
    },
  };
  
  module.exports = nextConfig;
  