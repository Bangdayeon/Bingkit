/** @type {import('@svgr/core').Config} */
module.exports = {
  native: true,
  plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
  replaceAttrValues: {
    '#181C1C': 'currentColor',
    '#181c1c': 'currentColor',
    '#4C5252': 'currentColor',
    '#4c5252': 'currentColor',
  },
  template: (variables, { tpl }) => tpl`
    /** @jsxRuntime classic */
    /** @jsx React.createElement */
    ${variables.imports};
    ${variables.interfaces};
    function ${variables.componentName}(props) {
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
