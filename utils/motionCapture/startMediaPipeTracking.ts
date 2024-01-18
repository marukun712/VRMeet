import { RefObject } from "react"
import { Results } from "@mediapipe/holistic"
import { LocalDataStream } from "@skyway-sdk/room"
import { userAndVRMData, motionData } from "@/types"
import { animateVRM } from "@/utils/motionCapture/animateVRM"
import { Holistic } from "@mediapipe/holistic"
import { Camera } from "@mediapipe/camera_utils"

export const startMediaPipeTracking = (cameraRef: RefObject<HTMLVideoElement>, dataStream: LocalDataStream, myVRM: userAndVRMData, finishLoading: () => void) => {
    let loading = true;

    const sendMessage = async (motionData: Results) => {
        if (dataStream == null || myVRM == null) { return }
        const data: motionData = await { "user": myVRM.user.id, "motion": motionData };
        //メッセージの送信
        await dataStream.write(data);
    }

    //cameraを取得  
    if (cameraRef == null) { return };
    let videoElement: HTMLVideoElement | null = cameraRef.current
    if (videoElement == null) { return };

    // トラッキング後のコールバック関数
    const onResults = (results: Results) => {
        if (videoElement == null || myVRM == null) { return }; //自分のVRMモデルがロード済みなら
        if (loading) { finishLoading(); loading = false; }
        sendMessage(results) //モーションデータを送信
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

    const startCamera = async () => {
        let promise = camera.start();

        promise.then((_) => {
            console.log("カメラを正常に開始しました。")
        }).catch((error) => {
            alert("カメラ映像の取得に失敗しました。カメラの使用権限を付与して再度参加してください。")
            location.href = "/"
        });
    }

    startCamera();
}
