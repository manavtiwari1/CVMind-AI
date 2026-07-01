import { chromium } from 'playwright';

export async function applyNaukri({ jobTitle, company, credentials, profile }) {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  const screenshots = [];
  const steps = [];

  const log = (msg) => { steps.push(msg); console.log('[Naukri]', msg); };

  try {
    log('Opening Naukri.com...');
    await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    log('Entering credentials...');
    await page.fill('#usernameField', credentials.email);
    await page.waitForTimeout(400);
    await page.fill('#passwordField', credentials.password);
    await page.waitForTimeout(400);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);

    // Check login failed
    const errorEl = await page.$('.error-msg, .errorBlock, [class*="error"]');
    if (errorEl) {
      const errText = await errorEl.textContent();
      throw new Error(`Login failed: ${errText?.trim() || 'Invalid credentials'}`);
    }

    log('Logged in! Searching for jobs...');
    screenshots.push(await page.screenshot({ encoding: 'base64' }));

    const searchUrl = `https://www.naukri.com/jobs-in-india?k=${encodeURIComponent(jobTitle)}&q=${encodeURIComponent(jobTitle)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);

    log(`Found job listings for "${jobTitle}"...`);
    screenshots.push(await page.screenshot({ encoding: 'base64' }));

    // Click first job
    const jobEl = await page.$('.jobTupleHeader a.title, article .title a, a.title[href*="naukri.com"]');
    if (!jobEl) throw new Error('No jobs found on Naukri for this role. Try a different search.');

    log('Opening best matching job...');
    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 8000 }).catch(() => null),
      jobEl.click()
    ]);

    const jobPage = newPage || page;
    await jobPage.waitForLoadState('domcontentloaded', { timeout: 20000 });
    await jobPage.waitForTimeout(2500);

    log('Job page loaded! Looking for Apply button...');
    screenshots.push(await jobPage.screenshot({ encoding: 'base64' }));

    const applyBtn = await jobPage.$('button:has-text("Apply"), .applyBtn, #apply-button, [id*="apply-button"]');
    if (!applyBtn) throw new Error('Apply button not found. This job may require direct company application.');

    log('Clicking Apply button...');
    await applyBtn.click();
    await jobPage.waitForTimeout(3000);

    screenshots.push(await jobPage.screenshot({ encoding: 'base64' }));
    log('Application submitted successfully on Naukri!');

    await browser.close();
    return { success: true, portal: 'naukri', steps, screenshots, message: `Applied to ${jobTitle} at ${company} on Naukri.com` };

  } catch (err) {
    try { screenshots.push(await page.screenshot({ encoding: 'base64' })); } catch {}
    try { await browser.close(); } catch {}
    return { success: false, portal: 'naukri', steps, error: err.message, screenshots };
  }
}
