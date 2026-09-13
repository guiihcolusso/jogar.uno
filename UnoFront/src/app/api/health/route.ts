import { NextResponse } from 'next/server'

import packageJson from '@/../package.json'

export async function GET() {
  return NextResponse.json(
    {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      uptime: process.uptime(),
    },
    { status: 200 },
  )
}
