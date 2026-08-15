import fs from "fs";
import path from "path";
import { PNG } from "pngjs";

const heroDir = "c:/xampp/htdocs/BCW/PhoneStore/frontend/phonestore-client/public/images/hero";
const files = [
    "iphone16-desert.png",
    "iphone16-natural.png",
    "iphone16-black.png",
    "iphone16-white.png"
];

function processImage(filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(heroDir, filename);
        if (!fs.existsSync(filePath)) return resolve();

        fs.createReadStream(filePath)
            .pipe(new PNG({ filterType: 4 }))
            .on("parsed", function () {
                const width = this.width;
                const height = this.height;

                // Visited array for flood fill from edges
                const visited = new Uint8Array(width * height);
                const queue = [];

                // Helper to check if pixel is background (near white/light grey)
                const isBg = (x, y) => {
                    const idx = (y * width + x) * 4;
                    const r = this.data[idx];
                    const g = this.data[idx + 1];
                    const b = this.data[idx + 2];
                    // Apple's studio background is typically r > 225, g > 225, b > 225
                    return r >= 225 && g >= 225 && b >= 225;
                };

                // Seed flood fill from all perimeter pixels
                for (let x = 0; x < width; x++) {
                    if (isBg(x, 0)) queue.push([x, 0]);
                    if (isBg(x, height - 1)) queue.push([x, height - 1]);
                }
                for (let y = 0; y < height; y++) {
                    if (isBg(0, y)) queue.push([0, y]);
                    if (isBg(width - 1, y)) queue.push([width - 1, y]);
                }

                // Process queue
                let head = 0;
                while (head < queue.length) {
                    const [cx, cy] = queue[head++];
                    const pIdx = cy * width + cx;
                    if (visited[pIdx]) continue;
                    visited[pIdx] = 1;

                    // Set pixel alpha to 0 (completely transparent)
                    const dataIdx = pIdx * 4;
                    this.data[dataIdx + 3] = 0;

                    // Neighbors
                    const neighbors = [
                        [cx + 1, cy],
                        [cx - 1, cy],
                        [cx, cy + 1],
                        [cx, cy - 1]
                    ];

                    for (const [nx, ny] of neighbors) {
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const nIdx = ny * width + nx;
                            if (!visited[nIdx] && isBg(nx, ny)) {
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }

                // Crop bounding box of remaining non-transparent pixels
                let minX = width, maxX = 0, minY = height, maxY = 0;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const idx = (y * width + x) * 4;
                        if (this.data[idx + 3] > 0) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                console.log(`Processed ${filename}: Phone bounds [${minX}, ${minY}] to [${maxX}, ${maxY}]`);

                // Write back
                const outStream = fs.createWriteStream(filePath);
                this.pack().pipe(outStream);
                outStream.on("finish", () => {
                    console.log(`Saved transparent ${filename}`);
                    resolve();
                });
            })
            .on("error", reject);
    });
}

async function run() {
    for (const f of files) {
        await processImage(f);
    }
    console.log("ALL HERO IMAGES ARE NOW 100% BACKGROUND-FREE & TRANSPARENT!");
}

run();
