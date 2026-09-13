# room

Lobby (`/[gameId]`): joins the game over the socket (`JoinGame`), shows the
player list with ready status, and lets the current player toggle ready
(optimistic, via `useGameSession().toggleReady`). Redirects to
`/[gameId]/table` as soon as the join ack reports `status: 'playing'` or a
live `GameStarted` broadcast arrives.

Depends only on `@/shared/socket` — no other feature module.
