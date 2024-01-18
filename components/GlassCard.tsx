type Props = {
    emoji: string,
    step: string,
    text: string
}

export default function GlassCard(props: Props): JSX.Element {
    return (
        <div className="grid flex-grow h-54 w-96 card rounded-box place-items-center glass animate-scale-in-center">
            <h1 className="text-5xl m-5">{props.emoji}</h1>
            <h1 className="text-2xl font-bold m-5">Step {props.step}</h1>
            <h1 className="m-5">{props.text}</h1>
        </div>
    )
}