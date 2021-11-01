# GitHub Releases to InfluxDB

Track the download count of your GitHub releases with [InfluxDB 2.0](https://www.influxdata.com/products/influxdb/)

## Usage

1. Copy `config.example.json` to `config.json`.
2. Fill in your settings
    - `default_tags` are tags that are applied to every point that is written.
    - Setting `includeSum` to true will create an additional point with the tags `tag` and `asset` set to `all` and containing the combined download count of all the repository's releases.
3. Execute `npm install` to install the dependencies.
4. Run the script with `node index.js`.
5. Optionally use [cron](https://en.wikipedia.org/wiki/Cron) or similar to run periodically.

## Usage (with [Docker](https://www.docker.com/))

1. Build the container with `docker build -t "YOUR TAG NAME HERE" .`
2. Run the container with `docker run "YOUR TAG NAME HERE"`
3. Optionally use [cron](https://en.wikipedia.org/wiki/Cron) or similar to run periodically.
