<script setup lang="ts">
import {
  balanceOf,
  countNodes,
  formatValue,
  height,
  insertAvl,
  layoutTree,
  parseBatch,
  parseSingleValue,
  resetNodeIds,
  type AvlMode,
  type AvlNode,
  type AvlStep
} from "~/utils/avl";

const mode = ref<AvlMode>("number");
const inputValue = ref("42");
const batchValue = ref("30, 20, 40, 10, 25, 35, 50, 5, 15, 60");
const root = ref<AvlNode | null>(null);
const steps = ref<AvlStep[]>([
  {
    title: "準備插入",
    detail: "選擇數字或英文字母模式，輸入一個鍵值後按下插入。每次操作都會列出比較、回溯、平衡因子與旋轉說明。",
    highlights: []
  }
]);
const activeStepIndex = ref(0);
const message = ref("");

const topics = [
  {
    title: "樹狀結構",
    items: ["二元樹基礎", "AVL 樹", "紅黑樹", "B 樹", "堆積 (Heap)", "Trie 字典樹"]
  },
  {
    title: "線性結構",
    items: ["陣列", "鏈結串列", "堆疊", "佇列"]
  },
  {
    title: "圖形結構",
    items: ["圖的表示法", "BFS", "DFS", "最短路徑"]
  },
  {
    title: "演算法",
    items: ["排序演算法", "搜尋演算法", "分治演算法", "動態規劃", "貪婪演算法"]
  }
];

const placeholders = [
  ["紅黑樹", "自平衡二元搜尋樹，適合高效動態集合。"],
  ["堆積 (Heap)", "完全二元樹結構，支援優先佇列操作。"],
  ["圖形結構", "將加入節點拖曳、BFS、DFS 與路徑搜尋。"],
  ["排序演算法", "預留 Bubble、Merge、Quick Sort 動畫。"]
];

const positionedNodes = computed(() => layoutTree(root.value));
const nodeMap = computed(() => new Map(positionedNodes.value.map((node) => [node.id, node])));
const edges = computed(() =>
  positionedNodes.value
    .filter((node) => node.parentId)
    .map((node) => ({
      from: nodeMap.value.get(node.parentId ?? ""),
      to: node
    }))
    .filter((edge) => edge.from && edge.to)
);
const activeStep = computed(() => steps.value[activeStepIndex.value] ?? steps.value[0]);
const highlights = computed(() => new Set(activeStep.value?.highlights ?? []));
const treeWidth = computed(() => Math.max(760, positionedNodes.value.length * 94 + 120));
const treeHeight = computed(() => Math.max(470, height(root.value) * 96 + 92));

function setMode(nextMode: AvlMode) {
  mode.value = nextMode;
  inputValue.value = nextMode === "number" ? "42" : "M";
  batchValue.value = nextMode === "number" ? "30, 20, 40, 10, 25, 35, 50, 5, 15, 60" : "M, D, T, A, H, P, Z, F";
  resetTree();
}

function insertOne(raw = inputValue.value) {
  const parsed = parseSingleValue(raw, mode.value);
  if (parsed === null) {
    message.value = mode.value === "number" ? "請輸入有效數字，例如 42 或 3.14。" : "請輸入單一英文字母，例如 A 或 z。";
    return;
  }

  const result = insertAvl(root.value, parsed, mode.value);
  root.value = result.root;
  steps.value = result.steps;
  activeStepIndex.value = 0;
  message.value = result.inserted ? "" : `${formatValue(parsed)} 已存在，沒有重複插入。`;
}

function insertBatch() {
  const values = parseBatch(batchValue.value, mode.value);
  if (!values.length) {
    message.value = mode.value === "number" ? "批次輸入需要至少一個有效數字。" : "批次輸入需要至少一個英文字母。";
    return;
  }

  values.forEach((value) => {
    const result = insertAvl(root.value, value, mode.value);
    root.value = result.root;
    steps.value = result.steps;
  });
  activeStepIndex.value = 0;
  message.value = `已批次插入 ${values.length} 個有效鍵值，右側顯示最後一次插入的步驟。`;
}

function nextStep() {
  activeStepIndex.value = (activeStepIndex.value + 1) % steps.value.length;
}

function resetTree() {
  resetNodeIds();
  root.value = null;
  steps.value = [
    {
      title: "準備插入",
      detail: "樹已清空。請輸入鍵值，觀察 AVL 樹如何在插入後回溯更新高度並自動旋轉。",
      highlights: []
    }
  ];
  activeStepIndex.value = 0;
  message.value = "";
}
</script>

