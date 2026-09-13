import { expect, test } from '@playwright/test'

/**
 * E2E — dashboard shell.
 *
 * No live backend in CI, so this only proves the guest-name gate renders and
 * the page doesn't crash before a socket connection exists. Once `UnoAPI` is
 * reachable, extend this with: create game → redirected to `/[gameId]`.
 */
test.describe('Dashboard', () => {
  test('shows the guest name gate before any game data loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible()
  })
})
