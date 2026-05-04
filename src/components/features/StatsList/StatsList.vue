<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { BOOK_RATE_LABELS } from '@/constants/book'

const bookStore = useBookStore()

const ratingChartRef = ref(null)
const statusChartRef = ref(null)
const yearChartRef = ref(null)
let ratingChart = null
let statusChart = null
let yearChart = null
let ChartConstructor = null

const RATING_COLORS = [
  '#b3e5fc ',
  '#ffc98d',
  '#e99897',
  '#fff59d ',
  '#c8e6c9 ',
  '#f8bbd0 ',
]

const STATUS_COLORS = ['#c8e6c9', '#b3e5fc', '#ffc98d', '#f8bbd0']

onMounted(async () => {
  await bookStore.fetchAllBooks()
  loadChartModule()
})

onUnmounted(() => {
  destroyCharts()
})

async function loadChartModule() {
  const chartModule = await import('chart.js')
  const { Chart, PieController, BarController, BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } = chartModule

  Chart.register(PieController, BarController, BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale)

  ChartConstructor = Chart
  createRatingChart()
  createStatusChart()
  createYearChart()
}

function destroyCharts() {
  if (ratingChart) { ratingChart.destroy(); ratingChart = null }
  if (statusChart) { statusChart.destroy(); statusChart = null }
  if (yearChart) { yearChart.destroy(); yearChart = null }
}

const statsByYear = computed(() => bookStore.statsByYear)
const totalPagesRead = computed(() => bookStore.totalPagesRead)
const statusPercentages = computed(() => bookStore.statusPercentages)
const ratingDistribution = computed(() => bookStore.ratingDistribution)
const isLoading = computed(() => bookStore.loadingStates.all)

const totalBooks = computed(() => bookStore.bookLists.all.length)
const totalRatings = computed(() => Object.values(ratingDistribution.value).reduce((a, b) => a + b, 0))

const authorsMostRead = computed(() => bookStore.authorsMostRead)
const genresDistribution = computed(() => bookStore.genresDistribution)
const averagePagesRead = computed(() => bookStore.averagePagesRead)
const averageRating = computed(() => bookStore.averageRating)
const currentlyReading = computed(() => bookStore.currentlyReading)

function createRatingChart() {
  if (!ChartConstructor || !ratingChartRef.value || Object.keys(ratingDistribution.value).length === 0) return
  if (ratingChart) ratingChart.destroy()

  const dist = ratingDistribution.value
  const labels = Object.keys(dist).map(rate => BOOK_RATE_LABELS[rate] || rate)
  const data = Object.values(dist)

  ratingChart = new ChartConstructor(ratingChartRef.value, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: RATING_COLORS.slice(0, data.length),
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 20, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed
              const percentage = ((value / totalRatings.value) * 100).toFixed(1)
              return ` ${value} livros (${percentage}%)`
            }
          }
        }
      }
    },
    plugins: [{
      id: 'ratingCenterText',
      beforeDraw: (chart) => {
        const { ctx, width, height } = chart
        ctx.restore()
        ctx.font = '700 1.75rem inherit'
        ctx.fillStyle = '#111827'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(totalRatings.value, width / 2, height / 2 - 10)
        ctx.font = '500 0.75rem inherit'
        ctx.fillStyle = '#6b7280'
        // ctx.fillText('avaliações', width / 2, height / 2 + 15)
        ctx.save()
      }
    }]
  })
}

