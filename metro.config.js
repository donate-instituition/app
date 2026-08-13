const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, 'src'),
};

// Allow Metro to follow the `exports` field in package.json.
// Required for packages like @tanstack/react-query v5 that ship both
// ESM (uses import.meta) and CJS builds — without this Metro picks the
// ESM build and Hermes throws "Cannot use 'import.meta' outside a module".
config.resolver.unstable_enablePackageExports = true;

// Ensure Metro always resolves the `require` (CJS) condition before `import` (ESM).
// Without this, the web bundler falls through to the `import` condition and picks
// the ESM build of @tanstack/react-query, which crashes with import.meta on web.
config.resolver.unstable_conditionNames = ['require', 'react-native', 'browser', 'default'];

module.exports = config;
