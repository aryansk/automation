# LaTeX Editor

A self-contained, browser-based LaTeX editor with live PDF output. Documents are
compiled **entirely in your browser** using a WebAssembly build of pdfTeX
([SwiftLaTeX](https://www.swiftlatex.com/)) — no LaTeX install needed.

## Run it

```bash
./start.command          # or: python3 -m http.server 8777
```

Then open <http://localhost:8777>. (Double-clicking `start.command` in Finder works too.)

> It **must** be served over `http://`, not opened as a `file://` URL — the
> compiler runs in a Web Worker + WASM, which browsers block on `file://`.

## Usage

- Edit `main.tex` on the left, hit **Compile** (or `⌘/Ctrl + Enter`).
- The rendered PDF appears on the right; **↓ PDF** downloads it.
- Compiler output/errors show under **Log**.
- Your source is auto-saved to the browser's `localStorage`.

## How it works / offline note

- `engine/` holds the pdfTeX WASM engine and its worker.
- On first use of a package, the engine downloads it on demand from
  `texlive2.swiftlatex.com` and caches it in the browser (IndexedDB). So the
  **first** compile touching a new package needs internet; afterwards it's cached
  and works offline.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole editor UI + compile logic |
| `engine/PdfTeXEngine.js` | JS wrapper around the WASM engine |
| `engine/swiftlatexpdftex.js` | Web Worker (Emscripten runtime) |
| `engine/swiftlatexpdftex.wasm` | The pdfTeX engine (~1.7 MB) |
| `start.command` | Convenience launcher (static server + opens browser) |
