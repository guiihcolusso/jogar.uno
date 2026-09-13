import { Module } from "@nestjs/common"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "node:path"

/**
 * Serves the card SVGs (and everything else under Assets/, carried over
 * unchanged from the old server) at GET /assets/*. `__dirname` here is
 * dist/static-files at runtime, and dist/Assets is populated at build time
 * by the nest-cli.json "assets" copy config - mirroring the old
 * `tsc && cp -r src/Assets dist/Assets` build step.
 *
 * This module deliberately does NOT live under `src/assets/` - macOS's
 * default case-insensitive filesystem collides that with the actual
 * `src/Assets/` asset directory (same folder on disk despite the casing
 * difference), which broke the TypeScript build.
 */
@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "Assets"),
			serveRoot: "/assets",
			serveStaticOptions: {
				maxAge: 30 * 24 * 60 * 60 * 1000,
			},
		}),
	],
})
export class AssetsModule {}
