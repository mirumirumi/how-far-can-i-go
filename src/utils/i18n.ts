export const messages = {
  ja: {
    toast: {
      limit: "現在、1 分あたりのリクエスト数は10回に制限されています。",
      limit_all: "1 分あたりのリクエスト制限（利用ユーザー全体）に達しました。",
      map_limit: "1 ユーザーあたりの地図の読み込み回数には制限があります。また明日どうぞ。",
      geocode_limit: "1 ユーザーあたりのキーワード検索回数には制限があります。また明日どうぞ。",
      failedGetLocation: "現在地を取得できませんでした。",
      reason0: "原因は不明です。",
      reason1: "位置情報の取得が許可されていませんでした。",
      reason2: "正確な情報を取得できませんでした。",
      reason3: "タイムアウトエラーです。",
      notSupportGetLocation: "お使いのデバイスでは現在地の取得ができませんでした。",
      timemap_no_shell: "移動可能範囲が見つかりませんでした。",
      timemap_wrong_request: "地点指定が有効ではありません。現実的な陸地でしたか？",
    }
  },
  en: {
    toast: {
      limit: "Currently, the number of requests per minute is limited to 10.",
      limit_all: "The request limit per minute (for all users) has been reached.",
      map_limit: "There is a limit to load the map per user. Please come back tomorrow.",
      geocode_limit: "There is a limit to serach with keywords per user. Please come back tomorrow.",
      failedGetLocation: "Failed to get current location.",
      reason0: "The cause is unknown.",
      reason1: "The cause is that location info acquisition was not allowed.",
      reason2: "The cause is due to signal conditions.",
      reason3: "This is a timeout error.",
      notSupportGetLocation: "Your device was not able to obtain information about your current location.",
      timemap_no_shell: "Movable range not found.",
      timemap_wrong_request: "The point you specified is not valid. Was it a normal land area?",
    }
  },
}
