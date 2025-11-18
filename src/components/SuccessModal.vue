<template>
  <div v-if="show" class="success-modal-overlay" @click.self="close">
    <div class="success-modal" @click.stop>
      <div class="success-modal-header">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 class="success-title">생성이 완료되었습니다</h3>
      </div>
      <div class="success-modal-body">
        <p class="success-message">{{ message }}</p>
      </div>
      <div class="success-modal-footer">
        <button class="success-close-btn" @click="close">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '대진표가 성공적으로 생성되었습니다.'
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.success-modal {
  background: white;
  border-radius: 20px;
  padding: 2rem 2.5rem;
  max-width: 90%;
  width: 420px;
  margin-top: 2rem;
  text-align: center;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.success-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A, #4CAF50);
  background-size: 200% 100%;
  animation: gradientShift 2s linear infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.success-modal-header {
  margin-bottom: 1.5rem;
}

.success-icon {
  color: #4CAF50;
  margin: 0 auto 1rem;
  animation: successBounce 0.6s ease-out;
  filter: drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3));
}

@keyframes successBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
}

.success-modal-body {
  margin-bottom: 1.5rem;
}

.success-message {
  margin: 0;
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  word-break: keep-all;
}

.success-modal-footer {
  display: flex;
  justify-content: center;
}

.success-close-btn {
  width: 100%;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.success-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.success-close-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .success-modal-overlay {
    padding: 0.5rem;
    padding-top: 1rem;
  }

  .success-modal {
    padding: 1.5rem 1.75rem;
    width: 90%;
    margin-top: 1rem;
    max-height: 90vh;
  }

  .success-title {
    font-size: 1.25rem;
  }

  .success-message {
    font-size: 0.9rem;
  }

  .success-close-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>

