<template>
  <div class="bracket-tab">
    <div class="bracket-controls">
      <div class="controls-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <h2 class="controls-title">고정팀</h2>
      </div>
      <div class="controls-body">
        <div class="control-group">
          <label class="control-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            그룹 선택
          </label>
          <select v-model="selectedGroupId" class="select-input">
            <option value="">그룹 선택</option>
            <option
              v-for="group in groups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }} ({{ group.players.length }}명)
            </option>
          </select>
        </div>
        <button class="generate-btn" @click="openTeamSelectModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>팀 선택</span>
        </button>
      </div>
    </div>

    <div v-if="bracketsByGroup.size > 0" class="brackets-container">
      <div class="group-tabs">
        <button
          v-for="[groupId, bracket] in Array.from(bracketsByGroup.entries()).filter(([id]) => id !== 'all')"
          :key="groupId"
          :class="['group-tab', { active: selectedViewGroupId === groupId }]"
          @click="selectedViewGroupId = groupId"
        >
          {{ getGroupName(groupId) }}
        </button>
      </div>
      
      <div v-if="selectedViewGroupId && bracketsByGroup.has(selectedViewGroupId)" class="bracket-container-wrapper">
        <BracketDisplay 
          :bracket="bracketsByGroup.get(selectedViewGroupId)" 
          :bracket-type="'double'" 
        />
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      </div>
      <h3>대진표를 생성해주세요</h3>
      <p>그룹을 선택하고 팀을 선택하여 대진표를 생성하세요</p>
    </div>

    <!-- 팀 선택 모달 -->
    <div v-if="showTeamSelectModal" class="modal-overlay" @click.self="closeTeamSelectModal">
      <div class="modal-content team-select-modal">
        <div class="modal-header">
          <h3>팀 선택 - {{ selectedGroupName }}</h3>
          <button class="modal-close-btn" @click="closeTeamSelectModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div ref="modalBodyRef" class="modal-body">
          <p class="modal-hint">선수들을 선택한 순서대로 2명씩 팀이 구성됩니다</p>
          
          <!-- 선택된 팀 미리보기 -->
          <div v-if="selectedPlayers.length > 0" class="team-preview">
            <h4 class="preview-title">선택된 팀 ({{ Math.ceil(selectedPlayers.length / 2) }}팀)</h4>
            <div class="teams-list">
              <div
                v-for="(team, index) in previewTeams"
                :key="index"
                class="team-preview-item"
              >
                <span class="team-number">{{ index + 1 }}팀</span>
                <span class="team-players">
                  {{ team.player1 }} / {{ team.player2 || '대기중...' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 선수 목록 -->
          <div ref="playerListRef" class="player-list-grid">
            <button
              v-for="player in availablePlayers"
              :key="player"
              :ref="el => { 
                if (el && selectedPlayers.includes(player) && playerButtonRefs.value) {
                  playerButtonRefs.value[player] = el 
                } else if (!el && playerButtonRefs.value && playerButtonRefs.value[player]) {
                  delete playerButtonRefs.value[player]
                }
              }"
              :class="['player-chip', {
                selected: selectedPlayers.includes(player)
              }]"
              @click="togglePlayer(player)"
            >
              {{ player }}
              <span v-if="selectedPlayers.includes(player)" class="selection-order">
                {{ getSelectionOrder(player) || '' }}
              </span>
            </button>
          </div>

          <div class="team-select-actions">
            <button class="clear-btn" @click="clearSelection" :disabled="selectedPlayers.length === 0">
              전체 해제
            </button>
            <button 
              class="generate-bracket-btn" 
              @click="generateBracketFromSelected" 
              :disabled="selectedPlayers.length < 4"
            >
              대진표 생성 ({{ Math.ceil(selectedPlayers.length / 2) }}팀)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits, nextTick } from 'vue'
import BracketDisplay from './BracketDisplay.vue'

