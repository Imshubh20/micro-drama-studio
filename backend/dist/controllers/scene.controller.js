"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSceneById = getSceneById;
exports.updateScene = updateScene;
exports.regenerateScene = regenerateScene;
exports.getSceneCostEstimate = getSceneCostEstimate;
exports.updateScript = updateScript;
const sceneService = __importStar(require("../services/scene.service"));
async function getSceneById(req, res) {
    try {
        const scene = await sceneService.getSceneById(req.params.id);
        if (!scene)
            return res.status(404).json({ success: false, error: 'Scene not found' });
        res.json({ success: true, data: scene });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function updateScene(req, res) {
    try {
        const scene = await sceneService.updateScene(req.params.id, req.body);
        res.json({ success: true, data: scene });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function regenerateScene(req, res) {
    try {
        const scene = await sceneService.regenerateScene(req.params.id);
        res.json({ success: true, data: scene });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function getSceneCostEstimate(req, res) {
    try {
        const estimate = sceneService.getSceneCostEstimate();
        res.json({ success: true, data: estimate });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function updateScript(req, res) {
    try {
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ success: false, error: 'Script content is required' });
        const script = await sceneService.updateScript(req.params.episodeId, content);
        res.json({ success: true, data: script });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=scene.controller.js.map