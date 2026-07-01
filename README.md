# interactive-3d-model

A tiny, dependency-free web viewer for interactive 3D geometric models. It renders
a [glTF](https://www.khronos.org/gltf/) model in the browser with [Three.js](https://threejs.org/)
and builds a show/hide toggle for each named part. Everything is static — no build
step, no server — so it hosts for free on **GitHub Pages**.

The viewer is **model-agnostic**: which model is shown, and how its parts are named,
textured and colored, is read from [`Config.yml`](./Config.yml) at runtime. Swapping in
your own model means editing that one file and dropping your assets into `resources/` —
you don't touch the code.

## The idea

This repo holds the **shared viewer code**. Each person (e.g. a student) **forks** it and
puts **their own model and configuration on their fork**, which they host on their own
GitHub Pages. Improvements to the *viewer itself* can flow back to this repo as pull
requests, while the (potentially large) model data stays on each fork.

```
                 this repo  (viewer code + a sample model)
                /         \
   fork: alice/...      fork: bob/...
   own model + Config    own model + Config
   own GitHub Pages      own GitHub Pages
        \                     /
         \___ PRs (code only) ___> back to this repo
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the "data stays on your fork, code goes
upstream" workflow.

## Quick start (use it with your own model)

1. **Fork** this repository to your GitHub account.
2. In your fork: **Settings → Pages → Build and deployment → Deploy from a branch →
   `main` / `root`**. After a minute your site is live at
   `https://<your-username>.github.io/interactive-3d-model/`.
3. Add your model files under `resources/` (see below).
4. Point [`Config.yml`](./Config.yml) at your model and list its parts.
5. Commit and push — Pages redeploys automatically.

Each fork's Pages is fully independent; the owner of this repo does not need to do
anything for your fork to go live.

## Configuring a model

`Config.yml` describes a single model:

```yaml
- name: MyModel
  path: ./resources/MyModel/model.gltf   # relative path to the glTF file
  Parts:
    part1:
      name: MeshNameInsideTheGltf         # must match the mesh/node name in the model
      texture: ./resources/textures/some.jpg   # optional
      color: { r: 0, g: 80, b: 50 }             # optional, 0–255
```

- `name` under each part **must match a mesh/node name inside your glTF**. Parts whose
  names aren't found are silently skipped.
- `texture` and `color` are both optional. If the mesh ships without normals, the viewer
  recomputes smooth-shading normals in-browser.
- Only the **first** model in the list is loaded.

## Asset guidance

Plain GitHub Pages serves committed files directly, with two hard limits worth knowing:

- **No single file may exceed 100 MB** (a git limit), and **Pages does not serve Git LFS
  files**. Keep each file comfortably under 100 MB.
- Keep the whole repo well under the ~1 GB soft limit.

For a typical model (target ~50 MB) this is no problem. To keep size down, export glTF
with an external `.bin`, and consider Draco / meshopt compression. If you ever need a
model larger than 100 MB, host that asset outside the repo (e.g. a GitHub Release or a
CDN) and put its URL in `Config.yml` instead of a local path.

## Local preview

Because the viewer uses `fetch()` and ES modules, open it through a local web server
rather than a `file://` URL:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | Landing page with the entry button |
| `3d.html` | Hosts the viewer |
| `main.js` | Three.js viewer; reads `Config.yml`, loads the model, builds part toggles |
| `Config.yml` | The one file you edit to swap models |
| `resources/` | Models and textures |
