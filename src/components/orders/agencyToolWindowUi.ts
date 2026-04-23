/** Shared layout + table chrome for purchase-cost and order-inquiry popup windows */

export const agencyPageBg = "min-h-screen bg-gray-100 pb-10";

export const agencyToolbarTitle =
  "bg-gradient-to-r from-teal-500 via-slate-500 to-purple-600 px-4 py-2 text-sm font-bold text-white";

export const agencyMainColumn = "mx-auto max-w-6xl space-y-4 px-3 pt-4";

export const agencySection = "overflow-hidden rounded border border-gray-300 bg-white shadow-sm";

export const agencySectionTitle = "bg-green-300 px-3 py-1.5 text-xs font-bold text-gray-800";

export const agencySectionBodyPad = "p-3 text-xs";

/** @deprecated prefer agencyOrderInfoTable for order / inquiry summary */
export const agencyOrderInfoGrid = "grid gap-2 text-xs sm:grid-cols-2";

export const agencyLabelMuted = "text-gray-500";

export const agencyValueStrong = "font-medium text-gray-900";

/** 4-column summary: label | value | label | value (green top edge like legacy order panels) */
export const agencyOrderInfoTable =
  "w-full border-collapse text-xs border border-gray-300 border-t-[3px] border-t-emerald-500";

export const agencyOrderInfoTableSectionTh =
  "border-b border-gray-300 bg-gray-100 px-3 py-2 text-left text-xs font-bold text-gray-800";

export const agencyKvLabelTd =
  "w-[15%] border border-gray-300 bg-gray-100 px-2 py-2.5 text-center align-middle text-[11px] font-medium text-gray-600";

export const agencyKvValueTd =
  "border border-gray-300 bg-white px-2 py-2.5 text-left align-middle text-xs font-medium text-gray-900";

/** Purchase-cost quote: table with green title row in thead, th/td label–value body (그림1 형식) */
export const agencyQuoteTable =
  "w-full table-fixed border-collapse text-xs border border-gray-300 border-t-[3px] border-t-emerald-500";

export const agencyQuoteTableHeadTh =
  "border-b border-gray-300 bg-green-300 px-3 py-2 text-left text-xs font-bold text-gray-900";

/** Row header in quote tbody — same look as order summary label cells */
export const agencyQuoteRowTh =
  `${agencyKvLabelTd} font-normal`; /* th 기본 bold 완화 */

export const agencyQuoteRowTd = agencyKvValueTd;

export const agencyTableWrap = "overflow-x-auto";

export const agencyTableMin720 = "w-full min-w-[720px] border-collapse text-xs";

export const agencyTableMin900 = "w-full min-w-[900px] border-collapse text-xs";

export const agencyTable = "w-full border-collapse text-xs";

export const agencyTableFixed = "w-full table-fixed border-collapse text-xs";

export const agencyTheadRow = "bg-gray-400 text-white";

export type AgencyColAlign = "left" | "center";

export function agencyThBase(align: AgencyColAlign) {
  const a = align === "center" ? "text-center" : "text-left";
  return `border border-gray-500 px-1 py-2 text-[11px] font-semibold ${a}`;
}

export function agencyTdBase(align: AgencyColAlign) {
  const a = align === "center" ? "text-center" : "text-left";
  return `border border-gray-200 bg-white px-1 py-1 text-[11px] ${a}`;
}

export const agencyFormTd = "border border-gray-200 bg-white px-2 py-2 align-top";

export const agencyFormTdMiddle = "border border-gray-200 bg-white px-2 py-2 align-middle";

export const agencyFormTdMutedFill = "border border-gray-200 bg-gray-50 px-2 py-2";
