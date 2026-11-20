<script setup>
// Traço de caneta em canvas que circula um elemento-alvo e se redesenha ao ativar o slide
import { onBeforeUnmount, ref, watch } from 'vue';

const STROKE_SEGMENTS = 160;
const STROKE_START_ANGLE = -Math.PI * 0.75; // canto superior esquerdo
const STROKE_SWEEP = Math.PI * 2 * 1.08; // overshoot: a caneta passa do ponto de chegada
const DRAW_BLOCK_SIZE = 8; // blocos curtos: a espessura varia como pressão de caneta

const props = defineProps({
  /** Elemento a ser circulado (blocos de texto) */
  target: { type: Object, default: null },
  /** Folga entre o texto e o traço, em px */
  padding: { type: Number, default: 18 },
  duration: { type: Number, default: 900 },
  lineWidth: { type: Number, default: 4 },
  color: { type: String, default: '#2b2b2b' },
});

const canvasEl = ref(null);

let observers = [];
let rafId = null;
let stroke = [];
let progress = 0;

/** easeOutQuad: a caneta desacelera no fim do traço */
function easeOutQuad(t) {
  return 1 - (1 - t) ** 2;
}

/**
 * Gera os pontos do traço: uma elipse com tremida sutil e overshoot —
 * a caneta passa um pouco do ponto de partida, como num círculo à mão
 */
function buildStroke(cx, cy, rx, ry) {
  const points = [];
  for (let i = 0; i <= STROKE_SEGMENTS; i++) {
    const t = i / STROKE_SEGMENTS;
    const angle = STROKE_START_ANGLE + STROKE_SWEEP * t;
    // Ruído determinístico: um resize não pode "pular" o desenho
    const wobble = 1 + Math.sin(angle * 3 + 1.7) * 0.02 + Math.sin(angle * 6.1) * 0.012;
    const grow = 1 + t * 0.03; // a caneta se afasta levemente no fim do traço
    points.push({
      x: cx + Math.cos(angle) * rx * wobble * grow,
      y: cy + Math.sin(angle) * ry * wobble * grow,
    });
  }
  return points;
}

/** Posiciona o canvas sobre o alvo e recalcula o traço. Usa offsetLeft/Top (coords de layout), imune ao transform dos slides do Swiper */
function measure() {
  const canvas = canvasEl.value;
  const target = props.target;
  const parent = canvas?.parentElement;
  if (!parent || !target?.offsetWidth) return false;

  const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = target;
  const rx = offsetWidth / 2 + props.padding;
  const ry = offsetHeight / 2 + props.padding;

  // O traço "escapa" do raio (tremida ~3,7% + crescimento) e tem espessura:
  // sem essa folga extra o canvas corta as laterais do desenho
  const clearance = Math.ceil(Math.max(rx, ry) * 0.04 + props.lineWidth);
  const inset = props.padding + clearance;

  // Limitado à caixa do pai: nada do desenho cai fora dele, que tem overflow
  const left = Math.max(0, offsetLeft - inset);
  const top = Math.max(0, offsetTop - inset);
  const width = Math.min(offsetLeft + offsetWidth + inset, parent.offsetWidth) - left;
  const height = Math.min(offsetTop + offsetHeight + inset, parent.offsetHeight) - top;

  const dpr = window.devicePixelRatio || 1;
  canvas.style.left = `${left}px`;
  canvas.style.top = `${top}px`;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  // Redefinir canvas.width zera o contexto, por isso o transform vem depois
  canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);

  stroke = buildStroke(
    offsetLeft + offsetWidth / 2 - left,
    offsetTop + offsetHeight / 2 - top,
    rx,
    ry,
  );
  return true;
}

/** Desenha o trecho do traço do progresso atual, em blocos de espessura oscilante */
function drawStroke() {
  const canvas = canvasEl.value;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  const visible = Math.max(2, Math.round(stroke.length * progress));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = props.color;
  for (let blockStart = 1; blockStart < visible; blockStart += DRAW_BLOCK_SIZE) {
    const blockEnd = Math.min(blockStart + DRAW_BLOCK_SIZE, visible);
    ctx.beginPath();
    ctx.moveTo(stroke[blockStart - 1].x, stroke[blockStart - 1].y);
    for (let i = blockStart; i < blockEnd; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
    ctx.lineWidth = props.lineWidth * (1 + Math.sin(((blockStart + blockEnd) / 2) * 0.12) * 0.22);
    ctx.stroke();
  }
}

/** Anima o traço como se uma caneta o desenhasse */
function animate() {
  cancelAnimationFrame(rafId);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    progress = 1;
    drawStroke();
    return;
  }
  const startedAt = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - startedAt) / props.duration);
    progress = easeOutQuad(t);
    drawStroke();
    if (t < 1) rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
}

function disconnect() {
  observers.forEach((observer) => observer.disconnect());
  observers = [];
}

/** Liga os observers e decide quando desenhar (mount ou ativação do slide) */
function setup() {
  disconnect();
  const canvas = canvasEl.value;
  const slide = canvas.closest('.swiper-slide');
  const start = () => {
    measure();
    animate();
  };

  // Alvo ou card redimensionou: recalcula mantendo o quadro atual da animação
  const handleResize = () => measure() && drawStroke();
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(props.target);
  resizeObserver.observe(canvas.parentElement);
  observers.push(resizeObserver);

  if (slide && !slide.classList.contains('swiper-slide-active')) {
    // Sem isso o traço animaria fora de vista: o slide renderiza antes de ficar ativo
    const slideObserver = new MutationObserver(() => {
      if (slide.classList.contains('swiper-slide-active')) start();
    });
    slideObserver.observe(slide, { attributes: true, attributeFilter: ['class'] });
    observers.push(slideObserver);
  } else {
    start();
  }
}

// Cobre o mount e o alvo que chega depois (o ref do pai só é atribuído após o mount dele)
watch([canvasEl, () => props.target], ([canvas, target]) => {
  if (canvas && target) setup();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  disconnect();
});
</script>

<template>
  <canvas ref="canvasEl" class="hand-drawn-circle" aria-hidden="true"></canvas>
</template>

<style scoped>
/* Sai do fluxo e cobre apenas a volta do texto; o pai precisa ser position: relative */
.hand-drawn-circle {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
</style>