const props = defineProps({
  groups: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update-bracket'])

const selectedGroupId = ref('')
const bracketsByGroup = ref(new Map())
const selectedViewGroupId = ref(null)
const showTeamSelectModal = ref(false)
const selectedPlayers = ref([])
const playerListRef = ref(null)
const playerButtonRefs = ref({})
const modalBodyRef = ref(null)

const getGroupName = (groupId) => {
  if (groupId === 'all') return '전체'
  const group = props.groups.find(g => g.id === groupId)
  return group ? group.name : `그룹 ${groupId}`
}

const selectedGroupName = computed(() => {
  const group = props.groups.find(g => g.id === selectedGroupId.value)
  return group ? group.name : ''
})

const availablePlayers = computed(() => {
  const group = props.groups.find(g => g.id === selectedGroupId.value)
  if (!group) return []
  
  const allPlayers = group.players
    .filter(p => p.name && p.name.trim())
    .map(p => p.name)
  
  // 선택된 선수들을 선택한 순서대로 맨 앞에 배치
  const selected = selectedPlayers.value.filter(name => allPlayers.includes(name))
  const unselected = allPlayers.filter(name => !selectedPlayers.value.includes(name))
  
  // selectedPlayers.value의 순서를 유지하면서 배치
  return [...selected, ...unselected]
})

const previewTeams = computed(() => {
  const teams = []
  for (let i = 0; i < selectedPlayers.value.length; i += 2) {
    teams.push({
      player1: selectedPlayers.value[i],
      player2: selectedPlayers.value[i + 1] || null
    })
  }
  return teams
})

const openTeamSelectModal = () => {
  if (selectedGroupId.value === '') {
    alert('그룹을 선택해주세요.')
    return
  }

  const group = props.groups.find(g => g.id === selectedGroupId.value)
  if (!group) {
    alert('그룹을 선택해주세요.')
    return
  }

  if (group.players.filter(p => p.name && p.name.trim()).length < 4) {
    alert(`${group.name}에는 최소 4명의 선수가 필요합니다.`)
    return
  }

  showTeamSelectModal.value = true
  selectedPlayers.value = []
  
  // 모달이 열릴 때 스크롤을 맨 위로 초기화
  setTimeout(() => {
    if (modalBodyRef.value) {
      modalBodyRef.value.scrollTop = 0
    }
  }, 100)
}

const closeTeamSelectModal = () => {
  showTeamSelectModal.value = false
  selectedPlayers.value = []
  // refs 초기화
  playerButtonRefs.value = {}
}

const togglePlayer = (playerName) => {
  const index = selectedPlayers.value.indexOf(playerName)
  if (index > -1) {
    selectedPlayers.value.splice(index, 1)
  } else {
    selectedPlayers.value.push(playerName)
    // 선택된 선수들이 맨 위에 있으므로 모달 스크롤을 맨 위로
    setTimeout(() => {
      if (modalBodyRef.value) {
        modalBodyRef.value.scrollTop = 0
      }
    }, 50)
  }
}

const getSelectionOrder = (playerName) => {
  const index = selectedPlayers.value.indexOf(playerName)
  if (index === -1) return null
  // 선택 순서는 1부터 시작
  return index + 1
}

// 선택된 선수가 변경될 때마다 스크롤을 맨 위로
watch(selectedPlayers, () => {
  nextTick(() => {
    if (modalBodyRef.value && selectedPlayers.value.length > 0) {
      modalBodyRef.value.scrollTop = 0
    }
  })
}, { deep: true })

const clearSelection = () => {
  selectedPlayers.value = []
}

const generateBracketFromSelected = () => {
  if (selectedPlayers.value.length < 4) {
    alert('최소 4명의 선수를 선택해주세요. (2팀 필요)')
    return
  }

  const group = props.groups.find(g => g.id === selectedGroupId.value)
  if (!group) return

  // 선택한 순서대로 선수 배열 생성
  const players = selectedPlayers.value.map(name => ({
    name,
    groupId: group.id,
    groupName: group.name
  }))

  // 기존 대진표를 유지하고 새 그룹만 추가
  const bracket = createDoubleBracket(players)
  bracketsByGroup.value.set(group.id, bracket)
  
  // 새로 생성한 그룹을 선택
  selectedViewGroupId.value = group.id

  // 모달 닫기
  closeTeamSelectModal()

  emit('update-bracket', Array.from(bracketsByGroup.value.values()))
}


const createDoubleBracket = (players) => {
  // 복식: 2명씩 팀 구성
  const teams = []
  for (let i = 0; i < players.length; i += 2) {
    if (i + 1 < players.length) {
      teams.push({
        id: teams.length + 1,
        player1: players[i],
        player2: players[i + 1],
        teamName: `${players[i].name} / ${players[i + 1].name}`,
        groupName: players[i].groupName
      })
    } else {
      // 홀수명일 경우 부전승 처리
      teams.push({
        id: teams.length + 1,
        player1: players[i],
        player2: null,
        teamName: players[i].name,
        groupName: players[i].groupName
      })
    }
  }

  // 1라운드부터 결승까지 순서대로 생성
  const rounds = []
  let currentRoundTeams = [...teams]
  let roundNumber = 0

  // 첫 라운드: 모든 팀을 매칭
  const firstRound = []
  for (let i = 0; i < currentRoundTeams.length; i += 2) {
    if (i + 1 < currentRoundTeams.length) {
      firstRound.push({
        id: firstRound.length + 1,
        team1: currentRoundTeams[i],
        team2: currentRoundTeams[i + 1],
        score1: null,
        score2: null,
        winner: null,
        round: roundNumber
      })
    } else {
      // 홀수 팀일 경우 부전승
      firstRound.push({
        id: firstRound.length + 1,
        team1: currentRoundTeams[i],
        team2: null,
        score1: null,
        score2: null,
        winner: currentRoundTeams[i].teamName,
        round: roundNumber
      })
    }
  }
  rounds.push([...firstRound])
  roundNumber++

  // 다음 라운드들 생성 (스코어 입력 후 승자가 올라올 자리)
  let remainingMatches = firstRound.length
  
  while (remainingMatches > 1) {
    const nextRound = []
    const matchesInRound = Math.ceil(remainingMatches / 2)
    
    for (let i = 0; i < matchesInRound; i++) {
      if (i + 1 < matchesInRound || remainingMatches % 2 === 0) {
        // 일반 매치 (두 팀 모두 있음)
        nextRound.push({
          id: nextRound.length + 1,
          team1: null, // 스코어 입력 후 자동 할당됨
          team2: null, // 스코어 입력 후 자동 할당됨
          score1: null,
          score2: null,
          winner: null,
          round: roundNumber
        })
      } else {
        // 홀수일 경우 부전승 매치
        nextRound.push({
          id: nextRound.length + 1,
          team1: null,
          team2: null,
          score1: null,
          score2: null,
          winner: null,
          round: roundNumber
        })
      }
    }
    
    rounds.push([...nextRound])
    remainingMatches = matchesInRound
    roundNumber++
  }

  // 부전승 처리 함수
  const advanceByeToNextRound = (byeMatch, winnerTeam, currentRoundNum) => {
    if (currentRoundNum >= rounds.length - 1) return
    
    const nextRound = rounds[currentRoundNum + 1]
    if (!nextRound || nextRound.length === 0) return
    
    const matchIndex = rounds[currentRoundNum].findIndex(m => m === byeMatch)
    if (matchIndex === -1) return
    
    const nextMatchIndex = Math.floor(matchIndex / 2)
    const nextMatch = nextRound[nextMatchIndex]
    
    if (nextMatch) {
      if (matchIndex % 2 === 0) {
        nextMatch.team1 = winnerTeam
      } else {
        nextMatch.team2 = winnerTeam
      }
    }
  }

  // 부전승 자동 처리
  firstRound.forEach((match) => {
    if (match.winner && !match.team2) {
      advanceByeToNextRound(match, match.team1, 0)
    }
  })

  // 정순으로 반환 (1라운드 → 결승)
  return rounds
}
</script>

<style scoped>
.bracket-tab {
  width: 100%;
}

.bracket-controls {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.controls-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.controls-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.control-group {
  width: 100%;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.control-label svg {
  color: #a78bfa;
}

.select-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23667eea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 3rem;
}

.select-input:hover {
  border-color: #d1d5db;
}

.select-input:focus {
  border-color: #a78bfa;
  box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.2);
}

.generate-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(167, 139, 250, 0.4);
}

.generate-btn:active {
  transform: translateY(0);
}

.brackets-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  overflow: visible;
}

