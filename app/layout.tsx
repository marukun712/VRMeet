import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_JP as NotoSansJP } from "next/font/google"; //as NotoSansJPとしないとエラーが発生する(Next/Font側のバグ?)
const notosansJP = NotoSansJP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VRMeet",
  description:
    "VRMeetは、Web上で手軽に複数人で3Dコラボを行うことができるWebアプリです。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="jp" data-theme="dracula">
      <body className={notosansJP.className}>{children}</body>
    </html>
  );
}
