export type AvlMode = "number" | "letter";
export type AvlValue = number | string;

export interface AvlNode {
  id: string;
  value: AvlValue;
  height: number;
  left: AvlNode | null;
  right: AvlNode | null;
}

export interface AvlStep {
  title: string;
  detail: string;
  highlights: string[];
}

export interface InsertResult {
  root: AvlNode | null;
  steps: AvlStep[];
  inserted: boolean;
}

let nextNodeId = 1;

export function createNode(value: AvlValue): AvlNode {
  return {
    id: `node-${nextNodeId++}`,
    value,
    height: 1,
    left: null,
    right: null
  };
}

export function resetNodeIds() {
  nextNodeId = 1;
}

export function height(node: AvlNode | null): number {
  return node?.height ?? 0;
}

export function balanceOf(node: AvlNode | null): number {
  if (!node) return 0;
  return height(node.left) - height(node.right);
}

export function countNodes(node: AvlNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

export function compareValues(a: AvlValue, b: AvlValue, mode: AvlMode): number {
  if (mode === "number") {
    return Number(a) - Number(b);
  }

  return String(a).localeCompare(String(b), "en", { sensitivity: "base" });
}

export function formatValue(value: AvlValue): string {
  return String(value);
}

export function parseSingleValue(raw: string, mode: AvlMode): AvlValue | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (mode === "number") {
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return /^[A-Za-z]$/.test(trimmed) ? trimmed.toUpperCase() : null;
}

export function parseBatch(raw: string, mode: AvlMode): AvlValue[] {
  return raw
    .split(/[\s,，、]+/)
    .map((part) => parseSingleValue(part, mode))
    .filter((value): value is AvlValue => value !== null);
}

function updateHeight(node: AvlNode) {
  node.height = Math.max(height(node.left), height(node.right)) + 1;
}

function rotateRight(y: AvlNode): AvlNode {
  const x = y.left;
  if (!x) return y;
  const t2 = x.right;

  x.right = y;
  y.left = t2;

  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x: AvlNode): AvlNode {
  const y = x.right;
  if (!y) return x;
  const t2 = y.left;

  y.left = x;
  x.right = t2;

  updateHeight(x);
  updateHeight(y);
  return y;
}

export function insertAvl(root: AvlNode | null, value: AvlValue, mode: AvlMode): InsertResult {
  const steps: AvlStep[] = [];
  let inserted = false;

  function insert(node: AvlNode | null, depth: number): AvlNode {
    if (!node) {
      const created = createNode(value);
      inserted = true;
      steps.push({
        title: `建立節點 ${formatValue(value)}`,
        detail: `走到第 ${depth + 1} 層的空位置，建立新節點，高度先設為 1。`,
        highlights: [created.id]
      });
      return created;
    }

    const comparison = compareValues(value, node.value, mode);
    steps.push({
      title: `比較 ${formatValue(value)} 與 ${formatValue(node.value)}`,
      detail:
        comparison < 0
          ? `${formatValue(value)} 較小，往 ${formatValue(node.value)} 的左子樹前進。`
          : comparison > 0
            ? `${formatValue(value)} 較大，往 ${formatValue(node.value)} 的右子樹前進。`
            : `${formatValue(value)} 已存在，AVL 樹不重複插入相同鍵值。`,
      highlights: [node.id]
    });

    if (comparison === 0) return node;

    if (comparison < 0) {
      node.left = insert(node.left, depth + 1);
    } else {
      node.right = insert(node.right, depth + 1);
    }

    updateHeight(node);
    const balance = balanceOf(node);
    steps.push({
      title: `回溯更新 ${formatValue(node.value)}`,
      detail: `更新高度為 ${node.height}，平衡因子為 ${balance}。AVL 要求平衡因子維持在 -1、0、1。`,
      highlights: [node.id]
    });

    if (balance > 1 && node.left && compareValues(value, node.left.value, mode) < 0) {
      steps.push({
        title: "LL 型失衡：右旋",
        detail: `${formatValue(value)} 插入在 ${formatValue(node.value)} 的左子樹之左側，對 ${formatValue(node.value)} 做一次右旋。`,
        highlights: [node.id, node.left.id]
      });
      return rotateRight(node);
    }

    if (balance < -1 && node.right && compareValues(value, node.right.value, mode) > 0) {
      steps.push({
        title: "RR 型失衡：左旋",
        detail: `${formatValue(value)} 插入在 ${formatValue(node.value)} 的右子樹之右側，對 ${formatValue(node.value)} 做一次左旋。`,
        highlights: [node.id, node.right.id]
      });
      return rotateLeft(node);
    }

    if (balance > 1 && node.left && compareValues(value, node.left.value, mode) > 0) {
      steps.push({
        title: "LR 型失衡：先左旋再右旋",
        detail: `${formatValue(value)} 插入在左子樹的右側，先對 ${formatValue(node.left.value)} 左旋，再對 ${formatValue(node.value)} 右旋。`,
        highlights: [node.id, node.left.id]
      });
      node.left = rotateLeft(node.left);
      return rotateRight(node);
    }

    if (balance < -1 && node.right && compareValues(value, node.right.value, mode) < 0) {
      steps.push({
        title: "RL 型失衡：先右旋再左旋",
        detail: `${formatValue(value)} 插入在右子樹的左側，先對 ${formatValue(node.right.value)} 右旋，再對 ${formatValue(node.value)} 左旋。`,
        highlights: [node.id, node.right.id]
      });
      node.right = rotateRight(node.right);
      return rotateLeft(node);
    }

    return node;
  }

  const nextRoot = insert(root, 0);
  steps.push({
    title: inserted ? "插入完成" : "未變更",
    detail: inserted ? "所有祖先節點都已更新高度並完成必要旋轉，AVL 樹重新符合平衡條件。" : "樹中已有相同鍵值，因此結構保持不變。",
    highlights: nextRoot ? [nextRoot.id] : []
  });

  return { root: nextRoot, steps, inserted };
}

export interface PositionedNode {
  id: string;
  value: AvlValue;
  height: number;
  balance: number;
  x: number;
  y: number;
  parentId: string | null;
}

export function layoutTree(root: AvlNode | null): PositionedNode[] {
  const positioned: PositionedNode[] = [];
  let order = 0;

  function walk(node: AvlNode | null, depth: number, parentId: string | null) {
    if (!node) return;
    walk(node.left, depth + 1, node.id);
    positioned.push({
      id: node.id,
      value: node.value,
      height: node.height,
      balance: balanceOf(node),
      x: 70 + order * 92,
      y: 58 + depth * 92,
      parentId
    });
    order += 1;
    walk(node.right, depth + 1, node.id);
  }

  walk(root, 0, null);
  return positioned;
}
