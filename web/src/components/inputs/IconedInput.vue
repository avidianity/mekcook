<script lang="ts" setup generic="T">
import { computed } from 'vue';
import BaseInput from './BaseInput.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: T;
    type?: string;
    placeholder?: string;
    name?: string;
    fullWidth?: boolean;
  }>(),
  { modelValue: undefined, fullWidth: true },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void;
}>();

const inputValue = computed<T | undefined>({
  get: () => props.modelValue,
  set: (val: T | undefined) => emit('update:modelValue', val as T),
});
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-xl bg-slate-600 h-10 w-full relative"
    :class="{
      'max-w-xs': props.fullWidth,
    }"
  >
    <span class="absolute left-3">
      <slot name="icon" />
    </span>
    <BaseInput
      v-model="inputValue"
      :full-width="props.fullWidth"
      :type="props.type"
      :placeholder="props.placeholder"
      :name="props.name"
      class="flex-grow pl-10"
    />
  </div>
</template>
