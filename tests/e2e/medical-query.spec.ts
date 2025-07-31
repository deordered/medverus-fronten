import { test, expect } from '@playwright/test';

test.describe('Medical Query System', () => {
  test.beforeEach(async ({ page }) => {
    // For these tests, we'll need to mock authentication
    // In a real scenario, you would set up test user credentials
    await page.goto('/');
  });

  test('should display search interface on homepage', async ({ page }) => {
    // Check for main search components
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
    
    // Check for source selection
    await expect(page.locator('text=Medverus AI')).toBeVisible();
    await expect(page.locator('text=PubMed')).toBeVisible();
    await expect(page.locator('text=Web Search')).toBeVisible();
    await expect(page.locator('text=File Upload')).toBeVisible();
  });

  test('should show autocomplete suggestions when typing', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Start typing a medical term
    await searchInput.fill('hypertension');
    
    // Wait for suggestions to appear
    await page.waitForTimeout(500);
    
    // Check for autocomplete dropdown
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
    
    // Should have suggestions containing the typed text
    await expect(page.locator('text=hypertension')).toBeVisible();
  });

  test('should allow source selection', async ({ page }) => {
    // Initially Medverus AI should be selected
    await expect(page.locator('[data-testid="source-medverus-ai"][aria-selected="true"]')).toBeVisible();
    
    // Click PubMed to add it to selection
    await page.click('[data-testid="source-pubmed"]');
    
    // Both should now be selected
    await expect(page.locator('[data-testid="source-medverus-ai"][aria-selected="true"]')).toBeVisible();
    await expect(page.locator('[data-testid="source-pubmed"][aria-selected="true"]')).toBeVisible();
    
    // Click Web Search to add it
    await page.click('[data-testid="source-web-search"]');
    
    // Should have 3 sources selected
    await expect(page.locator('[aria-selected="true"]')).toHaveCount(3);
  });

  test('should perform search with Medverus AI source', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Ensure only Medverus AI is selected
    await page.click('[data-testid="source-medverus-ai"]');
    
    // Enter search query
    await searchInput.fill('diabetes treatment guidelines');
    
    // Submit search
    await page.click('[data-testid="search-button"]');
    
    // Should show loading state
    await expect(page.locator('[data-testid="search-loading"]')).toBeVisible();
    
    // Wait for results (with timeout for backend)
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    
    // Check results are displayed
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-item"]')).toHaveCount({ greaterThan: 0 });
    
    // Check result format
    await expect(page.locator('[data-testid="result-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-source"]')).toBeVisible();
  });

  test('should handle search with multiple sources', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Select multiple sources
    await page.click('[data-testid="source-medverus-ai"]');
    await page.click('[data-testid="source-pubmed"]');
    
    // Enter search query
    await searchInput.fill('covid-19 treatment');
    
    // Submit search
    await page.click('[data-testid="search-button"]');
    
    // Should show results from both sources
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    
    // Check for source indicators in results
    await expect(page.locator('[data-source="medverus_ai"]')).toHaveCount({ greaterThan: 0 });
    await expect(page.locator('[data-source="pubmed"]')).toHaveCount({ greaterThan: 0 });
  });

  test('should display file upload interface', async ({ page }) => {
    // Click file upload source
    await page.click('[data-testid="source-file-upload"]');
    
    // Should show file upload area
    await expect(page.locator('[data-testid="file-upload-area"]')).toBeVisible();
    await expect(page.locator('text=Drag and drop medical documents here')).toBeVisible();
    
    // Should show supported file types
    await expect(page.locator('text=PDF, DOC, DOCX')).toBeVisible();
    
    // Should show file size limits
    await expect(page.locator('text=Max 5MB')).toBeVisible();
  });

  test('should handle file upload with drag and drop', async ({ page }) => {
    await page.click('[data-testid="source-file-upload"]');
    
    // Create a test file
    const fileContent = 'This is a test medical document with patient information.';
    const fileName = 'test-medical-document.txt';
    
    // Upload file via input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from(fileContent)
    });
    
    // Should show upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    
    // Should show uploaded file
    await expect(page.locator(`text=${fileName}`)).toBeVisible();
    
    // Should enable search with uploaded file
    await expect(page.locator('[data-testid="search-button"]:not([disabled])')).toBeVisible();
  });

  test('should show search history', async ({ page }) => {
    // Open search history panel
    await page.click('[data-testid="search-history-toggle"]');
    
    // Should show search history panel
    await expect(page.locator('[data-testid="search-history-panel"]')).toBeVisible();
    
    // Should show recent searches (if any)
    await expect(page.locator('[data-testid="recent-searches"]')).toBeVisible();
  });

  test('should export search results', async ({ page }) => {
    // Perform a search first
    await page.fill('[data-testid="search-input"]', 'hypertension');
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    
    // Click export button
    await page.click('[data-testid="export-results"]');
    
    // Should show export options
    await expect(page.locator('[data-testid="export-options"]')).toBeVisible();
    await expect(page.locator('text=Export as PDF')).toBeVisible();
    await expect(page.locator('text=Export as CSV')).toBeVisible();
  });

  test('should show usage limits for different tiers', async ({ page }) => {
    // Check if usage limits are displayed
    await expect(page.locator('[data-testid="usage-limits"]')).toBeVisible();
    
    // Should show current usage
    await expect(page.locator('[data-testid="current-usage"]')).toBeVisible();
    
    // Should show tier information
    await expect(page.locator('text=Free')).toBeVisible();
  });

  test('should display HIPAA compliance notice', async ({ page }) => {
    // Should show HIPAA compliance information
    await expect(page.locator('text=HIPAA')).toBeVisible();
    await expect(page.locator('text=Medical information is handled securely')).toBeVisible();
    
    // Should show security indicators
    await expect(page.locator('[data-testid="security-badge"]')).toBeVisible();
  });

  test('should handle search errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/query/**', route => {
      route.abort('failed');
    });
    
    // Perform search
    await page.fill('[data-testid="search-input"]', 'test query');
    await page.click('[data-testid="search-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="search-error"]')).toBeVisible();
    await expect(page.locator('text=Unable to perform search')).toBeVisible();
    
    // Should offer retry option
    await expect(page.locator('[data-testid="retry-search"]')).toBeVisible();
  });
});