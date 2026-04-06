const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// TanStack Query v5 utiliza ESM por padrão e inclui extensões .js em seus imports.
// Versões recentes do Metro precisam dessa configuração para resolver pacotes ESM corretamente.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
