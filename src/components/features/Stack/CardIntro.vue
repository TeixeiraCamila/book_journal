<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

// Import assets
import bgRTop from '@/assets/images/cards/card_01_intro/bg-r_top.webp'
import bgRBottom from '@/assets/images/cards/card_01_intro/bg-r_bottom.webp'
import paper02 from '@/assets/images/cards/card_01_intro/paper-02.webp'
import paper06 from '@/assets/images/cards/card_01_intro/paper-06.webp'
import paper5 from '@/assets/images/cards/card_01_intro/paper-5.webp'
import cloud from '@/assets/images/cards/card_01_intro/cloude.webp'
import start from '@/assets/images/cards/card_01_intro/start.webp'
import coffee from '@/assets/images/cards/card_01_intro/coffee.webp'
import paper01 from '@/assets/images/cards/card_01_intro/paper-01.webp'
import luck from '@/assets/images/cards/card_01_intro/luck.webp'

const animatedElements = ref()

function anime() {
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
  })

  const elements = animatedElements.value.querySelectorAll('p')

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
  )

  // Animate cloud from right to left
  tl.from(
    '.card-intro__cloud',
    {
      x: 100,
      opacity: 0,
      duration: 2,
      ease: 'power2.out',
    },
    '-=2.5',
  )

  // Animate start descending
  tl.from(
    '.card-intro__start',
    {
      y: -100,
      opacity: 0,
      duration: 2,
      ease: 'bounce.out',
    },
    '-=2',
  )

  // Animate coffee appearing
  tl.from(
    '.card-intro__coffee',
    {
      opacity: 0,
      scale: 0.5,
      duration: 1.5,
      ease: 'back.out(1.7)',
    },
    '-=1.5',
  )
}

onMounted(() => {
  anime()
});
</script>

<template>
  <div class="card-intro">
    <div class="card-intro__detail">
      <img class="card-intro__detail-01" :src="bgRTop" alt="" />
      <img class="card-intro__detail-02" :src="bgRBottom" alt="" />
      <img class="card-intro__detail-03" :src="paper02" alt="" />
      <img class="card-intro__detail-04" :src="paper06" alt="" />
      <img class="card-intro__detail-05" :src="paper5" alt="" />
      <img class="card-intro__cloud" :src="cloud" alt="" />
      <img class="card-intro__start" :src="start" alt="" />
      <img class="card-intro__coffee" :src="coffee" alt="" />
    </div>
    <div class="card-intro__content">
      <img class="card-intro__content__image" :src="paper01" alt="" />

      <img class="card-intro__content__detail" :src="luck" alt="" />

      <h1 ref="animatedElements" class="card-intro__title">
        <p>My Book</p>
        <p>Journal</p>
      </h1>
    </div>
  </div>
</template>

<style scoped>
.card-intro {
  background-color: #075832;
  overflow: hidden;
  border-radius: 18px;
}

.card-intro__detail img {
  position: absolute;
  z-index: 1;
}

.card-intro__detail-01,
.card-intro__detail-03,
.card-intro__detail-05,
.card-intro__content__detail {
  top: 0;
}

.card-intro__detail-02 {
  bottom: 0;
}

.card-intro__detail-01,
.card-intro__detail-02,
.card-intro__cloud {
  right: 0;
}

.card-intro__detail-03,
.card-intro__detail-05,
.card-intro__content__detail {
  left: 0;
}

.card-intro__detail-03 {
  height: 100%;
  z-index: 1;
}

.card-intro__detail-04 {
  top: 130px;
  left: -23px;
  transform: rotate(180deg);
}

.card-intro__detail-05 {
  max-width: 500px;
}

.card-intro__cloud {
  top: 20%;
}

.card-intro__start {
  top: -5%;
  right: 70%;
  max-height: 60%;
}

.card-intro__detail img.card-intro__coffee {
  bottom: 4%;
  left: 54%;
  max-height: 50%;
  z-index: 20;
}

.card-intro__content {
  position: absolute;
  z-index: 10;
  text-align: center;
  width: fit-content;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.card-intro__content__detail {
  position: absolute;
  max-width: 35%;
}

.card-intro__content__image {
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
