const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const fs = require("fs");
const absPathToDist = path.resolve(process.cwd(), "dist");

const ENTRYPOINTS = [
    './src/index.ts'
];

let VERSION = "0.0.0";
try {
    VERSION = `"${JSON.parse(fs.readFileSync("./package.json", "utf8")).version}"`
} catch (err) {
    console.error("Failed to parse package.json for version");
    console.error(err);
}

const TARGET = 'web';

const DEVSERVER_SETTINGS = {
    contentBase: absPathToDist,
    compress: true, // enable gzip compression
};

const MODULE_RULES = [
    {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
    },
    {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: "assets/fonts/"
                }
            }
        ]
    }
];

const COPY_PLUGIN_SETTINGS = [
    {from: "src/assets", to: "./assets"},
    {from: "src/config/fbapp-config.json", to: "./fbapp-config.json"},
];

const HTML_TEMPLATE_SETTINGS = {
    title: "Parking Jam 3D",
    hash: true,
    template: "src/config/index.html"
};

const MINIMIZE_SETTINGS = {
    minimize: true,
    minimizer: [
        new TerserPlugin({
                parallel: 6,
                terserOptions: {
                    ecma: 2016,
                    parse: {},
                    compress: {
                        // booleans_as_integers: true,
                        // drop_console: true,
                        // hoist_funs: true,
                        // hoist_vars: true,
                        // keep_fargs: true,
                        passes: 3,
                        // toplevel: true,
                        // typeofs: true,
                        // unsafe: true,
                        // unsafe_arrows: true,
                        // unsafe_Function: true,
                        // unsafe_math: true,
                        // unsafe_symbols: true,
                        // unsafe_methods: true,
                        // unsafe_proto: true,
                        // unsafe_undefined: true,
                    },
                    sourceMap: {
                        filename: "main.js",
                        url: "main.js.map"
                    },
                    mangle: true
                },
            }
        )
    ],
};

const RESOLVE_SETTINGS = {
    extensions: [".tsx", ".ts", ".js"],
};

const OUTPUT_SETTINGS = {
    filename: "main.js",
    path: absPathToDist,
};

module.exports = {
    VERSION: VERSION,
    ENTRYPOINTS: ENTRYPOINTS,
    TARGET: TARGET,
    DEVSERVER_SETTINGS: DEVSERVER_SETTINGS,
    COPY_PLUGIN_SETTINGS: COPY_PLUGIN_SETTINGS,
    HTML_TEMPLATE_SETTINGS: HTML_TEMPLATE_SETTINGS,
    MODULE_RULES: MODULE_RULES,
    MINIMIZE_SETTINGS: MINIMIZE_SETTINGS,
    RESOLVE_SETTINGS: RESOLVE_SETTINGS,
    OUTPUT_SETTINGS: OUTPUT_SETTINGS,
};
