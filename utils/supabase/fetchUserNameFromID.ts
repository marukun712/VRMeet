import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export const fetchUserNameFromID = async (id: string) => {
    try {
        let { data, error, status } = await supabase
            .from('profiles')
            .select(`username`)
            .eq('id', id)
            .single()

        if (error && status !== 406) {
            console.log(error)
        }

        if (data) {
            return data.username
        }
    } catch (error) {
        alert("リモートユーザーのユーザーネーム取得に失敗しました。")
    }
}