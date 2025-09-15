import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.auspicioustime.app",
  appName: "Auspicious Time",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
