<template>
  <div class="kdk-tab">
    <div class="kdk-controls">
      <div class="controls-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h2 class="controls-title">한울AA 리그전</h2>
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
        <button class="generate-kdk-btn" @click="generateKDKBracket" :disabled="!selectedGroupId">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>한울AA 대진표 생성</span>
        </button>
      </div>
    </div>

    <div v-if="kdkMatchesByGroup.size > 0" class="kdk-matches-container">
      <div class="group-tabs">
        <button
          v-for="[groupId, matches] in Array.from(kdkMatchesByGroup.entries())"
          :key="groupId"
          :class="['group-tab', { active: selectedViewGroupId === groupId }]"
          @click="selectedViewGroupId = groupId"
        >
          {{ getGroupName(groupId) }}
        </button>
      </div>
      
      <div v-if="selectedViewGroupId && kdkMatchesByGroup.has(selectedViewGroupId)" class="matches-list">
        <div class="kdk-info-card">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="info-content">
            <h3>한울AA 리그전</h3>
            <p>중복 파트너 없이 파트너를 서로 바꿔가며 진행하는 방식입니다. (총 4경기 진행)</p>
          </div>
        </div>
        
        <div class="summary-section">
          <div class="summary-header" @click="toggleResultsTable">
            <h3 class="summary-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM3 9h18M9 3v18"></path>
              </svg>
              경기 결과
            </h3>
            <button class="toggle-btn" :class="{ 'collapsed': !showResultsTable }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          <div v-show="showResultsTable" class="summary-table-container">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>선수</th>
                  <th>1세트</th>
                  <th>2세트</th>
                  <th>3세트</th>
                  <th>4세트</th>
                  <th>승률</th>
                  <th colspan="4">게임득실</th>
                  <th>순위</th>
                </tr>
                <tr class="sub-header">
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>승</th>
                  <th>패</th>
                  <th>득점</th>
                  <th>실점</th>
                  <th>득실차</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in matchResults" :key="result.player">
                  <td class="player-cell">{{ result.player }}</td>
                  <td class="set-cell">{{ formatSetScore(result.set1) }}</td>
                  <td class="set-cell">{{ formatSetScore(result.set2) }}</td>
                  <td class="set-cell">{{ formatSetScore(result.set3) }}</td>
                  <td class="set-cell">{{ formatSetScore(result.set4) }}</td>
                  <td class="win-cell">{{ result.wins }}</td>
                  <td class="loss-cell">{{ result.losses }}</td>
                  <td class="points-cell">{{ result.pointsScored }}</td>
                  <td class="points-cell">{{ result.pointsConceded }}</td>
                  <td class="diff-cell" :class="{ positive: result.pointDiff > 0, negative: result.pointDiff < 0 }">
                    {{ result.pointDiff > 0 ? '+' : '' }}{{ result.pointDiff }}
                  </td>
                  <td class="rank-cell">{{ result.rank }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="matches-grid">
          <div
            v-for="(match, index) in kdkMatchesByGroup.get(selectedViewGroupId)"
            :key="index"
            class="match-card"
            :class="{ 
              'has-score': match.setScore1 !== null && match.setScore2 !== null,
              'has-winner': match.winner !== null
            }"
          >
            <div class="match-header">
              <span class="match-number" :class="{ 'winner-number': match.winner !== null }">게임 {{ index + 1 }}</span>
            </div>
            <div class="match-body">
              <div class="team-card" :class="{ winner: match.winner === 'team1' }">
                <span class="player-name">{{ match.team1Player1 }}</span>
                <span class="player-separator">/</span>
                <span class="player-name">{{ match.team1Player2 }}</span>
              </div>
              
              <div class="score-card">
                <input
                  v-model.number="match.setScore1"
                  type="number"
                  class="score-input"
                  placeholder="0"
                  min="0"
                  @input="updateScore(match)"
                  @blur="updateScore(match)"
                />
                <span class="score-separator">:</span>
                <input
                  v-model.number="match.setScore2"
                  type="number"
                  class="score-input"
                  placeholder="0"
                  min="0"
                  @input="updateScore(match)"
                  @blur="updateScore(match)"
                />
              </div>

              <div class="team-card" :class="{ winner: match.winner === 'team2' }">
                <span class="player-name">{{ match.team2Player1 }}</span>
                <span class="player-separator">/</span>
                <span class="player-name">{{ match.team2Player2 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <h3>한울AA 대진표를 생성해주세요</h3>
      <p>그룹을 선택하고 한울AA 리그전 대진표를 생성하세요</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import SelectInput from './SelectInput.vue'

const props = defineProps({
  groups: {
    type: Array,
    required: true
  }
})

const selectedGroupId = ref('')
const kdkMatchesByGroup = ref(new Map())
const selectedViewGroupId = ref(null)
const showResultsTable = ref(true) // 경기 결과 표 표시 여부

// 한울AA 대진표 데이터 (인원수별)
// 한울AA는 중복 파트너가 없도록 설계되어 있습니다.
// 각 선수는 모든 파트너와 정확히 한 번씩만 팀을 맺습니다.
// 사용자 제공 대진표 데이터 반영
const hanulAABrackets = {
  5: ['12;34', '13;25', '14;35', '15;24', '23;45'],
  6: ['12;34', '15;46', '23;56', '14;25', '24;36', '16;35'],
  7: ['12;34', '56;17', '35;24', '14;67', '23;57', '16;25', '46;37'],
  8: ['12;34', '56;78', '13;57', '24;68', '37;48', '15;26', '16;38', '25;47'],
  9: ['12;34', '56;78', '19;57', '23;68', '49;38', '15;26', '17;89', '36;45', '24;79'],
  10: ['12;34', '56;78', '23;6A', '19;58', '3A;45', '27;89', '4A;68', '13;79', '46;59', '17;2A'],
  11: ['12;34', '56;78', '1B;9A', '23;68', '4A;57', '26;9B', '13;5B', '49;8A', '17;28', '5A;6B', '39;47'],
  12: ['12;34', '56;78', '9A;BC', '37;48', '29;5A', '1B;6C', '13;57', '68;AC', '24;9B', '17;2B', '35;6A', '49;8C'],
  13: ['12;34', '56;78', '9A;BC', '1D;25', '37;4A', '68;9B', 'CD;13', '26;5A', '47;8B', '9C;2D', '15;AB', '3C;67', '48;9D'],
  14: ['12;34', '56;78', '9A;BC', 'DE;13', '24;57', '68;9B', '26;CD', '79;AE', '14;8B', '5E;6A', '3C;7B', '2D;89', '3E;45', 'AC;1D'],
  15: ['12;34', '56;78', '9A;BC', 'DE;1F', '23;57', '46;AB', '8D;9E', '4F;5C', '13;6B', '27;8A', '9C;5E', '36;DF', '1B;8C', '47;EF', '2A;9D'],
  16: ['12;34', '56;78', '9A;BC', 'DE;FG', '13;57', '24;68', '9B;DF', 'AC;EG', '15;9D', '37;BF', '26;AE', '48;CG', '19;2A', '3B;4C', '5D;6E', '7F;8G']
}

const getGroupName = (groupId) => {
  const group = props.groups.find(g => g.id === groupId)
  return group ? group.name : `그룹 ${groupId}`
}

const toggleResultsTable = () => {
  showResultsTable.value = !showResultsTable.value
}

const generateKDKBracket = () => {
  if (selectedGroupId.value === '') {
    alert('그룹을 선택해주세요.')
    return
  }

  const group = props.groups.find(g => g.id === selectedGroupId.value)
  if (!group) {
    alert('그룹을 찾을 수 없습니다.')
    return
  }

  const originalPlayers = group.players
    .filter(p => p.name && p.name.trim())
    .map(p => p.name)

  if (originalPlayers.length < 5 || originalPlayers.length > 16) {
    alert('한울AA 리그전은 5명~16명만 가능합니다.')
    return
  }

  // 선수 목록을 랜덤으로 섞기 (Fisher-Yates 알고리즘)
  // 매번 호출될 때마다 새로운 랜덤 순서로 섞임
  const shuffleArray = (array) => {
    const shuffled = [...array]
    // 더 확실한 랜덤성을 위해 여러 번 섞기
    for (let round = 0; round < 3; round++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        // 배열 구조 분해 할당 대신 임시 변수 사용
        const temp = shuffled[i]
        shuffled[i] = shuffled[j]
        shuffled[j] = temp
      }
    }
    return shuffled
  }
  
  // 랜덤으로 섞인 선수 목록 (이 순서대로 1번, 2번, 3번... 으로 매핑됨)
  // 매번 대진표 생성 버튼을 누를 때마다 새로운 랜덤 순서로 섞임
  const players = shuffleArray(originalPlayers)

  const bracket = hanulAABrackets[players.length]
  if (!bracket) {
    alert(`${players.length}명의 한울AA 대진표가 준비되지 않았습니다.`)
    return
  }

  // 대진표 생성
  const matches = bracket.map((matchStr, index) => {
    // "13:24" 또는 "1A:2B" 형식을 파싱 (이미지에서는 콜론 사용, 코드에서는 세미콜론 사용)
    // "13" = 1번과 3번, "1A" = 1번과 10번(A)
    const [team1Str, team2Str] = matchStr.split(';')
    
    // 선수 번호 파싱 함수
    // "13" → [0, 2] (1번=인덱스0, 3번=인덱스2)
    // "1A" → [0, 9] (1번=인덱스0, 10번=인덱스9)
    const parseTeam = (str) => {
      const indices = []
      let i = 0
      while (i < str.length) {
        if (str[i] >= '0' && str[i] <= '9') {
          // 숫자: 1-9
          indices.push(parseInt(str[i]) - 1)
          i++
        } else if (str[i] >= 'A' && str[i] <= 'Z') {
          // 문자: A=10, B=11, C=12...
          indices.push(str[i].charCodeAt(0) - 'A'.charCodeAt(0) + 9)
          i++
        } else {
          i++
        }
      }
      return indices
    }

    const team1Indices = parseTeam(team1Str)
    const team2Indices = parseTeam(team2Str)

    return {
      id: index + 1,
      team1Player1: players[team1Indices[0]] || `선수${team1Indices[0] + 1}`,
      team1Player2: players[team1Indices[1]] || `선수${team1Indices[1] + 1}`,
      team2Player1: players[team2Indices[0]] || `선수${team2Indices[0] + 1}`,
      team2Player2: players[team2Indices[1]] || `선수${team2Indices[1] + 1}`,
      setScore1: null,
      setScore2: null,
      winner: null
    }
  })

  kdkMatchesByGroup.value.set(group.id, matches)
  selectedViewGroupId.value = group.id
}

const updateScore = (match) => {
  // 빈 값은 자동으로 0으로 설정
  if (match.setScore1 === null || match.setScore1 === '') {
    match.setScore1 = 0
  }
  if (match.setScore2 === null || match.setScore2 === '') {
    match.setScore2 = 0
  }

  // 총 세트 스코어로 승자 결정
  const score1 = Number(match.setScore1) || 0
  const score2 = Number(match.setScore2) || 0

  if (score1 > score2) {
    match.winner = 'team1'
  } else if (score2 > score1) {
    match.winner = 'team2'
  } else {
    match.winner = null
  }
}

// 세트 점수 포맷팅
const formatSetScore = (set) => {
  if (!set || (set.team1 === null && set.team2 === null)) return '-'
  if (set.team1 === null || set.team2 === null) return '-'
  return `${set.team1}:${set.team2}`
}

// 경기 결과 계산
const matchResults = computed(() => {
  if (!selectedViewGroupId.value || !kdkMatchesByGroup.value.has(selectedViewGroupId.value)) {
    return []
  }

  const matches = kdkMatchesByGroup.value.get(selectedViewGroupId.value)
  const group = props.groups.find(g => g.id === selectedViewGroupId.value)
  if (!group) return []

  const players = group.players.map(p => p.name)
  const resultsMap = new Map()

  // 각 선수별로 초기화 및 게임 카운터 추가
  const playerGameCounters = new Map()
  players.forEach(player => {
    resultsMap.set(player, {
      player,
      set1: { team1: null, team2: null },
      set2: { team1: null, team2: null },
      set3: { team1: null, team2: null },
      set4: { team1: null, team2: null },
      wins: 0,
      losses: 0,
      pointsScored: 0,
      pointsConceded: 0,
      pointDiff: 0
    })
    playerGameCounters.set(player, 0) // 각 선수가 참여한 게임 수 추적
  })

  // 각 게임에서 점수 추출
  matches.forEach((match) => {
    const team1Players = [match.team1Player1, match.team1Player2]
    const team2Players = [match.team2Player1, match.team2Player2]

    // 총 세트 스코어
    const team1Sets = match.setScore1 || 0
    const team2Sets = match.setScore2 || 0

    // 각 선수별로 점수 업데이트
    team1Players.forEach(player => {
      const result = resultsMap.get(player)
      if (result) {
        // 각 선수가 참여한 게임의 순서대로 세트 컬럼에 저장
        const gameCount = playerGameCounters.get(player) || 0
        if (match.setScore1 !== null && match.setScore2 !== null) {
          if (gameCount === 0) {
            result.set1 = { team1: team1Sets, team2: team2Sets }
          } else if (gameCount === 1) {
            result.set2 = { team1: team1Sets, team2: team2Sets }
          } else if (gameCount === 2) {
            result.set3 = { team1: team1Sets, team2: team2Sets }
          } else if (gameCount === 3) {
            result.set4 = { team1: team1Sets, team2: team2Sets }
          }
          // 게임 카운터 증가
          playerGameCounters.set(player, gameCount + 1)
        }
        
        if (match.winner === 'team1') {
          result.wins++
        } else if (match.winner === 'team2') {
          result.losses++
        }
        
        result.pointsScored += team1Sets
        result.pointsConceded += team2Sets
      }
    })

    team2Players.forEach(player => {
      const result = resultsMap.get(player)
      if (result) {
        const gameCount = playerGameCounters.get(player) || 0
        if (match.setScore1 !== null && match.setScore2 !== null) {
          if (gameCount === 0) {
            result.set1 = { team1: team2Sets, team2: team1Sets }
          } else if (gameCount === 1) {
            result.set2 = { team1: team2Sets, team2: team1Sets }
          } else if (gameCount === 2) {
            result.set3 = { team1: team2Sets, team2: team1Sets }
          } else if (gameCount === 3) {
            result.set4 = { team1: team2Sets, team2: team1Sets }
          }
          // 게임 카운터 증가
          playerGameCounters.set(player, gameCount + 1)
        }
        
        if (match.winner === 'team2') {
          result.wins++
        } else if (match.winner === 'team1') {
          result.losses++
        }
        
        result.pointsScored += team2Sets
        result.pointsConceded += team1Sets
      }
    })
  })

  // 득실차 계산 및 순위 계산
  const results = Array.from(resultsMap.values()).map(result => {
    result.pointDiff = result.pointsScored - result.pointsConceded
    return result
  })

  // 순위 계산 (승률 > 득실차 > 득점 순)
  results.sort((a, b) => {
    // 승률 비교
    const winRateA = a.wins / (a.wins + a.losses) || 0
    const winRateB = b.wins / (b.wins + b.losses) || 0
    if (winRateB !== winRateA) return winRateB - winRateA
    
    // 득실차 비교
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
    
    // 득점 비교
    return b.pointsScored - a.pointsScored
  })

  // 순위 할당
  results.forEach((result, index) => {
    result.rank = index + 1
  })

  return results
})
</script>

<style scoped>
.kdk-tab {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.kdk-controls {
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.controls-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
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
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #2E7D32;
}


.generate-kdk-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  min-height: 44px;
}

.generate-kdk-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.generate-kdk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.kdk-matches-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.group-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.group-tab {
  padding: 0.625rem 1rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 10px;
  background: white;
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.group-tab:hover {
  border-color: #4CAF50;
  color: #2E7D32;
}

.group-tab.active {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-color: transparent;
}

.matches-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.kdk-info-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 0.75rem;
}

.info-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.info-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2E7D32;
}

