# VRMeet

<img src="https://img.shields.io/badge/-TypeScript-000000.svg?style=for-the-badge&logo=typescript&logoColor=61DAFB"><img src="https://img.shields.io/badge/-Nextjs-000000.svg?style=for-the-badge&logo=next.js&logoColor=61DAFB"><img src="https://img.shields.io/badge/-tailwindcss-000000.svg?style=for-the-badge&logo=tailwindcss&logoColor=61DAFB"><img src="https://img.shields.io/badge/-Supabase-000000.svg?style=for-the-badge&logo=supabase&logoColor=61DAFB"><img src="https://img.shields.io/badge/-three.js-000000.svg?style=for-the-badge&logo=threedotjs&logoColor=61DAFB"><img src="https://img.shields.io/badge/-webrtc-000000.svg?style=for-the-badge&logo=webrtc&logoColor=61DAFB">

<img src="./public/images/logo.png">

必要なものはWebカメラだけ。Web上で手軽に複数人での3Dコラボを行うことができます。体を動かして遊ぶパーティーゲーム等の配信にもぴったりです。
# DEMO
<img src="./public/images/top.png">

# Features
- Webカメラだけで簡単に姿勢を推定してVRMモデルに反映
- SkyWayを用いた複数人でのモーションデータの同期
- 最大3人までのルーム作成機能
- VRMモデルのアップロード機能

# Usage

依存ライブラリのインストール。
```
yarn install
```

必要な認証情報を.env.localに記載。
```
SKYWAY_APP_ID=
SKYWAY_SECRET_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

開発サーバーの起動。
```
yarn run dev
```

# License 
VRMeet is under [MIT license](https://github.com/marukun712/VRMeet/blob/main/LICENSE).