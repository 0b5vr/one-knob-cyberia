import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { workletMinifierPlugin } from './plugins/vite-worklet-minifier-plugin';
import { terserMinifyOptions } from './terserMinifyOptions';
import Inspect from 'vite-plugin-inspect';
import { shaderMinifierPlugin } from './plugins/vite-shader-minifier-plugin';
import { htmlMinifierPlugin } from './plugins/vite-html-minifier-plugin';
import { lainDancePlugin } from './plugins/vite-lain-dance-plugin';

export default defineConfig( ( { mode } ) => {
  return {
    resolve: {
      alias: {
        ...( mode === 'prod' ? {
          'webgl-memory': `${ __dirname }/src/dummy.ts`, // don't want to import webgl-memory when it's prod build
        } : {} ),
      },
    },
    build: {
      target: 'esnext',
      minify: mode === 'prod' ? 'terser' : false,
      terserOptions: mode === 'prod' ? terserMinifyOptions : undefined,
      sourcemap: true,
      polyfillModulePreload: false, // size
      rollupOptions: {
        plugins: [
          visualizer( {
            json: true,
            gzipSize: true,
            brotliSize: true,
          } ),
        ],
      }
    },
    plugins: [
      Inspect(),
      lainDancePlugin(),
      htmlMinifierPlugin( {
        minify: true, // mode === 'prod',
      } ),
      shaderMinifierPlugin( {
        minify: true, // mode === 'prod',
        minifierOptions: {
          preserveExternals: true,
        },
      } ),
      workletMinifierPlugin( {
        minify: mode === 'prod',
        minifyOptions: terserMinifyOptions,
      } ),
    ]
  };
} );
