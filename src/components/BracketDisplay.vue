<template>
  <div class="bracket-display">
    <div
      v-for="(round, roundIndex) in bracket"
      :key="roundIndex"
      class="round"
      :style="{ '--round-index': roundIndex }"
    >
      <div class="round-header">
        <div class="round-badge">
          <div class="round-badge-icon">
            <svg v-if="roundIndex === bracket.length - 1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <span class="round-badge-text">{{ getRoundName(roundIndex, bracket.length) }}</span>
        </div>
        <div class="round-line"></div>
      </div>
      <div class="matches">
        <div
          v-for="(match, matchIndex) in round"
          :key="matchIndex"
          class="match-card"
          :class="{ 'has-winner': match.winner }"
        >
          <div class="match-header">
            <span class="match-number">매치 {{ matchIndex + 1 }}</span>
          </div>
          <div class="match-body">
            <div
              class="team-card"
              :class="{ 
                winner: match.winner && getTeamName(match.team1) === match.winner,
                empty: !match.team1
              }"
            >
              <div class="team-card-content">
                <div class="team-info">
                  <div v-if="match.team1" class="team-name-wrapper">
                    <span class="team-name">{{ getTeamName(match.team1) }}</span>
                  </div>
                  <span v-else class="empty-label">미정</span>
                </div>
                <div v-if="match.winner && getTeamName(match.team1) === match.winner" class="winner-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <input
                v-if="match.team1 && match.team2"
                v-model.number="match.score1"
                type="number"
                class="score-input"
                placeholder="0"
                min="0"
                @input="updateScore(match)"
                @change="updateScore(match)"
              />
            </div>

            <div
              class="team-card"
              :class="{ 
                winner: match.winner && getTeamName(match.team2) === match.winner,
                empty: !match.team2
              }"
            >
              <div class="team-card-content">
                <div class="team-info">
                  <div v-if="match.team2" class="team-name-wrapper">
                    <span class="team-name">{{ getTeamName(match.team2) }}</span>
                  </div>
                  <span v-else class="empty-label">미정</span>
                </div>
                <div v-if="match.winner && getTeamName(match.team2) === match.winner" class="winner-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <input
                v-if="match.team1 && match.team2"
                v-model.number="match.score2"
                type="number"
                class="score-input"
                placeholder="0"
                min="0"
                @input="updateScore(match)"
                @change="updateScore(match)"
              />
            </div>
          </div>
          <div v-if="match.winner" class="match-winner">
            <div class="winner-crown">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
              </svg>
            </div>
            <span class="winner-name">{{ match.winner }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const emit = defineEmits(['champion-winner'])

const props = defineProps({
  bracket: {
    type: Array,
    required: true
  },
  bracketType: {
    type: String,
    default: 'double'
  }
})

const getTeamName = (team) => {
  if (!team) return null
  if (typeof team === 'string') return team
  if (team.teamName) return team.teamName
  if (team.player1 && team.player2) {
    return `${team.player1.name || team.player1} / ${team.player2.name || team.player2}`
  }
  if (team.player1) {
    return team.player1.name || team.player1
  }
  if (team.name) return team.name
  return 'Unknown'
}

const getRoundName = (roundIndex, totalRounds) => {
  // 마지막 라운드는 항상 결승
  if (roundIndex === totalRounds - 1) return '결승'
  
  // 마지막에서 두 번째는 준결승
  if (roundIndex === totalRounds - 2) return '준결승'
  
  // 나머지는 해당 라운드의 팀 수에 따라 이름 생성
  // roundIndex가 0일 때 첫 라운드, 그때의 팀 수 = 2^(totalRounds - roundIndex)
  const teamsInRound = Math.pow(2, totalRounds - roundIndex)
  
  // 32강, 16강, 8강 등으로 표시
  if (teamsInRound >= 32) {
    return `${teamsInRound}강`
  } else if (teamsInRound >= 16) {
    return `${teamsInRound}강`
  } else if (teamsInRound >= 8) {
    return `${teamsInRound}강`
  } else if (teamsInRound >= 4) {
    return `${teamsInRound}강`
  }
  
  // 그 외는 라운드 번호로 표시
  return `${roundIndex + 1}라운드`
}

const updateScore = (match) => {
  if (!match.team1 || !match.team2) return
  
  const score1 = match.score1
  const score2 = match.score2
  const currentRoundIndex = match.round
  const isFinalRound = currentRoundIndex === props.bracket.length - 1
  const previousWinner = match.winner

  // 둘 다 숫자로 입력되어야 승자 결정
  if (score1 !== null && score1 !== undefined && score2 !== null && score2 !== undefined) {
    let winner = null
    let winnerTeam = null
    
    if (score1 > score2) {
      winner = getTeamName(match.team1)
      winnerTeam = match.team1
      match.winner = winner
      if (!isFinalRound) {
        advanceToNextRound(match, winnerTeam)
      }
    } else if (score2 > score1) {
      winner = getTeamName(match.team2)
      winnerTeam = match.team2
      match.winner = winner
      if (!isFinalRound) {
        advanceToNextRound(match, winnerTeam)
      }
    } else {
      // 동점인 경우
      match.winner = null
      clearNextRound(match)
    }
    
    // 결승전에서 우승자가 새로 결정되거나 변경된 경우에만 이벤트 emit
    if (isFinalRound && winner && winnerTeam && previousWinner !== winner) {
      emit('champion-winner', { winner, winnerTeam })
    }
  } else {
    // 스코어가 없으면 승자 없음
    match.winner = null
    clearNextRound(match)
  }
}

const clearNextRound = (currentMatch) => {
  const currentRoundIndex = currentMatch.round
  if (currentRoundIndex >= props.bracket.length - 1) return

  const nextRoundIndex = currentRoundIndex + 1
  const nextRound = props.bracket[nextRoundIndex]
  if (!nextRound) return

  const currentRound = props.bracket[currentRoundIndex]
  const matchIndex = currentRound.findIndex(m => m === currentMatch)
  if (matchIndex === -1) return

  const nextMatchIndex = Math.floor(matchIndex / 2)
  const nextMatch = nextRound[nextMatchIndex]

  if (nextMatch) {
    if (matchIndex % 2 === 0) {
      nextMatch.team1 = null
    } else {
      nextMatch.team2 = null
    }
  }
}

const advanceToNextRound = (currentMatch, winnerTeam) => {
  const currentRoundIndex = currentMatch.round
  // 현재 라운드가 마지막 라운드면 더 이상 진행할 곳이 없음
  if (currentRoundIndex >= props.bracket.length - 1) return

  const nextRoundIndex = currentRoundIndex + 1
  const nextRound = props.bracket[nextRoundIndex]
  if (!nextRound) return

  // 현재 매치가 속한 라운드에서 매치 인덱스 찾기
  const currentRound = props.bracket[currentRoundIndex]
  const matchIndex = currentRound.findIndex(m => m === currentMatch)
  
  if (matchIndex === -1) return
  
  // 다음 라운드에서 해당 위치의 매치 찾기 (토너먼트 구조상 matchIndex / 2 위치)
  const nextMatchIndex = Math.floor(matchIndex / 2)
  const nextMatch = nextRound[nextMatchIndex]
  
  if (nextMatch) {
    // 다음 매치의 빈 자리에 승자 팀 할당
    // 같은 매치 그룹에서 첫 번째 매치면 team1, 두 번째 매치면 team2
    if (matchIndex % 2 === 0) {
      // 첫 번째 매치에서 승리한 경우 team1에 할당
      nextMatch.team1 = winnerTeam
    } else {
      // 두 번째 매치에서 승리한 경우 team2에 할당
      nextMatch.team2 = winnerTeam
    }
  }
}
</script>

<style scoped>
.bracket-display {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 1rem;
  overflow-x: visible;
  overflow-y: auto;
  padding: 0.75rem 0.5rem;
  min-height: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
  animation: fadeIn 0.6s ease-out;
}

.bracket-display::-webkit-scrollbar {
  height: 8px;
}

.bracket-display::-webkit-scrollbar-track {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
}

.bracket-display::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 4px;
}

