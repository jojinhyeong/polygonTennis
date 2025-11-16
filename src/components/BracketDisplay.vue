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
                    <span v-if="match.team1 && match.team1.groupName" class="group-tag">
                      {{ match.team1.groupName }}
                    </span>
                  </div>
                  <span v-else class="empty-label">부전승</span>
                </div>
                <div v-if="match.winner && getTeamName(match.team1) === match.winner" class="winner-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="score-card">
              <input
                v-model.number="match.score1"
                type="number"
                class="score-input-new"
                placeholder="0"
                min="0"
                @input="updateScore(match)"
                @change="updateScore(match)"
                :disabled="!match.team1 || !match.team2"
              />
              <div class="score-divider">:</div>
              <input
                v-model.number="match.score2"
                type="number"
                class="score-input-new"
                placeholder="0"
                min="0"
                @input="updateScore(match)"
                @change="updateScore(match)"
                :disabled="!match.team1 || !match.team2"
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
                    <span v-if="match.team2 && match.team2.groupName" class="group-tag">
                      {{ match.team2.groupName }}
                    </span>
                  </div>
                  <span v-else class="empty-label">부전승</span>
                </div>
                <div v-if="match.winner && getTeamName(match.team2) === match.winner" class="winner-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
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
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%);
  border-radius: 8px;
  border: 2px solid rgba(76, 175, 80, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  position: relative;
  overflow: hidden;
  font-size: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
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
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-color: transparent;
  font-weight: 700;
  box-shadow: 
    0 8px 24px rgba(76, 175, 80, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
}

.team-card.winner::before {
  display: none;
}

.team-card.empty {
  opacity: 0.5;
  background: rgba(243, 244, 246, 0.5);
}

.team-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
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
  color: white;
}

.group-tag {
  font-size: 0.6rem;
  padding: 0.15rem 0.4rem;
  background: rgba(76, 175, 80, 0.15);
  border-radius: 5px;
  color: #4CAF50;
  font-weight: 700;
  white-space: nowrap;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.team-card.winner .group-tag {
  background: rgba(255, 255, 255, 0.25);
  color: white;
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

.score-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(102, 187, 106, 0.05) 100%);
  border-radius: 8px;
  border: 2px solid rgba(76, 175, 80, 0.2);
}

.score-input-new {
  width: 45px;
  padding: 0.4rem;
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 800;
  text-align: center;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  background: white;
  color: #1f2937;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.score-input-new::-webkit-outer-spin-button,
.score-input-new::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.score-input-new:focus {
  border-color: #4CAF50;
  box-shadow: 
    0 0 0 4px rgba(76, 175, 80, 0.2),
    0 4px 16px rgba(76, 175, 80, 0.15);
  transform: scale(1.05);
}

.score-input-new:disabled {
  background: rgba(243, 244, 246, 0.8);
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.score-divider {
  font-size: 1rem;
  font-weight: 800;
  color: #4CAF50;
  font-family: 'Inter', sans-serif;
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
