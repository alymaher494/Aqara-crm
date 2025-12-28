import { defineConfig, devices } from '@playwright/test';

/**
 * Aqara Plus CRM - Playwright Configuration
 * Configured for:
 * - Desktop Chrome (Visual Regression + Accessibility)
 * - Mobile Safari (Responsiveness)
 * - Screenshot comparison baseline management
 */
export default defineConfig({
    // Test directory
    testDir: './e2e',

    // Timeout for each test
    timeout: 60 * 30000,

    // Expect timeout
    expect: {
        timeout: 10000,
        // Screenshot comparison settings
        toHaveScreenshot: {
            maxDiffPixels: 100,
            threshold: 0.2,
        },
    },

    // Run tests in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Limit parallel workers on CI
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],

    // Shared settings for all projects
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL: 'http://localhost:3000',

        // Collect trace when retrying failed test
        trace: 'on-first-retry',

        // Take screenshot on failure
        screenshot: 'only-on-failure',

        // Record video on failure
        video: 'on-first-retry',
    },

    // Configure projects for different browsers/viewports
    projects: [
        // Desktop Chrome - Primary testing
        {
            name: 'Desktop Chrome',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
        },

        // Desktop Firefox - Cross-browser
        {
            name: 'Desktop Firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 },
            },
        },

        // Mobile Safari - iOS Responsiveness
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 12 Pro'],
            },
        },

        // Mobile Chrome - Android Responsiveness
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
            },
        },
    ],

    // Run local dev server before starting the tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 30000,
    },

    // Output folder for test artifacts
    outputDir: 'test-results/',

    // Snapshot directory for visual regression
    snapshotDir: 'e2e/__snapshots__',
});
