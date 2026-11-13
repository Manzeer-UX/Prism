/** Same aliases as remotion.config.ts, for scripts that bundle programmatically */
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export default (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      '@site': path.resolve(root, '..', 'src'),
      react: path.resolve(root, 'node_modules', 'react'),
      'react-dom': path.resolve(root, 'node_modules', 'react-dom'),
    },
  },
})
