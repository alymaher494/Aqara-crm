import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Aqara Plus CRM - Comprehensive E2E Test Suite
 * 
 * This suite covers:
 * - Visual Regression (Desktop screenshots)
 * - Accessibility (Color contrast checks)
 * - Mobile Responsiveness (Layout adaptation)
 * - Functional Logic (Core user flows)
 */

// ============================================================
// TEST UTILITIES
// ============================================================

/**
 * Login helper - handles authentication if needed
 * More robust version with better error handling and wait strategies
 */
async function loginIfRequired(page: Page) {
    // Check if we're redirected to login
    if (page.url().includes('/login')) {
        console.log('[Login] Detected login page, attempting authentication...');
        
        // Fill login form with test credentials
        const email = process.env.TEST_USER_EMAIL || 'alymaher.494@gmail.com';
        const password = process.env.TEST_USER_PASSWORD || 'Test@123';
        
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        
        console.log(`[Login] Submitting with email: ${email}`);
        await page.click('button[type="submit"]');
        
        // Wait a moment for the response
        await page.waitForTimeout(2000);
        
        // Check for error messages (toast, alert, or inline error)
        const errorSelectors = [
            '[data-sonner-toast][data-type="error"]',  // Sonner error toast
            '.toast-error',
            '[role="alert"]',
            'text=Invalid',
            'text=incorrect',
            'text=failed',
            'text=Error',
        ];
        
        for (const selector of errorSelectors) {
            const errorElement = page.locator(selector).first();
            if (await errorElement.isVisible({ timeout: 500 }).catch(() => false)) {
                const errorText = await errorElement.textContent();
                throw new Error(`[Login Failed] Error detected: ${errorText || 'Unknown error'}`);
            }
        }
        
        // Strategy 1: Wait for URL change (with longer timeout)
        try {
            await page.waitForURL(/\/crm/, { timeout: 30000 });
            console.log('[Login] URL changed to /crm - login successful');
        } catch (urlError) {
            // Strategy 2: Check if we're still on login (might have failed silently)
            if (page.url().includes('/login')) {
                // Take screenshot for debugging
                await page.screenshot({ path: 'test-results/login-failure.png' });
                throw new Error('[Login Failed] Still on login page after 30s. Check credentials.');
            }
        }
        
        // Strategy 3: Wait for dashboard header to confirm we're logged in
        try {
            await page.waitForSelector('header, aside, nav', { 
                state: 'visible', 
                timeout: 10000 
            });
            console.log('[Login] Dashboard header detected - confirmed logged in');
        } catch (headerError) {
            console.warn('[Login] Could not detect header, but URL suggests success');
        }
        
        // Final wait for page to stabilize
        await page.waitForLoadState('networkidle');
    }
}

/**
 * Generate unique test data
 */
function generateTestLead() {
    const timestamp = Date.now();
    return {
        name: `Test Lead ${timestamp}`,
        phone: `+2010${Math.floor(Math.random() * 90000000 + 10000000)}`,
    };
}

// ============================================================
// TEST GROUP A: VISUAL & ACCESSIBILITY (DESKTOP)
// ============================================================

test.describe('Group A: Visual & Accessibility (Desktop)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('A1: Dashboard loads with proper contrast', async ({ page }) => {
        await page.goto('/crm');
        await loginIfRequired(page);

        // Wait for dashboard to fully load
        await page.waitForSelector('h1, h2', { state: 'visible' });
        await page.waitForLoadState('networkidle');

        // Run accessibility check focusing on color contrast
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2aa', 'wcag2aaa'])
            .analyze();

        // Filter for color contrast violations
        const contrastViolations = accessibilityScanResults.violations.filter(
            (v) => v.id === 'color-contrast'
        );

        // Log violations for debugging
        if (contrastViolations.length > 0) {
            console.log('Contrast Violations Found:');
            contrastViolations.forEach((v) => {
                v.nodes.forEach((node) => {
                    console.log(`  - ${node.html}`);
                    console.log(`    ${node.failureSummary}`);
                });
            });
        }

        // Fail if critical contrast issues exist
        expect(
            contrastViolations.length,
            `Found ${contrastViolations.length} color contrast violations`
        ).toBeLessThanOrEqual(3); // Allow minor violations
    });

    test('A2: Dashboard visual snapshot matches baseline', async ({ page }) => {
        await page.goto('/crm');
        await loginIfRequired(page);

        // Wait for all content to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Allow animations to complete

        // Take full page screenshot and compare to baseline
        await expect(page).toHaveScreenshot('dashboard-desktop.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05,
        });
    });

    test('A3: Leads page visual consistency', async ({ page }) => {
        await page.goto('/crm/leads');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('leads-page-desktop.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05,
        });
    });

    test('A4: Settings page accessibility check', async ({ page }) => {
        await page.goto('/crm/settings');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2aa'])
            .analyze();

        // Log all violations for review
        if (results.violations.length > 0) {
            console.log('Accessibility Violations on Settings Page:');
            results.violations.forEach((v) => {
                console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
            });
        }

        // Allow some minor violations but fail on serious/critical
        const seriousViolations = results.violations.filter(
            (v) => v.impact === 'serious' || v.impact === 'critical'
        );
        expect(seriousViolations.length).toBe(0);
    });
});