function createStatusChart() {
  if (!ChartConstructor || !statusChartRef.value) return
  if (statusChart) statusChart.destroy()

  const data = [
    statusPercentages.value.read,
    statusPercentages.value.reading,
    statusPercentages.value.toBeRead,
    statusPercentages.value.dnf
  ]

  statusChart = new ChartConstructor(statusChartRef.value, {
    type: 'pie',
    data: {
      labels: ['Lidos', 'Lendo', 'Para Ler', 'Abandonado'],
      datasets: [{
        data,
        backgroundColor: STATUS_COLORS,
        borderWidth: 0,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed}%`
          }
        }
      }
    },
    plugins: [{
      id: 'statusCenterText',
      beforeDraw: (chart) => {
        const { ctx, width, height } = chart
        ctx.restore()
        ctx.font = '700 1.5rem inherit'
        ctx.fillStyle = '#111827'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(totalBooks.value, width / 2, height / 2)
        ctx.save()
      }
    }]
  })
}

function createYearChart() {
  if (!ChartConstructor || !yearChartRef.value || !statsByYear.value.length) return
  if (yearChart) yearChart.destroy()

  const years = statsByYear.value.slice(0, 8).reverse()
  const labels = years.map(y => y.year.toString())
  const data = years.map(y => y.count)

  yearChart = new ChartConstructor(yearChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.x} livros`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11, weight: '500' } }
        }
      }
    }
  })
}
</script>

<template>
  <div class="stats-list">
    <h2 class="stats-list__title">Estatísticas de Leitura</h2>

    <div v-if="isLoading" class="stats-list__loading">
      Carregando estatísticas...
    </div>

    <div v-else class="stats-list__content">
      <div class="stats-list__summary">
        <div class="stat-card stat-card--highlight">
          <span class="stat-card__value">{{ totalBooks }}</span>
          <span class="stat-card__label">Total de Livros</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value">{{ totalPagesRead.toLocaleString() }}</span>
          <span class="stat-card__label">Páginas Lidas</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value">{{ averagePagesRead }}</span>
          <span class="stat-card__label">Média Páginas</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value">{{ averageRating }}</span>
          <span class="stat-card__label">Média Avaliação</span>
        </div>
      </div>

      <div class="stats-list--container">
        <div class="stats-list__section">
          <h3 class="stats-list__section-title">Status dos Livros</h3>

          <div v-if="totalBooks > 0" class="stats-list__chart">
            <canvas ref="statusChartRef"></canvas>
          </div>
          <p v-else class="stats-list__empty">Nenhum livro cadastrado</p>

        </div>
        <div class="stats-list__section">
          <div v-if="currentlyReading && currentlyReading.length" class="stats-list__reading">
            <h3 class="stats-list__section-title">Lendo Agora</h3>
            <div class="stats-list__reading-covers">
              <div v-for="book in currentlyReading" :key="book.id" class="reading-cover">
                <img v-if="book.cover && book.cover[0]" :src="book.cover[0]" :alt="book.name" class="reading-cover__img"
                  loading="lazy" decoding="async" />
                <div v-else class="reading-cover__placeholder">
                  {{ book.name?.charAt(0) || '?' }}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div class="stats-list__section">
        <h3 class="stats-list__section-title">Livros Lidos por Ano</h3>
        <div v-if="statsByYear && statsByYear.length" class="stats-list__chart stats-list__chart--bar">
          <canvas ref="yearChartRef"></canvas>
        </div>
        <p v-else class="stats-list__empty">Nenhum livro concluído ainda</p>
      </div>

      <div class="stats-list__section" v-if="genresDistribution && genresDistribution.length">
        <h3 class="stats-list__section-title">Gêneros Mais Lidos</h3>
        <div class="stats-list__genres">
          <div v-for="item in genresDistribution" :key="item.genre" class="genre-item">
            <span class="genre-item__name">{{ item.genre }}</span>
            <div class="genre-item__bar">
              <div class="genre-item__fill" :style="{ width: (item.count / genresDistribution[0].count * 100) + '%' }">
              </div>
            </div>
            <span class="genre-item__count">{{ item.count }}</span>
          </div>
        </div>
      </div>

      <div class="stats-list__section">
        <h3 class="stats-list__section-title">Distribuição de Avaliações</h3>
        <div v-if="Object.keys(ratingDistribution).length" class="stats-list__chart">
          <canvas ref="ratingChartRef"></canvas>
        </div>
        <p v-else class="stats-list__empty">Nenhum livro avaliado ainda</p>
      </div>

      <div class="stats-list__section" v-if="authorsMostRead && authorsMostRead.length">
        <h3 class="stats-list__section-title">Autores Mais Lidos</h3>
        <div class="stats-list__chips">
          <span v-for="item in authorsMostRead" :key="item.author" class="chip">
            {{ item.author }} ({{ item.count }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.stats-list__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--black);
  margin: 0;
}