.info-content p {
  margin: 0;
  font-size: 0.75rem;
  color: #666;
  line-height: 1.4;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.match-card {
  background: white;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 0.75rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.match-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.match-card.has-score {
  border-color: #4CAF50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(102, 187, 106, 0.05) 100%);
}

.match-card.has-winner {
  border-color: #4CAF50;
  border-width: 2px;
  box-shadow: 
    0 2px 8px rgba(76, 175, 80, 0.2),
    0 0 0 1px rgba(76, 175, 80, 0.1);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  position: relative;
}

.match-card.has-winner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A, #4CAF50);
  border-radius: 12px 12px 0 0;
  animation: winnerShine 3s ease-in-out infinite;
}

.match-number.winner-number {
  color: #1B5E20;
  font-weight: 800;
  position: relative;
  display: inline-block;
}

.match-number.winner-number::after {
  content: '✓';
  display: inline-block;
  margin-left: 0.25rem;
  color: #4CAF50;
  font-size: 0.7rem;
  animation: winnerCheck 1.5s ease-in-out infinite;
}

@keyframes winnerShine {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes winnerCheck {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.match-header {
  margin-bottom: 0.5rem;
}

.match-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: #2E7D32;
}

.match-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.625rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(76, 175, 80, 0.2);
  transition: all 0.3s ease;
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

.team-card.winner .player-name {
  color: #1B5E20;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(76, 175, 80, 0.2);
}

@keyframes winnerPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes winnerGlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

.player-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #2E7D32;
}

.player-separator {
  color: #999;
  font-weight: 400;
  font-size: 0.7rem;
}

.score-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.score-input {
  width: 50px;
  padding: 0.4rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 6px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #2E7D32;
  transition: all 0.3s ease;
}

.score-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.score-separator {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4CAF50;
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

.summary-section {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.1);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  padding: 0.5rem;
  margin: -0.5rem -0.5rem 0.75rem -0.5rem;
  border-radius: 8px;
}

.summary-header:hover {
  background: rgba(76, 175, 80, 0.05);
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
  flex: 1;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  border-radius: 4px;
}

.toggle-btn:hover {
  background: rgba(76, 175, 80, 0.1);
}

.toggle-btn.collapsed {
  transform: rotate(180deg);
}

.summary-title svg {
  color: #4CAF50;
}

.summary-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
}

