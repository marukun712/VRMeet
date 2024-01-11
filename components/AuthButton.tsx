'use client'
import { SocialAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { siteURL } from '@/constants/siteURL'

export default function AuthForm() {
    const supabase = createClientComponentClient()

    return (
        <SocialAuth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={["google"]}
            redirectTo={`${siteURL}/auth/callback`}
        />
    )
}