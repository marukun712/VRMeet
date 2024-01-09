'use client'
import Header from "@/components/Header"
import AuthForm from "@/components/AuthButton"

export default function Home(): JSX.Element {
    return (
        <div>
            <Header />
            <div className="relative overflow-hidden">
                <div className="relative z-10">
                    <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
                        <div className="max-w-2xl text-center mx-auto">
                            <div className="mt-5 max-w-2xl">
                                <h1 className="block font-semibold text-6xl md:text-7xl lg:text-8xl">
                                    VRMeet
                                </h1>
                            </div>

                            <div className="mt-5 max-w-3xl">
                                <p className="text-lg">必要なものはWebカメラだけ。Web上で手軽に複数人での3Dコラボを行うことができます。体を動かして遊ぶパーティーゲーム等の配信にもぴったりです。</p>
                            </div>

                            <div className="mt-8 gap-3 flex justify-center">
                                <AuthForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
