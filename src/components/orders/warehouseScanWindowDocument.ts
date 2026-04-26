import type { OrderBoardOrder, OrderBoardProduct } from "./OrderBoard";

export interface WarehouseScanWindowLabels {
  pageTitle: string;
  takePhoto: string;
  upload: string;
  inboundComplete: string;
  workPending: string;
  issuePhoto: string;
  orderNumber: string;
  productNumber: string;
  productName: string;
  productImage: string;
  colorSize: string;
  quantity: string;
  barcode: string;
  barcodePhoto: string;
  imageUpload: string;
  productMemo: string;
  userMemo: string;
  caution: string;
  inspectionImages: string;
  sellerShippingCost: string;
  actualShippingCost: string;
  won: string;
  status: string;
  warehouseInComplete: string;
  warehouseInProgress: string;
  orderNoBracket: string;
  noMatches: string;
  close: string;
  trackingFilterCaption: string;
  selectLine: string;
  noInspectionPhotos: string;
  inboundIncomeApiRow: string;
  inboundIssueApiRow: string;
  inboundRealBarcodeApiRow: string;
  noInboundApiImagesSummary: string;
  inboundPhotoLabel: string;
}

export type WarehouseScanMatch = { order: OrderBoardOrder; product: OrderBoardProduct };

/** 상품 줄에 표시할 주문번호(상품 주문번호가 있으면 그것, 없으면 주문 번호) */
export function warehouseScanDisplayOrderNo(p: OrderBoardProduct, order: OrderBoardOrder): string {
  const pon = p.productOrderNumber?.trim();
  return pon && pon.length > 0 ? pon : order.orderNo;
}

/** `useLocale().t` 기준 입고 스캔 UI 라벨 */
export function warehouseScanLabelsFromTranslate(t: (key: string) => string): WarehouseScanWindowLabels {
  return {
    pageTitle: t("orders.action.warehouseScan"),
    takePhoto: t("orders.inboundScan.takePhoto"),
    upload: t("orders.inboundScan.upload"),
    inboundComplete: t("orders.inboundScan.inboundComplete"),
    workPending: t("orders.inboundScan.workPending"),
    issuePhoto: t("orders.inboundScan.issuePhoto"),
    orderNumber: t("orders.common.orderNumber"),
    productNumber: t("orders.product.productNumber"),
    productName: t("orders.inboundScan.productName"),
    productImage: t("orders.inboundScan.productImage"),
    colorSize: t("orders.inboundScan.colorSize"),
    quantity: t("orders.common.quantity"),
    barcode: t("orders.inboundScan.barcode"),
    barcodePhoto: t("orders.inboundScan.barcodePhoto"),
    imageUpload: t("orders.inboundScan.imageUpload"),
    productMemo: t("orders.product.productMemo"),
    userMemo: t("orders.product.userMemo"),
    caution: t("orders.product.caution"),
    inspectionImages: t("orders.product.inspectionImages"),
    sellerShippingCost: t("orders.product.sellerShippingCost"),
    actualShippingCost: t("orders.product.actualShippingCost"),
    status: t("orders.common.status"),
    warehouseInComplete: t("orders.status.warehouseInComplete"),
    warehouseInProgress: t("orders.status.warehouseInProgress"),
    orderNoBracket: t("orders.inboundScan.orderNoBracket"),
    noMatches: t("orders.inboundScan.noMatchesHint"),
    close: t("orders.common.close"),
    trackingFilterCaption: t("orders.inboundScan.trackingFilterCaption"),
    selectLine: t("orders.inboundScan.selectLine"),
    noInspectionPhotos: t("orders.inboundScan.noInspectionPhotos"),
    inboundIncomeApiRow: t("orders.inboundScan.inboundIncomeApiRow"),
    inboundIssueApiRow: t("orders.inboundScan.inboundIssueApiRow"),
    inboundRealBarcodeApiRow: t("orders.inboundScan.inboundRealBarcodeApiRow"),
    noInboundApiImagesSummary: t("orders.inboundScan.noInboundApiImagesSummary"),
    inboundPhotoLabel: t("orders.inboundScan.inboundPhotoLabel"),
    won: t("orders.common.won"),
  };
}
