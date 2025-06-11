<script lang="ts" setup>
type Props = {
  variant?: 'neutral' | 'blue';
  size?: 'xs' | 'sm' | 'md';
};

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
});
</script>

<template>
  <button
    type="button"
    class="rounded-xl cursor-pointer"
    :class="[
      props.variant === 'neutral' ? 'bg-neutral-800 hover:bg-neutral-700' : null,
      props.variant === 'blue' ? 'bg-sky-800 hover:bg-sky-700' : null,
      props.size === 'md' ? 'py-2 px-7' : null,
      props.size === 'sm' ? 'py-1 px-4 sm:px-6 text-sm' : null,
    ]"
  >
    <slot />
  </button>
</template>
