'use client'
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChangeEvent } from 'react'
import LoadingModal from '@/components/LoadingModal'
import UserIcon from './UserIcon'
import SignOutForm from './SignOutForm'
import { useUser } from '@/hooks/useUser'

export default function Dashboard({ session }: { session: Session | null }) {
    const supabase = createClientComponentClient();

    if (!session) { return }
    const { loading, setLoading, fullname, username, setModelURL, avatarURL, user } = useUser(session); //ユーザーデータの取得

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
            alert("アバターのアップロードに失敗しました。")
        }

        if (data) {
            alert("アバターのアップロードに成功しました!")
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

        let model_url = await getFileURL(`${user?.id}/${file.name}`)
        uploadModel(file)

        setModelURL(model_url)
        updateProfile({ username, model_url });
    }

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-center justify-center">
                <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open SideBar</label>

                {loading ? <LoadingModal /> : ""}
                <div className='flex'>
                    <div>
                        {fullname && avatarURL ? <UserIcon username={fullname} avatarURL={avatarURL} /> : ""}
                        <div className='py-10'>
                            <h1 className='text-2xl'>アバターを設定</h1>
                            <p>あなたがアプリ内で使いたいVRMモデルをアップロードしてください。</p>
                            <input type="file" className="file-input w-full max-w-xs my-6" onChange={handleVRMChange} />
                        </div>
                        <SignOutForm />
                    </div>
                </div>

            </div>

            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                    <li><a>Sidebar Item 1</a></li>
                    <li><a>ユーザー情報の編集</a></li>
                </ul>
            </div>
        </div>
    )
}
