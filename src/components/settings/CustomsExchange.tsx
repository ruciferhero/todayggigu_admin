"use client";
import { Info, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/api/client";
import { fetchDutySettings, updateDutySettings, type DutySettings } from "@/api/settings/exchangeTax";
import { showToast } from "@/lib/toast";

export default function CustomsExchange() {
  const [basicDuty, setBasicDuty] = useState("0");
  const [vatDuty, setVatDuty] = useState("0");
  const [specialDuty, setSpecialDuty] = useState("");
  const [initialDuty, setInitialDuty] = useState<DutySettings>({
    basicDuty: "0",
    vatDuty: "0",
    specialDuty: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingDuty, setSavingDuty] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      try {
        const s = await fetchDutySettings();
        if (!mounted) return;
        setBasicDuty(s.basicDuty);
        setVatDuty(s.vatDuty);
        setSpecialDuty(s.specialDuty);
        setInitialDuty(s);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "관세 설정을 불러오지 못했습니다.";
        showToast({ message: msg, variant: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentDutySettings = useMemo<DutySettings>(
    () => ({
      basicDuty: basicDuty.trim(),
      vatDuty: vatDuty.trim(),
      specialDuty: specialDuty.trim(),
    }),
    [basicDuty, specialDuty, vatDuty],
  );

  const onSaveDuty = async () => {
    setSavingDuty(true);
    try {
      await updateDutySettings(currentDutySettings);
      const refreshed = await fetchDutySettings();
      setBasicDuty(refreshed.basicDuty);
      setVatDuty(refreshed.vatDuty);
      setSpecialDuty(refreshed.specialDuty);
      setInitialDuty(refreshed);
      showToast({ message: "관세 설정이 저장되었습니다.", variant: "success" });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "관세 저장에 실패했습니다.";
      showToast({ message: msg, variant: "error" });
    } finally {
      setSavingDuty(false);
    }
  };

  const onResetDuty = () => {
    setBasicDuty(initialDuty.basicDuty);
    setVatDuty(initialDuty.vatDuty);
    setSpecialDuty(initialDuty.specialDuty);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">관세환율 설정</h1>
      {loading ? (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-500">
          설정값을 불러오는 중...
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">기본 관세율</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-600">{basicDuty || "0"}%</p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">부가세율</p>
          <p className="mt-2 text-2xl font-semibold text-lime-600">{vatDuty || "0"}%</p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">사치품 관세율</p>
          <p className="mt-2 text-2xl font-semibold text-yellow-500">{specialDuty || "0"}%</p>
        </div>
      </div>

      <div className="relative rounded-md border border-sky-200 bg-sky-50 p-4">
        <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white shadow">
          <Settings className="h-4 w-4" />
        </div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-800">
          <Info className="h-4 w-4" />
          관세 설정 안내
        </div>
        <p className="text-xs text-sky-900">
          관세율은 상품 카테고리별로 다르게 적용될 수 있으며, 기본 관세/부가세/사치품 관세율을 각각 관리할 수 있습니다.
        </p>
      </div>

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
              disabled={savingDuty}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              관세 설정 초기화
            </button>
            <button
              type="button"
              onClick={() => void onSaveDuty()}
              disabled={savingDuty}
              className="rounded bg-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
            >
              {savingDuty ? "저장 중..." : "관세 설정 저장"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
