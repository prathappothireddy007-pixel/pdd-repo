exports.config = {
    runner: 'local',
    specs: [
        './tests/**/*.js'
    ],
    exclude: [],
    maxInstances: 10,
    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome',
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu']
        }
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: process.env.BASE_URL || 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['chromedriver'],
    framework: 'mocha',
    reporters: ['spec', ['json', {
        outputDir: './reports/json/'
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            await browser.saveScreenshot('./screenshots/error-' + test.title.replace(/\s+/g, '') + '.png');
        }
    }
}
