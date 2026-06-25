import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.querySelector("#avl-canvas");
const insertButton = document.querySelector("#insert-node");
const resetButton = document.querySelector("#reset-scene");
const nextButton = document.querySelector("#next-step");
const nodeInput = document.querySelector("#node-value");
const treeHeight = document.querySelector("#tree-height");
const balanceFactor = document.querySelector("#balance-factor");
const treeStatus = document.querySelector("#tree-status");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101827);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 2.4, 8);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(3, 5, 4);
scene.add(keyLight);

const group = new THREE.Group();
scene.add(group);

const nodeMaterial = new THREE.MeshStandardMaterial({
  color: 0x21a0a0,
  roughness: 0.44,
  metalness: 0.1,
});

const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0xd7e2ff,
  transparent: true,
  opacity: 0.72,
});

const sampleNodes = [
  { value: 42, x: 0, y: 1.7, z: 0 },
  { value: 21, x: -1.9, y: 0.35, z: 0 },
  { value: 64, x: 1.9, y: 0.35, z: 0 },
  { value: 12, x: -2.9, y: -1, z: 0 },
  { value: 33, x: -0.9, y: -1, z: 0 },
];

const sampleEdges = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
];

let rotationStep = 0;

function createNode({ x, y, z }) {
  const geometry = new THREE.SphereGeometry(0.28, 32, 18);
  const mesh = new THREE.Mesh(geometry, nodeMaterial);
  mesh.position.set(x, y, z);
  return mesh;
}

function createEdge(from, to) {
  const points = [
    new THREE.Vector3(from.x, from.y, from.z),
    new THREE.Vector3(to.x, to.y, to.z),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, edgeMaterial);
}

function renderSkeletonTree() {
  group.clear();

  sampleEdges.forEach(([fromIndex, toIndex]) => {
    group.add(createEdge(sampleNodes[fromIndex], sampleNodes[toIndex]));
  });

  sampleNodes.forEach((node) => {
    group.add(createNode(node));
  });
}

function updateMetrics(status) {
  treeHeight.textContent = "3";
  balanceFactor.textContent = rotationStep % 2 === 0 ? "1" : "0";
  treeStatus.textContent = status;
}

function resizeRenderer() {
  const { clientWidth, clientHeight } = canvas;

  if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
  }
}

function animate() {
  resizeRenderer();
  group.rotation.y += 0.003;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

insertButton.addEventListener("click", () => {
  const value = Number(nodeInput.value);
  updateMetrics(`已接收插入值 ${value}`);
});

resetButton.addEventListener("click", () => {
  rotationStep = 0;
  group.rotation.set(0, 0, 0);
  updateMetrics("場景已重置");
});

nextButton.addEventListener("click", () => {
  rotationStep += 1;
  group.rotation.z = rotationStep % 2 === 0 ? 0 : 0.12;
  updateMetrics("示範旋轉步驟");
});

renderSkeletonTree();
updateMetrics("骨幹完成");
animate();
