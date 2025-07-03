<script lang="ts" setup>
type Props = {
  variant?: 'neutral' | 'blue';
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'reset' | 'submit';
};

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  disabled: false,
  type: 'button',
});

const emits = defineEmits<{
  (e: 'click', payload: MouseEvent): void;
}>();

const onClick = (e: MouseEvent) => emits('click', e);
</script>

<template>
  <button
    :type="props.type"
    class="rounded-xl cursor-pointer"
    :class="[
      props.variant === 'neutral'
        ? 'bg-neutral-800 disabled:bg-neutral-300 hover:not-disabled:bg-neutral-700 hover:disabled:cursor-not-allowed'
        : null,
      props.variant === 'blue'
        ? 'bg-sky-800 disabled:bg-sky-300 hover:not-disabled:bg-sky-700 hover:disabled:cursor-not-allowed'
        : null,
      props.size === 'md' ? 'py-2 px-7' : null,
      props.size === 'sm' ? 'py-1 px-4 sm:px-6 text-sm' : null,
    ]"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>
