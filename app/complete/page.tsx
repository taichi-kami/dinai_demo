"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdStrategy = {
  google: { budget: number; deliveryTime: string; keywords: string[]; action: string };
  instagram: { budget: number; targetRadius: string; targetAge: string; interests: string[]; copyText: string };
};

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

export default function CompleteScreen() {
  const router = useRouter();
  const [strategy, setStrategy] = useState<AdStrategy | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("adResult");
    if (!raw) { router.push("/"); return; }
    const { strategy, storeInfo } = JSON.parse(raw);
    setStrategy(strategy);
    setStoreInfo(storeInfo);
    setTimeout(() => setShown(true), 100);
  }, [router]);

  if (!strategy || !storeInfo) return null;

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

        {/* 完了アイコン */}
        <div className={`cp-check-wrap ${shown ? "cp-check-wrap--shown" : ""}`}>
          <div className="cp-check-ring" />
          <div className="cp-check-icon">✓</div>
        </div>

        <h2 className="cp-title">広告セット完了</h2>
        <p className="cp-demo-note">※ これはデモです。実際の広告配信は行っていません。</p>

        {/* サマリーカード */}
        <div className="cp-card">
          <div className="cp-card-store">
            <span>🏪</span>
            <span className="cp-store-name">{storeInfo.storeName}</span>
          </div>

          <div className="cp-divider" />

          <div className="cp-row">
            <span className="cp-label">Google広告</span>
            <span className="cp-value cp-value--orange">¥{strategy.google.budget.toLocaleString()}</span>
          </div>
          <div className="cp-row">
            <span className="cp-label">Instagram広告</span>
            <span className="cp-value cp-value--orange">¥{strategy.instagram.budget.toLocaleString()}</span>
          </div>

          <div className="cp-divider" />

          <div className="cp-row">
            <span className="cp-label">配信時間</span>
            <span className="cp-value">{strategy.google.deliveryTime}</span>
          </div>
          <div className="cp-row">
            <span className="cp-label">ターゲット</span>
            <span className="cp-value">{strategy.instagram.targetRadius} / {strategy.instagram.targetAge}</span>
          </div>

          <div className="cp-divider" />

          <div className="cp-row cp-row--total">
            <span className="cp-label">合計予算</span>
            <span className="cp-value cp-value--large">¥{storeInfo.budget.toLocaleString()}<span className="cp-per-day"> / 日</span></span>
          </div>
        </div>

        {/* タイムライン（疑似スケジュール） */}
        <div className="cp-timeline">
          <p className="cp-timeline-title">配信スケジュール（疑似）</p>
          <div className="cp-timeline-track">
            {["17", "18", "19", "20", "21", "22", "23"].map((h) => {
              const deliveryEnd = parseInt(strategy.google.deliveryTime.split("〜")[1]);
              const active = parseInt(h) < deliveryEnd;
              return (
                <div key={h} className={`cp-timeline-block ${active ? "cp-timeline-block--active" : ""}`}>
                  <span className="cp-timeline-label">{h}時</span>
                </div>
              );
            })}
          </div>
          <div className="cp-timeline-legend">
            <span><span className="cp-dot cp-dot--active" />広告配信中</span>
            <span><span className="cp-dot" />配信なし</span>
          </div>
        </div>

        <button
          className="cp-btn-dashboard"
          onClick={() => router.push("/dashboard")}
        >
          <span>📊</span>
          ダッシュボードを見る
        </button>

        <button className="cp-btn-back" onClick={() => router.push("/strategy")}>
          ← 戦略に戻る
        </button>

        <p className="dinai-footer">© 2025 Dinai — Demo Version</p>
      </div>

      <style>{`
        .cp-check-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          opacity: 0;
          transform: scale(0.6);
          transition: all 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cp-check-wrap--shown { opacity: 1; transform: scale(1); }
        .cp-check-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid #ff8c38;
          animation: ring-pulse 2s ease infinite;
        }
        .cp-check-icon {
          font-size: 36px;
          color: #ff8c38;
          font-weight: 700;
        }

        .cp-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #f5f0eb;
          text-align: center;
          margin-bottom: 8px;
        }
        .cp-demo-note {
          text-align: center;
          font-size: 12px;
          color: #4a3a2a;
          margin-bottom: 32px;
          background: rgba(255,140,56,0.06);
          border: 1px solid rgba(255,140,56,0.12);
          border-radius: 100px;
          padding: 6px 16px;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }

        .cp-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,200,120,0.14);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
          animation: fadeUp 0.5s ease both 0.2s;
        }
        .cp-card-store {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          font-size: 16px;
        }
        .cp-store-name { font-weight: 600; color: #f5f0eb; }

        .cp-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 14px 0;
        }
        .cp-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
        }
        .cp-row--total { margin-top: 4px; }
        .cp-label { font-size: 13px; color: #6a5a4a; }
        .cp-value { font-size: 14px; color: #c8b8a2; }
        .cp-value--orange { color: #ff8c38; font-weight: 600; font-family: 'Syne', sans-serif; }
        .cp-value--large {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #f5f0eb;
        }
        .cp-per-day { font-size: 13px; color: #6a5a4a; font-weight: 400; font-family: 'Noto Sans JP', sans-serif; }

        /* Timeline */
        .cp-timeline {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,200,120,0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          animation: fadeUp 0.5s ease both 0.3s;
        }
        .cp-timeline-title {
          font-size: 12px;
          color: #6a5a4a;
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }
        .cp-timeline-track {
          display: flex;
          gap: 4px;
          margin-bottom: 10px;
        }
        .cp-timeline-block {
          flex: 1;
          height: 28px;
          border-radius: 4px;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cp-timeline-block--active { background: rgba(255,140,56,0.25); }
        .cp-timeline-label { font-size: 9px; color: #4a3a2a; }
        .cp-timeline-block--active .cp-timeline-label { color: #ff8c38; }

        .cp-timeline-legend {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: #6a5a4a;
        }
        .cp-dot {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 2px;
          background: rgba(255,255,255,0.08);
          margin-right: 5px;
        }
        .cp-dot--active { background: rgba(255,140,56,0.5); }

        /* Buttons */
        .cp-btn-dashboard {
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px rgba(255,100,30,0.3);
          transition: all 0.25s;
          animation: fadeUp 0.5s ease both 0.4s;
        }
        .cp-btn-dashboard:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,100,30,0.4); }

        .cp-btn-back {
          width: 100%;
          padding: 14px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          font-size: 13px;
          color: #6a5a4a;
          cursor: pointer;
          font-family: 'Noto Sans JP', sans-serif;
          transition: all 0.2s;
          margin-bottom: 32px;
        }
        .cp-btn-back:hover { border-color: rgba(255,255,255,0.16); color: #c8b8a2; }

        @keyframes ring-pulse {
          0%   { transform: scale(1); opacity: 1; }
          70%  { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
