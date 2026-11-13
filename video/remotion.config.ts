import { Config } from '@remotion/cli/config'
import path from 'node:path'

const here = process.cwd()

Config.setVideoImageFormat('jpeg')
Config.setJpegQuality(95)
Config.setOverwriteOutput(true)
// GPU-backed WebGL for the 3D prism and network
Config.setChromiumOpenGlRenderer('angle')
Config.setConcurrency(3)
Config.setPixelFormat('yuv420p')
Config.setCodec('h264')
Config.setCrf(16)

Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      // The film reuses the website's own content and logo files directly
      '@site': path.resolve(here, '..', 'src'),
      // …but always with this module's single copy of React
      react: path.resolve(here, 'node_modules', 'react'),
      'react-dom': path.resolve(here, 'node_modules', 'react-dom'),
    },
  },
}))
