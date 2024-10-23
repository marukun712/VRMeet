"use client";
import {
  LocalP2PRoomMember,
  RoomPublication,
  LocalDataStream,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  RoomMember,
  DataStreamMessageType,
} from "@skyway-sdk/room";
import { useEffect, useState, useCallback, useRef } from "react";
import { VRM } from "@pixiv/three-vrm";
import { VRMLoader } from "@/utils/motionCapture/VRMLoader";
import { animateVRM } from "@/utils/motionCapture/animateVRM";
import { getToken } from "@/utils/skyway/getToken";
import { userAndVRMData, motionData, controlData } from "@/types";
import { Session } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import { fetchModelURLFromID } from "@/utils/supabase/fetchModelFromID";
import { useUser } from "@/hooks/useUser";
import { useThreeJS } from "@/hooks/useThreeJS";
import { startMediaPipeTracking } from "@/utils/motionCapture/startMediaPipeTracking";
import RoomMenu from "@/components/room/roomMenu";
import { useRouter } from "next/navigation";
import { fetchUserNameFromID } from "@/utils/supabase/fetchUserNameFromID";
import LoadingModal from "@/components/ui/loadingModal";
import { siteURL } from "@/constants/siteURL";
import Modal from "@/components/ui/modal";

export default function JoinRoomDynamicComponent({
  session,
}: {
  session: Session | null;
}) {
  const router = useRouter();
  const id = useParams().id; //パスパラメーターからルームIDを取得
  if (!session) {
    alert("先にログインしてください！");
    router.push("/");
    return;
  }
  if (typeof id !== "string") {
    alert("ルームIDの取得に失敗しました。");
    return;
  }

  const [loading, setIsLoading] = useState(true);
  const [myVRM, setMyVRM] = useState<userAndVRMData>();
  const [log, setLog] = useState<string[]>([]);
  const [dataStream, setDataStream] = useState<LocalDataStream>();
  let controls: controlData[] = [];
  let otherVRMData: userAndVRMData[] = [];
  let usedSpawnPoint = false;

  const { modelURL, user } = useUser(session); //ユーザーデータの取得
  const cameraRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { scene, createTransformControls } = useThreeJS(canvasRef); //ThreeJS Sceneの作成

  const finishLoading = useCallback(() => {
    let modal: any = document.getElementById("hint");
    modal.showModal();
    setIsLoading(false);
  }, [loading]);

  //publicationを購読して他ユーザーから送信されたモーションデータをモデルに反映する
  const subscribeAndAttach = async (
    publication: RoomPublication,
    me: LocalP2PRoomMember
  ) => {
    //自分のメッセージを除外する
    if (me == null || publication.publisher.id === me.id) return;
    const { stream } = await me.subscribe(publication.id);

    //TypeがdataStreamなら
    switch (stream.contentType) {
      case "data": {
        //streamの追加時に実行
        stream.onData.add((data: DataStreamMessageType) => {
          let motionData = data as motionData;
          let target = otherVRMData.find((e) => e.user.id == motionData.user); //VRMデータの中からpublisherのモデルを探す

          if (
            target == null ||
            cameraRef == null ||
            cameraRef.current == null
          ) {
            return;
          }
          animateVRM(target.vrm, motionData.motion, cameraRef.current); //適当なHTMLVideoElement要素を渡す
        });
      }
    }
  };

  //リモートユーザーのモデルをシーンに追加する
  const addRemoteUserModel = async (user: RoomMember) => {
    if (user.metadata == null || scene == null) {
      alert("ユーザーデータの取得に失敗しました。");
      return;
    }
    let userName = await fetchUserNameFromID(user.metadata);
    setLog((pre) => [...pre, `${userName}さんが参加しました。`]);

    let url = await fetchModelURLFromID(user.metadata);
    if (!url) {
      url =
        "https://iovskyppmnvtlcenixfn.supabase.co/storage/v1/object/public/models/AliciaSolid.vrm?t=2024-10-23T10%3A57%3A22.844Z";
    } //初期モデルをロード
    //VRMモデルの読み込み
    let otherVRMModel: VRM = await VRMLoader(url);
    scene.add(otherVRMModel.scene);
    if (!usedSpawnPoint) {
      //モデルの初期位置が被らないように切り替え
      otherVRMModel.scene.position.x = 2;
      usedSpawnPoint = true;
    } else {
      otherVRMModel.scene.position.x = -2;
    }

    otherVRMModel.scene.rotation.y = Math.PI;

    let transformControls = createTransformControls(otherVRMModel.scene)!; //モデルの位置を調節するためのコントロールの作成とIDとの紐づけ
    controls.push({ control: transformControls, id: user.id });

    let remoteMemberVRM: userAndVRMData = { user: user, vrm: otherVRMModel }; //idからモデルを参照できるようにユーザーデータとモデルデータをオブジェクトに格納
    otherVRMData.push(remoteMemberVRM);
  };

  //リモートユーザー退出時にシーンからモデルを削除する
  const removeRemoteUserModel = async (user: RoomMember) => {
    if (user.metadata == null || scene == null) {
      alert("ユーザーデータの取得に失敗しました。");
      return;
    }
    let userName = await fetchUserNameFromID(user.metadata);
    setLog((pre) => [...pre, `${userName}さんが退出しました。`]);

    let targetModel = otherVRMData.find((e) => e.user.id == user.id); //VRMデータの中から退出ユーザーのモデルを探す
    let targetControl = controls.find((e) => e.id == user.id); //VRMデータの中から退出ユーザーのモデルを探す

    if (targetModel == null || targetControl == null) {
      return;
    }
    scene.remove(targetModel.vrm.scene); //モデルを削除
    targetControl.control.detach();
    targetControl.control.dispose(); //コントロールを削除
    otherVRMData = otherVRMData.filter((e) => e.user.id !== user.id); //配列からユーザーの要素を削除
  };

  //ルーム参加時の処理
  const joinRoom = useCallback(
    async (model: string) => {
      try {
        if (model == null) {
          return;
        }
        //VRMモデルの読み込み
        let myVRMModel: VRM = await VRMLoader(model);

        //シーンに追加
        if (scene == null) {
          alert("シーンが作成されていません。ページをリロードしてください。");
          return;
        }
        myVRMModel.scene.rotation.y = Math.PI; // モデルが正面を向くように180度回転させる
        createTransformControls(myVRMModel.scene)!;

        scene.add(myVRMModel.scene);

        const token: string = await getToken();

        //dataStreamを作成
        const dataStream = await SkyWayStreamFactory.createDataStream();
        setDataStream(dataStream);

        if (token == null || dataStream == null) {
          return;
        }
        const context = await SkyWayContext.Create(token);

        //roomの取得
        const room = await SkyWayRoom.FindOrCreate(context, {
          type: "p2p",
          name: id,
        });

        //同時接続数を最大3名までに
        if (room.members.length >= 3) {
          alert("ルームの同時接続人数が上限に達しています!");
          return;
        }

        //入室
        let me = await room.join({ metadata: user?.id }); //メタデータにSupabaseのユーザーIDを付与する
        let myVRM: userAndVRMData = { user: me, vrm: myVRMModel };
        setMyVRM(myVRM);
        setLog((pre) => [
          ...pre,
          `ルームID${room.name}でルームに参加しました。`,
        ]);

        //dataStreamをpublishする
        await me.publish(dataStream);

        //既に参加しているメンバーのモデルをロード
        room.members.forEach(async (e) => {
          if (e.state == "joined" && e.id !== myVRM.user.id) {
            addRemoteUserModel(e);
          }
        });

        //メンバーの参加時にモデルをロード
        room.onMemberJoined.add(async (e) => {
          addRemoteUserModel(e.member);
        });

        //メンバーの退出時にモデルを削除
        room.onMemberLeft.add(async (e) => {
          removeRemoteUserModel(e.member);
        });

        //ルームのpublicationsをsubscribeしておく
        room.publications.forEach((e) => subscribeAndAttach(e, me));

        //publicationsの追加時に実行
        room.onStreamPublished.add((e) =>
          subscribeAndAttach(e.publication, me)
        );
      } catch (e) {
        alert("ルームの入室中にエラーが発生しました。再試行してください。");
      }
    },
    [scene, dataStream, myVRM, otherVRMData]
  );

  useEffect(() => {
    if (scene == null && loading) {
      return;
    }
    if (modelURL == null) {
      alert(
        "アップロードされたモデルが見つかりませんでした。代わりに初期モデルをロードします。"
      );
      joinRoom(
        "https://iovskyppmnvtlcenixfn.supabase.co/storage/v1/object/public/models/AliciaSolid.vrm?t=2024-10-23T10%3A57%3A22.844Z"
      ); //初期モデルを使用する
      return;
    }

    joinRoom(modelURL);
  }, [modelURL]);

  //myVRMの更新時に姿勢推定を開始
  useEffect(() => {
    if (myVRM == null || dataStream == null) {
      return;
    }
    startMediaPipeTracking(cameraRef, dataStream, myVRM, finishLoading);
  }, [myVRM]);

  return (
    <div>
      {id && scene && myVRM ? (
        <RoomMenu
          roomID={id}
          roomURL={`${siteURL}/room/${id}`}
          scene={scene}
          me={myVRM.user}
        />
      ) : (
        ""
      )}
      {loading ? (
        <LoadingModal message="ルームに参加中です。タブがフリーズすることがありますが、数秒で改善しますのでそのままお待ちください。" />
      ) : (
        ""
      )}
      <Modal id="hint">
        <img src="/images/machine_3d_scanner.png" className="py-5 m-auto"></img>
        <h1>
          Webカメラに全身が移る位置に移動すると、より正確に姿勢を反映できるようになります。
        </h1>
      </Modal>

      {/* ログの表示 */}
      <div className="absolute bottom-14 right-14 w-96 h-64 overflow-scroll hidden md:block">
        {log.map((log: string) => {
          return <h1>{log}</h1>;
        })}
      </div>
      <div>
        <video
          className="hidden"
          width="1280px"
          height="720px"
          ref={cameraRef}
        ></video>
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
}
