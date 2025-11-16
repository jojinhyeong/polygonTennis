ㅜ프프<template>
  <div class="app">
    <div class="background-pattern"></div>
    <div class="app-content">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-icon">
              <span class="tennis-ball-emoji">🎾</span>
            </div>
            <h1 class="app-title">폴리곤테니스</h1>
          </div>
        </div>
      </header>

      <nav class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon" v-html="tab.icon"></span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </nav>

      <div class="content-container">
        <div v-if="activeTab === 'groups'" class="bulk-add-section">
          <button class="bulk-add-top-btn" @click="showGroupSelectModal = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>선수 일괄 추가</span>
          </button>
        </div>

        <GroupManager
          v-if="activeTab === 'groups'"
          :groups="groups"
          @add-group="addGroup"
          @remove-group="removeGroup"
          @update-group="updateGroup"
          key="groups"
        />
        <BracketTab
          v-if="activeTab === 'bracket'"
          :groups="groups"
          @update-bracket="updateBracket"
          key="bracket"
        />
        <RandomBracketTab
          v-if="activeTab === 'random'"
          :groups="groups"
          @generate-random="generateRandomBracket"
          key="random"
        />
      </div>

      <!-- 그룹 선택 모달 -->
      <div v-if="showGroupSelectModal" class="modal-overlay" @click.self="showGroupSelectModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>그룹 선택</h3>
            <button class="modal-close-btn" @click="showGroupSelectModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint">선수를 추가할 그룹을 선택하세요</p>
            <div class="group-select-list">
              <button
                v-for="group in groups"
                :key="group.id"
                class="group-select-btn"
                @click="selectGroupForBulkAdd(group.id)"
              >
                <div class="group-select-info">
                  <span class="group-select-name">{{ group.name }}</span>
                  <span class="group-select-count">{{ group.players.length }}명</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 일괄 추가 모달 -->
      <div v-if="showBulkAddModal" class="modal-overlay" @click.self="closeBulkAddModal">
        <div class="modal-content bulk-add-modal">
          <div class="modal-header">
            <h3>선수 일괄 추가 - {{ selectedGroupName }}</h3>
            <button class="modal-close-btn" @click="closeBulkAddModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint">아래 선수 목록에서 추가할 선수를 선택하세요</p>
            <div class="player-list-grid">
              <button
                v-for="player in availablePlayersForGroup"
                :key="player.name"
                :class="['player-chip', { 
                  selected: selectedPlayers.includes(player.name),
                  disabled: player.isAdded
                }]"
                @click="!player.isAdded && togglePlayer(player.name)"
                :disabled="player.isAdded"
                :title="player.isAdded ? '이미 추가된 선수입니다' : ''"
              >
                {{ player.name }}
                <span v-if="player.isAdded" class="added-badge">추가됨</span>
              </button>
            </div>
            <div class="bulk-add-actions">
              <button class="select-all-btn" @click="selectAllPlayers">
                전체 선택
              </button>
              <button class="add-selected-btn" @click="addSelectedPlayersToGroup" :disabled="selectedPlayers.length === 0">
                선택한 {{ selectedPlayers.length }}명 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import GroupManager from './components/GroupManager.vue'
import BracketTab from './components/BracketTab.vue'
import RandomBracketTab from './components/RandomBracketTab.vue'

const activeTab = ref('groups')
const showGroupSelectModal = ref(false)
const showBulkAddModal = ref(false)
const selectedGroupId = ref(null)
const selectedPlayers = ref([])

// 제공된 선수 목록
const availablePlayers = [
  '조진형', '양준석', '고바우', '김동혁', '김시편', '김지은', '김태형', '김형수', 
  '김혜민', '김혜선', '류수영', '민선기', '박기백', '박리롱', '박성용', '박윤진', 
  '박정음', '박혜림', '백인호', '성수빈', '송슨곤', '송승훈', '유동균', '유제금', 
  '윤여명', '이다솜', '이민우', '이종훈', '이혜지', '임보아', '장완희', '장인혜', 
  '전민경', '전성현', '정우빈', '진철현', '황원기'
]

