import { AlignJustify, Settings, UserPen } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Drawer(props: Props): JSX.Element {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      <label
        htmlFor="my-drawer-2"
        className="btn drawer-button absolute lg:hidden"
      >
        <AlignJustify />
      </label>

      <div className="drawer-content flex flex-col items-center justify-center">
        {props.children}
      </div>

      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li>
            <button
              onClick={() => {
                let modal: any = document.getElementById("model_setting");
                modal.showModal();
              }}
            >
              <Settings />
              モデル設定
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                let modal: any = document.getElementById("user_setting");
                modal.showModal();
              }}
            >
              <UserPen />
              ユーザー情報の編集
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
