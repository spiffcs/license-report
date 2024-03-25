import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import fetch from 'node-fetch';
import { execSync } from 'child_process';
import fs from 'fs';

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  assets: GitHubReleaseAsset[];
}

async function downloadAndCacheGrant(repo: string, tagName: string, assetName: string, binaryPathInArchive: string): Promise<string> {
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

	const response = await fetch(apiURL, { headers });
	if (!response.ok) {
		throw new Error(`Failed to fetch release: ${response.statusText}`);
	}

	const releaseInfo = await response.json() as GitHubRelease;
	const asset = releaseInfo.assets.find((asset: any) => asset.name === assetName);
	if (!asset) {
		throw new Error(`Failed to find asset: ${assetName}`);
	}
	// Download the tar.gz file
	const tarballPath = await tc.downloadTool(asset.browser_download_url, undefined, `token ${token}`);

	// Extract the tar.gz file
	const extractedFolder = await tc.extractTar(tarballPath);

	// The binary path in the extracted folder
	const binaryPath = `${extractedFolder}/${binaryPathInArchive}`;

	// TODO: add cache

	const execPath = `${binaryPath}`;
	fs.chmodSync(execPath, '755');

	return execPath;
}

async function run(): Promise<void> {
  try {
	  // Get input using core.getInput
	  const grantInput = core.getInput('input', { required: true });

	  // TODO: parameterize this input
	  const grantPath = await downloadAndCacheGrant('anchore/grant', 'v0.2.0', 'grant_0.2.0_linux_amd64.tar.gz', 'grant');

	  // Execute Grant
	  // TODO: need to pick the right command
	  const output = execSync(`${grantPath} list -o csv ${grantInput}`).toString();

	  // Set output using core.setOutput
	  core.setOutput('license_list', output);
  } catch (error: unknown) {
	  if (error instanceof Error) {
		  core.setFailed(error.message);
	  } else {
		  core.setFailed('An unexpected error occurred: ${String(error)}');
	  }
  }
}

run();
