import { chromium } from 'playwright';

export async function applyLinkedIn({ jobTitle, company, credentials, profile }) {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  const screenshots = [];
  const steps = [];

  const log = (msg) => { steps.push(msg); console.log('[LinkedIn]', msg); };

  try {
    log('Opening LinkedIn...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // If already logged in, LinkedIn redirects to /feed
    const urlAfterNav = page.url();
    if (urlAfterNav.includes('/feed') || urlAfterNav.includes('/home') || urlAfterNav.includes('/mynetwork')) {
      log('Already logged in to LinkedIn!');
    } else {
      log('Waiting for login form...');
      // Wait for the email field to actually appear in DOM
      await page.waitForSelector('#username, input[name="session_key"], input[autocomplete="username"]', { timeout: 15000 });

      log('Entering credentials...');
      const emailField = await page.$('#username') || await page.$('input[name="session_key"]') || await page.$('input[autocomplete="username"]');
      if (emailField) await emailField.fill(credentials.email);
      await page.waitForTimeout(500);

      const passField = await page.$('#password') || await page.$('input[name="session_password"]') || await page.$('input[type="password"]');
      if (passField) await passField.fill(credentials.password);
      await page.waitForTimeout(500);

      await page.click('button[type="submit"], .btn__primary--large');
      await page.waitForTimeout(5000);

      // Check for 2FA / captcha
      if (await page.$('input[name="pin"], #captcha-internal')) {
        screenshots.push(await page.screenshot({ encoding: 'base64' }));
        throw new Error('LinkedIn requires 2FA verification. Please disable 2FA temporarily or use Naukri instead.');
      }

      // Check login failed
      if (await page.$('#error-for-username, #error-for-password')) {
        throw new Error('LinkedIn login failed. Check your email and password.');
      }
    }

    log('Searching Easy Apply jobs...');
    screenshots.push(await page.screenshot({ encoding: 'base64' }));

    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}&f_LF=f_AL`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(4000);

    log(`Showing Easy Apply listings for "${jobTitle}"...`);
    screenshots.push(await page.screenshot({ encoding: 'base64' }));

    // Click first job card
    const firstCard = await page.$('.job-card-container__link, li.jobs-search-results__list-item a, .base-card__full-link');
    if (!firstCard) throw new Error('No Easy Apply jobs found on LinkedIn for this role. Try a different job title.');

    log('Opening first matching job...');
    await firstCard.click();
    await page.waitForTimeout(3000);
    screenshots.push(await page.screenshot({ encoding: 'base64' }));

    // Click Easy Apply
    log('Clicking Easy Apply button...');
    const easyApplyBtn = await page.$('button.jobs-apply-button, button:has-text("Easy Apply"), .jobs-s-apply button');
    if (!easyApplyBtn) throw new Error('Easy Apply button not found. This job may require external application.');
    await easyApplyBtn.click();
    await page.waitForTimeout(3000);
    screenshots.push(await page.screenshot({ encoding: 'base64' }));

    // Fill phone if empty
    const phoneInput = await page.$('input[id*="phoneNumber"], input[id*="phone-number"]');
    if (phoneInput) {
      const val = await phoneInput.inputValue();
      if (!val) await phoneInput.fill(profile?.phone || '9999999999');
    }

    // Navigate through form steps
    log('Filling application form...');
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(2000);

      const submitBtn = await page.$('button:has-text("Submit application"), button[aria-label="Submit application"]');
      if (submitBtn) {
        log('Submitting application...');
        await submitBtn.click();
        await page.waitForTimeout(3000);
        screenshots.push(await page.screenshot({ encoding: 'base64' }));
        break;
      }

      const nextBtn = await page.$('button:has-text("Next"), button:has-text("Review"), button[aria-label*="Continue to next step"]');
      if (nextBtn) { await nextBtn.click(); continue; }

      break;
    }

    log('Application submitted on LinkedIn!');
    await browser.close();
    return { success: true, portal: 'linkedin', steps, screenshots, message: `Applied to ${jobTitle} at ${company} on LinkedIn` };

  } catch (err) {
    try { screenshots.push(await page.screenshot({ encoding: 'base64' })); } catch {}
    try { await browser.close(); } catch {}
    return { success: false, portal: 'linkedin', steps, error: err.message, screenshots };
  }
}
