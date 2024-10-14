import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCallback } from "react";

export const useModel = (userId: string) => {
  const supabase = createClientComponentClient();

  const [myModels, setMyModels] = useState<
    { url: string; name: string; id: string }[]
  >([]);

  const getModel = useCallback(async () => {
    const { data, error } = await supabase
      .from("models")
      .select("id,url,name")
      .eq("user_id", userId);

    if (data) {
      setMyModels(data);
    }

    if (error) {
      console.error(error);
      alert("モデルデータの取得に失敗しました!");
    }
  }, [supabase]);

  useEffect(() => {
    getModel();
  }, [supabase]);

  return { myModels, setMyModels };
};
