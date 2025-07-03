<script lang="ts" setup generic="T">
import type { InputTypeHTMLAttribute } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: T;
    type?: InputTypeHTMLAttribute;
    placeholder?: string;
    autocomplete?: string;
    name?: string;
    fullWidth?: boolean;
    disabled?: boolean;
  }>(),
  { fullWidth: true, disabled: false },
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
    class="outline-none rounded-xl bg-slate-700 disabled:bg-slate-500 h-10 px-4 text-sm not-disabled:focus:border-2 not-disabled:focus:border-slate-400 w-full"
    :class="{
      'max-w-xs': props.fullWidth,
      'cursor-not-allowed': props.disabled,
    }"
    :type="props.type"
    :placeholder="props.placeholder"
    :name="props.name"
    :value="props.modelValue"
    :autocomplete="props.autocomplete"
    :disabled="props.disabled"
    @input="onInput"
  />
</template>
