#!/usr/bin/env node
import { readdirSync, statSync } from "fs";
import path from "path";

function walkDir(dir: string, callback: (path: string) => void): void {
  readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// console.log("args", process.argv);
const maintPath = process.argv[3];

walkDir(maintPath, function (folderPath) {});
