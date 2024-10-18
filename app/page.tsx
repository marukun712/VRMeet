"use client";
import Header from "@/components/ui/header";
import AuthButton from "@/components/ui/authButton";
import BackGround from "@/components/TopPage/backGround";
import GlassCard from "@/components/TopPage/glassCard";

export default function Home(): JSX.Element {
  return (
    <div>
      <BackGround />

      <Header />
      <div className="md:w-1/2 md:m-auto">
        <div className="hero bg-base-200 py-20">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <img
              src="/images/top.png"
              className="max-w-sm rounded-lg shadow-2xl hidden md:block"
            />
            <div>
              <img src="/images/logo.png" className="w-96 m-auto" />
              <p className="py-6">
                必要なものはWebカメラだけ。Web上で手軽に複数人での3Dコラボを行うことができます。体を動かして遊ぶパーティーゲーム等の配信にもぴったりです。
              </p>
              <div className="mt-8 gap-3 flex justify-center">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl relative text-center py-10 font-bold animate-tracking-in-expand">
          3ステップで簡単に参加
        </h1>
        <div className="flex flex-col lg:flex-row">
          <GlassCard
            emoji="➡️"
            step="1"
            text="Googleアカウントでログイン"
          ></GlassCard>
          <div className="divider lg:divider-horizontal"></div>
          <GlassCard
            emoji="🚪"
            step="2"
            text="ルームを新しく作成/招待コードを使って既存のルームに参加"
          ></GlassCard>
          <div className="divider lg:divider-horizontal"></div>
          <GlassCard
            emoji="🕺"
            step="3"
            text="自分の動きとモデルが連動して動き出す!"
          ></GlassCard>
          <div className="divider lg:divider-horizontal"></div>
        </div>
      </div>
    </div>
  );
}