.stats-list__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--muted);
}

.stats-list__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-list__summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
  border-radius: 4px;
  padding: 1.25rem 1rem;
  text-align: center;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.15);
  transform: rotate(-1deg);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
  transform: rotate(1deg);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  transform: rotate(-0.5deg);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
  transform: rotate(0.5deg);
}

.stat-card:hover {
  transform: rotate(0deg) scale(1.02);
  box-shadow: 5px 5px 12px rgba(0, 0, 0, 0.2);
}

.stat-card--highlight {
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
}

.stat-card__value {
  display: block;
  font-size: 2.25rem;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1;
}

.stat-card__label {
  display: block;
  font-size: 0.75rem;
  color: #333;
  margin-top: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-list__section {
  background: #ffffff9e;
  width: 100%;
  padding: 1.25rem;
}

.stats-list__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--black);
  margin: 0 0 1rem 0;
}

.stats-list__percentages {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.percentage-bar {
  display: flex;
  height: 24px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--paper);
}

.percentage-bar__segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  transition: width 0.3s ease;
}

.percentage-bar__segment--read {
  background: #22c55e;
}

.percentage-bar__segment--reading {
  background: #3b82f6;
}

.percentage-bar__segment--tbr {
  background: var(--accent);
}

.percentage-bar__segment--dnf {
  background: #ef4444;
}

.stats-list__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.legend-item::before {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.legend-item--read::before {
  background: #22c55e;
}

.legend-item--reading::before {
  background: #3b82f6;
}

.legend-item--tbr::before {
  background: var(--accent);
}

.legend-item--dnf::before {
  background: #ef4444;
}

.stats-list__years {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.year-item {
  display: grid;
  grid-template-columns: 50px 1fr 30px;
  align-items: center;
  gap: 0.75rem;
}

.year-item__year {
  font-weight: 600;
  color: var(--black);
  font-size: 0.875rem;
}

.year-item__bar {
  height: 16px;
  background: var(--paper);
  border-radius: 4px;
  overflow: hidden;
}

.year-item__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent2) 0%, var(--accent) 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.year-item__count {
  text-align: right;
  font-weight: 600;
  color: var(--muted);
  font-size: 0.875rem;
}

.stats-list__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: var(--paper);
  border-radius: 20px;
  font-size: 0.8125rem;
  color: var(--black);
  font-weight: 500;
}

.stats-list__genres {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.genre-item {
  display: grid;
  grid-template-columns: 100px 1fr 30px;
  align-items: center;
  gap: 0.75rem;
}

.genre-item__name {
  font-weight: 500;
  color: var(--black);
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.genre-item__bar {
  height: 14px;
  background: var(--paper);
  border-radius: 4px;
  overflow: hidden;
}

.genre-item__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent2) 0%, var(--accent) 100%);
  border-radius: 4px;
}

.genre-item__count {
  text-align: right;
  font-weight: 600;
  color: var(--muted);
  font-size: 0.8125rem;
}

.stats-list__chart {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-list--container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stats-list__reading-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 0.75rem 0;
}

.stats-list__reading-covers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.reading-cover {
  flex-shrink: 0;
  width: 152px;
  overflow: hidden;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
}

.reading-cover__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reading-cover__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #757575;
}

.stats-list__chart--bar {
  height: 200px;
}

.stats-list__empty {
  text-align: center;
  color: var(--muted);
  font-size: 0.875rem;
  padding: 1rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .stats-list {
    padding: 0.75rem;
  }

  .stats-list__summary {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem 0.75rem;
  }

  .stat-card__value {
    font-size: 1.75rem;
  }

  .stat-card__label {
    font-size: 0.65rem;
  }

  .stat-card {
    transform: none;
  }

  .stats-list--container {
    grid-template-columns: 1fr;
  }
}
</style>
