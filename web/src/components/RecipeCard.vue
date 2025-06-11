<script lang="ts" setup>
const { url, title } = defineProps<{
  url: string;
  title: string;
}>();
</script>

<template>
  <div class="flex flex-col rounded-2xl cursor-pointer hover:scale-105">
    <img :src="url" :alt="title" class="rounded-2xl object-cover" />
    <span class="leading-6 mt-2 text-xs sm:text-sm md:text-base">{{ title }}</span>
  </div>
</template>
