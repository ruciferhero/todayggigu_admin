"use client";

import { Info, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/client";
import {
  fetchAdditionalFxSettings,
  fetchExchangeRatesSettings,
  updateAdditionalFxSettings,
  updateExchangeRatesSettings,
  type AdditionalFxSettings,
  type ExchangeRateSettings,
} from "@/api/settings/exchangeTax";
import { showToast } from "@/lib/toast";

export default function ExchangeRates() {
  const [cnyRate, setCnyRate] = useState("255");
  const [usdRate, setUsdRate] = useState("7");
  const [cnyAdditionalFx, setCnyAdditionalFx] = useState("0");
  const [usdAdditionalFx, setUsdAdditionalFx] = useState("0");
  const [initialExchange, setInitialExchange] = useState<ExchangeRateSettings>({
    cnyRate: "255",
    usdRate: "7",
  });
  const [initialAdditionalFx, setInitialAdditionalFx] = useState<AdditionalFxSettings>({
    cnyAdditionalFxMargin: "0",
    usdAdditionalFxMargin: "0",
  });
  const [loading, setLoading] = useState(true);
  const [savingExchange, setSavingExchange] = useState(false);
  const [savingAdditional, setSavingAdditional] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      const [exchangeRes, additionalRes] = await Promise.allSettled([
        fetchExchangeRatesSettings(),
        fetchAdditionalFxSettings(),
      ]);
      if (!mounted) return;

      if (exchangeRes.status === "fulfilled") {
        const s = exchangeRes.value;
        setCnyRate(s.cnyRate);
        setUsdRate(s.usdRate);
        setInitialExchange(s);
      } else {
        const msg = exchangeRes.reason instanceof ApiError
          ? exchangeRes.reason.message
          : "환율 설정을 불러오지 못했습니다.";
        showToast({ message: msg, variant: "error" });
      }

      if (additionalRes.status === "fulfilled") {
        const s = additionalRes.value;
        setCnyAdditionalFx(s.cnyAdditionalFxMargin);
        setUsdAdditionalFx(s.usdAdditionalFxMargin);
        setInitialAdditionalFx(s);
      } else {
        const msg = additionalRes.reason instanceof ApiError
          ? additionalRes.reason.message
          : "추가환율금액 설정을 불러오지 못했습니다.";
        showToast({ message: msg, variant: "error" });
      }

      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentExchangeSettings = useMemo<ExchangeRateSettings>(
    () => ({
      cnyRate: cnyRate.trim(),
      usdRate: usdRate.trim(),
    }),
    [cnyRate, usdRate],
  );

  const currentAdditionalSettings = useMemo<AdditionalFxSettings>(
    () => ({
      cnyAdditionalFxMargin: cnyAdditionalFx.trim(),
      usdAdditionalFxMargin: usdAdditionalFx.trim(),
    }),
    [cnyAdditionalFx, usdAdditionalFx],
  );

  const onSaveExchange = async () => {
    if (!currentExchangeSettings.cnyRate || !currentExchangeSettings.usdRate) {
      showToast({ message: "환율을 입력하세요.", variant: "warning" });
      return;
    }
    setSavingExchange(true);
    try {
      await updateExchangeRatesSettings(currentExchangeSettings);
      const refreshed = await fetchExchangeRatesSettings();
      setCnyRate(refreshed.cnyRate);
      setUsdRate(refreshed.usdRate);
      setInitialExchange(refreshed);
      showToast({ message: "환율 설정이 저장되었습니다.", variant: "success" });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "환율 저장에 실패했습니다.";
      showToast({ message: msg, variant: "error" });
    } finally {
      setSavingExchange(false);
    }
  };

  const onResetExchange = async () => {
    setSavingExchange(true);
    try {
      const refreshed = await fetchExchangeRatesSettings();
      setCnyRate(refreshed.cnyRate);
      setUsdRate(refreshed.usdRate);
      setInitialExchange(refreshed);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "환율 설정을 불러오지 못했습니다.";
      showToast({ message: msg, variant: "error" });
    } finally {
      setSavingExchange(false);
    }
  };

  const onSaveAdditionalFx = async () => {
    if (!currentAdditionalSettings.cnyAdditionalFxMargin || !currentAdditionalSettings.usdAdditionalFxMargin) {
      showToast({ message: "추가환율(위안/달러)을 모두 입력하세요.", variant: "warning" });
      return;
    }
    setSavingAdditional(true);
    try {
      await updateAdditionalFxSettings(currentAdditionalSettings);
      const refreshed = await fetchAdditionalFxSettings();
      setCnyAdditionalFx(refreshed.cnyAdditionalFxMargin);
      setUsdAdditionalFx(refreshed.usdAdditionalFxMargin);
      setInitialAdditionalFx(refreshed);
      showToast({ message: "추가환율금액 설정이 저장되었습니다.", variant: "success" });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "추가환율금액 저장에 실패했습니다.";
      showToast({ message: msg, variant: "error" });
    } finally {
      setSavingAdditional(false);
    }
  };

  const onResetAdditionalFx = () => {
    setCnyAdditionalFx(initialAdditionalFx.cnyAdditionalFxMargin);
    setUsdAdditionalFx(initialAdditionalFx.usdAdditionalFxMargin);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">환율/추가환율금액 설정</h1>
      {loading ? (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-500">
          설정값을 불러오는 중...
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">현재 환율 (위안화)</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-600"> ¥1 = {cnyRate || "0"}₩</p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">현재 환율 (달러)</p>
          <p className="mt-2 text-2xl font-semibold text-lime-600">$1 = {usdRate || "0"}₩</p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">추가환율금액 (위안/달러)</p>
          <p className="mt-2 text-2xl font-semibold text-yellow-500">
            ¥ {cnyAdditionalFx || "0"} / $ {usdAdditionalFx || "0"}
          </p>
        </div>
      </div>

      <div className="relative rounded-md border border-sky-200 bg-sky-50 p-4">
        <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white shadow">
          <Settings className="h-4 w-4" />
        </div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-800">
          <Info className="h-4 w-4" />
          환율 및 추가환율금액 안내
        </div>
        <p className="text-xs text-sky-900">
          환율은 매일 자동으로 업데이트되며, 수동으로 조정할 수 있습니다. 추가환율금액도 통화별(CNY/USD)로 각각 설정할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">환율 설정</div>
          <div className="space-y-4 px-4 py-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">* 위안화 (CNY)</label>
              <div className="flex items-center rounded border border-gray-300 bg-white">
                <span className="px-3 text-xs text-gray-500">¥1 =</span>
                <input
                  value={cnyRate}
                  onChange={(e) => setCnyRate(e.target.value)}
                  className="h-9 flex-1 border-0 bg-transparent px-2 text-sm outline-none"
                />
                <span className="px-3 text-xs font-semibold text-gray-700">₩</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">* 달러 (USD)</label>
              <div className="flex items-center rounded border border-gray-300 bg-white">
                <span className="px-3 text-xs text-gray-500">$1 =</span>
                <input
                  value={usdRate}
                  onChange={(e) => setUsdRate(e.target.value)}
                  className="h-9 flex-1 border-0 bg-transparent px-2 text-sm outline-none"
                />
                <span className="px-3 text-xs font-semibold text-gray-700">₩</span>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => void onResetExchange()}
                disabled={savingExchange || savingAdditional}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => void onSaveExchange()}
                disabled={savingExchange || savingAdditional}
                className="rounded bg-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
              >
                {savingExchange ? "저장 중..." : "환율 저장"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">추가환율금액 설정</div>
          <div className="space-y-4 px-4 py-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">* 위안화 (CNY)</label>
              <div className="flex items-center rounded border border-gray-300 bg-white">
                <span className="px-3 text-xs text-gray-500">¥</span>
                <input
                  value={cnyAdditionalFx}
                  onChange={(e) => setCnyAdditionalFx(e.target.value)}
                  className="h-9 flex-1 border-0 bg-transparent px-3 text-sm outline-none"
                />
                <span className="px-3 text-xs font-semibold text-gray-700">원</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">* 달러 (USD)</label>
              <div className="flex items-center rounded border border-gray-300 bg-white">
                <span className="px-3 text-xs text-gray-500">$</span>
                <input
                  value={usdAdditionalFx}
                  onChange={(e) => setUsdAdditionalFx(e.target.value)}
                  className="h-9 flex-1 border-0 bg-transparent px-3 text-sm outline-none"
                />
                <span className="px-3 text-xs font-semibold text-gray-700">원</span>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={onResetAdditionalFx}
                disabled={savingAdditional || savingExchange}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => void onSaveAdditionalFx()}
                disabled={savingAdditional || savingExchange}
                className="rounded bg-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
              >
                {savingAdditional ? "저장 중..." : "추가환율금액 저장"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
