import { NextResponse } from "next/server";
import { SkyWayAuthToken } from "@skyway-sdk/token";
import { AuthToken } from "@skyway-sdk/core";
import { v4 } from "uuid";

export async function POST(): Promise<NextResponse> {
  let responseJson;
  const APP_ID = process.env.SKYWAY_APP_ID;
  const SKYWAY_SECRET_KEY = process.env.SKYWAY_SECRET_KEY;

  //nullチェック
  if (APP_ID == null || SKYWAY_SECRET_KEY == null) {
    responseJson = {
      isSuccess: false,
      body: {
        errorMessage:
          "シークレットキーの取得に失敗しました。.envにシークレットキーを記載しているか確認してください。",
      },
    };

    return NextResponse.json(responseJson);
  }

  //トークンの発行日時
  const iat = Math.floor(Date.now() / 1000);
  //トークンの有効期限
  const exp = Math.floor(Date.now() / 1000) + 36000;

  //JWTトークンの生成
  const jwt: AuthToken = {
    exp: exp,
    iat: iat,
    jti: v4(),
    scope: {
      app: {
        id: APP_ID,
        turn: false,
        actions: ["read"],
        channels: [
          {
            id: "*",
            name: "*",
            actions: ["write"],
            members: [
              {
                id: "*",
                name: "*",
                actions: ["write"],
                publication: {
                  actions: ["write"],
                },
                subscription: {
                  actions: ["write"],
                },
              },
            ],
            sfuBots: [
              {
                actions: ["write"],
                forwardings: [
                  {
                    actions: ["write"],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };

  //tokenの生成
  const token = new SkyWayAuthToken(jwt).encode(SKYWAY_SECRET_KEY);

  try {
    responseJson = {
      isSuccess: true,
      body: {
        jwt: jwt,
        skywayToken: token,
      },
    };
  } catch (err) {
    responseJson = {
      isSuccess: false,
      body: {
        errorMessage: "token生成エラー",
      },
    };
    console.log(err);
  }
  return NextResponse.json(responseJson);
}
