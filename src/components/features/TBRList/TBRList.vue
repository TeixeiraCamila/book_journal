<script setup>
// Lista "To Be Read" — exibe livros pendentes em formato de selos (stamps) com rotação alternada
import { useRouter } from 'vue-router';
import { use_book_store } from '@/stores/bookStore';
import { computed } from 'vue';
import { BOOK_STATUS_MAP } from '@/constants/book';
import Button from '@/components/ui/Button.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const router = useRouter();
const bookStore = use_book_store();

const handle_retry = async () => {
  await bookStore.fetch_books_by_status(undefined, BOOK_STATUS_MAP.TO_BE_READ);
};

const show_empty_state = computed(() => {
  return (
    !bookStore.loading_states.tbr && bookStore.book_lists.tbr.length === 0 && !bookStore.has_error
  );
});

const navigate_to_edit = (bookId) => {
  router.push(`/editar/${bookId}`);
};
</script>

<template>
  <div class="tbr-list">
    <header class="tbr-list__header">
      <svg
        width="1628"
        height="1226"
        viewBox="0 0 1628 1226"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1324.17 500.316C1352.86 505.558 1380.9 512.651 1407.97 521.518C1435.91 530.453 1462.03 542.329 1485.54 556.788C1491.51 560.61 1497.2 564.666 1502.6 568.938L1504.66 570.532L1506.78 572.45L1510.97 576.324C1513.67 578.957 1515.89 581.882 1518.28 584.686C1526.73 596.351 1530.97 609.485 1530.56 622.772C1530.15 636.059 1525.12 649.031 1515.96 660.391L1514.31 662.51L1512.4 664.511L1508.54 668.483C1505.76 670.999 1502.81 673.432 1499.76 675.748L1494.86 678.998C1493.27 680.109 1491.57 681.127 1489.77 682.044C1486.46 683.877 1483.02 685.582 1479.47 687.153C1425.86 711.348 1367.37 727.811 1308.88 740.694C1269.82 749.372 1230.36 756.338 1190.98 762.752C1171.29 765.969 1151.59 768.931 1131.89 772.033C1112.17 775.049 1092.39 777.84 1072.64 780.755C993.515 791.966 913.803 801.297 833.57 807.919C753.239 814.709 672.476 818.207 591.64 818.397C510.567 818.586 429.581 814.404 349.301 805.884C343.095 805.358 336.958 804.443 330.789 803.702L312.312 801.339C299.993 799.72 287.697 798.269 275.363 796.304C250.108 792.689 225.308 787.461 201.231 780.679C188.881 777.071 176.92 772.748 165.455 767.751C162.572 766.477 159.689 765.205 156.898 763.792C153.962 762.439 151.137 760.955 148.437 759.347L139.977 754.305C137.345 752.458 134.849 750.486 132.306 748.565C129.751 746.645 127.407 744.574 125.296 742.37C122.99 740.281 120.89 738.069 119.012 735.749C117.159 733.42 115.272 731.104 113.507 728.743L109.07 721.333C103.761 711.29 100.758 700.64 100.188 689.839C99.9351 679.066 102.064 668.336 106.488 658.089C111.043 647.853 117.993 638.313 127.007 629.919L134.042 623.826C136.615 621.973 139.285 620.191 141.924 618.388C143.227 617.536 144.627 616.498 145.854 615.807L149.581 613.636L157.035 609.296C162.017 606.417 166.944 603.478 171.976 600.651L187.261 592.363C207.623 581.292 228.761 571.091 250.104 561.177C260.918 556.405 271.7 551.583 282.635 546.978L299.152 540.23L307.411 536.858L315.789 533.662C360.366 516.536 406.293 501.479 453.311 488.577C500.259 475.756 548.088 464.847 596.592 455.895C693.485 437.972 792.235 427.055 891.142 420.495C950.84 416.47 1011.27 414.89 1070.29 414.192C1126.82 413.588 1163.41 415.798 1186.09 418.866C1202.6 421.1 1202.55 423.571 1188.41 425.754C1174.28 427.937 1146.05 429.777 1106.2 431.218C1055.77 433.02 1000.72 434.798 948.729 437.256C829.096 442.929 709.928 454.475 594.448 477.067C479.186 499.661 367.448 533.263 266.842 580.462C239.188 593.578 211.914 607.996 185.755 623.171C179.28 627.025 172.819 630.87 166.373 634.705C163.424 636.585 161.111 638.352 158.414 640.137C155.923 641.999 153.833 644.123 151.478 646.06C142.926 654.27 137.05 663.877 134.323 674.107C132.29 682.209 132.188 690.518 134.021 698.646L134.802 701.678C134.996 702.697 135.313 703.701 135.747 704.677L138.203 710.564L141.543 716.186L142.373 717.596L143.437 718.909L145.543 721.545C146.251 722.421 146.908 723.323 147.647 724.184L150.172 726.603C151.742 728.281 153.487 729.863 155.39 731.333L161.156 735.715L167.645 739.527C169.912 740.884 172.296 742.126 174.782 743.245C177.244 744.495 179.864 745.587 182.433 746.73C187.61 748.981 192.996 751.004 198.451 752.95C221.11 760.412 244.779 765.998 269.041 769.61C293.682 773.692 319.277 776.178 344.411 779.462C357.05 780.914 369.78 781.938 382.46 783.197L401.496 785.003C407.853 785.533 414.238 785.895 420.607 786.35L458.841 788.934L497.179 790.587C503.57 790.829 509.949 791.226 516.348 791.342L535.545 791.731C548.344 791.933 561.13 792.398 573.933 792.404C599.54 792.364 625.135 792.584 650.727 791.88C802.979 789.083 955.293 772.314 1105.58 750.528C1172.59 740.568 1239.73 730.726 1304.5 716.434C1336.79 709.395 1368.45 700.814 1399.29 690.743C1406.86 688.085 1414.56 685.608 1421.96 682.717C1425.68 681.304 1429.44 679.939 1433.14 678.488L1444.1 673.991C1447.79 672.532 1451.37 670.939 1454.93 669.322C1458.45 667.725 1462.17 666.116 1465.54 664.532C1468.49 663.084 1471.3 661.477 1473.94 659.723C1475.29 658.882 1476.59 657.982 1477.8 657.028L1481.33 654.079C1490.38 645.813 1495.76 635.626 1496.74 624.942C1497.27 619.642 1496.63 614.313 1494.85 609.17C1494.64 608.53 1494.49 607.873 1494.24 607.241L1493.34 605.381C1492.7 604.155 1492.28 602.855 1491.49 601.678L1489.17 598.125C1488.37 596.952 1487.46 595.821 1486.45 594.738C1484.55 592.503 1482.43 590.379 1480.11 588.385C1477.5 586.292 1474.67 584.124 1471.87 582.05C1466.03 577.93 1459.88 574.066 1453.44 570.479C1440.26 563.217 1426.26 556.829 1411.6 551.387C1381.61 540.423 1350.19 531.833 1317.84 525.757C1284.84 519.387 1251.66 513.572 1218.29 508.314C1165.04 499.993 1113.12 492.526 1063.1 486.124C1038.09 482.878 1013.57 479.92 989.611 477.137C965.672 474.228 942.269 471.741 919.534 469.334C898.613 467.224 888.89 465.142 890.556 463.554C892.214 462.036 905.295 460.811 929.906 461.18C1001.82 462.233 1073.58 466.547 1144.81 474.098C1174.5 477.096 1204.38 481.231 1234.25 485.741C1264.11 490.288 1293.95 495.32 1323.5 500.68C1323.71 500.553 1323.92 500.438 1324.17 500.316Z"
          fill="black"
        />
      </svg>

      <h1 class="tbr-list__title">To Be Read</h1>
      <p class="tbr-list__subtitle">
        {{ bookStore.tbr_count }} {{ bookStore.tbr_count === 1 ? 'livro' : 'livros' }} para ler
      </p>
    </header>

    <div v-if="bookStore.has_error && !bookStore.loading_states.tbr" class="tbr-list__error">
      <div class="tbr-list__error-icon">⚠️</div>
      <p class="tbr-list__error-message">{{ bookStore.error }}</p>
      <Button @click="handle_retry"> Tentar Novamente </Button>
    </div>

    <LoadingSpinner v-else-if="bookStore.loading_states.tbr">
      <p>Carregando livros...</p>
    </LoadingSpinner>

    <div v-else-if="show_empty_state" class="tbr-list__empty">
      <div class="tbr-list__empty-icon">📚</div>
      <h2 class="tbr-list__empty-title">Lista vazia</h2>
      <p class="tbr-list__empty-text">
        Adicione livros com o status "To be read" para vê-los aqui!
      </p>
    </div>

    <TransitionGroup v-else name="stamp" tag="div" class="tbr-list__grid">
      <div
        v-for="(book, index) in bookStore.book_lists.tbr"
        :key="book.id"
        class="stamp-wrapper"
        :style="{ transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }"
      >
        <article class="stamp" @click="navigate_to_edit(book.id)">
          <div class="stamp__inner">
            <div class="stamp__image-container">
              <img
                v-if="book.cover?.[0]"
                :src="book.cover[0]"
                :alt="`Capa do livro ${book.title}`"
                class="stamp__image"
                loading="lazy"
              />
              <div v-else class="stamp__placeholder" aria-label="Sem capa disponível">📖</div>
              <div class="stamp__overlay" aria-hidden="true"></div>
            </div>

            <div class="stamp__details">
              <h3 class="stamp__title">{{ book.title }}</h3>
              <p v-if="book.author?.length" class="stamp__author">
                {{ book.author.join(', ') }}
              </p>
              <p v-else class="stamp__author">Autor desconhecido</p>
            </div>
          </div>
        </article>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.tbr-list {
  min-height: 100%;
}

