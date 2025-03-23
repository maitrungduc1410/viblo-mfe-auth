import { defineConfig, PreviewServer } from "vite";
import vue from "@vitejs/plugin-vue";
import { federation } from "@module-federation/vite";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const SCOPE = "VUE_MFE"

const publicKey = fs.readFileSync(path.join(process.cwd(), '..', "public.pem"), "utf8");

// Custom Vite plugin for authentication
function authPlugin() {
  // Shared middleware logic for both dev and preview servers
  const authMiddleware = (req: any, res: any, next: any) => {
    const isMfeAsset = req.url?.includes("remoteEntry.js");
    const token = req.url?.includes("token=")
      ? new URLSearchParams(req.url.split("?")[1]).get("token")
      : null;

    if (isMfeAsset) {
      if (!token) {
        res.statusCode = 403;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Token required" }));
        return;
      }
      // App-shell request: require valid token
      try {
        const decoded: any = jwt.verify(token, publicKey, {
          algorithms: ["RS256"],
        });

        // get scopes from decoded token
        const scopes = decoded.scopes;
        if (!scopes.includes(SCOPE)) {
          return res.status(403).json({ message: "Invalid scope" });
        }
        next(); // Token valid, serve the asset
      } catch (err) {
        res.statusCode = 403;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Invalid or expired token" }));
      }
    } else {
      // Direct access: allow without token check
      next();
    }
  };

  return {
    name: "vite-auth-plugin",
    // Preview server middleware
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(authMiddleware);
    },
  };
}

export default defineConfig({
  build: {
    target: "esnext",
  },
  preview: {
    port: 3003,
  },
  server: {
    port: 3003, // Development server port
  },
  base: "./",
  plugins: [
    vue(),
    federation({
      name: "remote",
      filename: "remoteEntry.js",
      exposes: {
        VueAppLoader: "./src/loader.ts",
      },
      shared: {
        vue: {
          singleton: true,
        },
      },
    }),
    authPlugin(), // Custom plugin for auth
  ],
});
