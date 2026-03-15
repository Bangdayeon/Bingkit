/** @type {import('@svgr/core').Config} */
module.exports = {
  native: true,
  plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
  template: (variables, { tpl }) => tpl`
    /** @jsxRuntime classic */
    /** @jsx React.createElement */
    ${variables.imports};
    ${variables.interfaces};
    function ${variables.componentName}(${variables.props}) {
      return ${variables.jsx};
    }
    ${variables.exports};
  `,
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            inlineStyles: { onlyMatchedOnce: false },
            removeViewBox: false,
            removeUnknownsAndDefaults: false,
            convertColors: false,
          },
        },
      },
      { name: 'removeAttrs', params: { attrs: 'xmlns' } },
    ],
  },
};
