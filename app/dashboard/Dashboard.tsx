'use client'
import { useCallback, useEffect, useState } from 'react'
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChangeEvent } from 'react'
import LoadingModal from '@/components/LoadingModal'

export default function Dashboard({ session }: { session: Session | null }) {
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
            alert('Error loading user data!')
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => {
        getProfile()
    }, [user, getProfile])

    async function updateProfile({
        username,
        model_url
    }: {
        username: string | null
        model_url: string | null
    }) {
        try {
            setLoading(true)

            let { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                full_name: fullname,
                username,
                avatar_url: avatarURL,
                updated_at: new Date().toISOString(),
                model_url
            })
            if (error) console.log(error)
            alert('プロフィールが更新されました!')
        } catch (error) {
            alert('プロフィールの更新にエラーが発生しました。')
        } finally {
            setLoading(false)
        }
    }

    const uploadModel = async (file: File) => {
        const { data, error } = await supabase
            .storage
            .from("models")
            .upload(`${user?.id}/${file.name}`, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error(error)
        }
    }

    const getFileURL = async (path: string) => {
        const { data } = await supabase
            .storage
            .from('models')
            .getPublicUrl(path)

        return data.publicUrl
    }

    const handleVRMChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length == 0) {
            return
        }

        const file = event.target.files[0]
        uploadModel(file)

        let model_url = await getFileURL(`${user?.id}/${file.name}`)
        setModelURL(model_url)
        updateProfile({ username, model_url });
    }

    return (
        <div className="form-widget">
            {loading ? <LoadingModal /> : ""}
            <h1 className='text-2xl py-10 text-center'>{username}さん、ようこそ。</h1>
            <div className="avatar justify-center flex">
                <div className="w-24 rounded-full">
                    {avatarURL ? <img src={avatarURL} width={500} height={500} /> : ""}
                </div>
            </div>

            <div>
                <h1>アバターを設定</h1>
                <p>あなたがアプリ内で使いたいVRMモデルをアップロードしてください。</p>
                <input type="file" className="file-input w-full max-w-xs" onChange={handleVRMChange} />
            </div>

            <div>
                <form action="/auth/signout" method="post">
                    <button className="btn" type="submit">
                        Sign out
                    </button>
                </form>
            </div>
        </div>
    )
}
