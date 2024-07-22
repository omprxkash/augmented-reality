import { test, expect } from '@playwright/test';

test.describe('AR Toolkit', () => {
  test('landing page loads with AR button', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#landing h1')).toBeVisible();
    await expect(page.locator('#landing h1')).toHaveText('AR Toolkit');

    // The AR button container should be present
    await expect(page.locator('#ar-button-container')).toBeAttached();

    // Wait a moment for the async AR support check
    await page.waitForTimeout(800);

    const btn = page.locator('#ar-button-container button');
    await expect(btn).toBeVisible();

    // In a desktop browser without WebXR the button shows unsupported, not a blank
    const text = await btn.textContent();
    expect(['Start AR', 'AR not supported', 'Checking…']).toContain(text?.trim());
  });

  test('overlay element exists for dom-overlay feature', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#overlay')).toBeAttached();
    await expect(page.locator('#hud')).toBeAttached();
  });
});
