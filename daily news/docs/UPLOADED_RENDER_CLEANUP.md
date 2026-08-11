# Uploaded render cleanup

`npm run cleanup:uploaded` is the fail-closed cleanup step for finished social
uploads. It removes local MP4s from the active render batch only when one
verified manifest proves all of the following:

- YouTube is `published` and every file has a live Shorts URL.
- Instagram is `published` and every file has a live Reel URL.
- The Instagram Reel is verified as portrait 9:16. A square `720x720` post
  never qualifies.
- The local MP4 is also 9:16, checked with `ffprobe` before it is moved.
- YouTube and Instagram contain the same file set.

## Normal workflow

1. Render a batch. The standalone builder writes its manifest to
   `renders/manifests/<batch>__standalone-manifest.json`; the MP4s remain in
   `renders/<batch>/`.
2. Upload one file at a time. After Instagram reports `Your reel has been
   shared.`, reopen the public Reel and verify the caption/source and live
   dimensions. Record those results in `upload-manifest.json`.
3. If Instagram required a crop correction, record the corrected public Reel
   URLs and portrait dimensions in `instagram-correction-manifest.json`.
4. Run a dry run:

   ```bash
   npm run cleanup:uploaded -- \
     --upload-manifest renders/manifests/2026-08-10-hook-test__upload-manifest.json \
     --instagram-correction-manifest renders/manifests/2026-08-10-hook-test__instagram-correction-manifest.json \
     --batch-root renders/2026-08-10-hook-test
   ```

5. Apply only after the dry-run list is correct:

   ```bash
   npm run cleanup:uploaded -- \
     --upload-manifest renders/manifests/2026-08-10-hook-test__upload-manifest.json \
     --instagram-correction-manifest renders/manifests/2026-08-10-hook-test__instagram-correction-manifest.json \
     --batch-root renders/2026-08-10-hook-test \
     --apply
   ```

The command moves eligible files to a dated `.quarantine/` folder and writes a
`cleanup-receipt.json`. It does not permanently delete media, and it leaves
the upload manifests and story history in place. A failed check stops the
batch before any file is moved.

## Manifest requirement for future uploads

Each `instagram.items[]` row must include `file`, `headline`, and the live Reel
`url`. It must also include either `dimensions: "720x1280"` or
`dimensions: "1080x1920"` plus `formatVerified: true` (or `crop: "9:16"`).
For a correction pass, use `correctedDimensions` and one matching
`correctedItems[]` row per headline, each with its corrected public Reel URL.

This cleanup command does not guess whether a browser upload succeeded. The
browser uploader or operator must write the verified manifest evidence first;
the command then enforces the deletion gate mechanically.
