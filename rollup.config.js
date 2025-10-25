import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/client-new/app.ts',
  output: {
    file: 'dist/client-new/app-new.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript()
  ]
};