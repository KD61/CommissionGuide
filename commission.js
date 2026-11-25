// 設定から文字列だけを受け取り、前後の空白を取り除く。
function settingText(value) {
  return typeof value === "string" ? value.trim() : "";
}

// 実在する日時のみ受け付け、日本時間の time 属性に変換する。
function updateDateTime(value) {
  if (!/^(?!0000)\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) return "";

  // 入力時刻をUTCの値として比較し、存在しない日付の自動補正を検出する。
  const dateTime = value.replace(" ", "T");
  const date = new Date(dateTime + "Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 16) !== dateTime) return "";
  return dateTime + "+09:00";
}

// 作家名と更新日時をヘッダーへ反映し、未設定の項目は非表示にする。
function renderPageMeta(artistName, updatedAt) {
  const meta = document.querySelector(".page-meta");
  const artist = meta.querySelector("#artist-name");
  artist.textContent = artistName;
  artist.hidden = !artistName;

  // 検証した日時だけを表示し、機械判読用の属性にも日本時間を指定する。
  const update = meta.querySelector(".page-updated");
  const dateTime = updateDateTime(updatedAt);
  update.hidden = !dateTime;
  if (dateTime) {
    const time = update.querySelector("time");
    time.dateTime = dateTime;
    time.textContent = updatedAt + " JST";
  }
  meta.hidden = artist.hidden && update.hidden;
}

// 設定ファイルの料金を円表記に整え、基本料金とオプション料金に反映する。
function renderFees(fees, saleFees) {
  const numberFormat = new Intl.NumberFormat("ja-JP");
  const help = document.getElementById("pricing-price-help");
  const saleTemplate = document.getElementById("sale-price-template");
  let needsHelp = false;

  for (const amount of document.querySelectorAll("#pricing [data-fee]")) {
    const fee = amount.dataset.fee;
    const yen = fees?.[fee];

    // 円単位の非負整数だけを表示し、未設定や不正な金額には確認案内を付ける。
    if (!Number.isSafeInteger(yen) || yen < 0) {
      amount.textContent = "—";
      if (help) amount.setAttribute("aria-describedby", help.id);
      needsHelp = true;
      continue;
    }

    const prefix = fee === "base" ? "¥" : "+¥";
    const regularPrice = prefix + numberFormat.format(yen);
    amount.removeAttribute("aria-describedby");

    // 通常価格より低い有効な金額がある場合だけ、通常価格とセール価格を表示する。
    const sale = saleFees?.[fee];
    if (!Number.isSafeInteger(sale) || sale < 0 || sale >= yen) {
      amount.textContent = regularPrice;
      continue;
    }

    const prices = saleTemplate.content.cloneNode(true);
    prices.querySelector("s").textContent = regularPrice;
    prices.querySelector("[data-sale-amount]").textContent = prefix + numberFormat.format(sale);
    amount.replaceChildren(prices);
  }

  // すべての金額を表示できる場合は、未設定時の案内を隠す。
  if (help) help.hidden = !needsHelp;
}

// 対応範囲を言語別に読み込み、入力された項目を文字列として表示する。
function renderSubjects(subjects) {
  for (const list of document.querySelectorAll("[data-subject-list]")) {
    const entries = subjects?.[list.dataset.subjectList]?.[list.lang];
    const items = document.createDocumentFragment();
    for (const entry of Array.isArray(entries) ? entries : []) {
      const text = settingText(entry);
      if (!text) continue;
      const item = document.createElement("li");
      item.textContent = text;
      items.append(item);
    }

    // 空の言語リストは表示せず、入力済みの項目だけを差し替える。
    list.replaceChildren(items);
    list.hidden = list.childElementCount === 0;
  }
}

// お知らせの文面から太字と斜体だけを作り、HTMLタグを含む入力は文字として扱う。
function renderAnnouncementText(element, message) {
  const content = document.createDocumentFragment();
  let end = 0;
  let opening = null;

  // 連続する記号をまとめて読み、旧Safariで使えない後読みなしで前後の記号を照合する。
  for (const closing of message.matchAll(/\*+/g)) {
    if (opening && opening[0].length <= 2 && opening[0] === closing[0]) {
      const text = message.slice(opening.index + opening[0].length, closing.index);
      if (!/[\r\n]/.test(text)) {
        const emphasis = document.createElement(opening[0] === "**" ? "strong" : "em");
        emphasis.textContent = text;
        content.append(message.slice(end, opening.index), emphasis);
        end = closing.index + closing[0].length;
        opening = null;
        continue;
      }
    }
    opening = closing;
  }

  // 最後の強調より後の文面を加え、表示先にまとめて反映する。
  content.append(message.slice(end));
  element.replaceChildren(content);
}

// 掲載設定が有効で、どちらかの言語に文面があるときだけお知らせを表示する。
function renderAnnouncement(announcement) {
  const notice = document.querySelector(".announcement");
  const messages = {
    ja: settingText(announcement?.ja),
    en: settingText(announcement?.en)
  };
  const fallbackLanguage = messages.ja ? "ja" : "en";
  notice.hidden = announcement?.enabled !== true || !messages[fallbackLanguage];
  if (notice.hidden) return;

  // 一方の翻訳が未入力なら、入力済みの言語で表示する。
  for (const element of notice.querySelectorAll("[data-announcement-text]")) {
    const language = element.dataset.announcementText;
    const messageLanguage = messages[language] ? language : fallbackLanguage;
    element.lang = messageLanguage;
    renderAnnouncementText(element, messages[messageLanguage]);

    // 注記も本文と同じ言語で表示し、空欄は飛ばして1項目ずつ並べる。
    const list = element.parentElement.querySelector(".announcement-notes");
    list.lang = messageLanguage;
    const notes = announcement?.notes?.[messageLanguage];
    const items = document.createDocumentFragment();
    for (const entry of Array.isArray(notes) ? notes : []) {
      const text = settingText(entry);
      if (!text) continue;
      const item = document.createElement("li");
      item.className = "note";
      const marker = document.createElement("span");
      marker.className = "note-mark";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = "※";

      // 本文と同じ装飾を使い、設定内のHTMLタグは文字として表示する。
      renderAnnouncementText(item, text);
      item.prepend(marker);
      items.append(item);
    }
    list.replaceChildren(items);
    list.hidden = list.childElementCount === 0;
  }
}

// 設定がない場合や受付状況の指定が不正な場合は、準備中として扱う。
const pageSettings = window.commissionSettings;
const status = pageSettings?.status;
document.body.dataset.commissionStatus = ["preparing", "open", "paused"].includes(status) ? status : "preparing";

// 検証済みの作家名をヘッダーと著作権表記で共有する。
const artistName = settingText(pageSettings?.artistName);
renderPageMeta(artistName, settingText(pageSettings?.updatedAt));
renderFees(pageSettings?.fees, pageSettings?.saleFees);
renderSubjects(pageSettings?.subjects);
renderAnnouncement(pageSettings?.announcement);

// 同梱の設定文を、既存の日英切り替えに対応する要素として追加する。設定内の強調タグも反映する。
function appendLocalizedTerms(container, copy) {
  for (const language of ["ja", "en"]) {
    const text = settingText(copy?.[language]);
    if (!text) continue;
    const span = document.createElement("span");
    span.className = "localized";
    span.lang = language;
    span.innerHTML = text;
    container.append(span, " ");
  }
}

// 設定の順番で見出しと箇条書きを作り、既存の見出しへの直リンクを有効にする。
function renderTerms(settings, artistName, profileUrl) {
  const container = document.querySelector("#terms .terms");
  const content = document.createDocumentFragment();
  for (const group of Array.isArray(settings?.groups) ? settings.groups : []) {
    // 見出しや項目が未入力のグループは表示しない。
    if (!Array.isArray(group?.items)) continue;
    const section = document.createElement("div");
    const heading = document.createElement("h3");
    heading.id = settingText(group.id);
    appendLocalizedTerms(heading, group.heading);
    if (!heading.childElementCount) continue;

    // 箇条書きの行は設定上の1項目につき1行作る。
    const list = document.createElement("ul");
    for (const copy of group.items) {
      const item = document.createElement("li");
      appendLocalizedTerms(item, copy);
      if (item.childElementCount) list.append(item);
    }
    if (!list.childElementCount) continue;
    section.append(heading, list);
    content.append(section);
  }

  // 注意事項の最後に問い合わせ文を置く。
  const contact = document.createElement("div");
  contact.className = "terms-contact";
  const contactMessage = document.createElement("p");
  appendLocalizedTerms(contactMessage, settings?.contact);
  if (contactMessage.childElementCount) contact.append(contactMessage);

  // HTTPSのXプロフィールURLだけをリンクにし、URL自体を文字として表示する。
  if (/^https:\/\/x\.com\/[a-z0-9_]{1,15}\/?$/i.test(profileUrl)) {
    const link = document.createElement("a");
    link.className = "x-profile-link";
    link.href = profileUrl;
    link.textContent = profileUrl;
    link.translate = false;
    link.rel = "noreferrer";
    contact.append(link);
  }
  if (contact.childElementCount) content.append(contact);

  // 設定済みの作家名だけを、著作権表記の日英両方に文字として入れる。
  if (artistName) {
    for (const element of content.querySelectorAll("[data-artist-name]")) {
      element.textContent = artistName;
      element.translate = false;
    }
  }
  container.replaceChildren(content);

  // 有効な支払い文面だけを反映し、未入力の場合はHTML側の案内を残す。
  for (const element of document.querySelectorAll("[data-payment-copy]")) {
    const text = settingText(settings?.payment?.[element.dataset.paymentCopy]?.[element.lang]);
    if (text) element.innerHTML = text;
  }
}

// 設定ファイルが読み込めない場合も、料金の表示や言語切り替えは使えるようにする。
if (typeof commissionTerms !== "undefined") renderTerms(commissionTerms, artistName, settingText(pageSettings?.xProfileUrl));

// 選んだ言語に合わせて、本文、ブラウザのタイトル、言語ボタンの状態を更新する。
const languageSwitch = document.querySelector(".language-switch");
const languageButtons = languageSwitch?.querySelectorAll("button") ?? [];
const pageTitles = { ja: "コミッション案内", en: "Commission Guide" };
const languageLabels = { ja: "表示言語", en: "Page language" };
const announcementLabels = { ja: "お知らせ", en: "Announcement" };
const templateBox = document.querySelector(".template-box");
const templateCopy = templateBox?.querySelector(".template-copy");
const copyButton = templateCopy?.querySelector("button");
const copyStatus = templateBox?.querySelector(".copy-status");
const copyFallback = templateBox?.querySelector(".copy-fallback");
const copyMessages = {
  ja: { copied: "コピーしました。", selected: "選択したテキストを手動でコピーしてください。", manual: "テンプレートの本文を選択し、手動でコピーしてください。" },
  en: { copied: "Copied.", selected: "Please copy the selected text manually.", manual: "Please select the template text and copy it manually." }
};
let copyStatusTimer;
let copyFeedbackVersion = 0;

// 再操作や言語切り替えで、前回の通知と消去タイマーを取り消す。
function clearCopyFeedback() {
  copyFeedbackVersion += 1;
  window.clearTimeout(copyStatusTimer);
  if (copyStatus) copyStatus.textContent = "";
  if (copyFallback) copyFallback.textContent = "";
}

// 自動翻訳が変更する lang とは別に、ページ内で選ばれた言語を使う。
function selectedLanguage() {
  return document.documentElement.dataset.language === "en" ? "en" : "ja";
}

// 選択中の言語を表示と操作ボタンの状態へ反映する。
function setLanguage(language) {
  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
  document.title = pageTitles[language];
  languageSwitch?.setAttribute("aria-label", languageLabels[language]);
  document.querySelector(".announcement")?.setAttribute("aria-label", announcementLabels[language]);
  clearCopyFeedback();

  // 選んだ言語で項目のない対応範囲は、見出しと枠もまとめて隠す。
  const subjects = document.getElementById("subjects");
  for (const panel of subjects.querySelectorAll(".subject-list")) {
    panel.hidden = !panel.querySelector(`[data-subject-list][lang="${language}"]:not([hidden])`);
  }
  subjects.hidden = !subjects.querySelector(".subject-list:not([hidden])");

  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.selectLanguage === language));
  }
}

