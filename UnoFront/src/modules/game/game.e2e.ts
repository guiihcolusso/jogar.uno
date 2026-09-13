import { expect, test } from '@playwright/test'

/**
 * E2E — table shell.
 *
 * Playing an actual round needs a live `UnoAPI` socket with at least two
 * connected clients, which isn't available in CI yet. This only proves the
 * guest-name gate renders before any socket state exists. Once the backend
 * is reachable, extend with: join two browser contexts, play a card via
 * drag, confirm the discard pile updates for both.
 */
test.describe('Table', () => {
  test('shows the guest name gate before joining a table', async ({ page }) => {
    await page.goto('/some-game-id/table')
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible()
  })
})
