<script lang="ts" setup>
import { useAttrs } from 'vue';

const props = defineProps({
  tag: {
    type: String,
    default: 'div',
  },
});

const attrs = useAttrs();
</script>

<template>
  <component :is="props.tag" class="flex flex-col items-center pt-10 gap-5" v-bind="attrs">
    <slot />
  </component>
</template>
