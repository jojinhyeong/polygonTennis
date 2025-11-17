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
        <h2 class="controls-title">팀 랜덤 복식 대진 생성</h2>
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
          <SelectInput
            v-model="selectedGroupId"
            :options="groups"
            placeholder="그룹 선택"
            :label-formatter="(group) => `${group.name} (${group.players.length}명)`"
          />
        </div>
        <button class="generate-random-btn" @click="generateRandomBracket" :disabled="!selectedGroupId">
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
          @champion-winner="handleChampionWinner"
        />
      </div>
      
      <!-- 팡파레 이펙트 -->
      <div v-if="showCelebration" class="celebration-overlay">
        <!-- 폭죽 이펙트 -->
        <div class="fireworks-container">
          <template v-for="i in 12" :key="`firework-${i}`">
            <div class="firework" :style="getFireworkStyle(i, 12)">
              <div v-for="j in 5" :key="`particle-${i}-${j}`" class="firework-particle" :style="getParticleStyle(i, j, 12)"></div>
            </div>
          </template>
        </div>
        <!-- 추가 폭죽 이펙트 (지연) -->
        <div class="fireworks-container fireworks-delayed">
          <template v-for="i in 8" :key="`firework-delayed-${i}`">
            <div class="firework firework-delayed" :style="getFireworkStyle(i, 8, 0.5)">
              <div v-for="j in 5" :key="`particle-delayed-${i}-${j}`" class="firework-particle" :style="getParticleStyle(i, j, 8, 0.5)"></div>
            </div>
          </template>
        </div>
        <!-- Confetti 이펙트 -->
        <div class="confetti-container">
          <div v-for="i in 80" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
        </div>
      </div>
      
      <!-- 우승자 모달 -->
      <div v-if="showWinnerModal" class="winner-modal-overlay" @click="closeWinnerModal">
        <div class="winner-modal" @click.stop>
          <div class="winner-modal-header">
            <div class="winner-crown-large">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"></path>
                <path d="M12 18v4"></path>
                <path d="M8 21h8"></path>
              </svg>
            </div>
            <h2 class="winner-title">우승자!</h2>
          </div>
          <div class="winner-content">
            <div class="winner-names">{{ championWinner }}</div>
          </div>
          <button class="winner-close-btn" @click="closeWinnerModal">확인</button>
        </div>
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
import SelectInput from './SelectInput.vue'

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
const showCelebration = ref(false)
const showWinnerModal = ref(false)
const championWinner = ref('')
const lastChampionWinner = ref('') // 마지막으로 표시한 우승자 추적

const getGroupName = (groupId) => {
  if (groupId === 'all') return '전체'
  const group = props.groups.find(g => g.id === groupId)
  return group ? group.name : `그룹 ${groupId}`
}

const handleChampionWinner = ({ winner, winnerTeam }) => {
  // 같은 우승자면 중복 표시하지 않음
  if (lastChampionWinner.value === winner && showWinnerModal.value) {
    return
  }
  
  championWinner.value = winner
  lastChampionWinner.value = winner
  
  // 기존 이펙트와 모달 닫기
  showCelebration.value = false
  showWinnerModal.value = false
  
  // 잠시 후 새로 표시
  setTimeout(() => {
    showCelebration.value = true
    showWinnerModal.value = true
    
    // 3초 후 팡파레 이펙트 제거
    setTimeout(() => {
      showCelebration.value = false
    }, 3000)
  }, 100)
}

const closeWinnerModal = () => {
  showWinnerModal.value = false
  showCelebration.value = false
  // 모달을 닫을 때는 lastChampionWinner를 초기화하지 않음 (같은 우승자 재표시 방지)
}

const getConfettiStyle = (index) => {
  const colors = ['#4CAF50', '#66BB6A', '#f44336', '#FF9800', '#2196F3', '#9C27B0', '#FFC107', '#00BCD4', '#E91E63']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const delay = Math.random() * 0.5
  const duration = 2 + Math.random() * 1
  const size = 8 + Math.random() * 8
  const shape = Math.random() > 0.5 ? 'square' : 'circle'
  const drift = (Math.random() - 0.5) * 200 // 좌우로 흩어지는 정도
  
  return {
    left: `${left}%`,
    backgroundColor: color,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: shape === 'circle' ? '50%' : '2px',
    '--drift': drift
  }
}

