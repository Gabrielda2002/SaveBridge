const { withAndroidManifest } = require('@expo/config-plugins');

// Android 9+ blocks cleartext (plain HTTP) traffic by default. The SaveBridge
// agent is reached over plain HTTP on the local network, so the release app
// must opt in explicitly (Expo Go allowed it, standalone builds do not).
module.exports = function withCleartextTraffic(config) {
  return withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (!application) {
      throw new Error('withCleartextTraffic: <application> not found in AndroidManifest.xml');
    }
    application.$['android:usesCleartextTraffic'] = 'true';
    return cfg;
  });
};
