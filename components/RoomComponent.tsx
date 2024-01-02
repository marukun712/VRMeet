import {
    LocalAudioStream,
    LocalP2PRoomMember,
    LocalStream,
    LocalVideoStream,
    RoomPublication,
    SkyWayAuthToken,
    LocalDataStream,
    DataStreamMessageType,
    SkyWayContext,
    SkyWayRoom,
    SkyWayStreamFactory,
    nowInSec,
    uuidV4,
} from "@skyway-sdk/room";
import { useEffect, useState, useCallback, useRef } from "react";
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VRM } from '@pixiv/three-vrm'
import { VRMLoader } from '@/lib/motionCapture/VRMLoader';
import { Holistic, Results } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { animateVRM } from "@/lib/motionCapture/animateVRM";
import { motionData, userAndVRMData } from "@/types";

export default function RoomComponent() {
    const [scene, setScene] = useState<THREE.Scene>();
    const [myVRM, setMyVRM] = useState<userAndVRMData>();
    const [dataStream, setDataStream] = useState<LocalDataStream>();

    const otherVRMData: userAndVRMData[] = []
    const cameraRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const effectRan = useRef(false)

    useEffect(() => {
        //2回実行されるのを防ぐ
        if (effectRan.current === false) {
            (async () => {
                //Three.jsシーンのSetup
                // レンダラー
                if (canvasRef.current == null) { return; }
                const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(window.devicePixelRatio);

                // カメラ
                const orbitCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
                orbitCamera.position.set(0.0, 1.4, 7);

                // コントロール
                const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
                orbitControls.screenSpacePanning = true;
                orbitControls.target.set(0.0, 1.4, 0.0);
                orbitControls.update();

                // シーンを作成
                const scene = new THREE.Scene();
                scene.background = new THREE.Color("#5AFF19")
                setScene(scene)

                // ライト
                const light = new THREE.DirectionalLight(0xffffff);
                light.position.set(1.0, 1.0, 1.0).normalize();
                scene.add(light);

                //アニメーション
                function animate() {
                    requestAnimationFrame(animate); //loop
                    renderer.render(scene, orbitCamera);
                }
                animate();
            })()

            return () => {
                effectRan.current = true
            }
        }
    }, [])

    //トークンの取得
    const getToken = async () => {
        const response = await fetch("/api/getSkyWayToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const apiResponse = await response.json();
        if (response.ok) {
            if (apiResponse.isSuccess) {
                //token
                const apiResponseBody = apiResponse.body;
                return apiResponseBody.skywayToken;
            } else {
                const apiResponseBody = apiResponse.body;
                console.error(apiResponseBody.errorMessage);
            }
        } else {
            console.error("connectionError");
            console.log(response)
        }
    };

    const sendMessage = async (motionData: Results) => {
        if (dataStream == null || myVRM == null) { return }
        const data: motionData = await { "user": myVRM.user.id, "motion": motionData };
        //メッセージの送信
        await dataStream.write(data);
    }

    const startMediaPipeTracking = useCallback(async () => {
        //cameraを取得  
        if (cameraRef == null) { return };
        let videoElement: HTMLVideoElement | null = cameraRef.current
        if (videoElement == null) { return };

        // トラッキング後のコールバック関数
        const onResults = (results: Results) => {
            if (videoElement == null || myVRM == null) { return };
            sendMessage(results)
            animateVRM(myVRM.vrm, results, videoElement); //VRMモデルを動かす
        };

        //modelのロード (ロード中はタブがハングする仕様)
        const holistic = new Holistic({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
            },
        });

        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            refineFaceLandmarks: true,
        });
        // トラッキング後のコールバック関数を指定
        holistic.onResults(onResults);

        // MediaPipe CameraのSetup
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                if (videoElement == null) { return };
                await holistic.send({ image: videoElement });
            },
            width: 1280, //解像度を下げるほどFPSが向上する
            height: 720,
        });
        camera.start();
    }, [cameraRef, myVRM])

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

    //ルーム参加時の処理
    const joinRoom = useCallback(async () => {
        //VRMモデルの読み込み
        let myVRMModel: VRM = await VRMLoader("School-girl-sample.vrm")

        //シーンに追加
        if (scene == null) { return; }
        scene.add(myVRMModel.scene);
        myVRMModel.scene.rotation.y = Math.PI; // モデルが正面を向くように180度回転させる

        const token: string = await getToken();

        //dataStreamを作成
        const dataStream = await SkyWayStreamFactory.createDataStream();
        setDataStream(dataStream)

        if (token == null || dataStream == null) return;
        const context = await SkyWayContext.Create(token);

        //roomの作成
        const room = await SkyWayRoom.FindOrCreate(context, {
            type: "p2p",
            name: "hogefuga",
        });

        //同時接続数を最大3名までに設定
        if (room.members.length >= 3) {
            console.log("人数が上限に達しています");
            return;
        }

        //入室
        let me = await room.join({ metadata: "hogefuga" }); //メタデータになにかしらの情報を付与する
        let myVRM: userAndVRMData = { user: me, vrm: myVRMModel }
        setMyVRM(myVRM)

        //dataStreamをpublishする
        await me.publish(dataStream);

        room.members.forEach((e) => {
            console.log(e)
        })

        room.onMemberJoined.add(async (e) => {
            //VRMモデルの読み込み
            let otherVRMModel: VRM = await VRMLoader("sample.vrm")
            scene.add(otherVRMModel.scene);
            otherVRMModel.scene.rotation.y = Math.PI;

            let remoteMemberVRM: userAndVRMData = { user: e.member, vrm: otherVRMModel }
            otherVRMData.push(remoteMemberVRM)
        })

        //ルームのpublicationsをsubscribeしておく
        room.publications.forEach((e) => subscribeAndAttach(e, me));

        //publicationsの追加時に実行
        room.onStreamPublished.add((e) => subscribeAndAttach(e.publication, me));

    }, [scene, dataStream, myVRM, otherVRMData])

    //myVRMの更新時に姿勢推定を開始
    useEffect(() => {
        if (myVRM == null) { return }
        startMediaPipeTracking();
    }, [myVRM])

    return (
        <div>
            <button className="btn" onClick={joinRoom}>join</button>
            {myVRM?.user.id ? myVRM.user.id : ""}
            <div>
                <video className="hidden" width="1280px" height="720px" ref={cameraRef}></video>
                <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>
        </div>
    );
};


