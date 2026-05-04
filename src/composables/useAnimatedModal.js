import { ref, computed } from 'vue'

export function useAnimatedModal(cardEl, randomTilt) {
  // Estados
  const isModalOpen = ref(false)
  const isModalVisible = ref(false)
  const isAnimating = ref(false)

  // Estado da face atual: 'front' ou 'back'
  const currentFace = ref('front')

  // Computed para saber se está virado para trás
  const isFlipped = computed(() => currentFace.value === 'back')

  // Abre modal com animação suave
  const openAnimatedModal = () => {
    if (!cardEl.value) return

    // Marca card original como "animando" (fica transparente)
    isAnimating.value = true

    // Abre modal imediatamente
    isModalOpen.value = true

    // Trigger fade-in do overlay e card após um frame
    requestAnimationFrame(() => {
      isModalVisible.value = true
    })

    // Abre no front e depois de alguns segundos muda para o back
    currentFace.value = 'front'

    // Depois de alguns segundos muda para o back
    setTimeout(() => {
      flipToBack()
    }, 2000)
  }

  // Fecha modal
  const closeModal = () => {
    // Inicia fade-out
    isModalVisible.value = false

    // Garante que termina no front antes de fechar
    currentFace.value = 'front'

    // Aguarda animação terminar antes de destruir o modal
    setTimeout(() => {
      isModalOpen.value = false
      // Remove transparência do card original
      isAnimating.value = false
    }, 300)
  }

  // Fecha modal com animação reversa
  const closeModalWithAnimation = () => {
    // Inicia fade-out
    isModalVisible.value = false

    // Garante que termina no front antes de fechar
    currentFace.value = 'front'

    // Aguarda animação terminar antes de destruir o modal
    setTimeout(() => {
      isModalOpen.value = false
      // Remove transparência do card original
      isAnimating.value = false
    }, 300)
  }

  // Vira para o verso
  const flipToBack = () => {
    currentFace.value = 'back'
  }

  // Vira para o frente
  const flipToFront = () => {
    currentFace.value = 'front'
  }

  // Alterna flip do card - sempre vai da face que está em display para a outra
  const toggleFlip = () => {
    currentFace.value = currentFace.value === 'front' ? 'back' : 'front'
  }

  // Vira para a face oposta
  const flipToOpposite = () => {
    toggleFlip()
  }

  return {
    isModalOpen,
    isModalVisible,
    isAnimating,
    currentFace,
    isFlipped,
    openAnimatedModal,
    closeModal,
    closeModalWithAnimation,
    flipToBack,
    flipToFront,
    toggleFlip,
    flipToOpposite,
  }
}
