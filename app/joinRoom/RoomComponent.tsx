"use client"
import {
    LocalP2PRoomMember,
    RoomPublication,
    LocalDataStream,
    SkyWayContext,
    SkyWayRoom,
    SkyWayStreamFactory,
    RoomMember
} from "@skyway-sdk/room";
import { useEffect, useState, useCallback, useRef } from "react";
import { VRM } from '@pixiv/three-vrm'
import { VRMLoader } from '@/lib/motionCapture/VRMLoader';
import { animateVRM } from "@/lib/motionCapture/animateVRM";
import { getToken } from "@/lib/skyway/getToken";
import { userAndVRMData } from "@/types";
import { Session } from '@supabase/auth-helpers-nextjs'
import { useSearchParams } from "next/navigation";
import { fetchModelURLFromID } from "@/lib/supabase/fetchModelFromID";
import { useUser } from "@/hooks/useUser";
import { useThreeJS } from "@/hooks/useThreeJS";
import { startMediaPipeTracking } from "@/lib/motionCapture/startMediaPipeTracking";

export default function JoinRoomDynamicComponent({ session }: { session: Session | null }) {
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); //ルームIDの取得

    if (!session) {
        alert("先にログインしてください！")
        return
    }

    const [myVRM, setMyVRM] = useState<userAndVRMData>();
    const [dataStream, setDataStream] = useState<LocalDataStream>();
    const otherVRMData: userAndVRMData[] = []

    const { modelURL, user } = useUser(session) //ユーザーデータの取得
    const cameraRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { scene } = useThreeJS(canvasRef); //ThreeJS Sceneの作成

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

    const addRemoteUserModel = async (user: RoomMember) => {
        if (user.metadata == null || scene == null) { return }
        let url = await fetchModelURLFromID(user.metadata)
        if (!url) { return };
        //VRMモデルの読み込み
        let otherVRMModel: VRM = await VRMLoader(url)
        scene.add(otherVRMModel.scene);
        otherVRMModel.scene.rotation.y = Math.PI;

        let remoteMemberVRM: userAndVRMData = { user: user, vrm: otherVRMModel } //idからモデルを参照できるようにユーザーデータとモデルデータをオブジェクトに格納
        otherVRMData.push(remoteMemberVRM)
    }

    //ルーム参加時の処理
    const joinRoom = useCallback(async () => {
        if (typeof modelURL !== "string") { return }
        //VRMモデルの読み込み
        let myVRMModel: VRM = await VRMLoader(modelURL)

        //シーンに追加
        if (scene == null) { return; }
        scene.add(myVRMModel.scene);

        myVRMModel.scene.rotation.y = Math.PI; // モデルが正面を向くように180度回転させる

        const token: string = await getToken();

        //dataStreamを作成
        const dataStream = await SkyWayStreamFactory.createDataStream();
        setDataStream(dataStream)

        if (token == null || dataStream == null || id == null) return;
        const context = await SkyWayContext.Create(token);

        //roomの取得
        const room = await SkyWayRoom.Find(context, {
            name: id,
        }, "p2p");

        //同時接続数を最大3名までに設定
        if (room.members.length >= 3) {
            console.log("人数が上限に達しています");
            return;
        }

        //入室
        let me = await room.join({ metadata: user?.id }); //メタデータにSupabaseのユーザーIDを付与する
        let myVRM: userAndVRMData = { user: me, vrm: myVRMModel }
        setMyVRM(myVRM)

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

        //ルームのpublicationsをsubscribeしておく
        room.publications.forEach((e) => subscribeAndAttach(e, me));

        //publicationsの追加時に実行
        room.onStreamPublished.add((e) => subscribeAndAttach(e.publication, me));
    }, [scene, dataStream, myVRM, otherVRMData, modelURL])

    //Sceneの作成後にルームに参加
    useEffect(() => {
        if (scene == null && modelURL == null) { return }
        joinRoom();
    }, [scene, modelURL])

    //myVRMの更新時に姿勢推定を開始
    useEffect(() => {
        if (myVRM == null || dataStream == null) { return }
        startMediaPipeTracking(cameraRef, dataStream, myVRM);
    }, [myVRM])

    return (
        <div>
            {myVRM?.user.id ? myVRM.user.id : ""}
            <div>
                <video className="hidden" width="1280px" height="720px" ref={cameraRef}></video>
                <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>
        </div>
    );
};


