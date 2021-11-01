// Based on https://docs.influxdata.com/influxdb/v2.0/api-guide/client-libraries/nodejs/write/

import {
    InfluxDB,
    Point
} from "@influxdata/influxdb-client"

import fetch from "node-fetch";

import fs from "fs/promises";

console.log("Reading config...");

const config = JSON.parse(await fs.readFile("./config.json", "utf8"));

console.log("Connecting to InfluxDB...");

const influxDB = new InfluxDB({
    url: config.influxdb.url,
    token: config.influxdb.token
});

// "s": precision = seconds
const writeApi = influxDB.getWriteApi(config.influxdb.org, config.influxdb.bucket, "s");

writeApi.useDefaultTags(config.influxdb.default_tags);

console.log("Fetching releases...");

function createPoint(date, repoName, tagName, assetName, downloadCount) {
    console.log(
        `repo: ${repoName}\t` +
        `tag: ${tagName}\t` +
        `asset: ${assetName}\t` +
        `value: ${downloadCount}`
    );

    const point = new Point("downloads")
        .timestamp(date / 1000)
        .tag("repo", repoName)
        .tag("tag", tagName)
        .tag("asset", assetName)
        .uintField("value", downloadCount);

    writeApi.writePoint(point);
}

async function processReleases(repoName, includeSum = false) {
    const releases = await (await fetch(`https://api.github.com/repos/${repoName}/releases`)).json();
    const fetchedDate = Date.now();
    let repoSum = 0;
    releases.forEach(release => {
        const tagName = release.tag_name;
        release.assets.forEach(asset => {
            const assetName = asset.name;
            const downloadCount = asset.download_count;
            repoSum += downloadCount;

            createPoint(fetchedDate, repoName, tagName, assetName, downloadCount);
        });
    });

    if (includeSum) {
        createPoint(fetchedDate, repoName, "all", "all", repoSum);
    }
}

for (const repo of config.repos) {
    await processReleases(repo.name, repo.includeSum)
}

console.log("Done!");

process.stdout.write("Flushing and closing connection...");

await writeApi.close();

console.log("Done");