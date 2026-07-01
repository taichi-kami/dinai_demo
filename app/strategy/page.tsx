"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StoreInfo = {
  storeName: string;
  address: string;
  gyotai: string;
  clientPrice: number;
  budget: number;
  targetAge: string;
  targetGender: string;
  openTime: string;
  closeTime: string;
};

type AdStrategy = {
  google: {
    budget: number;
    deliveryTime: string;
    keywords: string[];
    action: string;
  };
  instagram: {
    budget: number;
    targetRadius: string;
    targetAge: string;
    interests: string[];
    copyText: string;
  };
};

export default function StrategyScreen() {
  const router = useRouter();
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [strategy, setStrategy] = useState<AdStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dots, setDots] = useState("");

  // ローディングアニメーション
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("storeInfo");
    if (!raw) {
      router.push("/");
      return;
    }
    const info: StoreInfo = JSON.parse(raw);
    setStoreInfo(info);

    // 既にstrategyがsessionStorageにあればそれを使う
    const cachedStrategy = sessionStorage.getItem("strategy");
    if (cachedStrategy) {
      try {
        const parsed = JSON.parse(cachedStrategy);
        if (parsed.strategy) {
          setStrategy(parsed.strategy);
          setIsLoading(false);
          return;
        }
      } catch {}
    }

    // APIを叩く
    fetch("/generate_strategy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    })
      .then((r) => r.json())
      .then((data) => {
        setStrategy(data.strategy);
        sessionStorage.setItem("strategy", JSON.stringify(data));
      })
      .catch(() => {
        // フォールバック：ローカルで生成
        setStrategy(generateFallbackStrategy(info));
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleSetAds = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      sessionStorage.setItem(
        "adResult",
        JSON.stringify({ strategy, storeInfo })
      );
      router.push("/complete");
    }, 1800);
  };

  if (isLoading) {
    return (
      <div className="dinai-root">
        <div className="dinai-bg" />
        <div className="dinai-loading-wrap">
          <div className="dinai-loading-icon">✦</div>
          <p className="dinai-loading-text">AIが戦略を生成中{dots}</p>
          <p className="dinai-loading-sub">店舗情報をもとに最適な広告配信プランを計算しています</p>
        </div>
      </div>
    );
  }

  if (!strategy || !storeInfo) return null;

  return (
    <div className="dinai-root">
      <div className="dinai-bg" />
      <div className="dinai-container">
        {/* Header */}
        <header className="dinai-header">
          <div className="dinai-logo">
            <span className="dinai-logo-d">D</span>
            <span className="dinai-logo-rest">inai</span>
          </div>
          <p className="dinai-tagline">AIが最適な広告戦略を、一瞬で。</p>
        </header>

        {/* Store Badge */}
        <div className="dinai-store-badge">
          <span className="dinai-store-icon">🏪</span>
          <span className="dinai-store-name">{storeInfo.storeName}</span>
          <span className="dinai-store-gyotai">{storeInfo.gyotai}</span>
        </div>

        <h2 className="dinai-section-title">
          <span className="dinai-section-title-mark">✦</span>
          AI戦略生成結果
        </h2>

        {/* Google広告カード */}
        <div className="dinai-card dinai-card--google">
          <div className="dinai-card-header">
            <div className="dinai-platform-badge dinai-platform-badge--google">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Googleローカル広告
            </div>
            <div className="dinai-budget-badge">¥{strategy.google.budget.toLocaleString()}</div>
          </div>

          <div className="dinai-card-body">
            <div className="dinai-detail-row">
              <span className="dinai-detail-label">配信時間</span>
              <span className="dinai-detail-value">{strategy.google.deliveryTime}</span>
            </div>
            <div className="dinai-detail-row">
              <span className="dinai-detail-label">キーワード</span>
              <div className="dinai-tags">
                {strategy.google.keywords.map((k, i) => (
                  <span key={i} className="dinai-tag">{k}</span>
                ))}
              </div>
            </div>
            <div className="dinai-detail-row">
              <span className="dinai-detail-label">アクション</span>
              <span className="dinai-detail-value dinai-detail-value--accent">{strategy.google.action}</span>
            </div>
          </div>
        </div>

        {/* Instagram広告カード */}
        <div className="dinai-card dinai-card--instagram">
          <div className="dinai-card-header">
            <div className="dinai-platform-badge dinai-platform-badge--instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" stroke="url(#ig-grad)" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)"/>
                <defs>
                  <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f09433"/>
                    <stop offset="0.25" stopColor="#e6683c"/>
                    <stop offset="0.5" stopColor="#dc2743"/>
                    <stop offset="0.75" stopColor="#cc2366"/>
                    <stop offset="1" stopColor="#bc1888"/>
                  </linearGradient>
                </defs>
              </svg>
              Instagram広告
            </div>
            <div className="dinai-budget-badge">¥{strategy.instagram.budget.toLocaleString()}</div>
          </div>

          <div className="dinai-card-body">
            <div className="dinai-detail-row">
              <span className="dinai-detail-label">ターゲット</span>
              <span className="dinai-detail-value">{strategy.instagram.targetRadius} / {strategy.instagram.targetAge}</span>
            </div>
            <div className="dinai-detail-row">
              <span className="dinai-detail-label">興味関心</span>
              <div className="dinai-tags">
                {strategy.instagram.interests.map((k, i) => (
                  <span key={i} className="dinai-tag dinai-tag--pink">{k}</span>
                ))}
              </div>
            </div>
            <div className="dinai-detail-row dinai-detail-row--col">
              <span className="dinai-detail-label">コピー案</span>
              <div className="dinai-copy-box">
                <span className="dinai-copy-quote">&#8220;</span>
                {strategy.instagram.copyText}
                <span className="dinai-copy-quote">&#8221;</span>
              </div>
            </div>
          </div>
        </div>

        {/* 予算サマリー */}
        <div className="dinai-summary">
          <div className="dinai-summary-row">
            <span>合計予算</span>
            <span className="dinai-summary-total">¥{storeInfo.budget.toLocaleString()} / 日</span>
          </div>
          <div className="dinai-summary-bar">
            <div
              className="dinai-summary-bar-google"
              style={{ width: `${(strategy.google.budget / storeInfo.budget) * 100}%` }}
            />
            <div
              className="dinai-summary-bar-instagram"
              style={{ width: `${(strategy.instagram.budget / storeInfo.budget) * 100}%` }}
            />
          </div>
          <div className="dinai-summary-legend">
            <span><span className="dinai-legend-dot dinai-legend-dot--blue" />Google ¥{strategy.google.budget.toLocaleString()}</span>
            <span><span className="dinai-legend-dot dinai-legend-dot--pink" />Instagram ¥{strategy.instagram.budget.toLocaleString()}</span>
          </div>
        </div>

        {/* ボタン */}
        <div className="dinai-actions">
          <button className="dinai-btn-back" onClick={() => router.push("/")}>
            ← 入力に戻る
          </button>
          <button
            className={`dinai-btn-submit ${isSubmitting ? "dinai-btn-submit--loading" : ""}`}
            onClick={handleSetAds}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="dinai-submit-inner">
                <span className="dinai-spinner" />
                広告をセット中...
              </span>
            ) : (
              <span className="dinai-submit-inner">
                <span>✦</span>
                この内容で広告セット（疑似）
              </span>
            )}
          </button>
        </div>

        <p className="dinai-footer">© 2025 Dinai — Demo Version</p>
      </div>

      <style>{`
        .dinai-store-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,200,120,0.12);
          border-radius: 100px;
          padding: 8px 18px;
          margin-bottom: 28px;
          width: fit-content;
        }
        .dinai-store-icon { font-size: 16px; }
        .dinai-store-name {
          font-size: 14px;
          font-weight: 600;
          color: #f5f0eb;
        }
        .dinai-store-gyotai {
          font-size: 12px;
          color: #8a7a6a;
          background: rgba(255,140,56,0.1);
          border-radius: 100px;
          padding: 2px 10px;
        }
        .dinai-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #f5f0eb;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dinai-section-title-mark { color: #ff8c38; font-size: 14px; }

        /* Cards */
        .dinai-card {
          background: rgba(255,255,255,0.04);
          border-radius: 20px;
          margin-bottom: 16px;
          overflow: hidden;
          animation: fadeUp 0.5s ease both;
        }
        .dinai-card--google { border: 1px solid rgba(66,133,244,0.25); }
        .dinai-card--instagram { border: 1px solid rgba(220,39,67,0.25); animation-delay: 0.1s; }

        .dinai-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dinai-platform-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #f5f0eb;
        }
        .dinai-budget-badge {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #ff8c38;
        }

        .dinai-card-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .dinai-detail-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .dinai-detail-row--col { flex-direction: column; gap: 8px; }
        .dinai-detail-label {
          font-size: 11px;
          color: #6a5a4a;
          min-width: 72px;
          padding-top: 2px;
          letter-spacing: 0.05em;
        }
        .dinai-detail-value {
          font-size: 14px;
          color: #c8b8a2;
        }
        .dinai-detail-value--accent { color: #ff8c38; font-weight: 600; }

        .dinai-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .dinai-tag {
          background: rgba(66,133,244,0.12);
          border: 1px solid rgba(66,133,244,0.25);
          border-radius: 100px;
          padding: 3px 12px;
          font-size: 12px;
          color: #a8c4f8;
        }
        .dinai-tag--pink {
          background: rgba(220,39,67,0.12);
          border-color: rgba(220,39,67,0.25);
          color: #f8a8b8;
        }

        .dinai-copy-box {
          background: rgba(255,255,255,0.04);
          border-left: 3px solid #ff8c38;
          border-radius: 0 10px 10px 0;
          padding: 12px 16px;
          font-size: 14px;
          color: #f5f0eb;
          line-height: 1.7;
        }
        .dinai-copy-quote { color: #ff8c38; font-size: 18px; font-family: Georgia, serif; }

        /* Summary */
        .dinai-summary {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,200,120,0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          animation: fadeUp 0.5s ease both 0.2s;
        }
        .dinai-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 13px;
          color: #6a5a4a;
        }
        .dinai-summary-total {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #f5f0eb;
        }
        .dinai-summary-bar {
          display: flex;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          background: rgba(255,255,255,0.05);
          margin-bottom: 10px;
        }
        .dinai-summary-bar-google { background: #4285F4; transition: width 0.8s ease; }
        .dinai-summary-bar-instagram { background: #dc2743; transition: width 0.8s ease; }
        .dinai-summary-legend {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #6a5a4a;
        }
        .dinai-legend-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }
        .dinai-legend-dot--blue { background: #4285F4; }
        .dinai-legend-dot--pink { background: #dc2743; }

        /* Actions */
        .dinai-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          animation: fadeUp 0.5s ease both 0.3s;
        }
        .dinai-btn-back {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 13px;
          color: #8a7a6a;
          cursor: pointer;
          font-family: 'Noto Sans JP', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .dinai-btn-back:hover { border-color: rgba(255,255,255,0.2); color: #c8b8a2; }

        .dinai-btn-submit {
          flex: 1;
          padding: 16px;
          background: linear-gradient(135deg, #ff8c38 0%, #ff5c1a 100%);
          border: none;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(255,100,30,0.3);
        }
        .dinai-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,100,30,0.4); }
        .dinai-btn-submit--loading { opacity: 0.8; cursor: not-allowed; transform: none !important; }
        .dinai-submit-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .dinai-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Loading */
        .dinai-loading-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 16px;
        }
        .dinai-loading-icon {
          font-size: 40px;
          color: #ff8c38;
          animation: spin-slow 3s linear infinite;
        }
        .dinai-loading-text {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #f5f0eb;
          min-width: 220px;
        }
        .dinai-loading-sub {
          font-size: 13px;
          color: #6a5a4a;
          font-weight: 300;
        }

        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .dinai-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

// APIが使えない場合のフォールバック戦略生成
function generateFallbackStrategy(info: StoreInfo): AdStrategy {
  const googleBudget = Math.round((info.budget * 0.65) / 100) * 100;
  const instaBudget = info.budget - googleBudget;

  const ageLabel =
    info.targetAge === "20-30" ? "20〜30歳" :
    info.targetAge === "25-45" ? "25〜45歳" : "30〜50歳";

  const keywordMap: Record<string, string[]> = {
    "居酒屋": ["近くの居酒屋", "今夜の居酒屋"],
    "バー": ["近くのバー", "おしゃれなバー 今夜"],
    "カフェ": ["近くのカフェ", "おすすめカフェ"],
    "レストラン（和食）": ["近くの和食", "和食ディナー"],
    "レストラン（洋食）": ["近くのレストラン", "洋食ディナー"],
    "ラーメン": ["近くのラーメン", "ラーメン 今すぐ"],
    "焼肉": ["近くの焼肉", "焼肉ディナー"],
    "寿司・海鮮": ["近くの寿司", "新鮮な海鮮料理"],
    "イタリアン": ["近くのイタリアン", "パスタ ディナー"],
    "中華": ["近くの中華", "本格中華料理"],
  };

  const interestMap: Record<string, string[]> = {
    "居酒屋": ["居酒屋", "ビール", "日本酒"],
    "バー": ["クラフトビール", "カクテル", "バー"],
    "カフェ": ["コーヒー", "スイーツ", "カフェ巡り"],
    "焼肉": ["焼肉", "グルメ", "肉料理"],
    "ラーメン": ["ラーメン", "グルメ", "食べ歩き"],
    "寿司・海鮮": ["寿司", "海鮮", "グルメ"],
    "イタリアン": ["イタリアン", "ワイン", "パスタ"],
    "中華": ["中華料理", "餃子", "グルメ"],
  };

  const copyMap: Record<string, string> = {
    "居酒屋": `今から空席あります！旬の肴と地酒でいい夜を。(${info.openTime}〜${info.closeTime}営業中)`,
    "バー": `今夜はここで一杯。こだわりのカクテルをどうぞ。(${info.openTime}〜${info.closeTime})`,
    "カフェ": `ゆったりできる席があります。こだわりのコーヒーと共に。(${info.openTime}〜${info.closeTime})`,
    "焼肉": `今夜は焼肉！上質なお肉をリーズナブルに。ご予約不要。(${info.openTime}〜)`,
    "ラーメン": `並ばずに食べられます。こだわりの一杯、今すぐどうぞ。(${info.openTime}〜)`,
    "寿司・海鮮": `今日水揚げの新鮮ネタ、まだあります。特等席でどうぞ。(${info.openTime}〜${info.closeTime})`,
    "イタリアン": `本日のおすすめパスタ、空席あり。ワインと共にゆっくりどうぞ。(${info.openTime}〜)`,
    "中華": `熱々の料理がすぐ出ます。今夜の夕食に本格中華はいかがですか。(${info.openTime}〜)`,
  };

  const closeHour = parseInt(info.closeTime.split(":")[0]);
  const deliveryEnd = Math.max(parseInt(info.openTime.split(":")[0]) + 2, closeHour - 2);

  return {
    google: {
      budget: googleBudget,
      deliveryTime: `${info.openTime}〜${deliveryEnd}:00`,
      keywords: keywordMap[info.gyotai] ?? [`近くの${info.gyotai}`, `${info.gyotai} おすすめ`],
      action: "ルート案内",
    },
    instagram: {
      budget: instaBudget,
      targetRadius: "半径1.5km",
      targetAge: ageLabel,
      interests: interestMap[info.gyotai] ?? ["グルメ", "外食", info.gyotai],
      copyText: copyMap[info.gyotai] ?? `今すぐ${info.gyotai}へ！お席に余裕あります。(${info.openTime}〜${info.closeTime})`,
    },
  };
}
