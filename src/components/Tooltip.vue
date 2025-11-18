<template>
  <div class="tooltip-wrapper" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <slot></slot>
    <Transition name="tooltip-fade">
      <div v-if="showTooltip" class="tooltip" :class="position">
        <div class="tooltip-content">
          {{ text }}
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  }
})

const showTooltip = ref(false)
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  z-index: 10000;
  pointer-events: none;
  white-space: nowrap;
}

.tooltip.top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip.bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip.left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip.right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-content {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 200px;
  white-space: normal;
  word-break: keep-all;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.tooltip.top .tooltip-arrow {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(0, 0, 0, 0.85);
}

.tooltip.bottom .tooltip-arrow {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(0, 0, 0, 0.85);
}

.tooltip.left .tooltip-arrow {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid rgba(0, 0, 0, 0.85);
}

.tooltip.right .tooltip-arrow {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid rgba(0, 0, 0, 0.85);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.tooltip.top.tooltip-fade-enter-from,
.tooltip.top.tooltip-fade-leave-to {
  transform: translateX(-50%) translateY(4px);
}

.tooltip.bottom.tooltip-fade-enter-from,
.tooltip.bottom.tooltip-fade-leave-to {
  transform: translateX(-50%) translateY(-4px);
}

.tooltip.left.tooltip-fade-enter-from,
.tooltip.left.tooltip-fade-leave-to {
  transform: translateY(-50%) translateX(4px);
}

.tooltip.right.tooltip-fade-enter-from,
.tooltip.right.tooltip-fade-leave-to {
  transform: translateY(-50%) translateX(-4px);
}
</style>