.group-tabs {
  display: flex;
  gap: 0.625rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.625rem;
}

.group-tab {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.group-tab:hover {
  background: #e5e7eb;
  color: #374151;
}

.group-tab.active {
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
}

.bracket-container-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  padding: 0.5rem;
  margin: 0 -0.5rem;
}

.empty-state {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a78bfa;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.empty-state p {
  color: #6b7280;
  font-size: 0.8rem;
  margin: 0;
}

/* 태블릿 */
@media (min-width: 481px) {
  .bracket-controls {
    padding: 1.75rem;
    border-radius: 22px;
  }

  .controls-body {
    flex-direction: row;
    align-items: flex-end;
    gap: 1.5rem;
  }

  .control-group {
    flex: 1;
    min-width: 200px;
  }

  .generate-btn {
    width: auto;
    padding: 0.875rem 2rem;
  }

  .brackets-container {
    padding: 2rem;
    border-radius: 22px;
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .bracket-controls {
    padding: 2rem;
    border-radius: 24px;
  }

  .brackets-container {
    padding: 2rem;
    border-radius: 24px;
  }
}

/* 팀 선택 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 0.5rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 1rem);
  margin: 0.5rem auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #f3f4f6;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #6b7280;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.modal-close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 1rem 1.25rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  flex: 1;
  min-height: 0;
}

.modal-hint {
  margin: 0 0 1rem 0;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.team-preview {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.preview-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.teams-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-preview-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.team-number {
  font-weight: 700;
  color: #a78bfa;
  font-size: 0.75rem;
  min-width: 40px;
}

.team-players {
  flex: 1;
  font-weight: 600;
  color: #374151;
  font-size: 0.8rem;
}

.player-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.625rem;
  max-height: 50vh;
  overflow-y: auto;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.25rem;
  -webkit-overflow-scrolling: touch;
}

.player-chip {
  padding: 0.625rem 0.75rem;
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
  overflow: visible;
  word-break: keep-all;
}

.player-chip:hover {
  border-color: #a78bfa;
  background: #f5f3ff;
  transform: translateY(-2px);
}

.player-chip.selected {
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  color: white;
  border-color: #a78bfa;
  box-shadow: 0 2px 8px rgba(167, 139, 250, 0.3);
  font-weight: 600;
}

.selection-order {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
  border: 2px solid white;
  z-index: 10;
  flex-shrink: 0;
  line-height: 1;
  min-width: 22px;
}

.team-select-actions {
  display: flex;
  gap: 0.75rem;
}

.clear-btn {
  flex: 1;
  padding: 0.625rem 1rem;
  font-size: 0.8rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 40px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.clear-btn:hover:not(:disabled) {
  border-color: #ef4444;
  background: #fef2f2;
  color: #ef4444;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.generate-bracket-btn {
  flex: 2;
  padding: 0.625rem 1rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 40px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
}

.generate-bracket-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(167, 139, 250, 0.4);
}

.generate-bracket-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (min-width: 481px) {
  .modal-content {
    max-width: 700px;
    border-radius: 24px;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .player-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 480px) {
  .modal-header h3 {
    font-size: 1.1rem;
  }

  .player-list-grid {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .player-chip {
    padding: 0.5rem 0.625rem;
    font-size: 0.8rem;
  }

  .team-preview {
    padding: 1rem;
  }

  .team-preview-item {
    padding: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .team-number {
    min-width: auto;
  }
}
</style>
