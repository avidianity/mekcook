<script setup lang="ts">
const { tag } = defineProps({
  tag: {
    type: String,
    default: 'div',
  },
});
</script>

<template>
  <component
    :is="tag"
    class="mx-auto w-full px-6 xs:px-8 sm:px-10 md:px-16 md:max-w-screen-xs lg:max-w-screen-md xl:max-w-screen-xl pt-10"
  >
    <slot />
  </component>
</template>
