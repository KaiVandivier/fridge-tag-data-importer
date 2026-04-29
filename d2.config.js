/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    name: 'fridge-tag',
    title: 'Fridge-tag',
    description: 'Upload and review Berlinger Fridge-tag temperature reports',
    minDHIS2Version: '2.41',

    entryPoints: {
        app: './src/App.tsx',
    },

    viteConfigExtensions: './viteConfigExtensions.mts',
}

module.exports = config
