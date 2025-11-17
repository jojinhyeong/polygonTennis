<template>
  <select 
    :value="modelValue ?? ''" 
    @change="handleChange"
    class="select-input"
  >
    <option v-if="placeholder" value="">{{ placeholder }}</option>
    <option
      v-for="option in options"
      :key="getOptionValue(option)"
      :value="getOptionValue(option)"
    >
      {{ getOptionLabel(option) }}
    </option>
  </select>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number | null | undefined
  options: Array<{ id: string | number; name: string; [key: string]: any } | string>
  placeholder?: string
  valueKey?: string
  labelKey?: string
  labelFormatter?: (option: any) => string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  valueKey: 'id',
  labelKey: 'name',
  labelFormatter: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function getOptionValue(option: any): string {
  if (typeof option === 'string') {
    return option
  }
  const value = option[props.valueKey] ?? option
  return String(value)
}

function getOptionLabel(option: any): string {
  if (typeof option === 'string') {
    return option
  }
  if (props.labelFormatter) {
    return props.labelFormatter(option)
  }
  return option[props.labelKey] ?? String(option)
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  if (value === '') {
    emit('update:modelValue', '')
    return
  }
  // 원본 options에서 타입 확인하여 숫자면 숫자로, 문자열이면 문자열로 반환
  const selectedOption = props.options.find(opt => {
    const optValue = typeof opt === 'string' ? opt : opt[props.valueKey]
    return String(optValue) === value
  })
  if (selectedOption) {
    const originalValue = typeof selectedOption === 'string' 
      ? selectedOption 
      : selectedOption[props.valueKey]
    emit('update:modelValue', originalValue)
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
.select-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.select-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}
</style>

