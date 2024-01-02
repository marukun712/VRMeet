import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VRM } from '@pixiv/three-vrm'
import { RefObject, useEffect } from 'react';
import { startMediaPipeTracking } from '@/lib/motionCapture/startMediaPipeTracking';
import { VRMLoader } from '@/lib/motionCapture/VRMLoader';

type Props = {
    cameraRef: RefObject<HTMLVideoElement | null>
    vrmPath: string
}

export default function ThreeJsScene(props: Props): JSX.Element {
    useEffect(() => {
        (async () => {
            //Three.jsシーンのSetup

            // レンダラー
            const renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            document.body.appendChild(renderer.domElement);

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

            // ライト
            const light = new THREE.DirectionalLight(0xffffff);
            light.position.set(1.0, 1.0, 1.0).normalize();
            scene.add(light);

            //VRMモデルの読み込み
            let currentVrm: VRM = await VRMLoader(props.vrmPath)
            scene.add(currentVrm.scene);
            currentVrm.scene.rotation.y = Math.PI; // モデルが正面を向くように180度回転させる

            //アニメーション
            const clock = new THREE.Clock();
            function animate() {
                requestAnimationFrame(animate);//loop

                if (currentVrm) {
                    // 物理を描画するためにモデルの更新を行う
                    currentVrm.update(clock.getDelta());
                }
                renderer.render(scene, orbitCamera);
            }
            animate();

            if (props.cameraRef == null) { return };
            //cameraを取得  
            let videoElement: HTMLVideoElement | null = props.cameraRef.current

            if (videoElement == null) { return };
            //MediaPipeでトラッキングを開始
            startMediaPipeTracking(videoElement, currentVrm)
        })()
    })

    return (
        <></>
    )
}