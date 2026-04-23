"use client";

import { Info, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/client";
import {
  fetchExchangeTaxSettings,
  updateDutySettings,
  updateExchangeRatesSettings,
  type ExchangeTaxSettings,
} from "@/api/settings/exchangeTax";
import { showToast } from "@/lib/toast";

export default function ExchangeRates() {
  const [cnyRate, setCnyRate] = useState("255");
  const [usdRate, setUsdRate] = useState("7");
  const [basicDuty, setBasicDuty] = useState("0");
  const [vatDuty, setVatDuty] = useState("0");
  const [specialDuty, setSpecialDuty] = useState("");
  const [initialSettings, setInitialSettings] = useState<ExchangeTaxSettings>({
    cnyRate: "255",
    usdRate: "7",
    basicDuty: "0",
    vatDuty: "0",
    specialDuty: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingExchange, setSavingExchange] = useState(false);
  const [savingDuty, setSavingDuty] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      try {
        const s = await fetchExchangeTaxSettings();
        if (!mounted) return;
        setCnyRate(s.cnyRate);
        setUsdRate(s.usdRate);
        setBasicDuty(s.basicDuty);
        setVatDuty(s.vatDuty);
        setSpecialDuty(s.specialDuty);
        setInitialSettings(s);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "환율/관세 설정을 불러오지 못했습니다.";
        showToast({ message: msg, variant: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentSettings = useMemo<ExchangeTaxSettings>(
    () => ({
      cnyRate: cnyRate.trim(),
      usdRate: usdRate.trim(),
      basicDuty: basicDuty.trim(),
      vatDuty: vatDuty.trim(),
      specialDuty: specialDuty.trim(),
    }),
    [basicDuty, cnyRate, specialDuty, usdRate, vatDuty],
  );

  const onSaveExchange = async () => {
    if (!currentSettings.cnyRate || !currentSettings.usdRate) {
      showToast({ message: "환율을 입력하세요.", variant: "warning" });
      return;
    }
    setSavingExchange(true);
    try {
      await updateExchangeRatesSettings(currentSettings);
      setInitialSettings(currentSettings);
      showToast({ message: "환율 설정이 저장되었습니다.", variant: "success" });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "환율 저장에 실패했습니다.";
      showToast({ message: msg, variant: "error" });
    } finally {
      setSavingExchange(false);
    }
  };

  const onResetExchange = () => {
    setCnyRate(initialSettings.cnyRate);
    setUsdRate(initialSettings.usdRate);
  };

  const onSaveDuty = async () => {
    setSavingDuty(true);
    try {
      await updateDutySettings(currentSettings);
      setInitialSettings(currentSettings);
      showToast({ message: "관세 설정이 저장되었습니다.", variant: "success" });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "관세 저장에 실패했습니다.";
      showToast({ message: msg, variant: "error" });
    } finally {
      setSavingDuty(false);
    }
  };

  const onResetDuty = () => {
    setBasicDuty(initialSettings.basicDuty);
    setVatDuty(initialSettings.vatDuty);
    setSpecialDuty(initialSettings.specialDuty);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">환율/관세 설정</h1>
      {loading ? (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-500">
          설정값을 불러오는 중...
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">현재 환율 (위안화)</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-600">₩1 = {cnyRate || "0"}¥</p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">기본 관세율</p>
          <p className="mt-2 text-2xl font-semibold text-lime-600">{basicDuty || "0"}%</p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">부가세율</p>
          <p className="mt-2 text-2xl font-semibold text-yellow-500">{vatDuty || "0"}%</p>
        </div>
      </div>

      <div className="relative rounded-md border border-sky-200 bg-sky-50 p-4">
        <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white shadow">
          <Settings className="h-4 w-4" />
        </div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-800">
          <Info className="h-4 w-4" />
          환율 및 관세 안내
        </div>
        <p className="text-xs text-sky-900">
          환율은 매일 자동으로 업데이트되며, 수동으로 조정할 수 있습니다. 관세율은 상품 카테고리별로 다르게 적용될 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">환율 설정</div>
          <div className="space-y-4 px-4 py-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">* 위안화 (CNY)</label>
              <div className="flex items-center rounded border border-gray-300 bg-white">
                <span className="px-3 text-xs text-gray-500">₩1 =</span>
                <input
                  value={cnyRate}
                  onChange={(e) => setCnyRate(e.target.value)}
                  className="h-9 flex-1 border-0 bg-transparent px-2 text-sm outline-none"
                />
                <span className="px-3 text-xs font-semibold text-gray-700">¥</span>
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
                <span className="px-3 text-xs font-semibold text-gray-700">$</span>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={onResetExchange}
                disabled={savingExchange || savingDuty}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => void onSaveExchange()}
                disabled={savingExchange || savingDuty}
                className="rounded bg-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
              >
                {savingExchange ? "저장 중..." : "환율 저장"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">관세 설정</div>
          <div className="space-y-4 px-4 py-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">* 기본 관세율</label>
              <div className="flex items-center rounded border border-gray-300 bg-white">
                <input
                  value={basicDuty}
                  onChange={(e) => setBasicDuty(e.target.value)}
                  className="h-9 flex-1 border-0 bg-transparent px-3 text-sm outline-none"
                />
                <span className="px-3 text-xs font-semibold text-gray-700">%</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">* 부가세율 (VAT)</label>
              <div className="flex items-center rounded border border-gray-300 bg-white">
                <input
                  value={vatDuty}
                  onChange={(e) => setVatDuty(e.target.value)}
                  className="h-9 flex-1 border-0 bg-transparent px-3 text-sm outline-none"
                />
                <span className="px-3 text-xs font-semibold text-gray-700">%</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">사치품 관세율</label>
              <div className="flex items-center rounded border border-cyan-300 bg-white">
                <input
                  value={specialDuty}
                  onChange={(e) => setSpecialDuty(e.target.value)}
                  className="h-9 flex-1 border-0 bg-transparent px-3 text-sm outline-none"
                />
                <span className="px-3 text-xs font-semibold text-gray-700">%</span>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={onResetDuty}
                disabled={savingDuty || savingExchange}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                관세 설정 초기화
              </button>
              <button
                type="button"
                onClick={() => void onSaveDuty()}
                disabled={savingDuty || savingExchange}
                className="rounded bg-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
              >
                {savingDuty ? "저장 중..." : "관세 설정 저장"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
