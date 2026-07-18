#!/bin/bash
# Double-click this file (or run it) to launch the LaTeX editor.
# The editor must be served over http:// because it uses a Web Worker + WebAssembly.
cd "$(dirname "$0")"
PORT=8777
echo "LaTeX Editor → http://localhost:$PORT"
( sleep 1; open "http://localhost:$PORT" ) &
python3 -m http.server "$PORT"
