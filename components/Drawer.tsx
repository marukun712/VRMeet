import { ReactNode } from "react"

type Props = {
    children: ReactNode
}

export default function Drawer(props: Props): JSX.Element {
    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

            <label htmlFor="my-drawer-2" className="btn drawer-button absolute lg:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </label>

            <div className="drawer-content flex flex-col items-center justify-center">
                {props.children}
            </div>

            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                    <li><button onClick={() => { let modal: any = document.getElementById("model_setting"); modal.showModal(); }}>モデルの設定</button></li>
                    <li><button onClick={() => { let modal: any = document.getElementById("user_setting"); modal.showModal(); }}>ユーザー情報の編集</button></li>
                </ul>
            </div>
        </div>
    )
}