'use client'
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChangeEvent } from 'react'
import LoadingModal from '@/components/LoadingModal'
import UserIcon from './UserIcon'
import SignOutForm from './SignOutForm'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { v4 } from 'uuid'
import { useModel } from '@/hooks/useModel'
import ModelDetails from './ModelDetails'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { siteURL } from '@/constants/siteURL'
import { Bagel_Fat_One } from "next/font/google";
import Header from '@/components/Header'
import Drawer from '@/components/Drawer'

const BagelFatOne = Bagel_Fat_One({
    weight: "400",
    subsets: ["latin"],
});

export default function Dashboard({ session }: { session: Session | null }) {
    const supabase = createClientComponentClient();

    if (!session) { return }
    const { loading, setLoading, fullname, setFullname, username, setUsername, modelURL, setModelURL, avatarURL, user } = useUser(session); //ユーザーデータの取得
    const { myModels } = useModel(user.id);
    const [roomID, setRoomID] = useState("");
    const router = useRouter();

    //ユーザーネームの更新
    const updateProfile = async ({
        fullname,
    }: {
        fullname: string | null
    }) => {
        try {
            setLoading(true)

            let { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                full_name: fullname,
                username: username,
                avatar_url: avatarURL,
                model_url: modelURL,
                updated_at: new Date().toISOString(),
            })
            if (error) { throw error }
            alert('プロフィールが更新されました!')
        } catch (error) {
            alert('プロフィールの更新にエラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    //モデルの更新
    const updateModel = async ({
        model_url
    }: {
        model_url: string | null
    }) => {
        try {
            setLoading(true)
            let { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                full_name: fullname,
                username: username,
                avatar_url: avatarURL,
                model_url,
                updated_at: new Date().toISOString(),
            })
            if (error) { throw error }
            alert('モデルが更新されました!')
            location.reload();
        } catch (error) {
            alert('モデルの更新にエラーが発生しました。')
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
            alert("モデルのアップロードに失敗しました。")
        }

        if (data) {
            alert("モデルのアップロードに成功しました!")
        }
    }

    const removeModel = async (id: string, name: string) => {
        const { data } = await supabase
            .storage
            .from('models')
            .remove([`${user.id}/${name}`])

        const { error } = await supabase
            .from('models')
            .delete()
            .eq('id', id)

        if (error) {
            alert("モデルの削除に失敗しました。")
        }

        let model_url = null //エラーを防ぐため自分のmodel_urlテーブルからからモデルのURLを削除する
        updateModel({ model_url })
        alert("モデルを削除しました。")
        location.reload();
    }

    const getFileURL = async (path: string) => {
        const { data } = await supabase
            .storage
            .from('models')
            .getPublicUrl(path)

        return data.publicUrl
    }

    //モデル一覧テーブルにモデル情報を追加する
    const addModelToModelTable = async (model_url: string, name: string) => {
        const { error } = await supabase
            .from('models')
            .insert({ id: v4(), url: model_url, name: name, user_id: user.id })

        if (error) {
            console.error(error)
            alert("モデルデータの追加に失敗しました。")
        }
    }

    const handleVRMChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length == 0) {
            return
        }

        const file = event.target.files[0]
        const extension = file.name.split('.').pop();
        if (extension !== "vrm") {
            alert(".vrmのファイルのみアップロード可能です。")
        } else {
            uploadModel(file)
            let model_url = await getFileURL(`${user?.id}/${file.name}`)
            addModelToModelTable(model_url, file.name);
            setModelURL(model_url)
            updateModel({ model_url });
        }
    }

    return (
        <div>
            <Header font={BagelFatOne} />
            <Drawer>
                {loading ? <LoadingModal message="ユーザーデータを取得中..." /> : ""}
                <div className='flex py-5'>
                    <div>
                        {fullname ? <h1 className='text-2xl py-10 text-center'>{fullname}さん、ようこそ。</h1> : ""}
                        {avatarURL ? <UserIcon avatarURL={avatarURL} /> : ""}

                        <div className='flex'>
                            <input
                                type="text"
                                value={roomID || ''}
                                placeholder='ルームIDを入力して参加...'
                                className='input input-bordered input-primary w-full max-w-xs m-2'
                                onChange={(e) => setRoomID(e.target.value)}
                            />
                            <button className="btn btn-primary m-auto" onClick={() => router.push(`${siteURL}/joinRoom?id=${roomID}`)}>ルームに参加</button>
                        </div>

                        <Modal id="model_setting">
                            <h1 className='text-2xl'>モデル設定</h1>

                            <h1>アップロードされているモデル</h1>
                            {myModels.map((data) => {
                                if (modelURL === data.url) {
                                    return (
                                        <div className='py-10'>
                                            <h1 className='w-20 rounded-full text-center bg-green-500'>使用中</h1>
                                            <ModelDetails url={data.url} name={data.name} id={data.id} changeMainModel={updateModel} removeModel={removeModel} />
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className='py-10'>
                                            <ModelDetails url={data.url} name={data.name} id={data.id} changeMainModel={updateModel} removeModel={removeModel} />
                                        </div>
                                    )
                                }

                            })}
                            <p>モデルをアップロード</p>
                            <input type="file" accept=".vrm" className="file-input w-full max-w-xs my-6" onChange={handleVRMChange} />
                        </Modal>

                        <Modal id="user_setting">
                            <h1 className='text-2xl'>ユーザー情報の編集</h1>
                            <div>
                                <label htmlFor="fullName">ユーザーネーム</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullname || ''}
                                    className='input input-bordered input-primary w-full max-w-xs m-2'
                                    onChange={(e) => setFullname(e.target.value)}
                                />
                            </div>
                            <div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => { if (fullname == undefined) { return; } updateProfile({ fullname }) }}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading ...' : '保存'}
                                </button>
                            </div>
                        </Modal>

                        <div className='py-10 flex justify-center'>
                            <div>
                                <Link href={"/createRoom"} className='btn bg-green-500'>ルームを開く</Link>
                                <SignOutForm />
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    )
}