const selectedGroupName = computed(() => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  return group ? group.name : ''
})

const availablePlayersForGroup = computed(() => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  if (!group) return availablePlayers.map(name => ({ name, isAdded: false }))
  
  const existingNames = group.players.map(p => p.name)
  return availablePlayers.map(name => ({
    name,
    isAdded: existingNames.includes(name)
  }))
})

const selectGroupForBulkAdd = (groupId) => {
  selectedGroupId.value = groupId
  showGroupSelectModal.value = false
  showBulkAddModal.value = true
  selectedPlayers.value = []
}

const togglePlayer = (playerName) => {
  // 이미 추가된 선수는 선택할 수 없음
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  if (group) {
    const existingNames = group.players.map(p => p.name)
    if (existingNames.includes(playerName)) {
      return
    }
  }
  
  const index = selectedPlayers.value.indexOf(playerName)
  if (index > -1) {
    selectedPlayers.value.splice(index, 1)
  } else {
    selectedPlayers.value.push(playerName)
  }
}

const selectAllPlayers = () => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  if (group) {
    const existingNames = group.players.map(p => p.name)
    selectedPlayers.value = availablePlayers.filter(name => !existingNames.includes(name))
  } else {
    selectedPlayers.value = [...availablePlayers]
  }
}

const addSelectedPlayersToGroup = () => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  if (group && selectedPlayers.value.length > 0) {
    selectedPlayers.value.forEach(playerName => {
      if (!group.players.some(p => p.name === playerName)) {
        group.players.push({ name: playerName })
      }
    })
    updateGroup(selectedGroupId.value, { players: group.players })
    closeBulkAddModal()
  }
}

const closeBulkAddModal = () => {
  showBulkAddModal.value = false
  selectedGroupId.value = null
  selectedPlayers.value = []
}

const tabs = [
  { 
    id: 'groups', 
    label: '그룹 관리',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  },
  { 
    id: 'bracket', 
    label: '팀 고정',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>'
  },
  { 
    id: 'random', 
    label: '팀 랜덤',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
  }
]

const groups = ref([
  {
    id: 1,
    name: '그룹 1',
    players: []
  }
])

const addGroup = () => {
  const newGroupId = groups.value.length > 0 
    ? Math.max(...groups.value.map(g => g.id)) + 1 
    : 1
  groups.value.push({
    id: newGroupId,
    name: `그룹 ${newGroupId}`,
    players: []
  })
}

const removeGroup = (groupId) => {
  if (groups.value.length > 1) {
    groups.value = groups.value.filter(g => g.id !== groupId)
  } else {
    alert('최소 1개의 그룹이 필요합니다.')
  }
}

const updateGroup = (groupId, updatedGroup) => {
  const index = groups.value.findIndex(g => g.id === groupId)
  if (index !== -1) {
    groups.value[index] = { ...groups.value[index], ...updatedGroup }
  }
}

const updateBracket = (bracketData) => {
  console.log('대진표 업데이트:', bracketData)
}

const generateRandomBracket = (bracketData) => {
  console.log('랜덤 대진 생성:', bracketData)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  overflow-x: hidden;
}

.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: none;
  pointer-events: none;
  z-index: 0;
}

.app-content {
  position: relative;
  z-index: 1;
  padding: 1rem 0.75rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.app-header {
  margin-bottom: 1rem;
  animation: fadeInDown 0.8s ease-out;
}

.header-content {
  text-align: center;
}

.logo-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  margin-bottom: 0.375rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
  animation: float 3s ease-in-out infinite;
  flex-shrink: 0;
}

.tennis-ball-emoji {
  font-size: 26px;
  line-height: 1;
  display: block;
}

