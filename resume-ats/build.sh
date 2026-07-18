#!/bin/bash
# Compile a resume .tex to PDF, matching Overleaf behaviour, and ENFORCE one page.
# Usage: ./build.sh [source.tex]   (defaults to resume.tex)
#
# Note: this resume class opens a bulleted list in every rSubsection, so the
# Education entry (which has no \item) throws a harmless "missing \item" that
# Overleaf's latexmk silently ignores. We run Tectonic with continue-on-errors
# to mirror that, but we FAIL on any error other than that one known-benign case.
set -e
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")"

SRC="${1:-resume.tex}"
BASE="$(basename "${SRC%.tex}")"

tectonic "$SRC" --outdir out -Z continue-on-errors --keep-logs >/dev/null 2>&1 || true

LOG="out/$BASE.log"
# Any '! ...' error that isn't the benign empty-list one is a real failure.
UNEXPECTED=$(grep -E "^! " "$LOG" 2>/dev/null | grep -v "perhaps a missing .item" || true)
if [ -n "$UNEXPECTED" ]; then
  echo "❌ Real LaTeX error(s) in $BASE:"; echo "$UNEXPECTED"; exit 1
fi

if [ ! -f "out/$BASE.pdf" ]; then echo "❌ No PDF produced for $BASE."; exit 1; fi

PAGES=$(pdfinfo "out/$BASE.pdf" | awk '/Pages/{print $2}')
if [ "$PAGES" != "1" ]; then
  echo "⚠️  $BASE.pdf is $PAGES pages — MUST be 1. Tighten content and rebuild."
  exit 2
fi

# Refresh preview image.
pdftoppm -png -r 130 -singlefile "out/$BASE.pdf" "out/${BASE}_preview" 2>/dev/null || true
echo "✅ out/$BASE.pdf — 1 page, no real errors."
