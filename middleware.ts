import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Gets baseURL leaf and excludes '/'
  let pathname = request.nextUrl.pathname.substring(1, request.nextUrl.pathname.length);

  // Splits nested routes into names
  let splitPaths = pathname.split('/');

  let validRoutes: Array<string> = ["dictionary",];

  switch (validRoutes.findIndex(route => route === splitPaths[0])) {
    case 0: {
      splitPaths.shift();
      pathname = splitPaths.join('/');
      return NextResponse.redirect(new URL(`https://biblion.karnovah.com/`, request.url));
    } 
    default: {
      splitPaths.shift();
      pathname = splitPaths.join('/');
    }
  }

}

export const config = {
  matcher: ['/dictionary'],
}

