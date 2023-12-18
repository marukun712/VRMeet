export default function Home(): JSX.Element {
    return (
        <div className="hero min-h-screen bg-yellow-400">
            <div className="hero-content flex-col lg:flex-row">
                <div>
                    <h1 className="text-8xl font-bold">VRM-Collab-React</h1>
                    <p className="py-6">必要なものはWebカメラだけ。Web上でお手軽に複数人での3Dコラボ配信を行うことができます。体を動かして遊ぶパーティーゲームなどの配信にもぴったりです。</p>
                    <button className="btn btn-primary">Select Rooms</button>
                </div>
            </div>
        </div>
    )
}
