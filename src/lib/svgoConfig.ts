import type { Config } from 'svgo';

/**
 * Default SVGO configuration for the IkoniK pipeline.
 * Optimises SVG output while preserving viewBox and dimensions.
 */
export const svgoConfig: Config = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
    'removeXMLNS',
    'collapseGroups',
    'mergePaths',
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-name'],
      },
    },
  ],
};
