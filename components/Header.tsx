import { NextFont } from "next/dist/compiled/@next/font"

type Props = {
    font: NextFont
}

export default function Header(props: Props): JSX.Element {
    return (
        <div className="navbar relative glass">
            <div className="flex-1">
                <div className={props.font.className}>
                    <a className="btn btn-ghost text-xl">VRMeet</a>
                </div>
            </div>
        </div>
    )
}