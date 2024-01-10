'use client'
import { SocialAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthForm() {
    const supabase = createClientComponentClient()
    const redirectURL = `https://vrmeet-collab.vercel.app/auth/callback`

    return (
        <SocialAuth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={["google"]}
            redirectTo={redirectURL}
        />
    )
}