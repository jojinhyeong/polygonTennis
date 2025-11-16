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
          <div class="select-wrapper">
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

    <!-- 선택된 팀 미리보기 (모달 밖으로 이동) -->
    <div v-if="selectedPlayers.length > 0 && !showTeamSelectModal" class="team-preview-outside">
      <div class="preview-header">
        <h4 class="preview-title">
          <span class="preview-icon">🏆</span>
          선택된 팀 ({{ Math.ceil(selectedPlayers.length / 2) }}팀)
        </h4>
      </div>
      <div class="teams-list-outside">
        <div
          v-for="(team, index) in previewTeams"
          :key="index"
          class="team-preview-item-outside"
        >
          <div class="team-number-badge">{{ index + 1 }}</div>
          <div class="team-players-info">
            <div class="team-player">{{ team.player1 }}</div>
            <div class="team-separator">/</div>
            <div class="team-player" :class="{ waiting: !team.player2 }">
              {{ team.player2 || '대기중...' }}
            </div>
          </div>
        </div>
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
          <div class="modal-header-content">
            <div class="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <h3>팀 구성하기</h3>
              <p class="modal-subtitle">{{ selectedGroupName }}</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeTeamSelectModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div ref="modalBodyRef" class="modal-body">
          <div class="modal-info-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>선수들을 선택한 순서대로 2명씩 팀이 구성됩니다</span>
          </div>

          <!-- 선수 목록 -->
          <div class="player-section">
            <div class="player-section-header">
              <h4 class="player-section-title">선수 선택</h4>
              <span class="player-count">{{ availablePlayers.length }}명</span>
            </div>
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
                <span class="player-name">{{ player }}</span>
                <span v-if="selectedPlayers.includes(player)" class="selection-order">
                  {{ getSelectionOrder(player) }}
                </span>
              </button>
            </div>
          </div>

          <div class="team-select-actions">
            <button class="clear-btn" @click="clearSelection" :disabled="selectedPlayers.length === 0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>전체 해제</span>
            </button>
            <button 
              class="generate-bracket-btn" 
              @click="generateBracketFromSelected" 
              :disabled="selectedPlayers.length < 4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>대진표 생성 ({{ Math.ceil(selectedPlayers.length / 2) }}팀)</span>
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
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bracket-controls {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 24px;
  padding: 1.25rem 1rem;
  margin-bottom: 1rem;
  box-shadow: 
    0 8px 32px rgba(76, 175, 80, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(76, 175, 80, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.bracket-controls::before {
  display: none;
}

@keyframes shimmer {
  0%, 100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 0%;
  }
}

.controls-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.1);
}

.header-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 
    0 8px 24px rgba(76, 175, 80, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.header-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.controls-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2E7D32;
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  letter-spacing: -0.02em;
}

.controls-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  width: 100%;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-weight: 700;
  color: #1f2937;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  margin-bottom: 0.75rem;
}

.control-label svg {
  color: #4CAF50;
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3));
}

.select-wrapper {
  position: relative;
  width: 100%;
  z-index: 10;
}

.select-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 14px;
  font-size: 0.95rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-weight: 500;
  color: #1f2937;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='8' viewBox='0 0 14 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L7 7L13 1' stroke='%23a78bfa' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.25rem center;
  padding-right: 3.5rem;
  box-shadow: 
    0 2px 8px rgba(76, 175, 80, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
}

.select-input option {
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  color: #1f2937;
  font-weight: 500;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 0.95rem;
  border: none;
  border-radius: 0;
  transition: all 0.2s ease;
}

.select-input option:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  color: #1f2937;
}

.select-input option:checked,
.select-input option:focus {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  font-weight: 600;
}

.select-input:focus {
  z-index: 100;
  border-color: #4CAF50;
}

