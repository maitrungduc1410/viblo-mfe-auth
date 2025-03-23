const { ModuleFederationPlugin } = require("webpack").container;
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const publicKey = fs.readFileSync(path.join(process.cwd(), '..', "public.pem"), "utf8");
const SCOPE = "ANGULAR_MFE";

/** @type {import('webpack').Configuration} */
module.exports = {
  output: {
    publicPath: "auto",
    uniqueName: "angular_app",
    scriptType: "text/javascript",
    assetModuleFilename: "images/[hash][ext][query]",
  },
  optimization: {
    runtimeChunk: false,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset",
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "angular_mfe_app",
      filename: "remoteEntry.js",
      exposes: {
        AngularAppLoader: "./src/app/loader.ts",
      },
      shared: {
        "@angular/core": { singleton: true },
        "@angular/common": { singleton: true },
        "@angular/router": { singleton: true },
      },
    }),
  ],
  devServer: {
    // this is to remove the error "ws://localhost:4200/ws failed" in the console when we disable live reload
    // also this solve websocket proxy issue in local
    webSocketServer: false,
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.use((req, res, next) => {
        // Check if the request is for an MFE asset (e.g., .js, .css, .html files)
        const isMfeAsset = req.path.endsWith("remoteEntry.js");
        const token = req.query.token; // Get the token from the query parameter

        if (isMfeAsset) {
          if (!token) {
            return res.status(403).json({ message: "Token is required" });
          }

          try {
            const decoded = jwt.verify(token, publicKey, {
              algorithms: ["RS256"],
            });

            // get scopes from decoded token
            const scopes = decoded.scopes;
            if (!scopes.includes(SCOPE)) {
              return res.status(403).json({ message: "Invalid scope" });
            }
            next(); // Token is valid, proceed with the request
          } catch (err) {
            // Token is invalid or expired
            return res
              .status(403)
              .json({ message: "Invalid or expired token" });
          }
        } else {
          next(); // No token required for other requests (e.g., login page)
        }
      });
      return middlewares;
    },
  },
};
