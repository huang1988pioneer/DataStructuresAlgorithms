export default defineNuxtConfig({
  compatibilityDate: "2026-06-28",
  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: "zh-Hant" },
      title: "資料結構與演算法互動教學",
      meta: [
        {
          name: "description",
          content: "以 Nuxt 製作的資料結構與演算法互動教學網站，先實作 AVL 樹插入與旋轉步驟說明。"
        }
      ]
    }
  }
});
