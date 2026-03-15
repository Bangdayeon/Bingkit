import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(import.meta.dirname);

const nativeWindConfig = withNativeWind(config, {
  input: './global.css',
  configPath: './tailwind.config.cjs',
});

nativeWindConfig.transformer = {
  ...nativeWindConfig.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};
nativeWindConfig.resolver = {
  ...nativeWindConfig.resolver,
  assetExts: nativeWindConfig.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...nativeWindConfig.resolver.sourceExts, 'svg'],
};

export default nativeWindConfig;