.summary-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  table-layout: auto;
}

.summary-table thead {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
}

.summary-table th {
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 700;
  color: #2E7D32;
  font-size: 0.75rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.2);
  white-space: nowrap;
}

.summary-table th:first-child {
  width: auto;
  min-width: 80px;
  max-width: 120px;
}

.summary-table .sub-header {
  background: rgba(76, 175, 80, 0.05);
}

.summary-table .sub-header th {
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
  padding: 0.4rem 0.5rem;
}

.summary-table th:nth-child(2),
.summary-table th:nth-child(3),
.summary-table th:nth-child(4),
.summary-table th:nth-child(5) {
  width: auto;
  min-width: 70px;
  text-align: center;
}

.summary-table th:nth-child(6),
.summary-table th:nth-child(7) {
  width: auto;
  min-width: 50px;
  text-align: center;
}

.summary-table th:nth-child(8),
.summary-table th:nth-child(9),
.summary-table th:nth-child(10) {
  width: auto;
  min-width: 60px;
  text-align: center;
}

.summary-table th:nth-child(11) {
  width: auto;
  min-width: 50px;
  text-align: center;
}

.summary-table tbody tr {
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
  transition: background 0.2s ease;
}

.summary-table tbody tr:hover {
  background: rgba(76, 175, 80, 0.05);
}

