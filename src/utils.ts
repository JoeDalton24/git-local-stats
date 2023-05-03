import { readdirSync, existsSync } from "fs";
import path from "path";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import gitlog, { CommitField, GitlogOptions } from "gitlog";

import CliGhCal from "cli-gh-cal";

dayjs.extend(isSameOrBefore);

export function scanDir(
  folders: Array<string>,
  mainPath: string
): Array<string> {
  const files = readdirSync(mainPath, { withFileTypes: true });
  for (let file of files) {
    if (file.isDirectory()) {
      if (file.name === "node_modules" || file.name === "vendor") continue;

      const filePath = `${mainPath}/${file.name}`;
      const isGitFolder = existsSync(path.join(filePath, ".git"));

      if (isGitFolder) {
        console.log(`${filePath} ====> ✅`);
        folders.push(filePath);
      }

      folders = scanDir(folders, filePath);
    }
  }

  return folders;
}

export function getLastYear(): string {
  return dayjs().subtract(1, "year").toString();
}

interface Calendar {
  [key: string]: number;
}

export function getDayOfYear(): Calendar {
  let date = dayjs().subtract(1, "year");
  const days: Calendar = {};
  while (date.isSameOrBefore(dayjs())) {
    const newDate = date.format("MM/DD/YYYY");
    days[newDate] = 0;
    date = date.add(1, "day");
  }
  return days;
}

export function getAllCommits(
  respositories: Array<string>,
  lastYear: string,
  author: string,
  numberCommit?: number
): Calendar {
  let commits: Array<CommitField> = [];

  for (let repo of respositories) {
    const option: GitlogOptions = {
      repo: repo,
      all: true,
      fields: ["authorDate"],
      author: author,
      number: numberCommit ?? 1000,
      since: lastYear,
    };

    //@ts-ignore
    commits = [...commits, ...gitlog(option)];
  }

  const commitsObjects: { [key: string]: number } = {};

  commits.forEach((commit) => {
    //@ts-ignore
    const { authorDate } = commit;
    const key = dayjs(authorDate).format("MM/DD/YYYY");

    if (commitsObjects[key]) {
      commitsObjects[key] += 1;
    } else {
      commitsObjects[key] = 1;
    }
  });

  return commitsObjects;
}

type CliGhCalData = [[string | Dayjs, number]];
export function formatCommits(commits: Calendar): CliGhCalData {
  //@ts-ignore
  let formatedData: CliGhCalData = [];

  for (const [key, value] of Object.entries(commits)) {
    formatedData.push([key, value]);
  }

  return formatedData;
}

export function printGraph(
  commits: CliGhCalData,
  theme?: "LIGHT" | "DARK",
  start?: Date,
  end?: Date
): void {
  console.log(
    CliGhCal(commits, {
      theme: theme ?? "LIGHT",
      start: start ?? dayjs().subtract(1, "year"),
      end: end ?? dayjs(),
    })
  );
}

function merge(arr1: CliGhCalData, arr2: CliGhCalData): CliGhCalData {
  //@ts-ignore
  let results: GhCal = [];

  let i = 0;
  let j = 0;

  while (i < arr1.length && j < arr2.length) {
    if (dayjs(arr1[i][0]).isSameOrBefore(dayjs(arr2[j][0]))) {
      results.push(arr1[i]);
      i++;
    } else {
      results.push(arr2[j]);
      j++;
    }
  }

  while (i < arr1.length) {
    results.push(arr1[i]);
    i++;
  }
  while (j < arr2.length) {
    results.push(arr2[j]);
    j++;
  }

  return results;
}

export function mergeSort(arr: CliGhCalData): CliGhCalData {
  if (arr.length <= 1) {
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  //@ts-ignore
  return merge(mergeSort(left), mergeSort(right));
}
