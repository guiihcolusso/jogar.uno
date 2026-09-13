# dashboard

Lobby list (`/`): fetches open games via `GET /games` (`services/games.service.ts`)
and refetches whenever the server broadcasts the empty-payload `GameListUpdated`
socket event (`hooks/useGames.hook.ts`). "CREATE NEW GAME" emits `CreateGame`
through `useGameSession()` (from `@/shared/socket`) and navigates to `/[gameId]`.

Depends only on `@/shared/socket` (protocol types + session) and `@/shared/http`
— no other feature module.
