// ページに公開する設定をここで編集する。
window.commissionSettings = {
  // 作家名はヘッダーと、日英の著作権表記に反映する。
  artistName: "K-Dra61",

  // 更新日時は日本時間で YYYY-MM-DD HH:mm の形式で入力する。
  updatedAt: "2026-11-26 00:45",

  // XのプロフィールURL（例: https://x.com/ユーザー名）。空欄の場合はリンクを表示しない。
  xProfileUrl: "https://x.com/KDra61",

  // preparing（準備中）、open（受付中）、paused（受付停止中）のいずれか。
  status: "open",

  // 金額は円単位の整数。円記号・桁区切り・引用符は不要。未設定にする場合は null。
  fees: {
    base: 7500, // 基本料金
    character: 2500, // キャラクター追加
    background: 1500, // 背景
    variation: 1000, // 差分
    alternative: 4000 // 別パターン
  },

  // 通常価格より低い円単位の整数を入れた項目だけセール表示にする。null は通常価格で表示する。
  saleFees: {
    base: 6600, // 基本料金
    character: 2200, // キャラクター追加
    background: 1320, // 背景
    variation: 880, // 差分
    alternative: 3520 // 別パターン
  },

  // 対応範囲の項目は言語別に引用符で囲んで入力する。配列内の順番で表示する。
  subjects: {
    willDraw: { ja: ["♀, ♂ × ♀, ♀ × ♀", "原型ケモノ", "ドラゴン、恐竜、鳥など", "SFW, NSFW"], en: ["♀, ♂ × ♀, ♀ × ♀", "Feral", "Dragons, Dinosaurs, Birds, ...", "SFW, NSFW"] },
    wontDraw: { ja: ["♂ × ♂", "グロ、丸呑み", "人間", "複雑すぎるメカ"], en: ["♂ × ♂", "Gore, Vore", "Human", "Very complex machinery"] }
  },

  // 掲載する場合は文面を入力して enabled を true にする。
  // **太字** と *斜体* を指定できる。HTMLタグはそのまま文字として表示する。
  announcement: {
    enabled: true,
    ja: "コミッション案内ページ公開記念！ 料金 **12%オフ**",
    en: "Commission guide launch sale: **12% off**",
    // notes には注記を1項目ずつ入力する。各行の「※」は自動で表示する。
    notes: {
      ja: ["受付中にお送りいただいたご依頼が対象です", "締切は2026年12月10日 23:59（JST）です"],
      en: ["Applies to requests sent while commissions are open.", "Deadline: December 10, 2026 at 23:59 (JST)."]
    }
  }
};
