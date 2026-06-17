import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  // Replace 'LaunchKit' with your actual app title if different
  await expect(page).toHaveTitle(/LaunchKit/)
})

test('get started link', async ({ page }) => {
  await page.goto('/')

  // Click the get started link (adjust selector to your app)
  // await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of your app.
  // await expect(page.getByRole('heading', { name: 'LaunchKit' })).toBeVisible();
})
