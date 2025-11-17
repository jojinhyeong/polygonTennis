<template>
  <div class="group-manager">
    <div class="groups-container">
      <transition-group name="list" tag="div" class="groups-grid">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group-card"
        >
          <div class="card-header">
            <div class="group-number">그룹 {{ group.id }}</div>
            <button
              v-if="groups.length > 1"
              class="remove-group-btn"
              @click="$emit('remove-group', group.id)"
              title="그룹 삭제"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="group-name-section">
            <input
              v-model="group.name"
              class="group-name-input"
              @blur="updateGroupName(group.id, group.name)"
              @keyup.enter="$event.target.blur()"
              placeholder="그룹 이름을 입력하세요"
            />
          </div>

          <div class="players-section">
            <div class="players-header" @click="togglePlayersList(group.id)">
              <div class="players-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>선수 목록</span>
                <span class="player-count" v-if="group.players.length > 0">({{ group.players.length }})</span>
                <svg 
                  class="toggle-arrow" 
                  :class="{ 'expanded': isGroupExpanded(group.id) }"
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <button class="add-player-btn" @click.stop="addPlayer(group.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>선수 추가</span>
              </button>
            </div>

            <div class="players-list" v-show="isGroupExpanded(group.id)">
              <transition-group name="player-list" tag="div">
                <div
                  v-for="(player, index) in group.players"
                  :key="index"
                  class="player-item"
                >
                  <div class="player-number">{{ index + 1 }}</div>
                  <input
                    v-model="player.name"
                    class="player-input"
                    :placeholder="`선수 ${index + 1} 이름`"
                    @blur="updatePlayer(group.id, index, player.name)"
                    @keyup.enter="$event.target.blur()"
                  />
                  <button
                    class="remove-player-btn"
                    @click="removePlayer(group.id, index)"
                    title="선수 삭제"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </transition-group>
              <div v-if="group.players.length === 0" class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <p>선수를 추가해주세요</p>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <button class="add-group-btn" @click="$emit('add-group')">
        <div class="add-group-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <span class="add-group-text">새 그룹 추가</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  groups: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add-group', 'remove-group', 'update-group'])

// 각 그룹의 선수 목록 토글 상태 관리
const expandedGroups = ref(new Set())

const togglePlayersList = (groupId) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

const isGroupExpanded = (groupId) => {
  return expandedGroups.value.has(groupId)
}

const addPlayer = (groupId) => {
  const group = props.groups.find(g => g.id === groupId)
  if (group) {
    // 새로운 배열을 생성하여 반응성 보장
    const newPlayers = [...group.players, { name: '' }]
    emit('update-group', groupId, { players: newPlayers })
    // 선수 추가 시 토글이 닫혀있으면 자동으로 열기
    if (!isGroupExpanded(groupId)) {
      expandedGroups.value.add(groupId)
    }
  }
}

const removePlayer = (groupId, playerIndex) => {
  const group = props.groups.find(g => g.id === groupId)
  if (group) {
    // 새로운 배열을 생성하여 반응성 보장
    const newPlayers = group.players.filter((_, index) => index !== playerIndex)
    emit('update-group', groupId, { players: newPlayers })
  }
}

const updatePlayer = (groupId, playerIndex, name) => {
  const group = props.groups.find(g => g.id === groupId)
  if (group && group.players[playerIndex]) {
    // 새로운 배열을 생성하여 반응성 보장
    const newPlayers = [...group.players]
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], name }
    emit('update-group', groupId, { players: newPlayers })
  }
}

const updateGroupName = (groupId, name) => {
  emit('update-group', groupId, { name })
}
</script>

<style scoped>
.group-manager {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.groups-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.group-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(76, 175, 80, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  overflow-x: hidden;
  overflow-y: visible;
  max-width: 100%;
  box-sizing: border-box;
}


.group-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 8px 12px rgba(0, 0, 0, 0.08),
    0 20px 40px rgba(76, 175, 80, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.group-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4CAF50;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Inter', sans-serif;
}

.remove-group-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.remove-group-btn:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1) rotate(90deg);
}

.group-name-section {
  margin-bottom: 1rem;
}

.group-name-input {
  width: 100%;
  font-size: 1rem;
  font-weight: 700;
  border: 2px solid transparent;
  outline: none;
  color: #1a1a1a;
  background: rgba(76, 175, 80, 0.1);
  padding: 0.625rem 0.875rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  -webkit-appearance: none;
  touch-action: manipulation;
}

.group-name-input:hover {
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.3);
}

.group-name-input:focus {
  background: white;
  border-color: #4CAF50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
}

.players-section {
  margin-top: 0.75rem;
}

.players-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.players-header:hover {
  background-color: rgba(76, 175, 80, 0.05);
}

.players-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2E7D32;
  flex: 1;
}

.toggle-arrow {
  transition: transform 0.3s ease;
  color: #4CAF50;
  margin-left: 0.25rem;
}

.toggle-arrow.expanded {
  transform: rotate(180deg);
}

.players-title svg {
  color: #4CAF50;
}

.player-count {
  color: #9ca3af;
  font-weight: 500;
  font-size: 0.9rem;
}

.add-player-btn {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 40px;
}

.add-player-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.add-player-btn:active {
  transform: translateY(0);
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 60px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.player-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  animation: slideIn 0.3s ease;
  padding-right: 0;
  overflow: visible;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.player-number {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.player-input {
  flex: 1;
  padding: 0.875rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  background: white;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  -webkit-appearance: none;
  touch-action: manipulation;
  min-height: 48px;
  min-width: 0;
}

.player-input:hover {
  border-color: #d1d5db;
}

.player-input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
  background: white;
}

.remove-player-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-width: 32px;
  padding: 0;
}

.remove-player-btn:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1) rotate(90deg);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-state svg {
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.95rem;
  margin: 0;
  font-weight: 500;
}

.add-group-btn {
  padding: 1.5rem 1.25rem;
  border: 2px dashed rgba(76, 175, 80, 0.4);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
  font-weight: 600;
  color: #4CAF50;
  backdrop-filter: blur(20px);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 100px;
}

.add-group-btn:hover {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(76, 175, 80, 0.3);
}

.add-group-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.add-group-btn:hover .add-group-icon {
  transform: scale(1.1) rotate(90deg);
}

.add-group-text {
  color: #4CAF50;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.player-list-enter-active,
.player-list-leave-active {
  transition: all 0.3s ease;
}

.player-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.player-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 태블릿 */
@media (min-width: 481px) {
  .groups-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .group-card {
    padding: 1.75rem;
    border-radius: 22px;
  }

  .group-name-input {
    font-size: 1.375rem;
    padding: 1rem 1.25rem;
  }

  .players-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .add-player-btn {
    width: auto;
  }

  .add-group-btn {
    padding: 2.25rem;
    font-size: 1.05rem;
  }

  .player-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .groups-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
  }

  .group-card {
    padding: 2rem;
    border-radius: 24px;
  }

  .group-name-input {
    font-size: 1.5rem;
    padding: 1rem 1.25rem;
  }

  .add-group-btn {
    padding: 2.5rem;
    font-size: 1.1rem;
  }
}
</style>
