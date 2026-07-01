# Contributing

There are two kinds of change, and they are handled differently.

## 1. Your own model and configuration → stays on your fork

Your model files and your `Config.yml` are **your fork's data**. They live on your fork's
`main` branch (Pages can only serve committed files) and are **not** sent back to this
repo. Just commit them to your fork and push — that's the whole workflow, and your Pages
site redeploys automatically.

- Put your model under `resources/models/<your-name>/` (create it) to keep it tidy.
- Edit `Config.yml` on your fork to point at it.

Please **don't** open a pull request that adds your model or your `Config.yml` to this
repo — that data belongs on your fork only.

## 2. Improvements to the viewer itself → pull request to this repo

Bug fixes and new features in the shared code (`main.js`, the HTML, docs) are very
welcome. To keep your model data out of the PR, contribute from a **clean branch based on
this repo's `main`**, touching only code:

```bash
# one-time: point "upstream" at this repo
git remote add upstream https://github.com/maxiludwig/interactive-3d-model.git

# for each feature:
git fetch upstream
git checkout -b my-feature upstream/main   # clean base — no fork data on it
# ...edit main.js / HTML / docs only...
git commit -m "Describe the change"
git push origin my-feature
# then open a PR from my-feature to upstream/main on GitHub
```

Because `my-feature` is branched off `upstream/main`, it contains none of your model data
— only your code change. Please check the PR diff and confirm it touches **no files under
`resources/models/` and not your `Config.yml`** before opening it.

## Checklist for a code PR

- [ ] Branch is based on `upstream/main`, not your data-carrying `main`.
- [ ] Diff contains only code/docs — no model files, no personal `Config.yml`.
- [ ] The sample model still loads (open `index.html` via a local server).
