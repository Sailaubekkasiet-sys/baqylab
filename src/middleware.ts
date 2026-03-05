import { withAuth } from 'next-auth/middleware';

export default withAuth({
    callbacks: {
        authorized: ({ token, req }) => {
            const { pathname } = req.nextUrl;

            // Public routes
            if (
                pathname === '/' ||
                pathname === '/login' ||
                pathname === '/register' ||
                pathname.startsWith('/api/auth')
            ) {
                return true;
            }

            // All other routes require authentication
            return !!token;
        },
    },
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
    ],
};
