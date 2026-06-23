exports.config = {
    runner: 'local',
    port: 4723, // Appium server port
    specs: [
        './tests/**/*.js'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Nexus 6 API 29',
        'appium:platformVersion': '10.0',
        'appium:automationName': 'UiAutomator2',
        'appium:app': '../online-auction-expo/android/app/build/outputs/apk/debug/app-debug.apk',
        'appium:autoGrantPermissions': true,
        'appium:noReset': false,
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: '',
    waitforTimeout: 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    appium: {
        command: 'appium',
    },
    framework: 'mocha',
    reporters: ['spec', ['json', {
        outputDir: './reports/json/'
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 90000
    },
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            await driver.saveScreenshot('./screenshots/mobile-error-' + test.title.replace(/\s+/g, '') + '.png');
        }
    }
}
