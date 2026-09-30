import dotenv from 'dotenv';
dotenv.config();

// Sanitize the API key: trim whitespace and strip surrounding quotes
const rawGeminiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

export const config = {
  port: parseInt(process.env.PORT || '5000'),
  databaseUrl: process.env.DATABASE_URL || '',
  gemini: {
    apiKey: rawGeminiKey,
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  isDemoMode: !rawGeminiKey,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Startup diagnostic (never prints the actual key)
if (rawGeminiKey) {
  const masked = rawGeminiKey.slice(0, 5) + '...' + rawGeminiKey.slice(-4);
  console.log(`✅ GEMINI_API_KEY loaded (${masked}), production mode active with model ${config.gemini.model}`);
} else {
  console.log('⚠️  GEMINI_API_KEY is empty or missing in .env — running in DEMO mode');
}
