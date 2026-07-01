import { NextRequest, NextResponse } from "next/server";

export type StoreInfo = {
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

export type AdStrategy = {
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

// Mock strategy generator — replace with AI API call in production
function generateStrategy(info: StoreInfo): AdStrategy {
  const googleBudget = Math.round(info.budget * 0.65 / 100) * 100;
  const instaBudget = info.budget - googleBudget;

  const ageLabel = info.targetAge === "20-30"
    ? "20〜30歳"
    : info.targetAge === "25-45"
    ? "25〜45歳"
    : "30〜50歳";

  const gyotaiKeywordMap: Record<string, string[]> = {
    "居酒屋": ["近くの居酒屋", `${info.gyotai} ${info.address.slice(0, 3)}`],
    "バー": ["近くのバー", "おしゃれなバー 今夜"],
    "カフェ": ["近くのカフェ", "おすすめカフェ"],
    "レストラン（和食）": ["近くの和食", "和食レストラン ランチ"],
    "レストラン（洋食）": ["近くのレストラン", "洋食 ディナー"],
    "ラーメン": ["近くのラーメン屋", "ラーメン 今すぐ食べたい"],
    "焼肉": ["近くの焼肉", "焼肉 食べ放題"],
    "寿司・海鮮": ["近くの寿司屋", "新鮮な海鮮料理"],
    "イタリアン": ["近くのイタリアン", "パスタ ディナー"],
    "中華": ["近くの中華", "本格中華料理"],
  };

  const keywords = gyotaiKeywordMap[info.gyotai] ?? [
    `近くの${info.gyotai}`,
    `${info.gyotai} おすすめ`,
  ];

  const interestMap: Record<string, string[]> = {
    "居酒屋": ["居酒屋", "ビール", "日本酒"],
    "バー": ["クラフトビール", "カクテル", "バー"],
    "カフェ": ["コーヒー", "スイーツ", "カフェ巡り"],
    "焼肉": ["焼肉", "グルメ", "肉料理"],
    "ラーメン": ["ラーメン", "グルメ", "食べ歩き"],
  };
  const interests = interestMap[info.gyotai] ?? ["グルメ", "外食", info.gyotai];

  // Generate copy text
  const timeStr = `${info.openTime}〜${info.closeTime}`;
  const copyMap: Record<string, string> = {
    "居酒屋": `今から空席あります！旬の肴と地酒でいい夜を。(${timeStr}営業中)`,
    "バー": `今夜はここで一杯。こだわりのカクテルをどうぞ。(${timeStr})`,
    "カフェ": `ゆったりできる席があります。こだわりのコーヒーと共に。(${timeStr})`,
    "焼肉": `今夜は焼肉！上質なお肉をリーズナブルに。ご予約不要。(${timeStr})`,
    "ラーメン": `並ばずに食べられます。こだわりの一杯、今すぐどうぞ。(${timeStr})`,
  };
  const copyText = copyMap[info.gyotai]
    ?? `今すぐ${info.gyotai}へ！お席に余裕あります。(${timeStr})`;

  // Delivery time: 2hrs before close
  const openHour = parseInt(info.openTime.split(":")[0]);
  const closeHour = parseInt(info.closeTime.split(":")[0]);
  const deliveryEnd = Math.max(openHour + 2, closeHour - 2);
  const deliveryTime = `${info.openTime}〜${deliveryEnd}:00`;

  return {
    google: {
      budget: googleBudget,
      deliveryTime,
      keywords,
      action: "ルート案内",
    },
    instagram: {
      budget: instaBudget,
      targetRadius: "半径1.5km",
      targetAge: ageLabel,
      interests,
      copyText,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: StoreInfo = await req.json();

    // Validate required fields
    if (!body.storeName || !body.address) {
      return NextResponse.json(
        { error: "店舗名と住所は必須です" },
        { status: 400 }
      );
    }

    const strategy = generateStrategy(body);

    return NextResponse.json(
      { strategy, storeInfo: body },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
