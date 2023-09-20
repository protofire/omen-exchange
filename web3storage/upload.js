import { Web3Storage, getFilesFromPath } from 'web3.storage';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const buildDir = path.join(process.cwd(), 'build');

  // Check if directory exists
  try {
    await fs.stat(buildDir);
  } catch (err) {
    console.error(`The directory "${buildDir}" does not exist.`);
    return;
  }

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFCMDUzMzY2ZTEzMEFkN2YxYjdiODlCRmE0NjgxM2I5RjExODYxZGEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODc2OTA5NzExNjcsIm5hbWUiOiJ2aW9sZXQifQ.ez7SHMCTSR0DVm_3LjF-XAB0D4HwPdPKRuYR8Wec4eQ";
  if (!token) {
    return console.error('A token is needed. You can create one on https://web3.storage');
  }

  const storage = new Web3Storage({ token });

  const dirContents = await fs.readdir(buildDir);
  const files = [];

  for (const item of dirContents) {
    const itemPath = path.join(buildDir, item);
    const pathFiles = await getFilesFromPath(itemPath);
    files.push(...pathFiles);
  }

  console.log(`Uploading ${files.length} files`);
  const cid = await storage.put(files);
  console.log('Content added with CID:', cid);
}

main().catch(error => {
  console.error('Error occurred:', error);
});