.bracket-display::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #8b5cf6 0%, #10b981 100%);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.round {
  width: 100%;
  max-width: 100%;
  flex-shrink: 0;
  animation: slideDown 0.6s ease-out calc(var(--round-index) * 0.1s) both;
  display: flex;
  flex-direction: column;
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

.round-header {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  padding: 0.5rem 0;
  z-index: 5;
}

.round-badge {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.75rem;
  white-space: nowrap;
  box-shadow: 
    0 3px 12px rgba(76, 175, 80, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  position: relative;
  overflow: hidden;
}

.round-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

.round-badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.round-badge-icon svg {
  width: 16px;
  height: 16px;
}

.round-badge-text {
  position: relative;
  z-index: 1;
}

.round-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, #4CAF50 0%, rgba(76, 175, 80, 0.3) 100%);
  border-radius: 2px;
}

.matches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.625rem;
  width: 100%;
}

.match-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  border-radius: 10px;
  padding: 0.75rem 0.875rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 
    0 2px 8px rgba(76, 175, 80, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
  width: 100%;
}

.match-card::before {
  display: none;
}

.match-card:hover {
  border-color: rgba(76, 175, 80, 0.4);
  box-shadow: 
    0 12px 32px rgba(76, 175, 80, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-4px);
}

.match-card.has-winner {
  border-color: rgba(76, 175, 80, 0.5);
  box-shadow: 
    0 8px 24px rgba(76, 175, 80, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.match-header {
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1.5px solid rgba(76, 175, 80, 0.1);
}

.match-number {
  font-size: 0.6rem;
  font-weight: 700;
  color: #4CAF50;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'Inter', sans-serif;
}

.match-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-card {
  padding: 0.5rem 0.625rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(76, 175, 80, 0.2);
  transition: all 0.3s ease;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 40px;
  position: relative;
  overflow: hidden;
  font-size: 0.75rem;
}

.team-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  transform: scaleY(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.team-card:hover::before {
  transform: scaleY(1);
}

.team-card.winner {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(102, 187, 106, 0.3) 100%);
  border-color: #f44336;
  border-width: 2px;
  box-shadow: 
    0 2px 8px rgba(76, 175, 80, 0.3),
    0 0 0 2px rgba(76, 175, 80, 0.1);
  font-weight: 700;
  position: relative;
  animation: winnerPulse 2s ease-in-out infinite;
}

.team-card.winner::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  border-radius: 6px;
  z-index: -1;
  opacity: 0.3;
  animation: winnerGlow 2s ease-in-out infinite;
}

@keyframes winnerGlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

.team-card.empty {
  opacity: 0.5;
  background: rgba(243, 244, 246, 0.5);
}

.team-card-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.team-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-name-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.team-name {
  font-size: 0.75rem;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 1.3;
}

.team-card.winner .team-name {
  color: #1B5E20;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(76, 175, 80, 0.2);
}


.empty-label {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.85rem;
  font-weight: 500;
}

.winner-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
  animation: checkmarkPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.winner-badge svg {
  width: 12px;
  height: 12px;
}

@keyframes checkmarkPop {
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

@keyframes winnerPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.score-input {
  width: 40px;
  padding: 0.25rem 0.4rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 4px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2E7D32;
  transition: all 0.3s ease;
  background: white;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.score-input::-webkit-outer-spin-button,
.score-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.score-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.match-winner {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  border-radius: 8px;
  border: 2px solid rgba(76, 175, 80, 0.3);
  font-weight: 700;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  animation: winnerSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.match-winner svg {
  width: 12px;
  height: 12px;
}

@keyframes winnerSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.winner-crown {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));
  animation: crownBounce 1s ease-in-out infinite;
}

@keyframes crownBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.winner-name {
  color: #1f2937;
  font-weight: 800;
  font-size: 0.75rem;
}

/* 태블릿 */
@media (min-width: 481px) {
  .bracket-display {
    gap: 1.25rem;
    padding: 1rem 0.75rem;
  }

  .matches {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .bracket-display {
    gap: 1.5rem;
    padding: 1.25rem 1rem;
  }

  .matches {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.875rem;
  }
}
</style>
