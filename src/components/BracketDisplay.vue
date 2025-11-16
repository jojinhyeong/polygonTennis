<template>
  <div class="bracket-display">
    <div
      v-for="(round, roundIndex) in bracket"
      :key="roundIndex"
      class="round"
    >
      <div class="round-header">
        <div class="round-badge">{{ getRoundName(roundIndex, bracket.length) }}</div>
        <div class="round-line"></div>
      </div>
      <div class="matches">
        <div
          v-for="(match, matchIndex) in round"
          :key="matchIndex"
          class="match"
        >
          <div class="match-content">
            <div
              class="team-slot"
              :class="{ 
                winner: match.winner && getTeamName(match.team1) === match.winner,
                empty: !match.team1
              }"
            >
              <div class="team-content">
                <span v-if="match.team1" class="team-name">
                  {{ getTeamName(match.team1) }}
                </span>
                <span v-else class="empty-slot">부전승</span>
                <span v-if="match.team1 && match.team1.groupName" class="group-badge">
                  {{ match.team1.groupName }}
                </span>
              </div>
              <div v-if="match.winner && getTeamName(match.team1) === match.winner" class="winner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            
            <div class="score-section">
              <div class="score-inputs">
                <input
                  v-model.number="match.score1"
                  type="number"
                  class="score-input"
                  placeholder="0"
                  min="0"
                  @input="updateScore(match)"
                  @change="updateScore(match)"
                  :disabled="!match.team1 || !match.team2"
                />
                <span class="score-separator">:</span>
                <input
                  v-model.number="match.score2"
                  type="number"
                  class="score-input"
                  placeholder="0"
                  min="0"
                  @input="updateScore(match)"
                  @change="updateScore(match)"
                  :disabled="!match.team1 || !match.team2"
                />
              </div>
            </div>

            <div
              class="team-slot"
              :class="{ 
                winner: match.winner && getTeamName(match.team2) === match.winner,
                empty: !match.team2
              }"
            >
              <div class="team-content">
                <span v-if="match.team2" class="team-name">
                  {{ getTeamName(match.team2) }}
                </span>
                <span v-else class="empty-slot">부전승</span>
                <span v-if="match.team2 && match.team2.groupName" class="group-badge">
                  {{ match.team2.groupName }}
                </span>
              </div>
              <div v-if="match.winner && getTeamName(match.team2) === match.winner" class="winner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>
          <div v-if="match.winner" class="winner-indicator">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
            </svg>
            <span>{{ match.winner }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

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
  const roundNames = ['1라운드', '2라운드', '준결승', '결승']
  if (roundIndex < roundNames.length) {
    return roundNames[roundIndex]
  }
  // 라운드 수에 따라 동적으로 이름 생성
  const roundNumber = roundIndex + 1
  if (roundIndex === totalRounds - 1) return '결승'
  if (roundIndex === totalRounds - 2) return '준결승'
  return `${roundNumber}라운드`
}

const updateScore = (match) => {
  if (!match.team1 || !match.team2) return
  
  const score1 = match.score1
  const score2 = match.score2

  // 둘 다 숫자로 입력되어야 승자 결정
  if (score1 !== null && score1 !== undefined && score2 !== null && score2 !== undefined) {
    if (score1 > score2) {
      match.winner = getTeamName(match.team1)
      advanceToNextRound(match, match.team1)
    } else if (score2 > score1) {
      match.winner = getTeamName(match.team2)
      advanceToNextRound(match, match.team2)
    } else {
      // 동점인 경우
      match.winner = null
      clearNextRound(match)
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
  gap: 1.25rem;
  overflow-x: auto;
  overflow-y: visible;
  padding: 1rem 0.5rem;
  min-height: 400px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  width: max-content;
  min-width: 100%;
}

.round {
  min-width: 240px;
  flex-shrink: 0;
  scroll-snap-align: start;
}

.round-header {
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.round-badge {
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.8rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.round-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #a78bfa 100%);
}

.matches {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.match {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  position: relative;
}

.match:hover {
  border-color: #a78bfa;
  box-shadow: 0 8px 24px rgba(167, 139, 250, 0.2);
  transform: translateY(-2px);
}

.match-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-slot {
  padding: 0.625rem 0.75rem;
  background: white;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  position: relative;
  overflow: hidden;
  font-size: 0.875rem;
}

.team-slot::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.team-slot.winner {
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  color: white;
  border-color: #a78bfa;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(167, 139, 250, 0.4);
}

.team-slot.winner::before {
  display: none;
}

.team-slot.empty {
  opacity: 0.6;
}

.team-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.team-name {
  font-size: 0.875rem;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.empty-slot {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.8rem;
}

.group-badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: rgba(167, 139, 250, 0.15);
  border-radius: 8px;
  color: #a78bfa;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Inter', sans-serif;
}

.team-slot.winner .group-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.winner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.score-section {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.score-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
}

.score-input {
  width: 50px;
  padding: 0.375rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
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
  border-color: #a78bfa;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
}

.score-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.score-separator {
  font-size: 1rem;
  font-weight: 700;
  color: #6b7280;
  font-family: 'Inter', sans-serif;
}

.winner-indicator {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  text-align: center;
  background: linear-gradient(135deg, #a78bfa 0%, #34d399 100%);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.winner-indicator svg {
  flex-shrink: 0;
}

/* 태블릿 */
@media (min-width: 481px) {
  .bracket-display {
    gap: 2rem;
    padding: 1.25rem 0;
    min-height: 450px;
  }

  .round {
    min-width: 260px;
  }

  .team-slot {
    padding: 1rem 1.25rem;
    min-height: 56px;
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .bracket-display {
    gap: 2.5rem;
    padding: 1.5rem 0;
    min-height: 500px;
  }

  .round {
    min-width: 280px;
  }
}
</style>