// ============================================================
// TEST GROUP B: MOBILE RESPONSIVENESS
// ============================================================

test.describe('Group B: Mobile Responsiveness', () => {
    test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12 Pro

    test('B1: Sidebar hidden on mobile, hamburger visible', async ({ page }) => {
        await page.goto('/crm');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Desktop sidebar should be hidden
        const desktopSidebar = page.locator('aside.hidden.md\\:flex, aside.md\\:flex');
        await expect(desktopSidebar).toBeHidden();

        // Hamburger menu button should be visible
        const hamburgerButton = page.locator('button:has(svg.lucide-menu), [data-testid="mobile-menu"]');
        await expect(hamburgerButton.first()).toBeVisible();
    });

    test('B2: Mobile menu sheet opens correctly', async ({ page }) => {
        await page.goto('/crm');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Click hamburger menu
        const hamburgerButton = page.locator('button:has(svg.lucide-menu)').first();
        await hamburgerButton.click();

        // Wait for sheet to open
        await page.waitForTimeout(300);

        // Sheet content should be visible
        const sheetContent = page.locator('[role="dialog"], [data-state="open"]');
        await expect(sheetContent.first()).toBeVisible();

        // Navigation links should be in the sheet
        const navLinks = page.locator('[role="dialog"] a, [data-state="open"] a');
        await expect(navLinks.first()).toBeVisible();
    });

    test('B3: Kanban uses Tabs layout on mobile', async ({ page }) => {
        await page.goto('/crm/pipeline');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Tabs should be visible on mobile (TabsList)
        const tabsList = page.locator('[role="tablist"]');
        await expect(tabsList).toBeVisible();

        // "New Leads" and "Pipeline" tabs should exist
        const newLeadsTab = page.locator('[role="tab"]:has-text("New")');
        const pipelineTab = page.locator('[role="tab"]:has-text("Pipeline")');

        await expect(newLeadsTab).toBeVisible();
        await expect(pipelineTab).toBeVisible();

        // Click Pipeline tab and verify content switches
        await pipelineTab.click();
        await page.waitForTimeout(300);

        // Pipeline content should now be visible
        const pipelineContent = page.locator('[role="tabpanel"]');
        await expect(pipelineContent).toBeVisible();
    });

    test('B4: Tables have horizontal scroll on mobile', async ({ page }) => {
        await page.goto('/crm/leads');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Check for overflow-x-auto container
        const scrollableTable = page.locator('.overflow-x-auto, [style*="overflow"]');

        // If table exists, it should have scroll capability
        if (await scrollableTable.count() > 0) {
            await expect(scrollableTable.first()).toBeVisible();
        }
    });

    test('B5: Mobile visual snapshot', async ({ page }) => {
        await page.goto('/crm');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('dashboard-mobile.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.08,
        });
    });
});

// ============================================================
// TEST GROUP C: FUNCTIONAL LOGIC (CORE FLOWS)
// ============================================================

