"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StoreInfo = {
  storeName: string;
  gyotai: string;
  budget: number;
  clientPrice: number;
};

type AdStrategy = {
  google: { budget: number; deliveryTime: string; keywords: string[] };
  instagram: { budget: number; targetAge: string; interests: string[] };
};

const WEEKLY_DATA = [
  { day: "月", visits: 5,  adVisits: 2 },
  { day: "火", visits: 7,  adVisits: 3 },
  { day: "水", visits: 6,  adVisits: 2 },
  { day: "木", visits: 8,  adVisits: 4 },
  { day: "金", visits: 12, adVisits: 5 },
  { day: "土", visits: 20, adVisits: 9 },
  { day: "日", visits: 15, adVisits: 6 },
];

const TODAY = WEEKLY_DATA[5]; // 土曜日を「今日」とする

export default function DashboardScreen() {
  const router = useRouter();
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [strategy, setStrategy] = useState<AdStrategy | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("adResult");
    if (raw) {
      const { strategy, storeInfo } = JSON.parse(raw);
      setStrategy(strategy);
      setStoreInfo(storeInfo);
    } else {
      // ダッシュボード直アクセス時はデフォルト値を使う
      setStoreInfo({ storeName: "デモ店舗", gyotai: "居酒屋", budget: 1500, clientPrice: 3000 });
    }
    setTimeout(() => setAnimated(true), 200);
  }, []);

  if (!storeInfo) return null;

  const budget = strategy ? strategy.google.budget + strategy.instagram.budget : 1500;
  const cpa = Math.round(budget / TODAY.adVisits);
  const maxVisits = Math.max(...WEEKLY_DATA.map((d) => d.visits));

  const suggestions = [
    strategy?.instagram.budget
      ? `金・土のInstagram予算を¥${Math.round(strategy.instagram.budget * 0.3 / 10) * 10}増やすと来店が推定+3人増えます`
      : "金・土のInstagram予算を増やすと来店が増える見込みです",
    strategy?.google.keywords?.length
      ? `Google広告に「${strategy.google.keywords[0]} 予約なし」を追加するとCPAが改善する見込みです`
      : "Googleキーワードを1つ追加するとCPAが改善する見込みです",
    `客単価¥${storeInfo.clientPrice.toLocaleString()}に対し現在のCPAは¥${cpa}、ROIは約${Math.round(storeInfo.clientPrice / cpa * 10) / 10}倍です`,
  ];

  return (
    <div className="dinai-root">
      <div className="dinai-bg" />
      <div className="dinai-container">

        <header className="dinai-header">
          <div className="dinai-logo">
            <span className="dinai-logo-d">D</span>
            <span className="dinai-logo-rest">inai</span>
          </div>
          <p className="dinai-tagline">AIが最適な広告戦略を、一瞬で。</p>
        </header>

        {/* 店舗バッジ */}
        <div className="db-store-badge">
          <span>🏪</span>
          <span className="db-store-name">{storeInfo.storeName}</span>
          <span className="db-demo-tag">疑似データ</span>
        </div>

        {/* KPIカード */}
        <div className="db-kpi-grid">
          <div className="db-kpi-card db-kpi-card--1">
            <p className="db-kpi-label">今日の来店数</p>
            <p className="db-kpi-value">{TODAY.visits}<span className="db-kpi-unit">人</span></p>
            <p className="db-kpi-sub">前日比 +3人</p>
          </div>
          <div className="db-kpi-card db-kpi-card--2">
            <p className="db-kpi-label">広告経由</p>
            <p className="db-kpi-value">{TODAY.adVisits}<span className="db-kpi-unit">人</span></p>
            <p className="db-kpi-sub">{Math.round(TODAY.adVisits / TODAY.visits * 100)}% が広告経由</p>
          </div>
          <div className="db-kpi-card db-kpi-card--3">
            <p className="db-kpi-label">CPA（来店単価）</p>
            <p className="db-kpi-value">¥{cpa.toLocaleString()}</p>
            <p className="db-kpi-sub">客単価の{Math.round(storeInfo.clientPrice / cpa * 10) / 10}倍のROI</p>
          </div>
          <div className="db-kpi-card db-kpi-card--4">
            <p className="db-kpi-label">今日の広告費</p>
            <p className="db-kpi-value">¥{budget.toLocaleString()}</p>
            <p className="db-kpi-sub">予算通り消化中</p>
          </div>
        </div>

        {/* 曜日別グラフ */}
        <div className="db-chart-card">
          <p className="db-chart-title">曜日別の来店数（今週）</p>
          <div className="db-chart">
            {WEEKLY_DATA.map((d, i) => {
              const totalH = animated ? (d.visits / maxVisits) * 100 : 0;
              const adH = animated ? (d.adVisits / maxVisits) * 100 : 0;
              const isToday = i === 5;
              return (
                <div key={d.day} className="db-bar-col">
                  <span className="db-bar-val">{d.visits}</span>
                  <div className="db-bar-wrap">
                    <div
                      className={`db-bar-total ${isToday ? "db-bar-total--today" : ""}`}
                      style={{ height: `${totalH}%` }}
                    />
                    <div
                      className="db-bar-ad"
                      style={{ height: `${adH}%` }}
                    />
                  </div>
                  <span className={`db-bar-day ${isToday ? "db-bar-day--today" : ""}`}>{d.day}</span>
                </div>
              );
            })}
          </div>
          <div className="db-chart-legend">
            <span><span className="db-legend-dot db-legend-dot--total" />総来店数</span>
            <span><span className="db-legend-dot db-legend-dot--ad" />広告経由</span>
          </div>
        </div>

        {/* 広告内訳 */}
        {strategy && (
          <div className="db-breakdown-card">
            <p className="db-breakdown-title">今日の広告内訳</p>
            <div className="db-breakdown-row">
              <span className="db-breakdown-label">Google広告</span>
              <div className="db-breakdown-bar-wrap">
                <div
                  className="db-breakdown-bar db-breakdown-bar--google"
                  style={{ width: animated ? `${(strategy.google.budget / budget) * 100}%` : "0%" }}
                />
              </div>
              <span className="db-breakdown-val">¥{strategy.google.budget.toLocaleString()}</span>
            </div>
            <div className="db-breakdown-row">
              <span className="db-breakdown-label">Instagram広告</span>
              <div className="db-breakdown-bar-wrap">
                <div
                  className="db-breakdown-bar db-breakdown-bar--ig"
                  style={{ width: animated ? `${(strategy.instagram.budget / budget) * 100}%` : "0%" }}
                />
              </div>
              <span className="db-breakdown-val">¥{strategy.instagram.budget.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* AIの改善提案 */}
        <div className="db-suggestion-card">
          <p className="db-suggestion-title">
            <span className="db-suggestion-icon">✦</span>
            Dinaiの改善提案
          </p>
          <div className="db-suggestions">
            {suggestions.map((s, i) => (
              <div key={i} className="db-suggestion-item">
                <span className="db-suggestion-num">{i + 1}</span>
                <p className="db-suggestion-text">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ボタン */}
        <button className="db-btn-restart" onClick={() => router.push("/")}>
          ＋ 新しい戦略を作る
        </button>

        <p className="dinai-footer">© 2025 Dinai — Demo Version</p>
      </div>

      <style>{`
        .db-store-badge {
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
        .db-store-name { font-size: 14px; font-weight: 600; color: #f5f0eb; }
        .db-demo-tag {
          font-size: 10px;
          background: rgba(255,140,56,0.15);
          color: #ff8c38;
          border-radius: 100px;
          padding: 2px 10px;
          letter-spacing: 0.05em;
        }

        /* KPI Grid */
        .db-kpi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .db-kpi-card {
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 18px 16px;
          animation: fadeUp 0.5s ease both;
        }
        .db-kpi-card--1 { border: 1px solid rgba(255,200,120,0.15); animation-delay: 0s; }
        .db-kpi-card--2 { border: 1px solid rgba(255,200,120,0.15); animation-delay: 0.05s; }
        .db-kpi-card--3 { border: 1px solid rgba(255,140,56,0.25); animation-delay: 0.1s; }
        .db-kpi-card--4 { border: 1px solid rgba(255,200,120,0.15); animation-delay: 0.15s; }

        .db-kpi-label { font-size: 11px; color: #6a5a4a; margin-bottom: 6px; letter-spacing: 0.04em; }
        .db-kpi-value {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #f5f0eb;
          line-height: 1;
          margin-bottom: 6px;
        }
        .db-kpi-card--3 .db-kpi-value { color: #ff8c38; }
        .db-kpi-unit { font-size: 14px; font-weight: 400; color: #8a7a6a; font-family: 'Noto Sans JP', sans-serif; }
        .db-kpi-sub { font-size: 11px; color: #4a3a2a; }

        /* Chart */
        .db-chart-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,200,120,0.1);
          border-radius: 20px;
          padding: 24px 20px 16px;
          margin-bottom: 16px;
          animation: fadeUp 0.5s ease both 0.2s;
        }
        .db-chart-title { font-size: 13px; color: #8a7a6a; margin-bottom: 20px; letter-spacing: 0.04em; }

        .db-chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 120px;
          margin-bottom: 10px;
        }
        .db-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
        }
        .db-bar-val { font-size: 11px; color: #6a5a4a; font-family: 'Syne', sans-serif; }
        .db-bar-wrap {
          width: 100%;
          height: 90px;
          position: relative;
          display: flex;
          align-items: flex-end;
        }
        .db-bar-total {
          position: absolute;
          bottom: 0;
          left: 0; right: 0;
          background: rgba(255,200,120,0.15);
          border-radius: 4px 4px 0 0;
          transition: height 0.8s cubic-bezier(0.34,1.2,0.64,1);
        }
        .db-bar-total--today { background: rgba(255,140,56,0.35); }
        .db-bar-ad {
          position: absolute;
          bottom: 0;
          left: 0; right: 0;
          background: #ff8c38;
          border-radius: 4px 4px 0 0;
          transition: height 0.8s cubic-bezier(0.34,1.2,0.64,1) 0.1s;
          opacity: 0.8;
        }
        .db-bar-day { font-size: 11px; color: #4a3a2a; }
        .db-bar-day--today { color: #ff8c38; font-weight: 700; }

        .db-chart-legend { display: flex; gap: 16px; font-size: 11px; color: #6a5a4a; }
        .db-legend-dot {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 2px;
          margin-right: 5px;
        }
        .db-legend-dot--total { background: rgba(255,200,120,0.3); }
        .db-legend-dot--ad { background: #ff8c38; opacity: 0.8; }

        /* Breakdown */
        .db-breakdown-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,200,120,0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          animation: fadeUp 0.5s ease both 0.3s;
        }
        .db-breakdown-title { font-size: 12px; color: #6a5a4a; margin-bottom: 14px; letter-spacing: 0.04em; }
        .db-breakdown-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .db-breakdown-label { font-size: 12px; color: #8a7a6a; min-width: 90px; }
        .db-breakdown-bar-wrap {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
          overflow: hidden;
        }
        .db-breakdown-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s ease 0.4s;
        }
        .db-breakdown-bar--google { background: #4285F4; }
        .db-breakdown-bar--ig { background: #dc2743; }
        .db-breakdown-val { font-size: 13px; color: #c8b8a2; font-family: 'Syne', sans-serif; min-width: 60px; text-align: right; }

        /* Suggestions */
        .db-suggestion-card {
          background: rgba(255,140,56,0.05);
          border: 1px solid rgba(255,140,56,0.2);
          border-radius: 20px;
          padding: 24px 20px;
          margin-bottom: 24px;
          animation: fadeUp 0.5s ease both 0.4s;
        }
        .db-suggestion-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #f5f0eb;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-suggestion-icon { color: #ff8c38; font-size: 12px; }
        .db-suggestions { display: flex; flex-direction: column; gap: 12px; }
        .db-suggestion-item { display: flex; gap: 12px; align-items: flex-start; }
        .db-suggestion-num {
          min-width: 22px;
          height: 22px;
          background: rgba(255,140,56,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #ff8c38;
          font-family: 'Syne', sans-serif;
        }
        .db-suggestion-text { font-size: 13px; color: #c8b8a2; line-height: 1.6; }

        /* Buttons */
        .db-btn-restart {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #ff8c38 0%, #ff5c1a 100%);
          border: none;
          border-radius: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(255,100,30,0.3);
          transition: all 0.25s;
          animation: fadeUp 0.5s ease both 0.5s;
        }
        .db-btn-restart:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,100,30,0.4); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .db-kpi-grid { grid-template-columns: 1fr 1fr; }
          .db-kpi-value { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
