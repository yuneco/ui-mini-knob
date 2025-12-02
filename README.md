# mini-knob

Interactive knob/slider playground built with React, TypeScript, and Vite.

## Development

```bash
pnpm install
pnpm dev
```

## Deployment (GitHub Pages)

Pushing to `main` triggers `.github/workflows/deploy.yml`:

1. Installs dependencies with `pnpm`.
2. Builds the app via `pnpm run build`.
3. Uploads the `dist` folder and deploys it using `actions/deploy-pages`.

The Vite config automatically sets the correct base path during GitHub Actions
builds, so assets resolve under `https://<user>.github.io/ui-mini-knob/`.
