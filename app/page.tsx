"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AREA_FACTOR = 0.3025;
const KCAL_PER_PING = 600;
const KCAL_TO_KW = 860;
/** 條件加成（Kcal/h）：挑高 +50/坪、頂樓 +100坪、西曬 +150坪（與坪數成比例、可疊加） */
const BONUS_KCAL_HIGH_CEILING_PER_PING = 50;
const BONUS_KCAL_TOP_FLOOR_PER_PING = 100
const BONUS_KCAL_WEST_SUN_PER_PING = 150

type WizardStep = "home" | "q1" | "q2" | "q3" | "result";

type Answers = {
  highCeiling: boolean | null;
  westSun: boolean | null;
  topFloor: boolean | null;
};

const INITIAL_ANSWERS: Answers = {
  highCeiling: null,
  westSun: null,
  topFloor: null
};

const NAVY = "#1a1a40";
const PEACH = "#f3d5b2";
const GOLD = "#f1df91";

function formatNumber(value: number, decimals = 1) {
  if (!Number.isFinite(value)) return "";
  const rounded = Number(value.toFixed(decimals));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
}

function parsePositive(value: string) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function NavFooterButton({
  children,
  onClick,
  disabled
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-auto w-full border-0 py-4 text-center text-xl font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: NAVY }}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [step, setStep] = useState<WizardStep>("home");
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);

  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [manualPing, setManualPing] = useState("");
  const [kcalResult, setKcalResult] = useState<string | null>(null);
  const [kwResult, setKwResult] = useState<string | null>(null);

  const autoPing = useMemo(() => {
    const l = parsePositive(length);
    const w = parsePositive(width);
    if (!l || !w) return null;
    return l * w * AREA_FACTOR;
  }, [length, width]);

  const hasDimensionInput = length.trim() !== "" || width.trim() !== "";
  const hasPingInput = manualPing.trim() !== "";
  const isPingDisabled = hasDimensionInput;
  const isDimensionDisabled = hasPingInput;

  const pingValue = useMemo(() => {
    const direct = parsePositive(manualPing);
    if (direct) return direct;
    return autoPing;
  }, [manualPing, autoPing]);

  const bonusKcal = useMemo(() => {
    if (!pingValue) return 0;
    let sum = 0;
    if (answers.highCeiling === true) sum += pingValue * BONUS_KCAL_HIGH_CEILING_PER_PING;
    if (answers.topFloor === true) sum += pingValue * BONUS_KCAL_TOP_FLOOR_PER_PING;
    if (answers.westSun === true) sum += pingValue * BONUS_KCAL_WEST_SUN_PER_PING;
    return sum;
  }, [pingValue, answers.highCeiling, answers.westSun, answers.topFloor]);

  const baseKcal = pingValue ? pingValue * KCAL_PER_PING : null;
  const baseKw = baseKcal !== null ? baseKcal / KCAL_TO_KW : null;
  const finalKcal = baseKcal !== null ? baseKcal + bonusKcal : null;
  const finalKw = finalKcal !== null ? finalKcal / KCAL_TO_KW : null;

  useEffect(() => {
    if (step === "result" && pingValue === null) {
      setStep("home");
    }
  }, [step, pingValue]);

  function handleCalculateKcal() {
    if (!pingValue) return;
    setKcalResult(`${formatNumber(pingValue * KCAL_PER_PING, 0)} Kcal/h`);
  }

  function handleCalculateKw() {
    if (!pingValue) return;
    const kw = (pingValue * KCAL_PER_PING) / KCAL_TO_KW;
    setKwResult(`${formatNumber(kw, 1)} Kw`);
  }

  function handleClear() {
    setLength("");
    setWidth("");
    setManualPing("");
    setKcalResult(null);
    setKwResult(null);
  }

  function goNextFromHome() {
    if (!pingValue) return;
    setAnswers({ ...INITIAL_ANSWERS });
    setStep("q1");
  }

  function goHome() {
    setStep("home");
  }

  function answerQ1(value: boolean) {
    setAnswers((a) => ({ ...a, highCeiling: value }));
    setStep("q2");
  }

  function answerQ2(value: boolean) {
    setAnswers((a) => ({ ...a, topFloor: value }));
    setStep("q3");
  }

  function answerQ3(value: boolean) {
    setAnswers((a) => ({ ...a, westSun: value }));
    setStep("result");
  }

  function handleWizardPrev() {
    if (step === "q1") {
      setStep("home");
      return;
    }
    if (step === "q2") {
      setAnswers((a) => ({ ...a, topFloor: null }));
      setStep("q1");
      return;
    }
    if (step === "q3") {
      setAnswers((a) => ({ ...a, westSun: null }));
      setStep("q2");
      return;
    }
    if (step === "result") {
      setStep("q3");
    }
  }

  const displayedPing = isPingDisabled ? (autoPing ? formatNumber(autoPing, 1) : "0") : manualPing;
  const autoDisplayKcal = pingValue ? `${formatNumber(pingValue * KCAL_PER_PING, 0)} Kcal/h` : null;
  const autoDisplayKw = pingValue ? `${formatNumber((pingValue * KCAL_PER_PING) / KCAL_TO_KW, 1)} Kw` : null;
  const displayKcal = autoDisplayKcal ?? kcalResult;
  const displayKw = autoDisplayKw ?? kwResult;

  if (step === "q1" || step === "q2" || step === "q3") {
    const question =
      step === "q1"
        ? "是否為挑高樓層 (3m以上)?"
        : step === "q2"
          ? "是否在頂樓?"
          : "是否有西曬？";

    const onNo = step === "q1" ? () => answerQ1(false) : step === "q2" ? () => answerQ2(false) : () => answerQ3(false);
    const onYes = step === "q1" ? () => answerQ1(true) : step === "q2" ? () => answerQ2(true) : () => answerQ3(true);

    return (
      <main className="flex min-h-screen flex-col bg-background">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 p-4 md:gap-12 md:p-8">
          <Card className="border-border/70 bg-card/95">
            <CardContent className="px-6 pb-10 pt-10 md:px-8 md:pt-12">
              <p className="max-w-lg text-center text-2xl font-black leading-snug text-card-foreground md:text-2xl">
                {question}
              </p>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-10 pb-4 md:gap-16">
            <button
              type="button"
              aria-label="否"
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#e53935] text-white shadow-md transition active:scale-95 md:h-32 md:w-32"
              onClick={onNo}
            >
              <X className="size-14 stroke-[3] md:size-16" strokeWidth={3} />
            </button>
            <button
              type="button"
              aria-label="是"
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#43a047] text-white shadow-md transition active:scale-95 md:h-32 md:w-32"
              onClick={onYes}
            >
              <Check className="size-14 stroke-[3] md:size-16" strokeWidth={3} />
            </button>
          </div>
        </div>
        <NavFooterButton onClick={handleWizardPrev}>上一頁</NavFooterButton>
      </main>
    );
  }

  if (step === "result" && pingValue !== null && baseKcal !== null && baseKw !== null && finalKcal !== null && finalKw !== null) {
    const pingLabel = formatNumber(pingValue, 1);
    const origKcal = formatNumber(baseKcal, 0);
    const origKw = formatNumber(baseKw, 1);
    const outKcal = formatNumber(finalKcal, 0);
    const outKw = formatNumber(finalKw, 1);

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pb-4 pt-8">
          <div
            className="rounded-full px-4 py-3 text-center text-base font-black text-[#333] md:text-lg"
            style={{ backgroundColor: PEACH }}
          >
            您原本設定條件是 {pingLabel} 坪
          </div>
          <h2 className="text-center text-xl font-black md:text-2xl" style={{ color: NAVY }}>
            您需要的冷房能力為
          </h2>
          <div className="flex flex-col gap-4">
            <div
              className="rounded-3xl py-6 text-center text-3xl font-black text-white md:text-4xl"
              style={{ backgroundColor: NAVY }}
            >
              {outKcal}Kcal/h
            </div>
            <div
              className="rounded-3xl py-6 text-center text-3xl font-black text-white md:text-4xl"
              style={{ backgroundColor: NAVY }}
            >
              {outKw}Kw
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p
              className="text-center flex-1 rounded-2xl px-3 py-2 text-sm font-bold text-[#333] md:text-base"
              style={{ backgroundColor: GOLD }}
            >
              原始計算值為 {origKcal}Kcal/h , {origKw}Kw
            </p>
          </div>
        </div>
        <div className="flex w-full gap-[3px] bg-background">
          <button
            type="button"
            className="flex-1 border-0 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
            style={{ backgroundColor: NAVY }}
            onClick={handleWizardPrev}
          >
            上一頁
          </button>
          <button
            type="button"
            className="flex-1 border-0 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
            style={{ backgroundColor: NAVY }}
            onClick={goHome}
          >
            回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-4 md:p-8">
        <Card className="border-border/70 bg-card/95">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-primary md:text-5xl">冷房試算</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="長(公尺)"
                value={length}
                onChange={(event) => setLength(event.target.value)}
                disabled={isDimensionDisabled}
                className="h-12 text-lg font-bold"
              />
              <span className="text-xl font-black">X</span>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="寬(公尺)"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
                disabled={isDimensionDisabled}
                className="h-12 text-lg font-bold"
              />
              <span className="text-lg font-black text-muted-foreground">0.3025</span>
            </div>

            <p className="px-1 py-1 text-sm font-semibold text-blue-400">
              長(公尺) X 寬(公尺) X 0.3025 = 坪數
            </p>

            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder={isPingDisabled ? "自動計算坪數" : "請輸入坪數"}
                value={displayedPing}
                onChange={(event) => setManualPing(event.target.value)}
                disabled={isPingDisabled}
                className="h-12 text-lg font-bold"
              />
              <span className="text-xl font-black">坪</span>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-14 w-full text-lg font-black md:text-xl"
                onClick={handleCalculateKcal}
              >
                {displayKcal ?? "計算值 Kcal/h"}
              </Button>
              <div />
              <Button
                type="button"
                variant="secondary"
                className="h-14 w-full text-lg font-black md:text-xl"
                onClick={handleCalculateKw}
              >
                {displayKw ?? "計算值 Kw"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-14 rounded-full px-6 text-base font-black md:text-lg"
                onClick={handleClear}
              >
                清除
              </Button>
            </div>

            <section className="space-y-1 border-t pt-4 text-sm font-semibold text-muted-foreground md:text-base">
              <p>冷氣每小時移走的熱量單位： Kcal/h, Kw</p>
              <p>一坪約需 600kcal/hr 來計算（台灣氣候因數）</p>
              <p>冷氣大小計算： </p>
              <p>坪數 x（依照房間條件所需移走之熱量）= 冷氣的能力</p>
              <p>計算僅供參考使用</p>
              <p>★特殊場地及營業場所必須與專業人員現場評估討論★</p>
            </section>
          </CardContent>
        </Card>
      </div>
      <NavFooterButton onClick={goNextFromHome} disabled={!pingValue}>
        下一頁
      </NavFooterButton>
    </main>
  );
}