<template>
  <div class="page-shell">
    <header class="site-header">
      <NuxtLink class="brand" to="/">
        <span class="brand-mark">&lt;&gt;</span>
        <span>資料結構與演算法</span>
      </NuxtLink>

      <nav class="main-nav" aria-label="主要導覽">
        <a href="#path">學習路徑</a>
        <a href="#topics">主題</a>
        <a class="active" href="#lab">互動實驗室</a>
        <a href="#practice">題庫練習</a>
      </nav>

      <div class="header-actions" aria-label="介面狀態">
        <button class="icon-button" type="button" title="外觀設定">☼</button>
        <span>繁體中文</span>
      </div>
    </header>

    <main>
      <section class="hero" id="path">
        <h1>透過 <span>互動學習</span> 資料結構與演算法</h1>
        <p>動手插入、逐步觀察、即時理解。未實作的主題先以佔位符保留，第一階段完成 AVL 樹插入與旋轉教學。</p>
      </section>

      <section class="app-grid" id="lab" aria-label="AVL 樹互動實驗室">
        <aside class="sidebar" id="topics">
          <h2 class="side-title">主題</h2>
          <div v-for="group in topics" :key="group.title" class="topic-group">
            <div class="topic-group-title">
              <span>{{ group.title }}</span>
              <span>⌄</span>
            </div>
            <a
              v-for="item in group.items"
              :key="item"
              href="#lab"
              class="topic-link"
              :class="{ current: item === 'AVL 樹', disabled: item !== 'AVL 樹' }"
            >
              <span>{{ item }}</span>
              <small v-if="item !== 'AVL 樹'">開發中</small>
            </a>
          </div>
        </aside>

        <section class="lab-card">
          <div class="lab-header">
            <div>
              <h2 class="lab-title">AVL 樹互動實驗室</h2>
              <p>選擇數字或英文字母模式，插入鍵值後觀察樹高、平衡因子與 LL/RR/LR/RL 旋轉。</p>
            </div>
            <div class="mode-switch" aria-label="輸入模式">
              <button type="button" :class="{ active: mode === 'number' }" @click="setMode('number')">數字</button>
              <button type="button" :class="{ active: mode === 'letter' }" @click="setMode('letter')">英文字母</button>
            </div>
          </div>

          <p class="message" role="status">{{ message }}</p>

          <div class="tree-stage">
            <div v-if="!root" class="empty-state">
              <div>
                <strong>AVL 樹目前是空的</strong>
                <span>輸入一個鍵值後，這裡會顯示節點、高度與平衡因子。</span>
              </div>
            </div>
            <svg
              v-else
              class="tree-svg"
              :viewBox="`0 0 ${treeWidth} ${treeHeight}`"
              role="img"
              aria-label="AVL 樹視覺化"
            >
              <line
                v-for="edge in edges"
                :key="`${edge.from?.id}-${edge.to?.id}`"
                class="edge"
                :x1="edge.from?.x"
                :y1="edge.from?.y"
                :x2="edge.to?.x"
                :y2="edge.to?.y"
              />
              <g v-for="node in positionedNodes" :key="node.id">
                <circle
                  class="node-circle"
                  :class="{ highlight: highlights.has(node.id) }"
                  :cx="node.x"
                  :cy="node.y"
                  r="28"
                />
                <text class="node-label" :x="node.x" :y="node.y">{{ formatValue(node.value) }}</text>
                <text class="node-meta" :x="node.x" :y="node.y + 48">h={{ node.height }} bf={{ node.balance }}</text>
              </g>
            </svg>
          </div>

          <div class="controls">
            <div class="field">
              <label for="single-value">輸入值</label>
              <input
                id="single-value"
                v-model="inputValue"
                class="text-input"
                :placeholder="mode === 'number' ? '例如：42' : '例如：A'"
                @keyup.enter="insertOne()"
              >
            </div>
            <button class="action-button insert" type="button" @click="insertOne()">＋ 插入</button>
            <button class="action-button step" type="button" :disabled="steps.length <= 1" @click="nextStep">▶ 下一步</button>
            <button class="action-button reset" type="button" @click="resetTree">↻ 重設</button>
          </div>

          <div class="quick-input">
            <label for="batch-value">快速輸入（用逗號或空白分隔）</label>
            <div class="quick-row">
              <input id="batch-value" v-model="batchValue" class="text-input">
              <button type="button" @click="insertBatch">批次插入</button>
            </div>
          </div>

          <div class="facts" aria-label="AVL 樹狀態">
            <div class="fact">
              <span>節點數</span>
              <strong>{{ countNodes(root) }}</strong>
            </div>
            <div class="fact">
              <span>樹高</span>
              <strong>{{ height(root) }}</strong>
            </div>
            <div class="fact">
              <span>根節點平衡因子</span>
              <strong>{{ balanceOf(root) }}</strong>
            </div>
          </div>
        </section>

        <aside class="step-panel" aria-label="步驟說明">
          <div class="step-head">
            <h2 class="section-title">步驟說明</h2>
            <span class="step-count">步驟 {{ activeStepIndex + 1 }} / {{ steps.length }}</span>
          </div>
          <ol class="step-list">
            <li
              v-for="(step, index) in steps"
              :key="`${step.title}-${index}`"
              class="step-item"
              :class="{ active: index === activeStepIndex }"
            >
              <span class="step-index">{{ index + 1 }}</span>
              <div class="step-body">
                <strong>{{ step.title }}</strong>
                <p>{{ step.detail }}</p>
              </div>
            </li>
          </ol>
        </aside>
      </section>

      <section class="placeholder-section" id="practice">
        <h2 class="section-title">其他主題（佔位符）</h2>
        <div class="placeholder-grid">
          <article v-for="[title, description] in placeholders" :key="title" class="placeholder-card">
            <span class="status-tag">開發中</span>
            <h3>{{ title }}</h3>
            <p>{{ description }}</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span>使用 Nuxt 4 + Vue 3 + TypeScript 建構</span>
      <span>AVL 樹已實作，其餘模組保留擴充入口</span>
    </footer>
  </div>
</template>
