"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { OrderBoardOrder, OrderBoardProduct } from "@/components/orders/OrderBoard";
import {
  agencyKvLabelTd,
  agencyKvValueTd,
  agencyMainColumn,
  agencyOrderInfoTable,
  agencyOrderInfoTableSectionTh,
  agencyPageBg,
  agencySection,
  agencySectionTitle,
  agencyTableMin900,
  agencyTableWrap,
  agencyTdBase,
  agencyThBase,
  agencyTheadRow,
  agencyToolbarTitle,
  type AgencyColAlign,
} from "@/components/orders/agencyToolWindowUi";
import { useLocale } from "@/contexts/LocaleContext";
import { showToast } from "@/lib/toast";

const FONT_FAMILIES = [
  "Malgun Gothic",
  "맑은 고딕",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Gulim",
  "Dotum",
] as const;

const FONT_SIZES_PT = ["8", "9", "10", "11", "12", "14", "16", "18"] as const;

/** Preset minimum heights (px); footer control cycles; wrapper stays `resize-y` for manual drag. */
const INQUIRY_HEIGHT_PRESETS = [128, 160, 192, 256, 336, 432] as const;

function fmtYuan(n: number) {
  return `¥ ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function approxUsdFromYuan(yuan: number) {
  const rate = 0.146;
  return `(~$ ${(yuan * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
}

function htmlToPlainText(html: string) {
  if (!html.trim()) return "";
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  return doc.body.textContent?.replace(/\u00a0/g, " ") ?? "";
}

function escapeHtmlText(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainTextToHtml(text: string) {
  const lines = text.split(/\r?\n/);
  return lines.map((line) => escapeHtmlText(line) || "<br>").join("<br>");
}

function execCmd(command: string, value?: string) {
  document.execCommand(command, false, value);
}

type InquiryKvRow = {
  k: string;
  l1: string;
  v1: ReactNode;
  l2: string;
  v2: ReactNode;
};

type ProductCol = {
  key: string;
  label: string;
  align: AgencyColAlign;
  cell: (p: OrderBoardProduct, rowIndex: number) => ReactNode;
};

type InquiryEditorMode = "editor" | "html" | "text";

export default function OrderInquiryToolWindow({ order }: { order: OrderBoardOrder }) {
  const { t } = useLocale();
  const [inquiryHtml, setInquiryHtml] = useState("");
  const [textPlain, setTextPlain] = useState("");
  const [editorMode, setEditorMode] = useState<InquiryEditorMode>("editor");
  const [sms, setSms] = useState("none");
  const [fontFamily, setFontFamily] = useState<string>(FONT_FAMILIES[0]);
  const [fontSizePt, setFontSizePt] = useState<string>(FONT_SIZES_PT[1]);
  const [inquiryHeightIx, setInquiryHeightIx] = useState(1);
  const [fmtActive, setFmtActive] = useState({ bold: false, italic: false, underline: false });

  const editorRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const inquiryHtmlRef = useRef(inquiryHtml);
  inquiryHtmlRef.current = inquiryHtml;

  const yuanTotal = order.totalAmount;

  const inquiryMinHeightPx = INQUIRY_HEIGHT_PRESETS[inquiryHeightIx];

  const refreshFormatState = useCallback(() => {
    if (editorMode !== "editor" || !editorRef.current) {
      setFmtActive({ bold: false, italic: false, underline: false });
      return;
    }
    const sel = document.getSelection();
    if (!sel?.anchorNode || !editorRef.current.contains(sel.anchorNode)) {
      setFmtActive({ bold: false, italic: false, underline: false });
      return;
    }
    try {
      setFmtActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    } catch {
      setFmtActive({ bold: false, italic: false, underline: false });
    }
  }, [editorMode]);

  useEffect(() => {
    const onSelectionChange = () => {
      refreshFormatState();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [refreshFormatState]);

  const cycleInquiryResize = useCallback(() => {
    setInquiryHeightIx((i) => (i + 1) % INQUIRY_HEIGHT_PRESETS.length);
  }, []);

  const fmtToggleClass = (pressed: boolean, typographic: "bold" | "italic" | "underline") => {
    const base =
      "h-7 rounded border px-2 disabled:cursor-not-allowed disabled:opacity-50 " +
      (typographic === "bold" ? "font-bold " : typographic === "italic" ? "italic " : "underline ");
    return (
      base +
      (pressed
        ? "border-blue-600 bg-blue-100 text-blue-900 shadow-inner"
        : "border-gray-800 bg-[#f7f7f7] text-gray-900 hover:bg-gray-100")
    );
  };

  const flushEditorToHtml = useCallback(() => {
    if (editorRef.current) setInquiryHtml(editorRef.current.innerHTML);
  }, []);

  const focusEditor = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  const applyFontName = useCallback(
    (name: string) => {
      setFontFamily(name);
      if (editorMode !== "editor") return;
      focusEditor();
      execCmd("fontName", name);
      flushEditorToHtml();
    },
    [editorMode, flushEditorToHtml, focusEditor],
  );

  const wrapSelectionWithSpan = useCallback(
    (style: Partial<Pick<CSSStyleDeclaration, "fontSize" | "fontFamily">>) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      if (style.fontSize) span.style.fontSize = style.fontSize;
      if (style.fontFamily) span.style.fontFamily = style.fontFamily;
      if (range.collapsed) {
        span.appendChild(document.createTextNode("\u200b"));
        range.insertNode(span);
        const z = span.firstChild;
        if (z) {
          range.setStart(z, 1);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        sel.removeAllRanges();
        const nr = document.createRange();
        nr.selectNodeContents(span);
        nr.collapse(false);
        sel.addRange(nr);
      }
      flushEditorToHtml();
    },
    [flushEditorToHtml],
  );

  const applyFontSizePt = useCallback(
    (pt: string) => {
      setFontSizePt(pt);
      if (editorMode !== "editor") return;
      wrapSelectionWithSpan({ fontSize: `${pt}pt` });
    },
    [editorMode, wrapSelectionWithSpan],
  );

  const handleBold = useCallback(() => {
    if (editorMode !== "editor") return;
    focusEditor();
    execCmd("bold");
    flushEditorToHtml();
    refreshFormatState();
  }, [editorMode, flushEditorToHtml, focusEditor, refreshFormatState]);

  const handleItalic = useCallback(() => {
    if (editorMode !== "editor") return;
    focusEditor();
    execCmd("italic");
    flushEditorToHtml();
    refreshFormatState();
  }, [editorMode, flushEditorToHtml, focusEditor, refreshFormatState]);

  const handleUnderline = useCallback(() => {
    if (editorMode !== "editor") return;
    focusEditor();
    execCmd("underline");
    flushEditorToHtml();
    refreshFormatState();
  }, [editorMode, flushEditorToHtml, focusEditor, refreshFormatState]);

  const handlePhotoPick = useCallback(() => {
    if (editorMode !== "editor") return;
    photoInputRef.current?.click();
  }, [editorMode]);

  const onPhotoFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        editorRef.current?.focus();
        execCmd("insertImage", url);
        flushEditorToHtml();
      };
      reader.readAsDataURL(file);
    },
    [flushEditorToHtml],
  );

  const goEditorMode = useCallback(() => {
    if (editorMode === "text") setInquiryHtml(plainTextToHtml(textPlain));
    if (editorMode === "editor") return;
    if (editorMode === "html") {
      /* inquiryHtml already controlled by textarea */
    }
    setEditorMode("editor");
  }, [editorMode, textPlain]);

  const goHtmlMode = useCallback(() => {
    if (editorMode === "editor" && editorRef.current) {
      setInquiryHtml(editorRef.current.innerHTML);
    }
    setEditorMode("html");
  }, [editorMode]);

  const goTextMode = useCallback(() => {
    let html = inquiryHtml;
    if (editorMode === "editor" && editorRef.current) {
      html = editorRef.current.innerHTML;
      setInquiryHtml(html);
    }
    setTextPlain(htmlToPlainText(html));
    setEditorMode("text");
  }, [editorMode, inquiryHtml]);

  useLayoutEffect(() => {
    if (editorMode !== "editor" || !editorRef.current) return;
    const html = inquiryHtmlRef.current.trim() ? inquiryHtmlRef.current : "<br>";
    editorRef.current.innerHTML = html;
    queueMicrotask(refreshFormatState);
  }, [editorMode, refreshFormatState]);

  const toolbarDisabled = editorMode !== "editor";

  const modeBtn = (mode: InquiryEditorMode, labelKey: string) => {
    const active = editorMode === mode;
    return (
      <button
        type="button"
        onClick={() => {
          if (mode === "editor") goEditorMode();
          else if (mode === "html") goHtmlMode();
          else goTextMode();
        }}
        className={`rounded border px-2 py-0.5 ${
          active ? "border-gray-800 bg-gray-100 font-medium text-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        {t(labelKey)}
      </button>
    );
  };

  const inquiryKvRows = useMemo<InquiryKvRow[]>(
    () => [
      {
        k: "r1",
        l1: t("orders.tool.inquiry.summary.applicationShipped"),
        v1: `${order.typeLabel} / ${order.isShipped ? t("orders.tool.inquiry.shippedAuto") : t("orders.tool.inquiry.manualPayment")}`,
        l2: t("orders.tool.inquiry.summary.centerMethod"),
        v2: order.center || order.shippingMethod ? `${order.center || "—"} / ${order.shippingMethod}` : "—",
      },
      {
        k: "r2",
        l1: t("orders.common.receiver"),
        v1: order.receiver || "—",
        l2: t("orders.tool.inquiry.summary.trackIn"),
        v2: `${order.trackingCount} / ${order.warehousedCount}`,
      },
      {
        k: "r3",
        l1: t("orders.tool.inquiry.summary.qtyAmount"),
        v1: (
          <span className="font-semibold text-red-600">
            {order.qty} / {fmtYuan(yuanTotal)}{" "}
            <span className="text-sm font-normal text-gray-600">{approxUsdFromYuan(yuanTotal)}</span>
          </span>
        ),
        l2: t("orders.tool.inquiry.summary.rack"),
        v2: order.rack || "—",
      },
      {
        k: "r4",
        l1: t("orders.tool.inquiry.summary.warehouseProgress"),
        v1: `${order.warehouseStatus || "—"} / ${order.progressStatus || order.statusCode}`,
        l2: t("orders.tool.inquiry.summary.date"),
        v2: (
          <>
            {order.createdAt}
            <br />
            {order.updatedAt}
          </>
        ),
      },
    ],
    [order, t, yuanTotal],
  );

  const productCols = useMemo<ProductCol[]>(
    () => [
      {
        key: "no",
        label: t("orders.tool.inquiry.col.no"),
        align: "center",
        cell: (p, i) => p.productNo || String(i + 1),
      },
      {
        key: "img",
        label: t("orders.product.image"),
        align: "center",
        cell: (p) =>
          p.image ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center bg-gray-50 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-500">
              {t("orders.tool.noImage")}
            </div>
          ),
      },
      {
        key: "name",
        label: t("orders.tool.inquiry.col.nameCustoms"),
        align: "left",
        cell: (p) => p.name,
      },
      {
        key: "code",
        label: t("orders.tool.inquiry.col.codeBrand"),
        align: "left",
        cell: (p) => p.productNo,
      },
      {
        key: "track",
        label: t("orders.tool.inquiry.col.trackOrder"),
        align: "left",
        cell: (p) => (
          <>
            {p.trackingNo} / {p.productOrderNumber?.trim() || p.orderNo}
          </>
        ),
      },
      {
        key: "opt",
        label: t("orders.tool.inquiry.col.colorSize"),
        align: "left",
        cell: (p) => <span className="whitespace-pre-wrap">{p.option}</span>,
      },
      {
        key: "price",
        label: t("orders.tool.inquiry.col.unitQtyTotal"),
        align: "left",
        cell: (p) => (
          <>
            {fmtYuan(p.unitPrice)} × {p.quantity} / {fmtYuan(p.totalPrice)} {approxUsdFromYuan(p.totalPrice)}
          </>
        ),
      },
      {
        key: "rack",
        label: t("orders.tool.inquiry.col.rackPrev"),
        align: "left",
        cell: (p) => (
          <>
            {p.rackNo || "—"} / {p.prevRackNo || "—"}
          </>
        ),
      },
      {
        key: "st",
        label: t("orders.common.warehouseStatus"),
        align: "center",
        cell: (p) => p.statusLabel || "—",
      },
    ],
    [t],
  );

  return (
    <div className={agencyPageBg}>
      <div className={agencyToolbarTitle}>■ {t("orders.tool.inquiry.title")}</div>

      <div className={agencyMainColumn}>
        <section className={agencySection}>
          <table className={agencyOrderInfoTable}>
            <thead>
              <tr>
                <th colSpan={4} className={agencyOrderInfoTableSectionTh}>
                  {t("orders.tool.purchase.sectionOrder")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={agencyKvLabelTd}>{t("orders.common.orderNumber")}</td>
                <td className={agencyKvValueTd} colSpan={3}>
                  {order.orderNo}
                </td>
              </tr>
              {inquiryKvRows.map((row) => (
                <tr key={row.k}>
                  <td className={agencyKvLabelTd}>{row.l1}</td>
                  <td className={agencyKvValueTd}>{row.v1}</td>
                  <td className={agencyKvLabelTd}>{row.l2}</td>
                  <td className={agencyKvValueTd}>{row.v2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={agencySection}>
          <div className={agencySectionTitle}>{t("orders.viewWindow.productInfoTitle")}</div>
          <div className={agencyTableWrap}>
            <table className={agencyTableMin900}>
              <thead>
                <tr className={agencyTheadRow}>
                  {productCols.map((c) => (
                    <th key={c.key} className={agencyThBase(c.align)}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.products.map((p, i) => (
                  <tr key={p.id}>
                    {productCols.map((c) => (
                      <td key={c.key} className={`${agencyTdBase(c.align)} align-middle`}>
                        {c.cell(p, i)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={agencySection}>
          <div className={agencySectionTitle}>{t("orders.viewWindow.orderInquirySection")}</div>
          <div className="p-2">
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoFile} />

            <div
              className={`mb-1 flex flex-wrap items-center gap-1 border-b border-gray-200 pb-1 text-[11px] ${
                toolbarDisabled ? "opacity-50" : ""
              }`}
            >
              <select
                className="h-7 max-w-[9rem] rounded border px-1"
                value={fontFamily}
                disabled={toolbarDisabled}
                onChange={(e) => applyFontName(e.target.value)}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                className="h-7 rounded border px-1"
                value={fontSizePt}
                disabled={toolbarDisabled}
                onChange={(e) => applyFontSizePt(e.target.value)}
              >
                {FONT_SIZES_PT.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}pt
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={fmtToggleClass(fmtActive.bold, "bold")}
                disabled={toolbarDisabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleBold}
              >
                B
              </button>
              <button
                type="button"
                className={fmtToggleClass(fmtActive.italic, "italic")}
                disabled={toolbarDisabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleItalic}
              >
                I
              </button>
              <button
                type="button"
                className={fmtToggleClass(fmtActive.underline, "underline")}
                disabled={toolbarDisabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleUnderline}
              >
                U
              </button>
              <button
                type="button"
                className="ml-auto flex h-7 items-center gap-1 rounded border border-transparent px-1 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed"
                disabled={toolbarDisabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handlePhotoPick}
              >
                {t("orders.tool.inquiry.photo")} <span aria-hidden>📷</span>
              </button>
            </div>

            <div
              className="w-full resize-y overflow-auto rounded border border-gray-200 bg-white"
              style={{ minHeight: inquiryMinHeightPx }}
            >
              {editorMode === "editor" ? (
                <div
                  ref={editorRef}
                  contentEditable={!toolbarDisabled}
                  suppressContentEditableWarning
                  onInput={() => setInquiryHtml(editorRef.current?.innerHTML ?? "")}
                  onKeyUp={refreshFormatState}
                  onMouseUp={refreshFormatState}
                  className="w-full p-2 text-sm outline-none focus:ring-0"
                  style={{ fontFamily, fontSize: `${fontSizePt}pt`, minHeight: inquiryMinHeightPx }}
                  aria-label={t("orders.viewWindow.inquiryPlaceholder")}
                />
              ) : editorMode === "html" ? (
                <textarea
                  value={inquiryHtml}
                  onChange={(e) => setInquiryHtml(e.target.value)}
                  spellCheck={false}
                  className="w-full resize-none border-0 p-2 font-mono text-xs outline-none focus:ring-0"
                  style={{ minHeight: inquiryMinHeightPx }}
                />
              ) : (
                <textarea
                  value={textPlain}
                  onChange={(e) => setTextPlain(e.target.value)}
                  className="w-full resize-none border-0 p-2 text-sm outline-none focus:ring-0"
                  style={{ minHeight: inquiryMinHeightPx }}
                />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-1 text-[11px] text-gray-500">
              <button
                type="button"
                onClick={cycleInquiryResize}
                className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-left text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                title={t("orders.tool.inquiry.resizeActionTitle")}
              >
                <span className="select-none" aria-hidden>
                  ↕
                </span>
                <span>{t("orders.tool.inquiry.resizeHint")}</span>
                <span className="tabular-nums text-gray-400">({inquiryMinHeightPx}px)</span>
              </button>
              <div className="flex gap-2">
                {modeBtn("editor", "orders.tool.inquiry.modeEditor")}
                {modeBtn("html", "orders.tool.inquiry.modeHtml")}
                {modeBtn("text", "orders.tool.inquiry.modeText")}
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <select
            value={sms}
            onChange={(e) => setSms(e.target.value)}
            className="h-9 rounded border border-gray-300 bg-white px-2 text-xs"
          >
            <option value="none">{t("orders.action.smsNotSend")}</option>
            <option value="send">{t("orders.action.smsSend")}</option>
          </select>
          <button
            type="button"
            className="h-9 rounded bg-blue-600 px-6 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => showToast({ message: t("orders.viewWindow.stubComingSoon"), variant: "info" })}
          >
            {t("orders.tool.send")}
          </button>
          <button
            type="button"
            className="h-9 rounded border border-blue-500 bg-white px-6 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            onClick={() => window.close()}
          >
            {t("orders.common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
