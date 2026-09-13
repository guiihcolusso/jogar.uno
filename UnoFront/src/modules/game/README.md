# game

The table (`/[gameId]/table`): seats up to 8 players around the table
(`utils/table-layout.util.ts` ports the CRA app's rotation-so-you're-always-
at-the-bottom layout math verbatim), a center discard pile, the local
player's hand with tap-to-select (stacking same-rank cards via the server's
`canBeCombed` flag) and framer-motion drag-to-play onto the pile, a wild
color picker, a win-screen modal, an in-game chat drawer, and floating
reactions (UNO / blocked / buy-N) per seat.

All orchestration (join, `GameStarted`/`PlayerWon` listeners, the
color-picker-then-putCard flow, leave/quit navigation) lives in
`hooks/useTable.hook.ts`. Card usability (`canBeUsed`/`canBeCombed`) always
comes from the server's `PlayerCardUsabilityConsolidated` broadcast — this
module never computes it locally.

Depends only on `@/shared/socket` — no other feature module.

## Known gaps (need a live backend to verify)

- Real two-client play (card combos, buy-4 chains, AFK auto-play) is
  untested beyond the socket contract types.
- Drag-to-play is only unit-tested for tap-to-select; the actual pointer
  drag gesture needs a manual/E2E pass against a running `UnoAPI`.
