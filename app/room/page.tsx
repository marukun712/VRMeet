"use client"
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VRM } from '@pixiv/three-vrm'
import { useEffect, useRef } from 'react';
import { setupMediaPipeTracking } from '@/features/motionCapture/setupMediaPipeTracking';
import { VRMLoader } from '@/features/motionCapture/VRMLoader';

export default function Home(): JSX.Element {
    const cameraRef = useRef<HTMLVideoElement>(null);

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

            // ライト
            const light = new THREE.DirectionalLight(0xffffff);
            light.position.set(1.0, 1.0, 1.0).normalize();
            scene.add(light);

            //VRMモデルの読み込み
            let currentVrm: VRM = await VRMLoader("sample.vrm")
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

            let videoElement: HTMLVideoElement | null = cameraRef.current

            if (typeof HTMLVideoElement !== "undefined" && videoElement instanceof HTMLVideoElement) { //型チェック
                setupMediaPipeTracking(videoElement, currentVrm)
            }
        })()

    })

    return (
        <div>
            <video className="hidden" width="1280px" height="720px" ref={cameraRef}></video>
        </div>
    )
}
