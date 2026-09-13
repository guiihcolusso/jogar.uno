import { expect, test } from '@playwright/test'

/**
 * E2E — room shell.
 *
 * Requires a live `UnoAPI` socket to actually join a game, so this only
 * covers the guest-name gate for now. Extend once the backend is reachable:
 * create a game from the dashboard, land on `/[gameId]`, toggle ready.
 */
test.describe('Room', () => {
  test('shows the guest name gate before joining a room', async ({ page }) => {
    await page.goto('/some-game-id')
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible()
  })
})
