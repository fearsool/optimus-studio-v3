/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    'chromadb',
    'puppeteer',
    'better-sqlite3',
    'archiver',
    'natural',
    'cohere-ai',
    'openai',
    '@google/generative-ai',
    '@anthropic-ai/sdk',
    'onnxruntime-node',
    '@whiskeysockets/baileys',
    'jimp',
    'sharp',
    'node-telegram-bot-api'
  ],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@whiskeysockets/baileys/**/*',
      'node_modules/puppeteer/**/*',
      'node_modules/puppeteer-core/**/*',
      'node_modules/onnxruntime-node/**/*',
      'node_modules/jimp/**/*',
      'node_modules/sharp/**/*'
    ],
  },
  experimental: {
  }
};

module.exports = nextConfig;