/* ===== HEADER ===== */
.tbr-list__header {
  text-align: center;
  /* background-image: url('@/assets/images/cards/card_stats/tape-title.webp'); */
  background-repeat: no-repeat;
  background-position: center;
  background-origin: content-box;
  width: fit-content;
  padding: 2rem 2rem 1.5rem 1.5rem;
  margin: 0 auto;
  width: 100%;
  position: relative;
}
.tbr-list__header svg {
  max-width: 500px;
  height: fit-content;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.tbr-list__title {
  font-size: 2.5rem;
  color: var(--black);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.tbr-list__subtitle {
  color: var(--black);
}

/* ===== ESTADOS (ERROR, LOADING, EMPTY) ===== */
.tbr-list__error,
.tbr-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--black);
}

/* Estado de Erro */
.tbr-list__error {
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius);
  margin: 2rem;
}

.tbr-list__error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tbr-list__error-message {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  color: var(--danger);
}

/* Estado Vazio */
.tbr-list__empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.tbr-list__empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.tbr-list__empty-text {
  color: var(--muted);
  max-width: 400px;
}

/* ===== GRID DE LIVROS ===== */
.tbr-list__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7rem;
  margin-top: 2rem;
}

/* ===== STAMP CARD ===== */
.stamp-wrapper {
  transition: all 0.3s ease;
  filter: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.2));
}

