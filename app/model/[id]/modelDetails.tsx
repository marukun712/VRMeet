"use client";
import { useRef, useEffect, useState } from "react";
import {
  createClientComponentClient,
  Session,
} from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import { useThreeJS } from "@/hooks/useThreeJS";
import { useRouter } from "next/navigation";
import { VRM } from "@pixiv/three-vrm";
import { VRMLoader } from "@/utils/motionCapture/VRMLoader";
import MetaData from "@/components/model/metaData";
import { VRMMeta } from "@pixiv/three-vrm";

export default function ModelDetails({ session }: { session: Session | null }) {
  const router = useRouter();
  const id = useParams().id; //パスパラメーターからmodelのidを取得
  const supabase = createClientComponentClient();

  if (!session) {
    alert("先にログインしてください！");
    router.push("/");
    return;
  }
  if (typeof id !== "string") {
    alert("ルームIDの取得に失敗しました。");
    return;
  }

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { scene, createTransformControls } = useThreeJS(canvasRef); //ThreeJS Sceneの作成
  const [meta, SetMeta] = useState<VRMMeta>();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("models")
        .select("url")
        .eq("id", id)
        .single();

      if (!data) return;
      //VRMモデルの読み込み
      let myVRMModel: VRM = await VRMLoader(data.url);

      SetMeta(myVRMModel.meta);

      myVRMModel.scene.rotation.y = Math.PI; // モデルが正面を向くように180度回転させる
      createTransformControls(myVRMModel.scene)!;

      if (!scene) return;

      scene.add(myVRMModel.scene);
    })();
  }, [scene]);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      {meta ? <MetaData meta={meta} /> : ""}
    </div>
  );
}