.summary-table td {
  padding: 0.75rem 0.5rem;
  vertical-align: middle;
  text-align: center;
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
}

.player-cell {
  text-align: left;
  font-weight: 600;
  color: #2E7D32;
}

.set-cell {
  font-size: 0.75rem;
  color: #666;
}

.win-cell,
.loss-cell {
  font-weight: 600;
}

.win-cell {
  color: #4CAF50;
}

.loss-cell {
  color: #f44336;
}

.points-cell {
  font-weight: 500;
  color: #333;
}

.diff-cell {
  font-weight: 600;
}

.diff-cell.positive {
  color: #4CAF50;
}

.diff-cell.negative {
  color: #f44336;
}

.rank-cell {
  font-weight: 700;
  font-size: 0.9rem;
  color: #2E7D32;
}

.partners-cell {
  font-size: 0.75rem;
  min-width: 0;
  max-width: 100%;
  word-break: break-word;
}

.partners-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  max-width: 100%;
}

.partner-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 6px;
  color: #2E7D32;
  font-weight: 500;
  white-space: nowrap;
}

.partner-count {
  margin-left: 0.25rem;
  font-size: 0.7rem;
  color: #666;
  font-weight: 400;
}

.games-cell {
  font-size: 0.75rem;
  min-width: 0;
  max-width: 100%;
}

.games-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  max-width: 100%;
  min-width: 0;
}

.game-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 0.375rem;
  background: #4CAF50;
  color: white;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

@media (max-width: 480px) {
  .summary-table {
    font-size: 0.75rem;
  }
  
  .summary-table th,
  .summary-table td {
    padding: 0.5rem 0.375rem;
  }
  
  .partner-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  .game-badge {
    min-width: 20px;
    height: 20px;
    font-size: 0.65rem;
  }
  
  .matches-grid {
    gap: 0.5rem;
  }
  
  .match-card {
    padding: 0.625rem;
  }
  
  .match-header {
    margin-bottom: 0.5rem;
  }
  
  .match-number {
    font-size: 0.75rem;
  }
  
  .team-card {
    padding: 0.5rem;
  }
  
  .player-name {
    font-size: 0.75rem;
  }
  
  .score-input {
    width: 50px;
    padding: 0.4rem;
    font-size: 0.8rem;
  }
  
  .score-label {
    font-size: 0.7rem;
  }
}
</style>

