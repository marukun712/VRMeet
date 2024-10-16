import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCallback } from "react";

export const useModel = (userId: string) => {
  const supabase = createClientComponentClient();

  const [myModels, setMyModels] = useState<
    { id: string; url: string; name: string; image_url: string }[]
  >([]);

  const getModel = useCallback(async () => {
    const { data, error } = await supabase
      .from("models")
      .select("id,url,name,image_url")
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
