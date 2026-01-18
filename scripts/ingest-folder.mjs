import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const BASE_URL = 'http://localhost:3000/api';

async function ingestFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    let text = '';

    console.log(`Processing: ${filePath}`);

    try {
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else if (ext === '.txt' || ext === '.md') {
            text = fs.readFileSync(filePath, 'utf-8');
        } else {
            console.log(`[SKIP] Unsupported file type: ${ext}`);
            return;
        }

        // Clean text slightly
        text = text.replace(/\s+/g, ' ').trim();

        if (text.length < 50) {
            console.log(`[SKIP] Content too short.`);
            return;
        }

        const res = await fetch(`${BASE_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                metadata: {
                    source: path.basename(filePath),
                    title: path.basename(filePath, ext),
                    filePath: filePath
                }
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log(`[SUCCESS] Indexed ${data.chunks} chunks.`);
        } else {
            console.log(`[FAIL] ${data.error}`);
        }

    } catch (e) {
        console.error(`[ERROR] Failed to process ${filePath}:`, e.message);
    }
}

async function processFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.error(`Error: Folder not found: ${folderPath}`);
        process.exit(1);
    }

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await processFolder(fullPath); // Recursive
        } else {
            await ingestFile(fullPath);
        }
    }
}

const targetFolder = process.argv[2];
if (!targetFolder) {
    console.log("Usage: node scripts/ingest-folder.mjs <path-to-folder>");
    process.exit(1);
}

console.log(`Starting ingestion from: ${targetFolder}`);
processFolder(targetFolder);
