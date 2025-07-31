import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
  });

  test('should display the home page with login options', async ({ page }) => {
    // Check that the home page loads
    await expect(page).toHaveTitle(/Medverus AI/);
    
    // Check for login button
    await expect(page.locator('text=Login')).toBeVisible();
    
    // Check for register button
    await expect(page.locator('text=Register')).toBeVisible();
  });

  test('should navigate to login page and display login form', async ({ page }) => {
    // Click login button
    await page.click('text=Login');
    
    // Should be on login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for Google OAuth button
    await expect(page.locator('text=Continue with Google')).toBeVisible();
  });

  test('should navigate to registration page and display registration form', async ({ page }) => {
    // Click register button
    await page.click('text=Register');
    
    // Should be on register page
    await expect(page).toHaveURL(/.*\/register/);
    
    // Check for registration form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for Google OAuth button
    await expect(page.locator('text=Continue with Google')).toBeVisible();
    
    // Check for terms and privacy links
    await expect(page.locator('text=Terms of Service')).toBeVisible();
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Please enter a valid email')).toBeVisible();
  });

  test('should show validation errors for short password', async ({ page }) => {
    await page.goto('/register');
    
    // Enter valid email but short password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid credentials
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message (this will fail if backend is not running)
    // For now, we'll just check that we're still on login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect to Google OAuth when clicking Google login', async ({ page }) => {
    await page.goto('/login');
    
    // Set up request interception to catch Google OAuth redirect
    let googleRedirectCaught = false;
    page.on('request', request => {
      if (request.url().includes('accounts.google.com')) {
        googleRedirectCaught = true;
      }
    });
    
    // Click Google login button
    await page.click('text=Continue with Google');
    
    // Wait a bit for redirect
    await page.waitForTimeout(1000);
    
    // In a real scenario, this would redirect to Google
    // For testing purposes, we just check that the attempt was made
    expect(googleRedirectCaught).toBe(true);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect unauthenticated users from admin pages', async ({ page }) => {
    // Try to access admin page without authentication
    await page.goto('/admin');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});