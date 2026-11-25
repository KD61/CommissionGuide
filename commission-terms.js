// 注意事項を変更するときは、このファイルの日英（ja / en）の文面を編集する。
// items の { ja, en } を追加・削除すると、箇条書きの項目数も変わる。強調には <strong> を使える。
const commissionTerms = (() => {
  // 支払期限は請求書の発行日からの日数。料金欄と注意事項で支払い方法の記述も共有する。
  const paymentDeadlineDays = 10;
  const payment = {
    method: {
      ja: '<span translate="no">PayPal</span>の請求書をお送りします。<span translate="no">PayPal</span>アカウントまたはクレジットカードでお支払いいただけます。',
      en: 'I’ll send you a <span translate="no">PayPal</span> invoice. You can pay with a <span translate="no">PayPal</span> account or a credit card.'
    },
    deadline: {
      ja: `請求書の発行から<strong>${paymentDeadlineDays}日以内</strong>`,
      en: `<strong>within ${paymentDeadlineDays} ${paymentDeadlineDays === 1 ? "day" : "days"}</strong> of the invoice date`
    }
  };

  // id は各見出しへの直リンクに使う。見出しの文言は heading で変更する。
  return {
    payment,
    groups: [
      {
        id: "補足事項-additional-note",
        heading: { ja: "利用・公開・キャンセル・返金", en: "Use, sharing, cancellations, and refunds" },
        items: [
          {
            ja: "<strong>個人利用に限ります。</strong>その他の用途はご相談ください。",
            en: "<strong>For personal use only.</strong> Please ask me about other uses."
          },
          {
            ja: "完成作品はSNSで公開することがあります。ご依頼時に非公開をご希望の場合は、<strong>追加料金なし</strong>で対応します。",
            en: "I may share finished artwork on social media. If you ask when sending your request, I’ll keep it private <strong>at no extra charge</strong>."
          },
          {
            ja: "ラフ承認後は<strong>ご自身の都合でキャンセル</strong>できません。お支払い後は、こちらの都合で制作できないときだけ返金します。",
            en: "You can’t <strong>cancel for personal reasons</strong> after approving the sketch. Payments are non-refundable. If I’m unable to finish the commission for reasons on my end, I’ll refund your payment."
          },
          {
            ja: '著作権は <strong class="artist-name" data-artist-name>作家</strong> に帰属します。',
            en: 'Copyright remains with <strong class="artist-name" data-artist-name>the artist</strong>.'
          },
          {
            ja: 'このページの料金や条件は<span translate="no">Skeb</span>でのご依頼には適用されません。',
            en: 'The prices and terms on this page do not apply to <span translate="no">Skeb</span> requests.'
          }
        ]
      },
      {
        id: "お支払方法-payment-method",
        heading: { ja: "お支払い方法・期限", en: "Payment methods and deadline" },
        items: [
          payment.method,
          {
            ja: `${payment.deadline.ja}にお支払いください。期限までにお支払いが確認できない場合は、ご依頼をキャンセルします。`,
            en: `Please pay ${payment.deadline.en}. I’ll cancel the commission if I haven’t received payment by the deadline.`
          }
        ]
      },
      {
        id: "修正について-revisions",
        heading: { ja: "修正", en: "Revisions" },
        items: [
          {
            ja: "ポーズや構図を変えたいときは、ラフの段階でお知らせください。<strong>ラフ承認後は大きな変更ができません。</strong>",
            en: "Please request pose or composition changes at the sketch stage. <strong>I can’t make major changes after sketch approval.</strong>"
          },
          {
            ja: "ラフの修正内容によっては、見積もり金額が変わることがあります。その場合は、お支払い前に改めてお見積もりをお送りします。",
            en: "Sketch revisions may affect the quoted price. If the price changes, I’ll send you an updated quote before you pay."
          },
          {
            ja: "納品後の修正は、色味の調整など小さな修正に限り、<strong>1回まで</strong>対応します。料金はかかりません。",
            en: "After delivery, I can make <strong>up to one minor revision</strong>, such as a color adjustment. This revision is free."
          },
          {
            ja: "ラフの修正回数が多すぎる場合は、ご依頼をキャンセルすることがあります。",
            en: "I may cancel the commission if there are too many sketch revisions."
          }
        ]
      }
    ],
    // 注意事項の下に表示する問い合わせ案内。
    contact: {
      ja: "ご質問があれば、受付中にXのDMでお気軽にご連絡ください。",
      en: "If you have any questions, please contact me via X DM when commissions are open."
    }
  };
})();
