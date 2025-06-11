<script lang="ts" setup generic="T">
import type { InputTypeHTMLAttribute } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: T;
    type?: InputTypeHTMLAttribute;
    placeholder?: string;
    name?: string;
    fullWidth?: boolean;
  }>(),
  { modelValue: undefined, fullWidth: true },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void;
}>();

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value as unknown as T);
};
</script>

<template>
  <input
    class="outline-none rounded-xl bg-slate-700 h-10 px-4 text-sm focus:border-2 focus:border-slate-400 w-full"
    :class="{
      'max-w-xs': props.fullWidth,
    }"
    :type="props.type"
    :placeholder="props.placeholder"
    :name="props.name"
    :value="props.modelValue"
    @input="onInput"
  />
</template>
