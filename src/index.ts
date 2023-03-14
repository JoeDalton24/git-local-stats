#!/usr/bin/env node
import figlet from "figlet";
import yargs from "yargs";
import {
  scanDir,
  getLastYear,
  getAllCommits,
  formatCommits,
  printGraph,
  mergeSort,
} from "./utils";

console.log(figlet.textSync("Git Local Stats"));

const argv = yargs(process.argv.slice(2))
  .options({
    path: {
      type: "string",
      describe: "path of the folder that that content your repos",
      demandOption: true,
    },
    author: {
      type: "string",
      describe: "contributor name",
      demandOption: true,
    },
  })
  .scriptName("git-local-stats")
  .usage("$0 --path <folder_path> --author <contributor_name>")
  .help()
  .parseSync();

const { path, author } = argv;

if (!path || !author) {
  throw new Error();
}

const main = (): void => {
  const respositories = scanDir([], path);
  const lastYear = getLastYear();
  const allCommits = getAllCommits(respositories, lastYear, author);
  const commits = formatCommits(allCommits);

  printGraph(mergeSort(commits), "DARK");
};

main();
