<script setup>
// Card de introdução com animações GSAP — exibe "My Book Journal" com assets decorativos
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';

// Import assets

import paperCenter from '@/assets/images/cards/card_intro/paper-center.webp';
import paperLeft from '@/assets/images/cards/card_intro/paper-left.webp';
import paperLeftBottom from '@/assets/images/cards/card_intro/paper-left-bottom.webp';
import paperLeftTop from '@/assets/images/cards/card_intro/paper-left-top.webp';
import paperRightTop from '@/assets/images/cards/card_intro/paper-right-top.webp';
import paperRightBottom from '@/assets/images/cards/card_intro/paper-right-bottom.webp';

import cloud from '@/assets/images/cards/card_intro/cloude.webp';
import start from '@/assets/images/cards/card_intro/start.webp';
import coffee from '@/assets/images/cards/card_intro/coffee.webp';
import luck from '@/assets/images/cards/card_intro/luck.webp';

const animatedElements = ref();

function anime() {
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
  });

  const elements = animatedElements.value.querySelectorAll('p');

  tl.from(
    elements,
    {
      x: (index) => (index === 0 ? -60 : 60),
      opacity: 0,
      duration: 3,
      delay: 1.8,
      ease: 'back.out(1.7)',
      stagger: 0.1,
    },
    '-=1.2',
  );

  // Animate cloud from right to left
  tl.from(
    '#card-intro__cloud',
    {
      x: 100,
      opacity: 0,
      duration: 2,
      ease: 'power2.out',
    },
    '-=2.5',
  );

  // Animate start descending
  tl.from(
    '#card-intro__start',
    {
      y: -100,
      opacity: 0,
      duration: 2,
      ease: 'bounce.out',
    },
    '-=2',
  );

  // Animate coffee appearing
  tl.from(
    '#card-intro__coffee',
    {
      opacity: 0,
      scale: 0.5,
      duration: 1.5,
      ease: 'back.out(1.7)',
    },
    '-=1.5',
  );
}

onMounted(() => {
  anime();
});
</script>

<template>
  <div class="card-intro">
    <div class="card-intro__detail">
      <img :src="paperLeftBottom" id="card-intro__detail-02" />
      <img :src="paperLeft" id="card-intro__detail-01" />
      <img :src="paperLeftTop" id="card-intro__detail-03" />
      <img :src="paperRightTop" id="card-intro__detail-04" />
      <img :src="paperRightBottom" id="card-intro__detail-05" />

      <img id="card-intro__cloud" :src="cloud" alt="" />
      <img id="card-intro__start" :src="start" alt="" />
      <img id="card-intro__coffee" :src="coffee" alt="" />
    </div>
    <div class="card-intro__content">
      <img :src="paperCenter" id="card-intro__content-image" alt="" />
      <img :src="luck" id="card-intro__content-detail" alt="" />

      <h1 ref="animatedElements" class="card-intro__title">
        <p>
          My Book <br />
          Journal
        </p>
      </h1>
    </div>
  </div>
</template>

<style scoped>
.card-intro {
  background-color: #075832;
  background-size: contain;
  border-radius: 18px;
  overflow: hidden;
}

.card-intro__detail img {
  position: absolute;
}
#card-intro__detail-01 {
  left: -10px;
  top: 0;
  height: 100%;
}
#card-intro__detail-02 {
  left: 0;
  bottom: 0;
  max-height: 600px;
}
#card-intro__detail-03 {
  left: -7%;
  top: -15%;
  max-height: 600px;
}
#card-intro__detail-04 {
  max-width: 350px;
  top: -10%;
  right: -47px;
}
#card-intro__detail-05 {
  bottom: 0;
  right: -47px;
}
/* .card-intro__detail-01,
.card-intro__detail-03,
.card-intro__detail-05,
.card-intro__content-detail {
  left: 0;
}

.card-intro__detail-03 {
  height: 100%;
  z-index: 1;
}

.card-intro__detail-04 {
  bottom: -10px;
  left: -23px;
  transform: rotate(180deg);
}

.card-intro__detail-05 {
  max-width: 500px;
} */

#card-intro__cloud {
  top: 20%;
  right: -10%;
  max-width: 56%;
}

#card-intro__start {
  top: -5%;
  right: 70%;
  max-height: 60%;
}

#card-intro__coffee {
  bottom: 6%;
  left: 47%;
  max-height: 33%;
  z-index: 20;
}

.card-intro__content {
  position: absolute;
  text-align: center;
  width: fit-content;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

#card-intro__content-detail {
  position: absolute;
  max-width: 35%;
  top: -17%;
  right: -16%;
}

#card-intro__content-image {
  max-width: 400px;
}

.card-intro__title {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(2, 2, 2);
  letter-spacing: -0.04em;
  font-size: 55px;
  z-index: 20;
}
</style>
