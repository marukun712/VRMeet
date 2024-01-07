type Props = {
    username: string,
    avatarURL: string
}

export default function UserIcon(props: Props) {
    return (
        <div>
            <h1 className='text-2xl py-10 text-center'>{props.username}さん、ようこそ。</h1>
            <div className="avatar justify-center flex">
                <div className="w-24 rounded-full">
                    <img src={props.avatarURL} width={500} height={500} />
                </div>
            </div>
        </div>
    )
}