.app-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  color: #2E7D32;
  letter-spacing: -0.02em;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.app-subtitle {
  font-size: 0.8rem;
  color: #666666;
  margin: 0.375rem 0 0 0;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.tabs-container {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  animation: fadeInUp 0.8s ease-out 0.2s both;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 0.5rem;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab-button {
  flex: 1;
  min-width: 0;
  padding: 0.625rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: #f5f5f5;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.tab-button:hover::before {
  left: 100%;
}

.tab-button:hover {
  background: #e8f5e9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  color: #2E7D32;
}

.tab-button.active {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
  border-color: transparent;
  transform: translateY(-2px);
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.tab-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.tab-label {
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1.2;
}

.content-container {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.bulk-add-section {
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.bulk-add-top-btn {
  width: 100%;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
}

.bulk-add-top-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(76, 175, 80, 0.4);
}

.bulk-add-top-btn:active {
  transform: translateY(0);
}

.bulk-add-top-btn svg {
  flex-shrink: 0;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.bulk-add-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.modal-close-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.modal-close-btn:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-hint {
  margin: 0 0 1.25rem 0;
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 500;
}

.group-select-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-select-btn {
  width: 100%;
  padding: 1.25rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.group-select-btn:hover {
  border-color: #4CAF50;
  background: #e8f5e9;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.group-select-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.group-select-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.group-select-count {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.group-select-btn svg {
  color: #9ca3af;
  flex-shrink: 0;
}

.group-select-btn:hover svg {
  color: #4CAF50;
}

.player-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.25rem;
  -webkit-overflow-scrolling: touch;
}

.player-chip {
  padding: 0.625rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
}

.player-chip:hover:not(.disabled) {
  border-color: #4CAF50;
  background: #e8f5e9;
  transform: translateY(-2px);
}

.player-chip.selected {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  font-weight: 600;
}

.player-chip.selected::before {
  content: '✓';
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #2E7D32;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(46, 125, 50, 0.4);
  border: 2px solid white;
}

.player-chip.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6;
  border-color: #d1d5db;
  position: relative;
}

.player-chip.disabled:hover {
  transform: none;
  border-color: #d1d5db;
  background: #f3f4f6;
}

.added-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: #9ca3af;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  white-space: nowrap;
}

.bulk-add-actions {
  display: flex;
  gap: 0.75rem;
}

.select-all-btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  font-size: 0.9rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
}

.select-all-btn:hover {
  border-color: #4CAF50;
  background: #e8f5e9;
  color: #4CAF50;
}

.add-selected-btn {
  flex: 2;
  padding: 0.875rem 1.25rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
}

.add-selected-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.add-selected-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 태블릿 */
@media (min-width: 481px) {
  .bulk-add-top-btn {
    padding: 1.125rem 2rem;
    font-size: 1.05rem;
  }

  .modal-content {
    max-width: 550px;
  }

  .bulk-add-modal {
    max-width: 700px;
  }

  .player-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  .app-content {
    padding: 2rem 1.5rem;
  }

  .app-header {
    margin-bottom: 2.5rem;
  }

  .logo-section {
    flex-direction: row;
    gap: 1.25rem;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }

  .logo-icon svg {
    width: 32px;
    height: 32px;
  }

  .app-title {
    font-size: 2.25rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .tabs-container {
    justify-content: center;
    gap: 0.75rem;
  }

  .tab-button {
    flex: 0 1 auto;
    flex-direction: row;
    padding: 1rem 1.5rem;
    font-size: 0.95rem;
    gap: 0.5rem;
  }

  .tab-label {
    font-size: 0.875rem;
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .app-content {
    padding: 3rem 1.5rem;
  }

  .app-header {
    margin-bottom: 3rem;
  }

  .logo-icon {
    width: 64px;
    height: 64px;
  }

  .logo-icon svg {
    width: 36px;
    height: 36px;
  }

  .app-title {
    font-size: 3rem;
  }

  .app-subtitle {
    font-size: 1.1rem;
  }

  .tabs-container {
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .tab-button {
    padding: 1rem 2rem;
    font-size: 1rem;
    gap: 0.75rem;
  }

  .tab-label {
    font-size: 1rem;
  }
}
</style>
