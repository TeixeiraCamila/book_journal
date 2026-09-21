// Composable que gerencia modal animado com flip 3D (frente/verso) para visualização de cards
import { ref, computed } from 'vue';

export function use_animated_modal(card_el) {
  // Estados
  const is_modal_open = ref(false);
  const is_modal_visible = ref(false);
  const is_animating = ref(false);

  // Estado da face atual: 'front' ou 'back'
  const current_face = ref('front');

  // Computed para saber se está virado para trás
  const is_flipped = computed(() => current_face.value === 'back');

  // Abre modal com animação suave
  const open_animated_modal = () => {
    if (!card_el.value) return;

    // Marca card original como "animando" (fica transparente)
    is_animating.value = true;

    // Abre modal imediatamente
    is_modal_open.value = true;

    // Trigger fade-in do overlay e card após um frame
    requestAnimationFrame(() => {
      is_modal_visible.value = true;
    });

    // Abre no front e depois de alguns segundos muda para o back
    current_face.value = 'front';

    // Depois de alguns segundos muda para o back
    setTimeout(() => {
      flip_to_back();
    }, 2000);
  };

  // Fecha modal
  const close_modal = () => {
    // Inicia fade-out
    is_modal_visible.value = false;

    // Garante que termina no front antes de fechar
    current_face.value = 'front';

    // Aguarda animação terminar antes de destruir o modal
    setTimeout(() => {
      is_modal_open.value = false;
      // Remove transparência do card original
      is_animating.value = false;
    }, 300);
  };

  // Fecha modal com animação reversa
  const close_modal_with_animation = () => {
    // Inicia fade-out
    is_modal_visible.value = false;

    // Garante que termina no front antes de fechar
    current_face.value = 'front';

    // Aguarda animação terminar antes de destruir o modal
    setTimeout(() => {
      is_modal_open.value = false;
      // Remove transparência do card original
      is_animating.value = false;
    }, 300);
  };

  // Vira para o verso
  const flip_to_back = () => {
    current_face.value = 'back';
  };

  // Vira para o frente
  const flip_to_front = () => {
    current_face.value = 'front';
  };

  // Alterna flip do card - sempre vai da face que está em display para a outra
  const toggle_flip = () => {
    current_face.value = current_face.value === 'front' ? 'back' : 'front';
  };

  // Vira para a face oposta
  const flip_to_opposite = () => {
    toggle_flip();
  };

  return {
    is_modal_open,
    is_modal_visible,
    is_animating,
    current_face,
    is_flipped,
    open_animated_modal,
    close_modal,
    close_modal_with_animation,
    flip_to_back,
    flip_to_front,
    toggle_flip,
    flip_to_opposite,
  };
}
