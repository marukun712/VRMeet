import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies })

    //セッションの存在をチェック
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (session) {
        await supabase.auth.signOut() //セッションが存在すればサインアウト
    }

    return NextResponse.redirect(new URL('/', req.url), {
        status: 302,
    })
}