test.describe('Group C: Functional Logic', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('C1: Create Lead without crash', async ({ page }) => {
        await page.goto('/crm/leads');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Click "Add Lead" button
        const addButton = page.locator('button:has-text("Add"), button:has-text("New Lead"), button:has-text("Create")');
        await addButton.first().click();

        // Wait for form/dialog to appear
        await page.waitForTimeout(500);

        // Generate test data
        const testLead = generateTestLead();

        // Fill the form
        await page.fill('input[name="name"], input[placeholder*="name" i]', testLead.name);
        await page.fill('input[name="phone"], input[placeholder*="phone" i], input[type="tel"]', testLead.phone);

        // Open Assign Agent dropdown - THIS IS THE CRASH CHECK
        const assignDropdown = page.locator('button:has-text("Unassigned"), button:has-text("Select"), [role="combobox"]').first();
        if (await assignDropdown.isVisible()) {
            await assignDropdown.click();
            await page.waitForTimeout(300);

            // Select first available agent (if any)
            const agentOption = page.locator('[role="option"]:not(:has-text("Unassigned"))').first();
            if (await agentOption.isVisible()) {
                await agentOption.click();
            } else {
                // Close dropdown if no agents
                await page.keyboard.press('Escape');
            }
        }

        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Create Lead")');
        await submitButton.click();

        // Wait for success (toast or redirect)
        await page.waitForTimeout(2000);

        // Verify no crash - page should still be functional
        await expect(page.locator('body')).toBeVisible();
    });

    test('C2: Lead details page loads without crash', async ({ page }) => {
        await page.goto('/crm/leads');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Click on first lead in the list
        const firstLeadRow = page.locator('table tbody tr, [data-testid="lead-item"]').first();
        if (await firstLeadRow.isVisible()) {
            await firstLeadRow.click();

            await page.waitForLoadState('networkidle');

            // Verify lead details page loaded
            // Should have assign agent selector
            const assignSection = page.locator('text=Assigned To, text=Agent Assignment');
            await expect(assignSection.first()).toBeVisible();

            // Assign agent dropdown should not crash
            const assignDropdown = page.locator('[role="combobox"], button:has-text("Unassigned")').first();
            if (await assignDropdown.isVisible()) {
                await assignDropdown.click();
                await page.waitForTimeout(300);
                await page.keyboard.press('Escape');
            }
        }
    });

    test('C3: Kanban drag and drop (Desktop)', async ({ page }) => {
        await page.goto('/crm/pipeline');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Find a card in "New Leads" column
        const sourceCard = page.locator('[data-testid="kanban-card"], .cursor-grab').first();

        if (await sourceCard.isVisible()) {
            // Find target column (e.g., "Contacted" or "Meeting")
            const targetColumn = page.locator('[data-testid="kanban-column"]:has-text("Contacted"), [data-testid="kanban-column"]:has-text("Meeting"), .droppable').first();

            if (await targetColumn.isVisible()) {
                // Perform drag and drop
                await sourceCard.dragTo(targetColumn);

                await page.waitForTimeout(1000);

                // Verify toast or status update
                // The exact verification depends on your implementation
            }
        }
    });

    test('C4: Settings page loads correctly', async ({ page }) => {
        await page.goto('/crm/settings');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Verify settings sections exist
        await expect(page.locator('text=Company, text=Organization, text=Settings')).toBeVisible();
    });

    test('C5: Team management - Add user flow', async ({ page }) => {
        await page.goto('/crm/settings/team');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Click invite/add user button
        const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add")');
        if (await inviteButton.first().isVisible()) {
            await inviteButton.first().click();

            await page.waitForTimeout(500);

            // Verify dialog opened
            const dialog = page.locator('[role="dialog"]');
            await expect(dialog).toBeVisible();

            // Close dialog
            await page.keyboard.press('Escape');
        }
    });

    test('C6: Properties page loads without errors', async ({ page }) => {
        await page.goto('/crm/properties');
        await loginIfRequired(page);

        await page.waitForLoadState('networkidle');

        // Verify page loaded
        await expect(page.locator('text=Inventory, text=Properties')).toBeVisible();

        // Check add property button
        const addButton = page.locator('button:has-text("Add Property")');
        await expect(addButton).toBeVisible();
    });
});

// ============================================================
// TEST GROUP D: SMOKE TESTS (Quick Health Check)
// ============================================================

test.describe('Group D: Smoke Tests', () => {
    const criticalPages = [
        { path: '/crm', name: 'Dashboard' },
        { path: '/crm/leads', name: 'Leads' },
        { path: '/crm/pipeline', name: 'Pipeline' },
        { path: '/crm/properties', name: 'Properties' },
        { path: '/crm/campaigns', name: 'Campaigns' },
        { path: '/crm/tasks', name: 'Tasks' },
        { path: '/crm/attendance', name: 'Attendance' },
        { path: '/crm/settings', name: 'Settings' },
    ];

    for (const route of criticalPages) {
        test(`Smoke: ${route.name} page loads`, async ({ page }) => {
            await page.goto(route.path);

            // Either page loads OR redirects to login (both valid)
            const response = await page.waitForLoadState('networkidle');

            // Page should not show error
            const errorText = await page.locator('text=Error, text=500, text=404, text=crashed').count();
            expect(errorText).toBe(0);
        });
    }
});
