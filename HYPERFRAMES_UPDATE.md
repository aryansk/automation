# HyperFrames update process

The local upstream checkout is:

`/Users/aryansingh/Downloads/Projects/hyperframes-upstream`

It tracks `https://github.com/heygen-com/hyperframes` on `main`. The checkout
uses a partial clone, and large Git LFS assets remain pointers until Git LFS is
installed; source history and ordinary files are available for comparisons.

From the Automation directory:

```bash
# Report upstream and npm updates without changing project pins.
node scripts/update-hyperframes.mjs --check

# Fetch upstream, fast-forward the local clone when clean, update both news
# projects to the latest released CLI, validate them, and refresh installed
# HyperFrames skills.
node scripts/update-hyperframes.mjs
```

The updater restores a project's previous `package.json` pin if the post-update
`npm run check` fails, then continues on that known pin. Add `--strict` when a
failed upgrade should make the command exit non-zero. It never publishes or
uploads a video. The news projects also run the guarded CLI update before `npm run render`; use
`npm run check:hyperframes-update` for a read-only project-specific probe.
