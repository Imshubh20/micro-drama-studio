import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? config.frontendUrl : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(config.port, () => {
  console.log(`\n🎬 Micro Drama Studio API running on port ${config.port}`);
  console.log(`📡 Mode: ${config.isDemoMode ? 'DEMO (mock AI)' : `PRODUCTION (Gemini - ${config.gemini.model})`}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}\n`);
});

export default app;
