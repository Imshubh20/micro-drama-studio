"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? config_1.config.frontendUrl : true,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api', routes_1.default);
// Error handling
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});
// Start server
app.listen(config_1.config.port, () => {
    console.log(`\n🎬 Micro Drama Studio API running on port ${config_1.config.port}`);
    console.log(`📡 Mode: ${config_1.config.isDemoMode ? 'DEMO (mock AI)' : `PRODUCTION (Gemini - ${config_1.config.gemini.model})`}`);
    console.log(`🌐 Frontend URL: ${config_1.config.frontendUrl}\n`);
});
exports.default = app;
//# sourceMappingURL=index.js.map