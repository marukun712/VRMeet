import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'VRMeet',
    description: 'VRMeetは、Web上で手軽に複数人で3Dコラボを行うことができるWebアプリです。',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}): JSX.Element {
    return (
        <html lang="jp" data-theme="cupcake">
            <body>{children}</body>
        </html>
    )
}
