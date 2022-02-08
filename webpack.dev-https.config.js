const template = require("./webpack.dev.config");

module.exports = {
    ...template,
    devServer: {
        ...template.devServer, https: true
    }
};