// 選んだ言語のテンプレートを、改行を保ったままコピーする。
async function copyTemplate() {
  const language = selectedLanguage();
  const template = templateBox.querySelector('[data-template-language="' + language + '"]');
  if (!template) return;

  clearCopyFeedback();
  const feedbackVersion = copyFeedbackVersion;
  let copied = false;

  // クリップボードが利用できない場合は手動コピーへ進む。
  if (typeof navigator.clipboard?.writeText === "function") {
    try {
      await navigator.clipboard.writeText(template.textContent);
      copied = true;
    } catch {
      copied = false;
    }
  }

  // コピー完了までに再操作があった場合は、最後の操作だけを反映する。
  if (feedbackVersion !== copyFeedbackVersion) return;

  // 自動コピーが使えないときは本文を選択し、手動でコピーできるようにする。
  if (!copied) {
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(template);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // 同じ案内を連続で出したときも通知されるよう、表示を次フレームへ送る。
    window.requestAnimationFrame(() => {
      if (feedbackVersion === copyFeedbackVersion) {
        copyFallback.textContent = copyMessages[language][selection ? "selected" : "manual"];
      }
    });
    return;
  }

  // 成功時も消去と再表示を別フレームにし、連続操作を通知できるようにする。
  window.requestAnimationFrame(() => {
    if (feedbackVersion !== copyFeedbackVersion) return;
    copyStatus.textContent = copyMessages[language].copied;
    copyStatusTimer = window.setTimeout(() => { copyStatus.textContent = ""; }, 1500);
  });
}

