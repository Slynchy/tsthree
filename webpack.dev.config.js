const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const SharedConfig = require("./build/SharedWebpackSettings.js");
const {DefinePlugin} = require("webpack");

module.exports = {
    entry: SharedConfig.ENTRYPOINTS,
    mode: "development",
    devtool: "source-map",
    target: SharedConfig.TARGET,
    devServer: SharedConfig.DEVSERVER_SETTINGS,
    plugins: [
        new CopyPlugin(SharedConfig.COPY_PLUGIN_SETTINGS),
        new HtmlWebpackPlugin({
            hash: false,
            ...SharedConfig.HTML_TEMPLATE_SETTINGS
        }),
        new DefinePlugin({
            __PRODUCTION: false,
            __VERSION: SharedConfig.VERSION
        }),
    ],
    module: { rules: SharedConfig.MODULE_RULES },
    resolve: SharedConfig.RESOLVE_SETTINGS,
    output: SharedConfig.OUTPUT_SETTINGS,
};
