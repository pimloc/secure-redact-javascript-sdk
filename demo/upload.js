'use strict';

import { SecureRedactSDK } from '../dist/SecureRedactSDK.js';
import fs from 'fs';
import path from 'path';

/*
  A demo script to upload a single file to SecureRedact using node.js

  Usage:
    SR_CLIENT_ID=... SR_CLIENT_SECRET=... [SR_URL=http://localhost:3000] \
      node demo/upload.js <file> [projectName]
*/
const clientId = process.env.SR_CLIENT_ID ?? 'place your client id here';
const clientSecret =
  process.env.SR_CLIENT_SECRET ?? 'place your client secret here';
const url = process.env.SR_URL ?? 'https://app.secureredact.co.uk';

const [filePath, projectName = 'SDK demo uploads'] = process.argv.slice(2);

const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
  '.webm': 'video/webm',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png'
};

const sdk = new SecureRedactSDK({ clientId, clientSecret, url });

const main = async () => {
  if (!filePath) {
    throw new Error('Usage: node demo/upload.js <file> [projectName]');
  }
  const stat = await fs.promises.stat(filePath).catch(() => null);
  if (!stat?.isFile()) {
    throw new Error(`File not found: ${filePath}`);
  }

  const resp = await sdk.fetchProjects({ page: 0, pageSize: 1000 });
  let project = resp.projects.find(p => p.name === projectName);
  if (!project) {
    project = await sdk.createProject(projectName);
  }
  console.log('project', project);

  const name = path.basename(filePath);
  const sizeMb = (stat.size / 1000 / 1000).toFixed(1);
  console.log(`Uploading ${filePath} (${sizeMb} MB) ...`);

  const res = await sdk.uploadMedia({
    mediaPath: '',
    videoTag: name,
    increasedDetectionAccuracy: false,
    detectLicensePlates: false,
    detectFaces: true,
    projectId: project.projectId,
    file: {
      path: filePath,
      name,
      type:
        MIME_TYPES[path.extname(filePath).toLowerCase()] ??
        'application/octet-stream'
    }
  });
  console.log(res);

  // while the video is still processing, you can check the status
  let status = await sdk.fetchMediaStatus({ mediaId: res.mediaId });
  while (status.status !== 'detected' && status.status !== 'error') {
    console.log(`Video is still processing... ${status.status}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    status = await sdk.fetchMediaStatus({ mediaId: res.mediaId });
  }
  console.log(`${filePath} uploaded and processed: ${status.status}`);
};

main().catch(err => {
  console.error('Error uploading video:', err);
  process.exitCode = 1;
});
