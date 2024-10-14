import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export const fetchModelURLFromID = async (id: string) => {
  try {
    let { data, error, status } = await supabase
      .from("profiles")
      .select(`model_url`)
      .eq("id", id)
      .single();

    if (error && status !== 406) {
      console.log(error);
    }

    if (data) {
      return data.model_url;
    }
  } catch (error) {
    alert("リモートユーザーのモデル取得に失敗しました。");
  }
};
