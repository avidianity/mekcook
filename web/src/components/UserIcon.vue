<script lang="ts" setup>
const { name, url } = defineProps({
  name: {
    type: String,
    default: 'User',
  },
  url: {
    type: String,
    default: 'https://dummyimage.com/600x600/000/fff',
  },
});
</script>

<template>
  <img :src="url" :alt="name" class="h-10 w-10 rounded-full object-cover shadow cursor-pointer" />
</template>
