import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const defaultSourcePath = path.join(projectDir, "scripts/data/major-cities.tsv");
const outputPath = path.join(projectDir, "assets/data/city-data.js");

const sourceFlag = process.argv.indexOf("--source");
const writeSourceFlag = process.argv.indexOf("--write-source");
const sourcePath =
  sourceFlag >= 0 ? path.resolve(process.argv[sourceFlag + 1]) : defaultSourcePath;
const compactSourcePath =
  writeSourceFlag >= 0 ? path.resolve(process.argv[writeSourceFlag + 1]) : null;

const lines = fs.readFileSync(sourcePath, "utf8").split(/\r?\n/).filter(Boolean);
const cities = [];

for (const line of lines) {
  const fields = line.split("\t");
  const isGeoNamesDump = fields.length >= 19;
  const record = isGeoNamesDump
    ? {
        id: fields[0],
        name: fields[1],
        ascii: fields[2],
        lat: Number(fields[4]),
        lon: Number(fields[5]),
        featureCode: fields[7],
        countryCode: fields[8],
        population: Number(fields[14]) || 0,
      }
    : {
        id: fields[0],
        name: fields[1],
        ascii: fields[2],
        lat: Number(fields[3]),
        lon: Number(fields[4]),
        countryCode: fields[5],
        featureCode: fields[6],
        population: Number(fields[7]) || 0,
      };

  const isCapitalOrAdminSeat = /^PPLC$|^PPLA$|^PPLA2$/.test(record.featureCode);
  if (!isGeoNamesDump || record.population >= 50000 || isCapitalOrAdminSeat) {
    cities.push(record);
  }
}

cities.sort((a, b) => b.population - a.population || a.name.localeCompare(b.name));

if (compactSourcePath) {
  const compactTsv = cities
    .map((city) =>
      [
        city.id,
        city.name,
        city.ascii,
        city.lat,
        city.lon,
        city.countryCode,
        city.featureCode,
        city.population,
      ].join("\t"),
    )
    .join("\n");
  fs.writeFileSync(compactSourcePath, `${compactTsv}\n`);
}

const payload = cities.map((city) => [
  city.name,
  city.ascii,
  city.countryCode,
  city.lat,
  city.lon,
  city.population,
  city.featureCode,
]);

fs.writeFileSync(
  outputPath,
  `window.DAILY_NEWS_CITIES=${JSON.stringify(payload)};\n` +
    `window.DAILY_NEWS_CITIES_META=${JSON.stringify({
      count: payload.length,
      source: "GeoNames cities15000",
      license: "CC BY 4.0",
      url: "https://www.geonames.org/",
    })};\n`,
);

console.log(`Wrote ${payload.length} major cities to ${path.relative(projectDir, outputPath)}`);
