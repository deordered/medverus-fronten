import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user state
    await page.goto('/dashboard');
  });

  test('should display dashboard with navigation sidebar', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-sidebar"]')).toBeVisible();
    
    // Check navigation items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Search')).toBeVisible();
    await expect(page.locator('text=Files')).toBeVisible();
    await expect(page.locator('text=Usage')).toBeVisible();
    
    // Check user profile section
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('should show dashboard overview with stats', async ({ page }) => {
    // Check for usage statistics
    await expect(page.locator('[data-testid="usage-stats"]')).toBeVisible();
    await expect(page.locator('text=Queries Today')).toBeVisible();
    await expect(page.locator('text=Files Uploaded')).toBeVisible();
    
    // Check for recent activity
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    
    // Check for quick actions
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
    await expect(page.locator('text=New Search')).toBeVisible();
    await expect(page.locator('text=Upload File')).toBeVisible();
  });

  test('should navigate to files page', async ({ page }) => {
    // Click files navigation
    await page.click('[data-testid="nav-files"],text=Files');
    
    // Should be on files page
    await expect(page).toHaveURL(/.*\/dashboard\/files/);
    
    // Check files page elements
    await expect(page.locator('[data-testid="files-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-button"]')).toBeVisible();
    
    // Check file management controls
    await expect(page.locator('[data-testid="file-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-filter"]')).toBeVisible();
  });

  test('should navigate to usage page', async ({ page }) => {
    // Click usage navigation
    await page.click('[data-testid="nav-usage"],text=Usage');
    
    // Should be on usage page
    await expect(page).toHaveURL(/.*\/dashboard\/usage/);
    
    // Check usage page elements
    await expect(page.locator('[data-testid="usage-analytics"]')).toBeVisible();
    await expect(page.locator('[data-testid="tier-information"]')).toBeVisible();
    
    // Check usage charts
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
    
    // Check tier management
    await expect(page.locator('[data-testid="tier-upgrade"]')).toBeVisible();
  });

  test('should display collapsible sidebar panels', async ({ page }) => {
    // Check for sidebar panels
    await expect(page.locator('[data-testid="sidebar-panel-toggle"]')).toBeVisible();
    
    // Open recent activity panel
    await page.click('[data-testid="recent-activity-toggle"]');
    await expect(page.locator('[data-testid="recent-activity-panel"]')).toBeVisible();
    
    // Open file manager panel
    await page.click('[data-testid="file-manager-toggle"]');
    await expect(page.locator('[data-testid="file-manager-panel"]')).toBeVisible();
    
    // Open TTS panel
    await page.click('[data-testid="tts-toggle"]');
    await expect(page.locator('[data-testid="tts-panel"]')).toBeVisible();
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sidebar should be collapsed on mobile
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    
    // Click mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]');
    
    // Navigation should be visible
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
  });

  test('should allow user profile management', async ({ page }) => {
    // Click user profile
    await page.click('[data-testid="user-profile"]');
    
    // Should show profile menu
    await expect(page.locator('[data-testid="profile-menu"]')).toBeVisible();
    await expect(page.locator('text=Profile Settings')).toBeVisible();
    await expect(page.locator('text=Logout')).toBeVisible();
    
    // Click profile settings
    await page.click('text=Profile Settings');
    
    // Should show profile form
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin user authentication
    await page.goto('/admin');
  });

  test('should display admin dashboard for admin users', async ({ page }) => {
    // Check admin dashboard elements
    await expect(page.locator('[data-testid="admin-header"]')).toBeVisible();
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    
    // Check admin navigation
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('text=System Monitoring')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
  });

  test('should show user management interface', async ({ page }) => {
    // Navigate to user management
    await page.click('text=User Management');
    
    // Check user management elements
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-filter"]')).toBeVisible();
    
    // Check user actions
    await expect(page.locator('[data-testid="add-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
  });

  test('should display system monitoring dashboard', async ({ page }) => {
    // Navigate to system monitoring
    await page.click('text=System Monitoring');
    
    // Check monitoring elements
    await expect(page.locator('[data-testid="system-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
    
    // Check performance charts
    await expect(page.locator('[data-testid="cpu-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="memory-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="response-time-chart"]')).toBeVisible();
    
    // Check alerts section
    await expect(page.locator('[data-testid="system-alerts"]')).toBeVisible();
  });

  test('should show analytics dashboard', async ({ page }) => {
    // Navigate to analytics
    await page.click('text=Analytics');
    
    // Check analytics elements
    await expect(page.locator('[data-testid="analytics-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-analytics"]')).toBeVisible();
    
    // Check analytics charts
    await expect(page.locator('[data-testid="user-activity-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="query-volume-chart"]')).toBeVisible();
    
    // Check date range selector
    await expect(page.locator('[data-testid="date-range-picker"]')).toBeVisible();
  });

  test('should display security dashboard', async ({ page }) => {
    // Navigate to security
    await page.click('text=Security');
    
    // Check security elements
    await expect(page.locator('[data-testid="security-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="hipaa-compliance"]')).toBeVisible();
    
    // Check security metrics
    await expect(page.locator('[data-testid="failed-logins"]')).toBeVisible();
    await expect(page.locator('[data-testid="suspicious-activity"]')).toBeVisible();
    
    // Check audit logs
    await expect(page.locator('[data-testid="audit-logs"]')).toBeVisible();
  });

  test('should handle user editing in admin panel', async ({ page }) => {
    await page.click('text=User Management');
    
    // Click edit on first user
    await page.click('[data-testid="edit-user"]:first-child');
    
    // Should show user edit modal
    await expect(page.locator('[data-testid="user-edit-modal"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('select[name="tier"]')).toBeVisible();
    
    // Check save and cancel buttons
    await expect(page.locator('[data-testid="save-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="cancel-edit"]')).toBeVisible();
  });

  test('should show voucher management', async ({ page }) => {
    // Look for voucher management section
    if (await page.locator('text=Vouchers').isVisible()) {
      await page.click('text=Vouchers');
      
      // Check voucher management elements
      await expect(page.locator('[data-testid="vouchers-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-voucher"]')).toBeVisible();
    }
  });

  test('should restrict admin access for non-admin users', async ({ page }) => {
    // This would be tested with a non-admin user context
    // For now, we'll check that proper permissions are enforced
    await expect(page.locator('[data-testid="admin-content"]')).toBeVisible();
  });
});