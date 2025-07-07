// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

// Configuración específica para SVG Transformer
const svgConfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // O false según tu configuración general
      },
    }),
  },
  resolver: {
    assetExts: getDefaultConfig(__dirname).resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...getDefaultConfig(__dirname).resolver.sourceExts, 'svg'],
  },
};

// Obtiene la configuración por defecto y la fusiona con la de SVG
const defaultConfig = getDefaultConfig(__dirname);
const finalConfig = mergeConfig(defaultConfig, svgConfig);

module.exports = finalConfig;