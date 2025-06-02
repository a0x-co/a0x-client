import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    viewportWidth: 1440,
    viewportHeight: 900,
    setupNodeEvents(on, config) {
      config.browsers = config.browsers.concat([
        {
          name: "Brave",
          channel: "stable",
          family: "chromium",
          displayName: "Brave",
          version: "132.0.6834.160",
          path: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
          majorVersion: 132,
          isHeaded: true,
          isHeadless: false,
        },
      ]);
      return config;
    },
  },
});
