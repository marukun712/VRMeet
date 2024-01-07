import { useCallback, useEffect, useState } from 'react'
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const useUser = (session: Session) => {
    const supabase = createClientComponentClient()
    const [loading, setLoading] = useState(true)
    const [fullname, setFullname] = useState<string | null>(null)
    const [username, setUsername] = useState<string | null>(null)
    const [avatarURL, setAvatarUrl] = useState<string | null>(null)
    const [modelURL, setModelURL] = useState<string | null>(null)
    const user = session?.user

    const getProfile = useCallback(async () => {
        try {
            setLoading(true)

            //DBから自分のユーザーデータを取得
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`full_name, username, avatar_url,model_url`)
                .eq('id', user?.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setFullname(data.full_name)
                setUsername(data.username)
                setAvatarUrl(data.avatar_url)
                setModelURL(data.model_url)
            }
        } catch (error) {
            alert('ユーザーデータの取得に失敗しました。')
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => {
        getProfile()
    }, [user, getProfile])

    return { loading, setLoading, fullname, setFullname, username, setUsername, avatarURL, setAvatarUrl, modelURL, setModelURL, user }
}