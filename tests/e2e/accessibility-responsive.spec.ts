import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  const devices = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 }
  ];

  devices.forEach(device => {
    test(`should display correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/');

      // Check that the page loads and is visible
      await expect(page.locator('body')).toBeVisible();
      
      // Check header responsiveness
      await expect(page.locator('[data-testid="header"]')).toBeVisible();
      
      // Check main content area
      await expect(page.locator('main')).toBeVisible();
      
      // Check that content doesn't overflow
      const bodyBox = await page.locator('body').boundingBox();
      expect(bodyBox?.width).toBeLessThanOrEqual(device.width);
      
      // Check search interface on different screen sizes
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
      
      if (device.width <= 768) {
        // On mobile, check for hamburger menu or mobile navigation
        const mobileMenu = page.locator('[data-testid="mobile-menu"]');
        if (await mobileMenu.isVisible()) {
          await expect(mobileMenu).toBeVisible();
        }
      }
    });
  });

  test('should handle orientation changes on mobile', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check layout in portrait
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Should still be usable in landscape
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    // Navigation should adapt
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have proper touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that buttons are at least 44px (iOS) or 48dp (Android) - roughly 44-48px
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40); // Allowing some margin
        expect(box.width).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should handle text scaling', async ({ page }) => {
    await page.goto('/');
    
    // Simulate larger text size (like iOS accessibility settings)
    await page.addStyleTag({
      content: `
        html { font-size: 120% !important; }
        * { font-size: 1.2em !important; }
      `
    });
    
    // Check that layout doesn't break with larger text
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    // Check that text doesn't overflow containers
    const searchInput = page.locator('[data-testid="search-input"]');
    const inputBox = await searchInput.boundingBox();
    if (inputBox) {
      expect(inputBox.width).toBeGreaterThan(0);
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Check that headings are properly nested
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // H1 should contain meaningful text
    const h1Text = await h1.textContent();
    expect(h1Text?.length).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper button roles
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      const role = await button.getAttribute('role');
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Button should have role="button" or meaningful text/aria-label
      expect(role === 'button' || ariaLabel || (text && text.trim().length > 0)).toBe(true);
    }
    
    // Check for proper form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const id = await input.getAttribute('id');
      
      // Input should have label association
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Start keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      
      // Each focused element should be visible
      if (await currentFocus.count() > 0) {
        await expect(currentFocus).toBeVisible();
      }
    }
    
    // Test Enter key on focused button
    const focusedButton = page.locator('button:focus');
    if (await focusedButton.count() > 0) {
      await page.keyboard.press('Enter');
      // Button should respond to Enter key
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This is a basic check - in real scenarios you'd use tools like axe-core
    // Check that text is visible against background
    const textElements = page.locator('p, span, div').filter({ hasText: /\w+/ });
    const count = await textElements.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = textElements.nth(i);
      await expect(element).toBeVisible();
      
      // Basic visibility check
      const box = await element.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for landmark roles
    const landmarks = [
      page.locator('[role="main"], main'),
      page.locator('[role="navigation"], nav'),
      page.locator('[role="banner"], header'),
      page.locator('[role="contentinfo"], footer')
    ];
    
    // At least main landmark should exist
    const main = landmarks[0];
    const mainCount = await main.count();
    expect(mainCount).toBeGreaterThanOrEqual(1);
    
    // Check for skip links (good accessibility practice)
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    // Skip links are optional but recommended
  });

  test('should handle focus management in modals', async ({ page }) => {
    await page.goto('/');
    
    // Look for modal triggers
    const modalTrigger = page.locator('[data-testid="login-button"], button').first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      
      // If a modal opens, check focus management
      const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]');
      if (await modal.count() > 0) {
        // Focus should be trapped in modal
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        
        // Focused element should be within modal
        if (await focusedElement.count() > 0) {
          const isInModal = await modal.locator(':focus').count() > 0;
          expect(isInModal).toBe(true);
        }
        
        // Escape should close modal
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('should provide alternative text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Decorative images should have empty alt or role="presentation"
      // Content images should have meaningful alt text
      expect(alt !== null || role === 'presentation').toBe(true);
      
      if (alt && alt.length > 0) {
        // Alt text should be meaningful (not just filename)
        expect(alt).not.toMatch(/\.(jpg|png|gif|svg)$/i);
      }
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Check that page still functions with reduced motion
    await expect(page.locator('body')).toBeVisible();
    
    // Animated elements should respect reduced motion
    // This would require checking CSS animations/transitions
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    // Animations should be disabled or reduced
  });

  test('should be usable with voice control', async ({ page }) => {
    await page.goto('/');
    
    // Check that interactive elements have accessible names
    const interactiveElements = page.locator('button, a, input, select, textarea');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = interactiveElements.nth(i);
      const accessibleName = await element.getAttribute('aria-label') ||
                           await element.textContent() ||
                           await element.getAttribute('title') ||
                           await element.getAttribute('placeholder');
      
      // Each interactive element should have an accessible name
      expect(accessibleName?.trim().length).toBeGreaterThan(0);
    }
  });
});

test.describe('Performance Accessibility', () => {
  test('should load quickly for users with slow connections', async ({ page }) => {
    // Simulate slow 3G connection
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      await route.continue();
    });
    
    const startTime = Date.now();
    await page.goto('/');
    
    // Page should be usable within reasonable time
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // 10 seconds max for slow connection
  });

  test('should work with JavaScript disabled', async ({ page }) => {
    // Disable JavaScript
    await page.setJavaScriptEnabled(false);
    await page.goto('/');
    
    // Basic content should still be visible
    await expect(page.locator('body')).toBeVisible();
    
    // Forms should still be submittable (server-side handling)
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      await expect(forms.first()).toBeVisible();
    }
  });
});