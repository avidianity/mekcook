<script lang="ts" setup>
import type { RouteRecordNameGeneric } from 'vue-router';

const { href } = defineProps<{
  href: RouteRecordNameGeneric;
}>();
</script>

<template>
  <RouterLink :to="{ name: href }" class="text-sm text-slate-400 hover:underline cursor-pointer">
    <slot />
  </RouterLink>
</template>
