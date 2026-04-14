export interface MenuItem {
  key: string;
  labelKey: string;
  path?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    key: "business-orders",
    labelKey: "menu.businessOrders",
    children: [
      { key: "business-orders-all", labelKey: "submenu.purchaseOrders", path: "/admin/orders/business" },
      { key: "business-orders-pending", labelKey: "submenu.purchasePendingPayment", path: "/admin/orders/business/pending" },
      { key: "business-orders-nodata", labelKey: "submenu.purchaseNoData", path: "/admin/orders/business/no-data" },
      { key: "business-orders-inquiry", labelKey: "submenu.purchaseOrderInquiry", path: "/admin/orders/business/inquiry" },
    ],
  },
  {
    key: "rocket-orders",
    labelKey: "menu.rocketShipping",
    children: [
      { key: "rocket-orders-all", labelKey: "submenu.rocketOrders", path: "/admin/orders/rocket" },
      { key: "rocket-orders-pending", labelKey: "submenu.rocketPendingPayment", path: "/admin/orders/rocket/pending" },
      { key: "rocket-orders-nodata", labelKey: "submenu.rocketNoData", path: "/admin/orders/rocket/no-data" },
      { key: "rocket-orders-inquiry", labelKey: "submenu.rocketOrderInquiry", path: "/admin/orders/rocket/inquiry" },
    ],
  },
  {
    key: "vvic-orders",
    labelKey: "menu.vvicHighPass",
    children: [
      { key: "vvic-orders-all", labelKey: "submenu.vvicOrders", path: "/admin/orders/vvic" },
      { key: "vvic-orders-pending", labelKey: "submenu.vvicPendingPayment", path: "/admin/orders/vvic/pending" },
      { key: "vvic-orders-nodata", labelKey: "submenu.vvicNoData", path: "/admin/orders/vvic/no-data" },
      { key: "vvic-orders-inquiry", labelKey: "submenu.vvicOrderInquiry", path: "/admin/orders/vvic/inquiry" },
    ],
  },
  {
    key: "payment-agency",
    labelKey: "menu.paymentAgency",
    children: [
      { key: "pa-management", labelKey: "submenu.comprehensiveManagement", path: "/admin/orders/payment-agency" },
      { key: "pa-pending", labelKey: "submenu.pendingPayment", path: "/admin/orders/payment-agency/pending" },
      { key: "pa-forex-app", labelKey: "submenu.forexApplication", path: "/admin/orders/payment-agency/forex-application" },
      { key: "pa-forex-usage", labelKey: "submenu.forexUsage", path: "/admin/orders/payment-agency/forex-usage" },
      { key: "pa-forex-settlement", labelKey: "submenu.forexSettlement", path: "/admin/orders/payment-agency/forex-settlement" },
    ],
  },
  {
    key: "shipping-agency",
    labelKey: "menu.shippingAgency",
    children: [
      { key: "sa-orders", labelKey: "submenu.shippingOrders", path: "/admin/orders/shipping-agency" },
      { key: "sa-pending", labelKey: "submenu.shippingPendingPayment", path: "/admin/orders/shipping-agency/pending" },
      { key: "sa-nodata", labelKey: "submenu.shippingNoData", path: "/admin/orders/shipping-agency/no-data" },
      { key: "sa-inquiry", labelKey: "submenu.shippingOrderInquiry", path: "/admin/orders/shipping-agency/inquiry" },
    ],
  },
  {
    key: "trade-services",
    labelKey: "menu.tradeServices",
    children: [
      { key: "ts-management", labelKey: "submenu.comprehensiveManagement", path: "/admin/orders/trade-services" },
      { key: "ts-pending", labelKey: "submenu.pendingPayment", path: "/admin/orders/trade-services/pending" },
    ],
  },
  {
    key: "products",
    labelKey: "menu.products",
    children: [
      { key: "products-list", labelKey: "submenu.productList", path: "/admin/products" },
      { key: "products-add", labelKey: "submenu.productRegistration", path: "/admin/products/add" },
      { key: "products-categories", labelKey: "submenu.categoryManagement", path: "/admin/products/categories" },
    ],
  },
  {
    key: "members",
    labelKey: "menu.members",
    children: [
      { key: "members-deposit", labelKey: "submenu.depositStatus", path: "/admin/members/deposit" },
      { key: "members-business", labelKey: "submenu.businessMembers", path: "/admin/members/business" },
      { key: "members-blacklist", labelKey: "submenu.blacklistMembers", path: "/admin/members/blacklist" },
      { key: "members-points", labelKey: "submenu.points", path: "/admin/members/points" },
      { key: "members-bankbook", labelKey: "submenu.bankbookVerification", path: "/admin/members/bankbook" },
    ],
  },
  {
    key: "cs",
    labelKey: "menu.customerService",
    children: [
      { key: "cs-notices", labelKey: "submenu.notices", path: "/admin/cs/notices" },
      { key: "cs-faq", labelKey: "submenu.faq", path: "/admin/cs/faq" },
      { key: "cs-inquiries", labelKey: "submenu.inquiries", path: "/admin/cs/inquiries" },
      { key: "cs-reviews", labelKey: "submenu.reviews", path: "/admin/cs/reviews" },
      { key: "cs-suggestions", labelKey: "submenu.suggestions", path: "/admin/cs/suggestions" },
      { key: "cs-lookingforowner", labelKey: "submenu.lookingForOwner", path: "/admin/cs/looking-for-owner" },
      { key: "cs-events", labelKey: "submenu.events", path: "/admin/cs/events" },
      { key: "cs-banner-ads", labelKey: "submenu.bannerAds", path: "/admin/cs/banner-ads" },
      { key: "cs-settings", labelKey: "submenu.csSettings", path: "/admin/cs/settings" },
    ],
  },
  {
    key: "homepage",
    labelKey: "menu.homepage",
    children: [
      { key: "homepage-banner", labelKey: "submenu.bannerManagement", path: "/admin/homepage/banner" },
      { key: "homepage-rolling", labelKey: "submenu.rollingBanner", path: "/admin/homepage/rolling-banner" },
      { key: "homepage-popup", labelKey: "submenu.popupManagement", path: "/admin/homepage/popup" },
      { key: "homepage-page", labelKey: "submenu.pageManagement", path: "/admin/homepage/page" },
      { key: "homepage-event", labelKey: "submenu.eventManagement", path: "/admin/homepage/event" },
      { key: "homepage-recommended", labelKey: "submenu.recommendedProducts", path: "/admin/homepage/recommended" },
      { key: "homepage-departure", labelKey: "submenu.departureSchedule", path: "/admin/homepage/departure" },
      { key: "homepage-shopping", labelKey: "submenu.shoppingInformation", path: "/admin/homepage/shopping-info" },
      { key: "homepage-mail", labelKey: "submenu.mailForm", path: "/admin/homepage/mail-form" },
    ],
  },
  {
    key: "settlement",
    labelKey: "menu.settlement",
    children: [
      { key: "settlement-sellers", labelKey: "submenu.sellerSettlement", path: "/admin/settlement/sellers" },
      { key: "settlement-recharge", labelKey: "submenu.memberRechargeReview", path: "/admin/settlement/recharge" },
      { key: "settlement-withdrawal", labelKey: "submenu.memberWithdrawalReview", path: "/admin/settlement/withdrawal" },
      { key: "settlement-price", labelKey: "submenu.productPriceIncrease", path: "/admin/settlement/price-increase" },
    ],
  },
  {
    key: "coupons",
    labelKey: "menu.coupons",
    children: [
      { key: "coupons-issuance", labelKey: "submenu.couponIssuance", path: "/admin/coupons/issuance" },
      { key: "coupons-event", labelKey: "submenu.eventCoupons", path: "/admin/coupons/event" },
    ],
  },
  {
    key: "sms",
    labelKey: "menu.sms",
    children: [
      { key: "sms-send", labelKey: "submenu.sendSMS", path: "/admin/sms/send" },
      { key: "sms-kakao", labelKey: "submenu.kakaoManagement", path: "/admin/sms/kakao" },
      { key: "sms-history", labelKey: "submenu.sendingHistory", path: "/admin/sms/history" },
      { key: "sms-points", labelKey: "submenu.smsPoints", path: "/admin/sms/points" },
    ],
  },
  {
    key: "statistics",
    labelKey: "menu.statistics",
    children: [
      { key: "stats-orders", labelKey: "submenu.orderStatistics", path: "/admin/statistics/orders" },
      { key: "stats-members", labelKey: "submenu.memberStatistics", path: "/admin/statistics/members" },
      { key: "stats-payment", labelKey: "submenu.paymentAgencyStats", path: "/admin/statistics/payment-agency" },
      { key: "stats-trade", labelKey: "submenu.tradeCostStats", path: "/admin/statistics/trade-cost" },
      { key: "stats-purchase", labelKey: "submenu.purchaseCostStats", path: "/admin/statistics/purchase-cost" },
      { key: "stats-tax", labelKey: "submenu.taxSettlement", path: "/admin/statistics/tax" },
      { key: "stats-workers", labelKey: "submenu.workerStatistics", path: "/admin/statistics/workers" },
      { key: "stats-worklog", labelKey: "submenu.workLogs", path: "/admin/statistics/work-logs" },
    ],
  },
  {
    key: "rack",
    labelKey: "menu.rackWarehouse",
    children: [
      { key: "rack-management", labelKey: "submenu.rackManagement", path: "/admin/rack/management" },
      { key: "rack-usage", labelKey: "submenu.rackUsage", path: "/admin/rack/usage" },
      { key: "rack-logs", labelKey: "submenu.rackLogs", path: "/admin/rack/logs" },
    ],
  },
  {
    key: "settings",
    labelKey: "menu.settings",
    children: [
      { key: "settings-admins", labelKey: "submenu.administrators", path: "/admin/settings/administrators" },
      { key: "settings-center", labelKey: "submenu.centerManagement", path: "/admin/settings/center" },
      { key: "settings-deposit", labelKey: "submenu.depositAccounts", path: "/admin/settings/deposit-accounts" },
      { key: "settings-membership", labelKey: "submenu.membershipLevels", path: "/admin/settings/membership-levels" },
      { key: "settings-center-settings", labelKey: "submenu.centerSettings", path: "/admin/settings/center-settings" },
      { key: "settings-rates", labelKey: "submenu.rates", path: "/admin/settings/rates" },
      { key: "settings-exchange", labelKey: "submenu.exchangeRates", path: "/admin/settings/exchange-rates" },
      { key: "settings-customs", labelKey: "submenu.customsExchange", path: "/admin/settings/customs-exchange" },
      { key: "settings-items", labelKey: "submenu.itemManagement", path: "/admin/settings/items" },
      { key: "settings-services", labelKey: "submenu.additionalServices", path: "/admin/settings/additional-services" },
      { key: "settings-purchase", labelKey: "submenu.purchaseConditions", path: "/admin/settings/purchase-conditions" },
      { key: "settings-island", labelKey: "submenu.islandMountainCosts", path: "/admin/settings/island-mountain" },
      { key: "settings-waybill", labelKey: "submenu.waybillBandwidth", path: "/admin/settings/waybill" },
      { key: "settings-website", labelKey: "submenu.websiteContent", path: "/admin/settings/website-content" }
    ],
  },
];

export const notificationItems = [
  { key: "deposit", labelKey: "notification.depositApplication", count: 0 },
  { key: "bank", labelKey: "notification.bankPayment", count: 0 },
  { key: "inquiry-1on1", labelKey: "notification.1on1Inquiry", count: 0 },
  { key: "order-inquiry", labelKey: "notification.orderInquiry", count: 0 },
];
