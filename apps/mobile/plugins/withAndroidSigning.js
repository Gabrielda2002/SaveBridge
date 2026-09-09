const { withAppBuildGradle } = require('@expo/config-plugins');

const RELEASE_SIGNING_CONFIG = `    signingConfigs {
        savebridgeRelease {
            if (project.hasProperty('SAVEBRIDGE_STORE_FILE')) {
                storeFile file(SAVEBRIDGE_STORE_FILE)
                storePassword SAVEBRIDGE_STORE_PASSWORD
                keyAlias SAVEBRIDGE_KEY_ALIAS
                keyPassword SAVEBRIDGE_KEY_PASSWORD
            }
        }
        debug {`;

const TEMPLATE_RELEASE_SIGNING = `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

const CONDITIONAL_RELEASE_SIGNING = `            signingConfig = project.hasProperty('SAVEBRIDGE_STORE_FILE') ? signingConfigs.savebridgeRelease : signingConfigs.debug`;

module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;

    if (contents.includes('savebridgeRelease')) {
      return cfg;
    }

    if (!contents.includes('    signingConfigs {\n        debug {')) {
      throw new Error('withAndroidSigning: signingConfigs block not found; Expo template changed?');
    }
    contents = contents.replace('    signingConfigs {\n        debug {', RELEASE_SIGNING_CONFIG);

    if (!contents.includes(TEMPLATE_RELEASE_SIGNING)) {
      throw new Error('withAndroidSigning: release signing block not found; Expo template changed?');
    }
    contents = contents.replace(TEMPLATE_RELEASE_SIGNING, CONDITIONAL_RELEASE_SIGNING);

    cfg.modResults.contents = contents;
    return cfg;
  });
};
