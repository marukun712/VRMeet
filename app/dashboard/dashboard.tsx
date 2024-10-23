"use client";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { ChangeEvent } from "react";
import LoadingModal from "@/components/ui/loadingModal";
import UserIcon from "../../components/dashboard/userIcon";
import SignOutForm from "../../components/dashboard/signOutForm";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import { v4 } from "uuid";
import { useModel } from "@/hooks/useModel";
import ModelDetails from "../../components/dashboard/modelCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { siteURL } from "@/constants/siteURL";
import Header from "@/components/ui/header";
import Drawer from "@/components/dashboard/drawer";
import { Check, Plus } from "lucide-react";
import { getVRMMeta } from "@/utils/motionCapture/getVRMMeta";

export default function Dashboard({ session }: { session: Session | null }) {
  const supabase = createClientComponentClient();

  if (!session) {
    return;
  }

  const {
    loading,
    setLoading,
    fullname,
    setFullname,
    username,
    modelURL,
    setModelURL,
    avatarURL,
    user,
  } = useUser(session); //ユーザーデータの取得

  const { myModels } = useModel(user.id);
  const [roomID, setRoomID] = useState("");

  const router = useRouter();

  //ユーザーネームの更新
  const updateProfile = async ({ fullname }: { fullname: string | null }) => {
    try {
      setLoading(true);

      let { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullname,
        username: username,
        avatar_url: avatarURL,
        model_url: modelURL,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        throw error;
      }
      alert("プロフィールが更新されました!");
    } catch (error) {
      alert("プロフィールの更新にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  //使用モデルの更新(profile内)
  const updateModel = async ({ model_url }: { model_url: string | null }) => {
    try {
      setLoading(true);
      let { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullname,
        username: username,
        avatar_url: avatarURL,
        model_url,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        throw error;
      }
      alert("モデルが更新されました!");
      location.reload();
    } catch (error) {
      alert("モデルの更新にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const uploadModel = async (id: string, modelFile: File, imageFile: File) => {
    const { error } = await supabase.storage
      .from("models")
      .upload(`${user?.id}/${id}.vrm`, modelFile, {
        cacheControl: "3600",
        upsert: false,
      });

    const { error: imgErr } = await supabase.storage
      .from("models")
      .upload(`${user?.id}/${id}.png`, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      alert("モデルのアップロードに失敗しました。");
    }

    if (imgErr) {
      console.log(imgErr);
      alert("画像のアップロードに失敗しました。");
    }
  };

  const removeModel = async (id: string) => {
    await supabase.storage.from("models").remove([`${user.id}/${id}.vrm`]);
    await supabase.storage.from("models").remove([`${user.id}/${id}.png`]);

    const { error } = await supabase.from("models").delete().eq("id", id);

    if (error) {
      alert("モデルの削除に失敗しました。");
    }

    let model_url = null; //エラーを防ぐため自分のmodel_urlテーブルからからモデルのURLを削除する
    updateModel({ model_url });
    alert("モデルを削除しました。");
    location.reload();
  };

  const getFileURL = async (path: string) => {
    const { data } = await supabase.storage.from("models").getPublicUrl(path);

    return data.publicUrl;
  };

  //モデル一覧テーブルにモデル情報を追加する
  const addModelToModelTable = async (
    id: string,
    model_url: string,
    name: string,
    image_url: string
  ) => {
    const { error } = await supabase
      .from("models")
      .insert({ id, url: model_url, name, image_url, user_id: user.id });

    if (error) {
      console.error(error);
      alert("モデルデータの追加に失敗しました。");
    }
  };

  const handleVRMChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length == 0) {
      return;
    }
    try {
      const file = event.target.files[0];
      const meta = await getVRMMeta(file);
      const id = v4();

      if (!meta || !meta.image) {
        alert("メタデータの取得に失敗しました。");
        return;
      }

      const extension = file.name.split(".").pop(); //.vrm.pngのような拡張子がチェックを通過しないように最後の要素を取得する
      if (extension !== "vrm") {
        alert(".vrmのファイルのみアップロード可能です。");
      } else {
        uploadModel(id, file, meta.image);
        let model_url = await getFileURL(`${user?.id}/${id}.vrm`);
        let image_url = await getFileURL(`${user?.id}/${id}.png`);
        addModelToModelTable(id, model_url, meta.name, image_url);
        setModelURL(model_url);
        updateModel({ model_url });
      }
    } catch (e) {
      alert("VRM 0.xのモデルのみアップロード可能です。");
    }
  };

  return (
    <div>
      <Header />

      <Drawer>
        {loading ? <LoadingModal message="ユーザーデータを取得中..." /> : ""}

        <div className="flex py-5">
          <div>
            {fullname ? (
              <h1 className="text-2xl text-center">
                {fullname}さん、ようこそ。
              </h1>
            ) : (
              ""
            )}
            {avatarURL ? <UserIcon avatarURL={avatarURL} /> : ""}

            <div className="flex">
              <input
                type="text"
                value={roomID || ""}
                placeholder="ルームIDを入力して参加..."
                className="input input-bordered input-primary w-full max-w-xs m-2"
                onChange={(e) => setRoomID(e.target.value)}
              />
              <div
                className="tooltip m-auto"
                data-tip="既存のルームに参加するには、ルームIDまたは招待リンクを共有してもらう必要があります。"
              >
                <button
                  className="btn btn-primary"
                  onClick={() => router.push(`${siteURL}/room/${roomID}`)}
                  disabled={!roomID}
                >
                  既存のルームに参加
                </button>
              </div>
            </div>

            <Modal id="model_setting">
              <h1 className="text-2xl">モデル設定</h1>

              <h1>アップロードされているモデル</h1>
              {myModels.map((data) => {
                if (modelURL === data.url) {
                  return (
                    <div className="py-10">
                      <h1 className="w-20 rounded-full text-center bg-green-500">
                        使用中
                      </h1>
                      <ModelDetails
                        url={data.url}
                        name={data.name}
                        image_url={data.image_url}
                        id={data.id}
                        changeMainModel={updateModel}
                        removeModel={removeModel}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div className="py-10">
                      <ModelDetails
                        url={data.url}
                        name={data.name}
                        image_url={data.image_url}
                        id={data.id}
                        changeMainModel={updateModel}
                        removeModel={removeModel}
                      />
                    </div>
                  );
                }
              })}
              <p>モデルをアップロード</p>
              <p className="text-gray-500 text-sm">
                ※VRM-0.xのVRMモデルにのみ対応しています。
              </p>
              <input
                type="file"
                accept=".vrm"
                className="file-input w-full max-w-xs my-6"
                onChange={handleVRMChange}
              />
            </Modal>

            <Modal id="user_setting">
              <h1 className="text-2xl">ユーザー情報の編集</h1>
              <div>
                <label htmlFor="fullName">ユーザーネーム</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullname || ""}
                  className="input input-bordered input-primary w-full max-w-xs m-2"
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div>
                <p className="text-gray-500 text-sm my-5">
                  ※ボタンをクリックすることで編集が確定されます。
                </p>
                <button
                  className="btn bg-green-500"
                  onClick={() => {
                    if (fullname == undefined) {
                      return;
                    }
                    updateProfile({ fullname });
                  }}
                  disabled={loading || !fullname}
                >
                  <Check />

                  {loading ? "Loading ..." : "保存"}
                </button>
              </div>
            </Modal>

            <div className="py-10 flex justify-center">
              <div>
                <Link href={`/room/${v4()}`} className="btn bg-green-500">
                  <Plus />
                  ルームを新規作成
                </Link>
                <SignOutForm />
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
