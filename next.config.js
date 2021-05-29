const path = require('path')

module.exports = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Important: return the modified config
        config.resolve.alias['@nipacloud/nvision'] = "@nipacloud/nvision/dist/browser/nvision.js"
        return config
    },
}