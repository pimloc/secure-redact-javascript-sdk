'use strict';

import { SecureRedactSDK } from '../dist/SecureRedactSDK.js';
import fs from 'fs';
import path from 'path';

/*
  A demo script to upload videos to SecureRedact using node.js
*/
const clientId = 'place your client id here';
const clientSecret = 'place your client secret here';
const url = 'https://app.secureredact.co.uk';
const rootFolder = 'put the folder you want to upload here';
const projectName = 'put the name of your project here';
const sdk = new SecureRedactSDK({ clientId, clientSecret, url });

const videos = [];
const crawlFolder = async folderPath => {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, async (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        reject(err);
        return;
      }

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          await crawlFolder(filePath); // Recursively crawl subfolders
        } else if (file.endsWith('.mp4')) {
          videos.push(filePath);
        }
      }

      resolve();
    });
  });
};

const main = async () => {
  await crawlFolder(rootFolder);

  const resp = await sdk.fetchProjects({ page: 0, pageSize: 1000 });
  let project = resp.projects.find(p => p.name === projectName);
  if (!project) {
    project = sdk.createProject({ name: projectName });
  }
  console.log('project', project);
  const upload = async videoPath => {
    try {
      const res = await sdk.uploadMedia({
        mediaPath: '',
        videoTag: path.basename(videoPath),
        increasedDetectionAccuracy: false,
        detectLicensePlates: false,
        detectFaces: true,
        projectId: project.projectId,
        file: {
          path: videoPath,
          name: path.basename(videoPath),
          type: 'video/mp4'
        }
      });
      console.log(res);

      // while the video is still processing, you can check the status
      let status = await sdk.fetchMediaStatus({
        mediaId: res.mediaId
      });
      while (status.status !== 'detected') {
        console.log(`Video is still processing... ${status.status}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await sdk.fetchMediaStatus({
          mediaId: res.mediaId
        });
      }
      console.log(`${videoPath} uploaded and processed.`);
    } catch (err) {
      console.error('Error uploading video:', err);
    }
  };

  for (const file of videos) {
    console.log(`Uploading ${file} ...`);
    await upload(file);
  }
};

main();