.select-input:hover {
  border-color: rgba(76, 175, 80, 0.4);
  box-shadow: 
    0 4px 12px rgba(76, 175, 80, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.select-input:focus {
  border-color: #4CAF50;
  box-shadow: 
    0 0 0 4px rgba(76, 175, 80, 0.2),
    0 4px 16px rgba(76, 175, 80, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.generate-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 
    0 8px 24px rgba(76, 175, 80, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.generate-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.generate-btn:hover::before {
  left: 100%;
}

.generate-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 32px rgba(76, 175, 80, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.generate-btn:active {
  transform: translateY(-1px);
  box-shadow: 
    0 6px 20px rgba(76, 175, 80, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.generate-btn svg {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.brackets-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 
    0 20px 60px rgba(76, 175, 80, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(76, 175, 80, 0.1);
  border: 2px solid rgba(76, 175, 80, 0.25);
  backdrop-filter: blur(30px);
  overflow: visible;
  position: relative;
  animation: containerSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.brackets-container::before {
  display: none;
}

.brackets-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(76, 175, 80, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(102, 187, 106, 0.06) 0%, transparent 50%);
  border-radius: 20px;
  pointer-events: none;
  z-index: 0;
}

@keyframes containerSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmerTop {
  0%, 100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 0%;
  }
}

.group-tabs {
  display: flex;
  gap: 0.625rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.2);
  position: relative;
  z-index: 1;
}

.group-tabs::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(76, 175, 80, 0.3) 50%, transparent 100%);
}

.group-tab {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%);
  border: 2px solid rgba(76, 175, 80, 0.25);
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 2px 8px rgba(76, 175, 80, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  letter-spacing: -0.01em;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
}

.group-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.1), transparent);
  transition: left 0.5s ease;
}

.group-tab:hover::before {
  left: 100%;
}

.group-tab:hover {
  border-color: rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  transform: translateY(-1px);
  box-shadow: 
    0 4px 16px rgba(76, 175, 80, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  color: #1f2937;
}

.group-tab.active {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-color: transparent;
  color: white;
  box-shadow: 
    0 6px 20px rgba(76, 175, 80, 0.4),
    0 2px 8px rgba(102, 187, 106, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  font-weight: 800;
  position: relative;
}

.group-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

.bracket-container-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  padding: 0.75rem 0.5rem;
  margin: 0 -0.5rem;
  position: relative;
  z-index: 1;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(248, 250, 252, 0.5) 100%);
}

.empty-state {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 24px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 
    0 8px 32px rgba(76, 175, 80, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(76, 175, 80, 0.2);
  backdrop-filter: blur(20px);
  animation: fadeInUp 0.6s ease-out;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(102, 187, 106, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
  box-shadow: 
    0 8px 24px rgba(76, 175, 80, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  letter-spacing: -0.02em;
}

.empty-state p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
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
    padding: 1.75rem;
    border-radius: 18px;
  }

  .brackets-container::before {
    border-radius: 18px 18px 0 0;
  }

  .brackets-container::after {
    border-radius: 18px;
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .bracket-controls {
    padding: 2rem;
    border-radius: 24px;
  }

  .brackets-container {
    padding: 2rem 2.5rem;
    border-radius: 24px;
  }

  .brackets-container::before {
    border-radius: 24px 24px 0 0;
  }

  .brackets-container::after {
    border-radius: 24px;
  }

  .group-tabs {
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .group-tab {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
  }
}

/* 팀 선택 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
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

.modal-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 28px;
  width: 100%;
  max-width: 680px;
  max-height: calc(100vh - 2rem);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 24px 80px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(76, 175, 80, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(76, 175, 80, 0.2);
  backdrop-filter: blur(20px);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;
  margin: auto;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.96);
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
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  border-bottom: 2px solid rgba(76, 175, 80, 0.15);
  flex-shrink: 0;
  position: relative;
}

.modal-header::before {
  display: none;
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #2E7D32;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  letter-spacing: -0.02em;
}

.modal-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.modal-close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #6b7280;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.modal-close-btn:hover {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}


.modal-info-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(102, 187, 106, 0.08) 100%);
  border-radius: 14px;
  border: 1px solid rgba(76, 175, 80, 0.2);
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #4b5563;
  font-weight: 500;
  flex-shrink: 0;
}

.modal-info-card svg {
  color: #4CAF50;
  flex-shrink: 0;
}

/* 모달 밖 팀 미리보기 */
.team-preview-outside {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 20px;
  border: 2px solid rgba(76, 175, 80, 0.2);
  box-shadow: 
    0 8px 32px rgba(76, 175, 80, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.teams-list-outside {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.teams-list-outside::-webkit-scrollbar {
  width: 6px;
}

.teams-list-outside::-webkit-scrollbar-track {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 3px;
}

.teams-list-outside::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 3px;
}

.team-preview-item-outside {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(102, 187, 106, 0.05) 100%);
  border-radius: 14px;
  border: 2px solid rgba(76, 175, 80, 0.15);
  transition: all 0.3s ease;
}

.team-preview-item-outside:hover {
  border-color: rgba(76, 175, 80, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.preview-header {
  margin-bottom: 1rem;
}

.preview-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #1f2937;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-icon {
  font-size: 1.25rem;
}

.teams-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.team-preview-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(102, 187, 106, 0.05) 100%);
  border-radius: 14px;
  border: 2px solid rgba(76, 175, 80, 0.15);
  transition: all 0.3s ease;
}

.team-preview-item:hover {
  border-color: rgba(76, 175, 80, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.team-number-badge {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  flex-shrink: 0;
}

.team-players-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

.team-player {
  flex: 1;
}

.team-player.waiting {
  color: #9ca3af;
  font-style: italic;
}

.team-separator {
  color: #4CAF50;
  font-weight: 700;
}

.player-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.player-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.player-section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1f2937;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  margin: 0;
}

.player-count {
  font-size: 0.95rem;
  font-weight: 600;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
}

.player-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.8) 100%);
  border-radius: 16px;
  border: 2px solid rgba(76, 175, 80, 0.15);
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  max-height: 100%;
}

.player-list-grid::-webkit-scrollbar {
  width: 8px;
}

.player-list-grid::-webkit-scrollbar-track {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
}

.player-list-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 4px;
}

.player-list-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #8b5cf6 0%, #10b981 100%);
}

.player-chip {
  padding: 0.875rem 1rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
  color: #374151;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: visible;
  word-break: keep-all;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.player-chip:hover {
  border-color: rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.2);
}

.player-chip.selected {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-color: transparent;
  box-shadow: 
    0 8px 24px rgba(76, 175, 80, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  font-weight: 700;
  transform: translateY(-2px);
}

.player-name {
  flex: 1;
}

.selection-order {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 
    0 4px 12px rgba(251, 191, 36, 0.4),
    0 0 0 3px white;
  z-index: 10;
  flex-shrink: 0;
  line-height: 1;
  min-width: 26px;
  animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes popIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.team-select-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-shrink: 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(76, 175, 80, 0.1);
}

.clear-btn {
  flex: 1;
  padding: 0.875rem 0.875rem;
  font-size: 0.8rem;
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
  color: #ef4444;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.clear-btn:hover:not(:disabled) {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.9) 100%);
  color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.2);
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.generate-bracket-btn {
  flex: 2;
  padding: 0.875rem 0.875rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  font-weight: 800;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  box-shadow: 
    0 8px 24px rgba(76, 175, 80, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  letter-spacing: 0.01em;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

.generate-bracket-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.generate-bracket-btn:hover::before {
  left: 100%;
}

.generate-bracket-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 32px rgba(76, 175, 80, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.generate-bracket-btn:active:not(:disabled) {
  transform: translateY(-1px);
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
  .modal-overlay {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 1rem;
  }

  .modal-content {
    max-height: calc(100vh - 2rem);
    min-height: 300px;
    width: calc(100% - 1rem);
    margin: 0 auto;
  }

  .modal-header {
    padding: 0.875rem 1.25rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .player-list-grid {
    padding: 0.5rem;
    gap: 0.5rem;
    max-height: 100%;
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