.stamp-wrapper:hover {
  transform: scale(1.1) rotate(0deg) !important;
  z-index: 10;
}

.stamp {
  background: var(--white);
  padding: 12px;
  position: relative;
  width: 180px;
  margin: 0 auto;
}

/* Efeito de borda serrilhada */
.stamp::after {
  content: '';
  position: absolute;
  top: -12px;
  left: -8px;
  right: -12px;
  bottom: -9px;
  background-image: radial-gradient(circle at 9px 9px, transparent 6px, var(--white) 7px);
  background-size: 20px 20px;
  z-index: -1;
}

.stamp__inner {
  border: 1px solid #ddd;
  padding: 4px;
  background: #f9f9f9;
}

.stamp__image-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #eee;
}

.stamp__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(0.2) contrast(1.1);
}

.stamp__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 3rem;
  background: #e5e5e5;
}

.stamp__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

.stamp__details {
  padding: 10px 2px;
  text-align: center;
}

.stamp__title {
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--black);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stamp__author {
  font-size: 0.7rem;
  color: var(--muted);
  margin: 0;
}

/* ===== ANIMAÇÕES ===== */
.stamp-move,
.stamp-enter-active,
.stamp-leave-active {
  transition: all 0.4s ease;
}

.stamp-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-10deg);
}

.stamp-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(10deg);
}

.stamp-leave-active {
  position: absolute;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .tbr-list__title {
    font-size: 2rem;
    padding: 0.5rem 1rem;
  }

  .stamp {
    width: 140px;
  }

  .stamp__image-container {
    height: 180px;
  }
}
</style>
