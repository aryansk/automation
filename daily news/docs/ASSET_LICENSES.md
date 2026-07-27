# Asset licenses and provenance

All render-critical assets are local. The composition performs no network
requests during preview or rendering.

## Earth textures

- Files: `assets/textures/earth-day.jpg`, `earth-clouds.jpg`,
  `earth-normal.png`, `earth-specular.png`
- Creator: Solar System Scope / INOVE
- Source: https://www.solarsystemscope.com/textures/
- License: Creative Commons Attribution 4.0 International
- License URL: https://creativecommons.org/licenses/by/4.0/
- Accessed: 25 July 2026
- Changes: the supplied 2K normal and specular TIFF files were converted to PNG
  for browser compatibility; the image content was not otherwise altered.
- Attribution: “Planetary textures by Solar System Scope, CC BY 4.0; based on
  NASA imagery and elevation data.”

## Country geometry

- Package: `world-atlas`
- Source data: Natural Earth
- Resolution used: 110m countries
- Natural Earth terms: public domain
- Package URL: https://www.npmjs.com/package/world-atlas

## City data

- Source: GeoNames `cities15000`
- License: Creative Commons Attribution 4.0
- URL: https://www.geonames.org/

## Fonts

- League Gothic and IBM Plex Mono
- Source: Google Fonts
- License: SIL Open Font License 1.1
- Local license copies:
  `assets/fonts/League-Gothic-OFL.txt` and
  `assets/fonts/IBM-Plex-Mono-OFL.txt`

## JavaScript runtimes

- Three.js: MIT License
- D3: ISC License
- GSAP: used under GreenSock's standard no-charge license terms for this local
  project. Review the GreenSock license before redistributing the renderer as a
  paid template or hosted component library.
