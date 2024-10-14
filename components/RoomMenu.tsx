import { RoomMember } from "@skyway-sdk/room";
import Modal from "./Modal";
import { useRef } from "react";
import { useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";

type Props = {
  roomURL: string;
  roomID: string;
  scene: THREE.Scene;
  me: RoomMember;
};
export default function RoomMenu(props: Props): JSX.Element {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isShowMenu, setIsShowMenu] = useState(true);
  const [bgColor, setBGColor] = useState("");
  const router = useRouter();

  return (
    <div className="flex w-screen">
      <div
        className={isShowMenu ? "absolute top-5 left-5" : "hidden"}
        ref={menuRef}
      >
        <Modal id="shere">
          <h1 className="text-2xl font-bold">ルームを共有</h1>
          <h1 className="py-5">以下のリンクを共有...</h1>
          <h1>{props.roomURL}</h1>
          <h1 className="py-5">または 以下のルームIDを共有</h1>
          <h1>{props.roomID}</h1>
        </Modal>

        <Modal id="settings">
          <h1 className="text-2xl font-bold">ルーム設定</h1>
          <h1 className="py-3">背景色</h1>
          <button
            className="btn btn-success"
            onClick={() =>
              (props.scene.background = new THREE.Color("#5AFF19"))
            }
          >
            GB
          </button>
          <button
            className="btn bg-blue-500"
            onClick={() =>
              (props.scene.background = new THREE.Color("#0067C0"))
            }
          >
            BB
          </button>
          <button
            className="btn bg-red-500"
            onClick={() =>
              (props.scene.background = new THREE.Color("#FF0000"))
            }
          >
            RB
          </button>

          <h1 className="py-3">16進数カラーコードで背景色を設定</h1>
          <input
            type="text"
            placeholder="カラーコードを入力..."
            className="input input-bordered input-primary w-full max-w-xs"
            value={bgColor}
            onChange={(e) => setBGColor(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => (props.scene.background = new THREE.Color(bgColor))}
            disabled={!bgColor}
          >
            背景色を適用
          </button>
        </Modal>

        <button
          className="bg-blue-300 btn"
          onClick={() => {
            let modal: any = document.getElementById("shere");
            modal.showModal();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
          </svg>
          共有
        </button>

        <button
          className="bg-blue-300 btn"
          onClick={() => {
            let modal: any = document.getElementById("settings");
            modal.showModal();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          ルーム設定
        </button>

        <button
          className="bg-red-500 btn"
          onClick={() => {
            props.me.leave();
            router.push("/");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
            />
          </svg>
          ルームを退出
        </button>
      </div>

      <label className="swap absolute top-5 right-5">
        <input type="checkbox" onChange={() => setIsShowMenu(!isShowMenu)} />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 swap-on fill-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 swap-off fill-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      </label>
    </div>
  );
}
