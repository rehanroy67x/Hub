import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes
  if (request.nextUrl.pathname.startsWith("/_next") || request.nextUrl.pathname.startsWith("/static")) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req: request, res: response })

    // Refresh session if expired - but don't redirect here
    // Let the client-side auth provider handle redirects
    await supabase.auth.getSession()
  } catch (e) {
    console.error("Middleware error:", e)
  }

  return response
}

// Make sure the middleware allows the auth callback route
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth/callback (auth callback route)
     * - auth/confirm (password reset route)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|auth/callback|auth/confirm|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}
