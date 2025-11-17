<template>
  <div class="random-bracket-tab">
    <div class="random-controls">
      <div class="controls-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </div>
        <h2 class="controls-title">랜덤 복식 대진 생성</h2>
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
        <button class="generate-random-btn" @click="generateRandomBracket">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>랜덤 대진 생성</span>
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
      
      <div v-if="selectedViewGroupId && bracketsByGroup.has(selectedViewGroupId)" class="bracket-container">
        <BracketDisplay 
          :bracket="bracketsByGroup.get(selectedViewGroupId)" 
          :bracket-type="'double'" 
        />
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      </div>
      <h3>랜덤 대진표를 생성해주세요</h3>
      <p>그룹을 선택하고 랜덤 복식 대진표를 생성하세요</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import BracketDisplay from './BracketDisplay.vue'

const props = defineProps({
  groups: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['generate-random'])

const selectedGroupId = ref('')
const bracketsByGroup = ref(new Map())
const selectedViewGroupId = ref(null)

const getGroupName = (groupId) => {
  if (groupId === 'all') return '전체'
  const group = props.groups.find(g => g.id === groupId)
  return group ? group.name : `그룹 ${groupId}`
}

const generateRandomBracket = () => {
  // 전체 그룹 선택 시 생성하지 않음
  if (selectedGroupId.value === '') {
    alert('개별 그룹을 선택해주세요.')
    return
  }

  // 선택된 그룹 찾기
  const group = props.groups.find(g => g.id === selectedGroupId.value)
  if (!group) {
    alert('그룹을 선택해주세요.')
    return
  }

  let players = group.players
    .filter(p => p.name && p.name.trim())
    .map(p => ({
      name: p.name,
      groupId: group.id,
      groupName: group.name
    }))

  if (players.length < 4) {
    alert(`${group.name}에는 최소 4명의 선수가 필요합니다. (복식은 2명씩 팀)`)
    return
  }

  if (players.length % 2 !== 0) {
    alert('홀수명은 선택할 수 없습니다. 2명씩 팀을 구성해야 합니다.')
    return
  }

  const teamCount = Math.floor(players.length / 2)
  // 팀 수가 2의 거듭제곱인지 확인 (토너먼트)
  const isValidTeamCount = (count) => {
    return count > 0 && (count & (count - 1)) === 0
  }

  if (!isValidTeamCount(teamCount)) {
    // 가장 가까운 2의 거듭제곱 찾기
    let nextPowerOfTwo = 2
    while (nextPowerOfTwo < teamCount) {
      nextPowerOfTwo *= 2
    }
    const prevPowerOfTwo = nextPowerOfTwo / 2
    const neededPlayersForNext = nextPowerOfTwo * 2
    const neededPlayersForPrev = prevPowerOfTwo * 2
    const diffForNext = neededPlayersForNext - players.length
    const diffForPrev = players.length - neededPlayersForPrev
    
    let message = `토너먼트를 위해 팀 수는 2, 4, 8, 16... 이어야 합니다.\n\n현재: ${teamCount}팀 (${players.length}명)\n\n`
    
    if (diffForNext <= diffForPrev) {
      message += `추천: ${nextPowerOfTwo}팀 (${neededPlayersForNext}명) - ${diffForNext}명 더 필요`
    } else {
      message += `추천: ${prevPowerOfTwo}팀 (${neededPlayersForPrev}명) - ${diffForPrev}명 제거 필요`
    }
    
    alert(message)
    return
  }

  // 선수 순서를 랜덤하게 섞기
  players = shuffleArray([...players])

  // 기존 대진표를 유지하고 새 그룹만 추가
  const bracket = createDoubleBracket(players)
  bracketsByGroup.value.set(group.id, bracket)
  
  // 새로 생성한 그룹을 선택
  selectedViewGroupId.value = group.id

  emit('generate-random', Array.from(bracketsByGroup.value.values()))
}

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const createDoubleBracket = (players) => {
  // 복식: 2명씩 팀 구성
  const teams = []
  for (let i = 0; i < players.length; i += 2) {
    teams.push({
      id: teams.length + 1,
      player1: players[i],
      player2: players[i + 1],
      teamName: `${players[i].name} / ${players[i + 1].name}`,
      groupName: players[i].groupName
    })
  }

  // 팀 수에 따라 라운드 생성 (마지막 라운드는 결승)
  const rounds = []
  let currentRoundTeams = [...teams]
  let roundNumber = 0

  // 첫 라운드: 모든 팀을 매칭
  const firstRound = []
  for (let i = 0; i < currentRoundTeams.length; i += 2) {
    firstRound.push({
      id: firstRound.length + 1,
      team1: currentRoundTeams[i],
      team2: currentRoundTeams[i + 1],
      score1: null,
      score2: null,
      winner: null,
      round: roundNumber
    })
  }
  rounds.push([...firstRound])
  roundNumber++

  // 다음 라운드들 생성 (스코어 입력 후 승자가 올라올 자리)
  let remainingMatches = firstRound.length
  
  while (remainingMatches > 1) {
    const nextRound = []
    const matchesInRound = remainingMatches / 2
    
    for (let i = 0; i < matchesInRound; i++) {
      nextRound.push({
        id: nextRound.length + 1,
        team1: null, // 스코어 입력 후 자동 할당됨
        team2: null, // 스코어 입력 후 자동 할당됨
        score1: null,
        score2: null,
        winner: null,
        round: roundNumber
      })
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
  firstRound.forEach((match, index) => {
    if (match.winner && !match.team2) {
      advanceByeToNextRound(match, match.team1, 0)
    }
  })

  // 정순으로 반환 (1라운드 → 결승)
  return rounds
}
</script>

<style scoped>
.random-bracket-tab {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.random-controls {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.25rem 1rem;
  margin-bottom: 1rem;
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
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
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
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.control-label svg {
  color: #4CAF50;
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
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23f5576c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 3rem;
}

.select-input:hover {
  border-color: #d1d5db;
}

.select-input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
}

.generate-random-btn {
  padding: 0.875rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
}

.generate-random-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.generate-random-btn:active {
  transform: translateY(0);
}

.brackets-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.25rem 1rem;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.group-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.75rem;
}

.group-tab {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
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
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.bracket-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.empty-state {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.empty-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.25rem;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(102, 187, 106, 0.15) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
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
  font-size: 0.875rem;
  margin: 0;
}

/* 태블릿 */
@media (min-width: 481px) {
  .random-controls {
    padding: 1.75rem;
    border-radius: 22px;
  }

  .brackets-container {
    padding: 2rem;
    border-radius: 22px;
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .random-controls {
    padding: 2rem;
    border-radius: 24px;
  }

  .brackets-container {
    padding: 2rem;
    border-radius: 24px;
  }
}
</style>
