const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Firebase / Google Sign-In pods (AppCheckCore, GoogleUtilities) need modular
 * headers when linked as static libraries. EAS regenerates ios/ on each build,
 * so this must be applied via a config plugin rather than editing Podfile locally.
 */
function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (!contents.includes('use_modular_headers!')) {
        contents = contents.replace(
          /use_expo_modules!\n/,
          'use_expo_modules!\n  use_modular_headers!\n'
        );
        fs.writeFileSync(podfilePath, contents);
      }

      return config;
    },
  ]);
}

module.exports = withModularHeaders;