const getFireworkStyle = (index, total, baseDelay = 0) => {
  const colors = ['#4CAF50', '#f44336', '#FF9800', '#2196F3', '#9C27B0', '#FFC107', '#00BCD4', '#E91E63', '#FF5722', '#9E9E9E']
  const color = colors[index % colors.length]
  const angle = (360 / total) * index
  const delay = baseDelay + (index * 0.1)
  const radius = 250 + Math.random() * 100
  const angleRad = (angle * Math.PI) / 180
  const x = Math.cos(angleRad) * radius
  const y = Math.sin(angleRad) * radius
  
  return {
    '--color': color,
    '--x': `${x}px`,
    '--y': `${y}px`,
    animationDelay: `${delay}s`
  }
}

const getParticleStyle = (fireworkIndex, particleIndex, total, baseDelay = 0) => {
  const colors = ['#4CAF50', '#f44336', '#FF9800', '#2196F3', '#9C27B0', '#FFC107', '#00BCD4', '#E91E63', '#FF5722', '#9E9E9E']
  const color = colors[fireworkIndex % colors.length]
  const angle = (360 / total) * fireworkIndex
  const particleAngle = angle + (particleIndex - 2) * 25
  const particleAngleRad = (particleAngle * Math.PI) / 180
  const particleRadius = 180 + Math.random() * 100
  const x = Math.cos(particleAngleRad) * particleRadius
  const y = Math.sin(particleAngleRad) * particleRadius
  const delay = baseDelay + (fireworkIndex * 0.1) + 0.1
  
  return {
    '--color': color,
    '--px': `${x}px`,
    '--py': `${y}px`,
    animationDelay: `${delay}s`
  }
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
    alert(`${group.name}에는 최소 4명의 선수가 필요합니다.`)
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
  padding-bottom: 0.875rem;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
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
  font-size: 0.9rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.controls-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2E7D32;
  font-size: 0.8rem;
}

.control-label svg {
  color: #4CAF50;
}


.generate-random-btn {
  padding: 0.875rem 1.25rem;
  font-size: 0.85rem;
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
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.generate-random-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.generate-random-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  color: rgba(76, 175, 80, 0.3);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 0.85rem;
  color: #666;
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

/* 팡파레 이펙트 */
.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10000;
  overflow: hidden;
}

/* 폭죽 이펙트 */
.fireworks-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.firework {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color);
  box-shadow: 0 0 20px var(--color), 0 0 40px var(--color);
  animation: fireworkExplode 1.5s ease-out forwards;
}

@keyframes fireworkExplode {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
    box-shadow: 0 0 20px var(--color), 0 0 40px var(--color);
  }
  20% {
    transform: translate(0, 0) scale(2);
    opacity: 1;
    box-shadow: 0 0 30px var(--color), 0 0 60px var(--color), 0 0 90px var(--color);
  }
  100% {
    transform: translate(var(--x), var(--y)) scale(0);
    opacity: 0;
  }
}

.firework-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color);
  box-shadow: 0 0 15px var(--color), 0 0 30px var(--color);
  top: 50%;
  left: 50%;
  margin-top: -3px;
  margin-left: -3px;
  animation: particleExplode 1.5s ease-out forwards;
}

@keyframes particleExplode {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
    box-shadow: 0 0 15px var(--color), 0 0 30px var(--color);
  }
  30% {
    opacity: 1;
    box-shadow: 0 0 20px var(--color), 0 0 40px var(--color);
  }
  100% {
    transform: translate(var(--px), var(--py)) scale(0);
    opacity: 0;
  }
}

.firework-delayed {
  animation-delay: 0.5s;
}

.confetti-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.confetti {
  position: absolute;
  top: -10px;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(var(--drift, 0px)) rotate(720deg);
    opacity: 0;
  }
}

/* 우승자 모달 */
.winner-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
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

.winner-modal {
  background: white;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  max-width: 90%;
  width: 400px;
  text-align: center;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.winner-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A, #f44336, #FF9800, #2196F3, #9C27B0, #FFC107, #4CAF50);
  background-size: 200% 100%;
  animation: gradientShift 3s linear infinite;
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

.winner-modal-header {
  margin-bottom: 1.5rem;
}

.winner-crown-large {
  color: #FFD700;
  margin: 0 auto 1rem;
  animation: crownBounce 1s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 215, 0, 0.4));
}

@keyframes crownBounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.winner-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #f44336 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.winner-content {
  margin-bottom: 2rem;
}

.winner-names {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2E7D32;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  border-radius: 12px;
  border: 2px solid rgba(76, 175, 80, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.winner-close-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.winner-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.winner-close-btn:active {
  transform: translateY(0);
}
</style>
