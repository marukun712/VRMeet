"use client"
import {
    LocalP2PRoomMember,
    RoomPublication,
    LocalDataStream,
    SkyWayContext,
    SkyWayRoom,
    SkyWayStreamFactory,
    RoomMember,
} from "@skyway-sdk/room";
import { v4 } from "uuid"
import { useEffect, useState, useCallback, useRef } from "react";
import { VRM } from '@pixiv/three-vrm'
import { VRMLoader } from '@/utils/motionCapture/VRMLoader';
import { animateVRM } from "@/utils/motionCapture/animateVRM";
import { getToken } from "@/utils/skyway/getToken";
import { userAndVRMData } from "@/types";
import { Session } from '@supabase/auth-helpers-nextjs'
import { useThreeJS } from "@/hooks/useThreeJS";
import { useUser } from "@/hooks/useUser";
import { fetchModelURLFromID } from "@/utils/supabase/fetchModelFromID";
import { startMediaPipeTracking } from "@/utils/motionCapture/startMediaPipeTracking";
import RoomMenu from "@/components/RoomMenu";
import { useRouter } from 'next/navigation'
import { fetchUserNameFromID } from "@/utils/supabase/fetchUserNameFromID";
import LoadingModal from "@/components/LoadingModal";

export default function CreateRoomDynamicComponent({ session }: { session: Session | null }) {
    const router = useRouter()

    if (!session) {
        alert("先にログインしてください！")
        router.push("/")
        return;
    }

    const [loading, setIsLoading] = useState(true)
    const [myVRM, setMyVRM] = useState<userAndVRMData>();
    const [log, setLog] = useState<string[]>([]);
    const [roomID, setRoomID] = useState<string>();
    const [dataStream, setDataStream] = useState<LocalDataStream>();
    let otherVRMData: userAndVRMData[] = []

    const { modelURL, user } = useUser(session) //ユーザーデータの取得
    const cameraRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { scene } = useThreeJS(canvasRef); //ThreeJS Sceneの作成

    const finishLoading = useCallback(() => {
        setIsLoading(false)
    }, [loading])

    //publicationを購読して他ユーザーから送信されたモーションデータをモデルに反映する
    const subscribeAndAttach = async (publication: RoomPublication, me: LocalP2PRoomMember) => {
        //自分のメッセージを除外する
        if (me == null || publication.publisher.id === me.id) return;
        const { stream } = await me.subscribe(publication.id);

        //TypeがdataStreamなら
        switch (stream.contentType) {
            case 'data': {
                //streamの追加時に実行
                stream.onData.add((data: any) => { //TODO 型エラーの修正
                    let target = otherVRMData.find((e) => e.user.id == data.user) //VRMデータの中からpublisherのモデルを探す

                    if (target == null || cameraRef == null || cameraRef.current == null) { return }
                    animateVRM(target.vrm, data.motion, cameraRef.current) //適当なHTMLVideoElement要素を渡す
                });
            }
        }
    };

    //リモートユーザーのモデルをシーンに追加する
    const addRemoteUserModel = async (user: RoomMember) => {
        if (user.metadata == null || scene == null) { alert("ユーザーデータの取得に失敗しました。"); return; }
        let userName = await fetchUserNameFromID(user.metadata)
        setLog((pre) => [...pre, `${userName}さんが参加しました。`])

        let url = await fetchModelURLFromID(user.metadata)
        if (!url) { alert("リモートユーザーのモデル取得に失敗しました。再度ルームを建て直してください。") };
        //VRMモデルの読み込み
        let otherVRMModel: VRM = await VRMLoader(url)
        scene.add(otherVRMModel.scene);
        otherVRMModel.scene.rotation.y = Math.PI;

        let remoteMemberVRM: userAndVRMData = { user: user, vrm: otherVRMModel } //idからモデルを参照できるようにユーザーデータとモデルデータをオブジェクトに格納
        otherVRMData.push(remoteMemberVRM)
    }

    //リモートユーザー退出時にシーンからモデルを削除する
    const removeRemoteUserModel = async (user: RoomMember) => {
        if (user.metadata == null || scene == null) { alert("ユーザーデータの取得に失敗しました。"); return; }
        let userName = await fetchUserNameFromID(user.metadata)
        setLog((pre) => [...pre, `${userName}さんが退出しました。`])

        let target = otherVRMData.find((e) => e.user.id == user.id) //VRMデータの中から退出ユーザーのモデルを探す

        if (target == null) { return }
        scene.remove(target.vrm.scene) //モデルを削除
        otherVRMData = otherVRMData.filter((e) => e.user.id !== user.id); //配列からユーザーの要素を削除
    }

    //ルーム参加時の処理
    const CreateRoom = useCallback(async () => {
        if (typeof modelURL !== "string") { return }
        //VRMモデルの読み込み
        let myVRMModel: VRM = await VRMLoader(modelURL)

        //シーンに追加
        if (scene == null) { alert("シーンが作成されていません。ページをリロードしてください。"); return; }
        scene.add(myVRMModel.scene);

        myVRMModel.scene.rotation.y = Math.PI; // モデルが正面を向くように180度回転させる

        const token: string = await getToken();

        //dataStreamを作成
        const dataStream = await SkyWayStreamFactory.createDataStream();
        setDataStream(dataStream)

        if (token == null || dataStream == null) return;
        const context = await SkyWayContext.Create(token);

        //roomの作成
        const room = await SkyWayRoom.Create(context, {
            type: "p2p",
            name: v4(), //ルーム名をuuidで自動生成
        });

        //ルーム共有リンクの作成
        setRoomID(room.name)

        //入室
        let me = await room.join({ metadata: user?.id }); //メタデータにSupabaseのユーザーIDを付与する
        let myVRM: userAndVRMData = { user: me, vrm: myVRMModel }
        setMyVRM(myVRM)
        setLog((pre) => [...pre, `ルームID${room.name}でルームを開始しました。`])

        //dataStreamをpublishする
        await me.publish(dataStream);

        //既に参加しているメンバーのモデルをロード
        room.members.forEach(async (e) => {
            if (e.state == "joined" && e.id !== myVRM.user.id) {
                addRemoteUserModel(e)
            }
        })

        //メンバーの参加時にモデルをロード
        room.onMemberJoined.add(async (e) => {
            addRemoteUserModel(e.member)
        })

        //メンバーの退出時にモデルを削除
        room.onMemberLeft.add(async (e) => {
            removeRemoteUserModel(e.member)
        })

        //ルームのpublicationsをsubscribeしておく
        room.publications.forEach((e) => subscribeAndAttach(e, me));

        //publicationsの追加時に実行
        room.onStreamPublished.add((e) => subscribeAndAttach(e.publication, me));
    }, [scene, dataStream, myVRM, otherVRMData, modelURL])

    useEffect(() => {
        if (scene == null && modelURL == null) { return }
        CreateRoom();
    }, [scene, modelURL])

    //myVRMの更新時に姿勢推定を開始
    useEffect(() => {
        if (myVRM == null || dataStream == null) { return }
        startMediaPipeTracking(cameraRef, dataStream, myVRM, finishLoading);
    }, [myVRM])

    return (
        <div>
            {roomID && scene && myVRM ? <RoomMenu roomID={roomID} roomURL={`http://localhost:3000/joinRoom?id=${roomID}`} scene={scene} me={myVRM.user} /> : ""}
            {loading ? <LoadingModal message='ルームに参加中です。タブがフリーズすることがありますが、数秒で改善しますのでそのままお待ちください。' /> : ""}

            {/* ログの表示 */}
            <div className="absolute bottom-14 right-14 w-96 h-64 overflow-scroll hidden md:block">
                {log.map((log: string) => {
                    return (
                        <h1>{log}</h1>
                    )
                })}
            </div>
            <div>
                <video className="hidden" width="1280px" height="720px" ref={cameraRef}></video>
                <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>
        </div>
    );
};


