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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
function downloadAndCacheGrant(repo, tagName, assetName, binaryPathInArchive) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            throw new Error('GitHub token not provided. Please set the GITHUB_TOKEN environment variable.');
        }
        const headers = {
            'User-Agent': 'grant-action',
            'Authorization': `token ${token}`,
        };
        // API URL for the release
        const apiURL = `https://api.github.com/repos/${repo}/releases/tags/${tagName}`;
        const response = yield (0, node_fetch_1.default)(apiURL, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch release: ${response.statusText}`);
        }
        const releaseInfo = yield response.json();
        const asset = releaseInfo.assets.find((asset) => asset.name === assetName);
        if (!asset) {
            throw new Error(`Failed to find asset: ${assetName}`);
        }
        // Download the tar.gz file
        const tarballPath = yield tc.downloadTool(asset.browser_download_url, undefined, `token ${token}`);
        // Extract the tar.gz file
        const extractedFolder = yield tc.extractTar(tarballPath);
        // The binary path in the extracted folder
        const binaryPath = `${extractedFolder}/${binaryPathInArchive}`;
        // TODO: add cache
        const execPath = `${binaryPath}`;
        fs_1.default.chmodSync(execPath, '755');
        return execPath;
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get input using core.getInput
            const imageInput = core.getInput('image', { required: true });
            // TODO: parameterize this input
            const grantPath = yield downloadAndCacheGrant('anchore/grant', 'v0.2.0', 'grant_0.2.0_linux_amd64.tar.gz', 'grant');
            // Execute Grant
            // TODO: need to pick the right command
            const output = (0, child_process_1.execSync)(`${grantPath} list ${imageInput}`).toString();
            // Set output using core.setOutput
            core.setOutput('license_list', output);
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
            else {
                core.setFailed('An unexpected error occurred: ${String(error)}');
            }
        }
    });
}
run();
