import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const hasGuestCookie = request.cookies.get('guest_mode')?.value === 'true'

  const url = request.nextUrl.clone()

  // Protected routes check
  const isProtectedRoute = 
    url.pathname.startsWith('/match') || 
    url.pathname.startsWith('/profile') || 
    url.pathname.startsWith('/leaderboard') ||
    url.pathname.startsWith('/admin')

  if (isProtectedRoute && !user && !hasGuestCookie) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and tries to access /login or root, redirect to match/latest
  if ((url.pathname === '/login' || url.pathname === '/') && (user || hasGuestCookie)) {
    url.pathname = '/match/latest'
    return NextResponse.redirect(url)
  }

  if (url.pathname === '/' && !user && !hasGuestCookie) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|sitemap.xml|robots.txt).*)',
  ],
}
