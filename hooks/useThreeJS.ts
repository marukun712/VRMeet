import { RefObject, useEffect, useState } from "react";
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const useThreeJS = (canvasRef: RefObject<HTMLCanvasElement>) => {
    const [scene, setScene] = useState<THREE.Scene>();

    //ThreeJS Sceneの作成
    useEffect(() => {
        (async () => {
            if (!canvasRef || !canvasRef.current) { return }

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
    }, [])

    return { scene, setScene }
}