"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GYOTAI_OPTIONS = [
  "居酒屋",
  "バー",
  "カフェ",
  "レストラン（和食）",
  "レストラン（洋食）",
  "ラーメン",
  "焼肉",
  "寿司・海鮮",
  "イタリアン",
  "中華",
  "その他",
];

const AGE_OPTIONS = [
  { label: "20〜30代", value: "20-30" },
  { label: "25〜45代", value: "25-45" },
  { label: "30〜50代", value: "30-50" },
];

const GENDER_OPTIONS = [
  { label: "男性", value: "male" },
  { label: "女性", value: "female" },
  { label: "全て", value: "all" },
];

export default function InputScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    storeName: "",
    address: "",
    gyotai: "居酒屋",
    clientPrice: 3000,
    budget: 1500,
    targetAge: "25-45",
    targetGender: "all",
    openTime: "17:00",
    closeTime: "23:00",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.storeName.trim()) e.storeName = "店舗名を入力してください";
    if (!form.address.trim()) e.address = "住所を入力してください";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/generate_strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      // Store result in sessionStorage and navigate
      sessionStorage.setItem("strategy", JSON.stringify(data));
      sessionStorage.setItem("storeInfo", JSON.stringify(form));
      router.push("/strategy");
    } catch {
      // Demo fallback: navigate with form data
      sessionStorage.setItem("storeInfo", JSON.stringify(form));
      router.push("/strategy");
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Form Card */}
        <div className="dinai-card">
          <h2 className="dinai-card-title">店舗セットアップ</h2>
          <p className="dinai-card-sub">情報を入力して、AIに広告戦略を任せましょう</p>

          <div className="dinai-form">
            {/* 店舗名 */}
            <div className="dinai-field">
              <label className="dinai-label">
                <span className="dinai-label-num">01</span>店舗名
              </label>
              <input
                className={`dinai-input ${errors.storeName ? "dinai-input--error" : ""}`}
                placeholder="例：Beer Bar TOKYO"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              />
              {errors.storeName && <p className="dinai-error">{errors.storeName}</p>}
            </div>

            {/* 住所 */}
            <div className="dinai-field">
              <label className="dinai-label">
                <span className="dinai-label-num">02</span>住所
              </label>
              <input
                className={`dinai-input ${errors.address ? "dinai-input--error" : ""}`}
                placeholder="例：東京都渋谷区道玄坂1-2-3"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              {errors.address && <p className="dinai-error">{errors.address}</p>}
            </div>

            {/* 業態 */}
            <div className="dinai-field">
              <label className="dinai-label">
                <span className="dinai-label-num">03</span>業態
              </label>
              <div className="dinai-select-wrap">
                <select
                  className="dinai-select"
                  value={form.gyotai}
                  onChange={(e) => setForm({ ...form, gyotai: e.target.value })}
                >
                  {GYOTAI_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <span className="dinai-select-arrow">▾</span>
              </div>
            </div>

            {/* 客単価 */}
            <div className="dinai-field">
              <label className="dinai-label">
                <span className="dinai-label-num">04</span>客単価
                <span className="dinai-label-val">¥{form.clientPrice.toLocaleString()}</span>
              </label>
              <input
                type="range"
                className="dinai-range"
                min={500}
                max={15000}
                step={500}
                value={form.clientPrice}
                onChange={(e) => setForm({ ...form, clientPrice: Number(e.target.value) })}
              />
              <div className="dinai-range-ticks">
                <span>¥500</span>
                <span>¥7,500</span>
                <span>¥15,000</span>
              </div>
            </div>

            {/* 1日の広告予算 */}
            <div className="dinai-field">
              <label className="dinai-label">
                <span className="dinai-label-num">05</span>1日の広告予算
                <span className="dinai-label-val">¥{form.budget.toLocaleString()}<span className="dinai-label-unit">/日</span></span>
              </label>
              <input
                type="range"
                className="dinai-range"
                min={500}
                max={3000}
                step={100}
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              />
              <div className="dinai-range-ticks">
                <span>¥500</span>
                <span>¥1,750</span>
                <span>¥3,000</span>
              </div>
            </div>

            {/* ターゲット年齢 */}
            <div className="dinai-field">
              <label className="dinai-label">
                <span className="dinai-label-num">06</span>ターゲット年齢
              </label>
              <div className="dinai-pill-group">
                {AGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`dinai-pill ${form.targetAge === opt.value ? "dinai-pill--active" : ""}`}
                    onClick={() => setForm({ ...form, targetAge: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ターゲット性別 */}
            <div className="dinai-field">
              <label className="dinai-label">
                <span className="dinai-label-num">07</span>ターゲット性別
              </label>
              <div className="dinai-pill-group">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`dinai-pill ${form.targetGender === opt.value ? "dinai-pill--active" : ""}`}
                    onClick={() => setForm({ ...form, targetGender: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 営業時間 */}
            <div className="dinai-field">
              <label className="dinai-label">
                <span className="dinai-label-num">08</span>営業時間
              </label>
              <div className="dinai-time-group">
                <input
                  type="time"
                  className="dinai-time-input"
                  value={form.openTime}
                  onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                />
                <span className="dinai-time-sep">〜</span>
                <input
                  type="time"
                  className="dinai-time-input"
                  value={form.closeTime}
                  onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            className={`dinai-submit ${isLoading ? "dinai-submit--loading" : ""}`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="dinai-submit-inner">
                <span className="dinai-spinner" />
                AIが分析中...
              </span>
            ) : (
              <span className="dinai-submit-inner">
                <span className="dinai-submit-icon">✦</span>
                AIに任せる
              </span>
            )}
          </button>
        </div>

        <p className="dinai-footer">© 2025 Dinai — Demo Version</p>
      </div>
    </div>
  );
}
