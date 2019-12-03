import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'stencil-tests',
  srcDir: 'stencil-tests',
  tsconfig: 'tsconfig.stencil.json',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
};
