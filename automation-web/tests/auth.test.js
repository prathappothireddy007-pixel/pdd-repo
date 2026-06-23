const assert = require('assert');

describe('Online Auction App - Authentication Suite', () => {
    
    beforeEach(async () => {
        await browser.url(process.env.BASE_URL);
    });

    it('TC_AUTH_001 - Should load the home page successfully', async () => {
        const title = await browser.getTitle();
        assert(title.includes('Auction'), 'Page title should contain Auction');
    });

    it('TC_AUTH_002 - Should display login modal when clicking Sign In', async () => {
        const loginBtn = await $('button=Sign In');
        await loginBtn.click();
        
        const modal = await $('#auth-modal');
        await modal.waitForDisplayed({ timeout: 5000 });
        assert(await modal.isDisplayed(), 'Login modal should be displayed');
    });

    it('TC_AUTH_003 - Should prevent login with invalid credentials', async () => {
        await $('button=Sign In').click();
        
        await $('#auth-email').setValue('invalid@user.com');
        await $('#auth-password').setValue('wrongpassword');
        
        await $('button=Login').click();
        
        // Wait for error toast or message
        const errorMsg = await $('.toast-error');
        await errorMsg.waitForDisplayed({ timeout: 5000 });
        assert(await errorMsg.isDisplayed(), 'Error message should be shown for invalid login');
    });

    // We will scale these to 40+ Auth cases...
});
