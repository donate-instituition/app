const { withAndroidManifest } = require('@expo/config-plugins');

function hasPackageQuery(queries, packageName) {
  return queries.some((query) =>
    query.package?.some((entry) => entry.$?.['android:name'] === packageName),
  );
}

function hasIntentQuery(queries, actionName, scheme) {
  return queries.some((query) =>
    query.intent?.some(
      (intent) =>
        intent.action?.some((entry) => entry.$?.['android:name'] === actionName) &&
        intent.data?.some((entry) => entry.$?.['android:scheme'] === scheme),
    ),
  );
}

function addAndroidPackageVisibilityQueries(manifest) {
  const queries = manifest.manifest.queries ?? [];
  manifest.manifest.queries = queries;

  if (!hasPackageQuery(queries, 'com.whatsapp')) {
    queries.push({
      package: [
        {
          $: {
            'android:name': 'com.whatsapp',
          },
        },
      ],
    });
  }

  if (!hasIntentQuery(queries, 'android.intent.action.SENDTO', 'mailto')) {
    queries.push({
      intent: [
        {
          action: [
            {
              $: {
                'android:name': 'android.intent.action.SENDTO',
              },
            },
          ],
          data: [
            {
              $: {
                'android:scheme': 'mailto',
              },
            },
          ],
        },
      ],
    });
  }

  if (!hasIntentQuery(queries, 'android.intent.action.VIEW', 'whatsapp')) {
    queries.push({
      intent: [
        {
          action: [
            {
              $: {
                'android:name': 'android.intent.action.VIEW',
              },
            },
          ],
          data: [
            {
              $: {
                'android:scheme': 'whatsapp',
              },
            },
          ],
        },
      ],
    });
  }
}

module.exports = function withAndroidQueries(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    addAndroidPackageVisibilityQueries(configWithManifest.modResults);
    return configWithManifest;
  });
};
