import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const SCOPE = "REACT_MFE";

const publicKey = fs.readFileSync(path.join(process.cwd(), '..', "public.pem"), "utf8");

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 3002,
  },
  dev: {
    assetPrefix: true,
    setupMiddlewares: [
      (middlewares) => {
        // Middleware to enforce authentication
        const authMiddleware = (req, res, next) => {
          const url = req.url || "";
          const isMfeAsset = req.url?.includes("remoteEntry.js");
          let token: string | null = null;
          if (url.includes("token=")) {
            const queryString = url.split("?")[1];
            const params = new URLSearchParams(queryString);
            token = params.get("token");
          }

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
              res.end(
                JSON.stringify({
                  message: "Invalid or expired token",
                  error: err.message,
                })
              );
            }
          } else {
            // Direct access: allow without token check
            next();
          }
        };

        // Add middleware to the stack (unshift to run before other middlewares)
        middlewares.unshift(authMiddleware);
      },
    ],
  },
  tools: {
    rspack: {
      output: {
        uniqueName: "react_mfe_app", // cái này phải unique cho mỗi mfe nhé
      },
      plugins: [
        new ModuleFederationPlugin({
          name: "react_mfe_app",
          exposes: {
            ReactAppLoader: "./src/loader.ts",
          },
          shared: {
            react: {
              singleton: true,
            },
            "react-dom/client": {
              singleton: true,
            },
          },
          filename: "remoteEntry.js",
        }),
      ],
    },
  },
});
