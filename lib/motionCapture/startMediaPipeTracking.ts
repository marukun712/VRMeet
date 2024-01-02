import { Holistic, Results } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { animateVRM } from './animateVRM';
import { VRM } from '@pixiv/three-vrm';

export function startMediaPipeTracking(videoElement: HTMLVideoElement, targetVRM: VRM) {
    // トラッキング後のコールバック関数
    const onResults = (results: Results) => {
        animateVRM(targetVRM, results, videoElement); //VRMモデルを動かす
    };

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
            await holistic.send({ image: videoElement });
        },
        width: 1280, //解像度を下げるほどFPSが向上する
        height: 720,
    });
    camera.start();
}