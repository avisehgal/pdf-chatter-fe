import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.headers.get('authorization');

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // If you have more complex logic, add it here
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
