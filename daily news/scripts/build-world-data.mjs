import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const atlasPath = path.join(projectDir, "node_modules/world-atlas/countries-110m.json");
const countriesPath = path.join(projectDir, "node_modules/world-countries/countries.json");
const outputPath = path.join(projectDir, "assets/data/world-data.js");

const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
const countryRecords = JSON.parse(fs.readFileSync(countriesPath, "utf8"));
const byNumeric = new Map(countryRecords.map((country) => [country.ccn3, country]));
const collection = feature(atlas, atlas.objects.countries);

const features = collection.features.map((item) => {
  const numeric = String(item.id).padStart(3, "0");
  const record = byNumeric.get(numeric);
  return {
    type: "Feature",
    id: numeric,
    properties: {
      code: record?.cca2 || "",
      name: record?.name?.common || item.properties?.name || "",
      atlasName: item.properties?.name || "",
      latlng: record?.latlng || null,
    },
    geometry: item.geometry,
  };
});

const payload = JSON.stringify({ type: "FeatureCollection", features });
fs.writeFileSync(outputPath, `window.DAILY_NEWS_GEO=${payload};\n`);
console.log(`Wrote ${features.length} countries to ${path.relative(projectDir, outputPath)}`);
