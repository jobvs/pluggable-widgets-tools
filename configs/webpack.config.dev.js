"use strict";

const commonConfig = require("./webpack.config.common");
const merge = require("webpack-merge");
const variables = require("./variables");

const packagePath = variables.package.packagePath.replace(/\./g, "\/");
const widgetName = variables.package.widgetName;
const name = widgetName.toLowerCase();

const mxHost = process.env.npm_package_config_mendixHost || variables.package.config.mendixHost || "http://localhost:8080";
const developmentPort = process.env.npm_package_config_developmentPort || variables.package.config.developmentPort || "3000";

const devConfig = {
    mode: "development",
    devtool: "eval",
    devServer: {
        port: developmentPort,
        overlay: {
            errors: true
        },
        proxy: [{
            context: ["**", `!/widgets/${packagePath}/${name}/${widgetName}.js`],
            target: mxHost,
            onError: function(err, req, res) {
                if (res && res.writeHead) {
                    res.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    if (err.code === "ECONNREFUSED") {
                        res.end("Please make sure that the Mendix server is running at " + mxHost
                            + ` or change the configuration through your package.json or command line: \n > npm config set @mendix/pluggable-widgets-tools:mendixHost http://host:port \n > npm config set @mendix/pluggable-widgets-tools:developmentPort 3000`);
                    } else {
                        res.end("Error connecting to Mendix server"
                            + "\n " + JSON.stringify(err, null, 2));
                    }
                }
            }
        }]
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/, use: [
                    "style-loader", "css-loader", "sass-loader"
                ]
            },
            { test: /\.png$/, loader: "url-loader?limit=100000" },
            { test: /\.jpg$/, loader: "file-loader" },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/octet-stream"
            },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=image/svg+xml"
            }
        ]
    }
};

const previewDevConfig = {
    mode: "development",
    devtool: "eval",
    module: {
        rules: [
            { test: /\.css$/, use: "raw-loader" },
            {
                test: /\.scss$/, use: [
                    { loader: "raw-loader" },
                    { loader: "sass-loader" }
                ]
            }
        ]
    }
};

module.exports = [ merge(commonConfig[0], devConfig), merge(commonConfig[1], previewDevConfig) ];
