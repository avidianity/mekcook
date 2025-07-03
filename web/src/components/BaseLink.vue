<script lang="ts" setup>
import type { RouteRecordNameGeneric } from 'vue-router';

const props = defineProps<{
  href: RouteRecordNameGeneric;
  disabled?: boolean;
}>();
</script>

<template>
  <RouterLink
    :to="{ name: props.href }"
    class="text-sm text-slate-400"
    :class="{
      'hover:underline cursor-pointer': !props.disabled,
      'text-slate-300 cursor-not-allowed': props.disabled,
    }"
    @click.prevent="props.disabled && $event.preventDefault()"
  >
    <slot />
  </RouterLink>
</template>
