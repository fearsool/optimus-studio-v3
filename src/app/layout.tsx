import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Alinin Kişisel Asistanı',
    description: 'Ali Erden için HuggingFace tabanlı akıllı seyahat ve üretim asistanı',
}

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-black text-white antialiased">
                <ErrorBoundary>
                    <AuthGuard>
                        {children}
                    </AuthGuard>
                </ErrorBoundary>
            </body>
        </html>
    )
}