// テンプレート一式がある場合だけコピー操作を有効にする。
if (copyButton && copyStatus && copyFallback) {
  copyButton.addEventListener("click", copyTemplate);
  templateCopy.hidden = false;
}

// 英語版のURLを共有できるようにし、日本語は言語指定がないときに表示する。
function languageFromUrl() {
  return new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "ja";
}

// URLの言語指定だけを記録し、同じ言語指定でのアンカー移動では表示言語を変えない。
let syncedUrlLanguage = languageFromUrl();
for (const button of languageButtons) {
  button.addEventListener("click", () => {
    const language = button.dataset.selectLanguage;
    const url = new URL(window.location.href);
    setLanguage(language);

    if (language === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");

    // 共有URLの更新を許可しないローカル環境でも、言語の切り替えは有効にする。
    try {
      window.history.replaceState(window.history.state, "", url);
      syncedUrlLanguage = language;
    } catch (error) {
      if (error.name !== "SecurityError") throw error;
    }
  });
}
window.addEventListener("popstate", () => {
  const language = languageFromUrl();
  if (language === syncedUrlLanguage) return;
  syncedUrlLanguage = language;
  if (language !== selectedLanguage()) setLanguage(language);
});
setLanguage(syncedUrlLanguage);
if (languageSwitch) languageSwitch.hidden = false;

// URLが折りたたみやその中の見出しを指す場合は、開いてから該当箇所へ移動する。
function openLinkedDisclosure() {
  let id;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return;
  }

  const target = document.getElementById(id);
  const details = target?.closest("details");
  if (!details || details.open) return;

  details.open = true;
  target.scrollIntoView({ block: "start" });
}

window.addEventListener("hashchange", openLinkedDisclosure);
openLinkedDisclosure();
