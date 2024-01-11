import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export const fetchUserNameFromID = async (id: string) => {
    try {
        let { data, error, status } = await supabase
            .from('profiles')
            .select(`full_name`)
            .eq('id', id)
            .single()

        if (error && status !== 406) {
            console.log(error)
        }

        if (data) {
            return data.full_name
        }
    } catch (error) {
        alert("リモートユーザーのユーザーネーム取得に失敗しました。")
    }
}