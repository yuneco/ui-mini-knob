import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  const repoName =
    process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? ''
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'
  const basePath =
    isGitHubPages && repoName ? `/${repoName}/` : '/'

  return {
    base: basePath,
    plugins: [react()],
  }
})
