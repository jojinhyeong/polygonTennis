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
            :label-formatter="(group) => `${getGroupLabel(group.id)} (${group.players.length}명)`"
          />
        </div>
        
        <!-- 시드 선택 섹션 -->
        <div v-if="selectedGroupId" class="control-group seed-section">
          <label class="control-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
            </svg>
            시드 선택 (선택사항)
            <span class="seed-hint">강자끼리 팀이 되지 않도록 설정</span>
          </label>
          <div class="seed-selector">
            <div class="seed-info">
              <p class="seed-description">
                실력 차이가 나는 소수의 선수끼리 파트너가 (강강 or 약약) 되는 경우를 피하고 싶을 때 사용합니다.
              </p>
              <p class="seed-recommended" v-if="recommendedSeeds.length > 0">
                권장 시드 개수: {{ recommendedSeeds.length }}명
              </p>
            </div>
            <div class="seed-players-list">
              <div
                v-for="(player, index) in availablePlayersForSeeds"
                :key="index"
                class="seed-player-item"
              >
                <label class="seed-checkbox">
                  <input
                    type="checkbox"
                    :value="player"
                    v-model="selectedSeeds"
                    :disabled="selectedSeeds.length >= maxSeeds && !selectedSeeds.includes(player)"
                  />
                  <span class="seed-checkbox-label">{{ player }}</span>
                </label>
              </div>
            </div>
            <div v-if="selectedSeeds.length > 0" class="seed-selected-info">
              <span class="seed-count">선택된 시드: {{ selectedSeeds.length }}명</span>
              <button class="clear-seeds-btn" @click="clearSeeds">초기화</button>
            </div>
          </div>
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
          <div class="summary-header">
            <h3 class="summary-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM3 9h18M9 3v18"></path>
              </svg>
              경기 결과
            </h3>
          </div>
          <div class="results-tabs">
            <button 
              class="results-tab-btn" 
              :class="{ active: resultsTab === 'full' }"
              @click="resultsTab = 'full'"
            >
              경기결과
            </button>
            <button 
              class="results-tab-btn" 
              :class="{ active: resultsTab === 'summary' }"
              @click="resultsTab = 'summary'"
            >
              경기요약
            </button>
          </div>
          <div v-show="resultsTab === 'full'" class="summary-table-container">
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
          <div v-show="resultsTab === 'summary'" class="summary-table-container">
            <table class="summary-table summary-table-simple">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>선수</th>
                  <th>승</th>
                  <th>패</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in matchResults" :key="result.player">
                  <td class="rank-cell" :class="getRankClass(result.rank)">{{ result.rank }}</td>
                  <td class="player-cell player-cell-center">{{ result.player }}</td>
                  <td class="win-cell">{{ result.wins }}</td>
                  <td class="loss-cell">{{ result.losses }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 시드 충돌 검증 결과 표시 -->
        <div v-if="selectedSeeds.length > 0 && hasSeedConflicts" class="seed-conflict-alert">
          <div class="alert-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="alert-content">
            <strong>시드 충돌 감지</strong>
            <p>시드 선수들이 같은 팀에 배정된 경기가 {{ seedConflictCount }}개 있습니다. 빨간색으로 표시된 경기를 확인해주세요.</p>
          </div>
        </div>
        
        <div class="matches-grid">
          <div
            v-for="(match, index) in kdkMatchesByGroup.get(selectedViewGroupId)"
            :key="index"
            class="match-card"
            :class="{ 
              'has-score': match.setScore1 !== null && match.setScore2 !== null,
              'has-winner': match.winner !== null,
              'seed-conflict': match.hasSeedConflict
            }"
          >
            <div class="match-header">
              <span class="match-number" :class="{ 'winner-number': match.winner !== null }">게임 {{ index + 1 }}</span>
            </div>
            <div class="match-body">
              <div 
                class="team-card" 
                :class="{ 
                  winner: match.winner === 'team1',
                  'seed-conflict-team': match.hasSeedConflict && isSeedTeam(match.team1Player1, match.team1Player2)
                }"
              >
                <span 
                  class="player-name"
                  :class="{ 'seed-player': selectedSeeds.includes(match.team1Player1) }"
                >{{ match.team1Player1 }}</span>
                <span class="player-separator">/</span>
                <span 
                  class="player-name"
                  :class="{ 'seed-player': selectedSeeds.includes(match.team1Player2) }"
                >{{ match.team1Player2 }}</span>
                <input
                  v-model.number="match.setScore1"
                  type="number"
                  class="score-input"
                  placeholder="0"
                  min="0"
                  @input="updateScore(match)"
                  @blur="updateScore(match)"
                />
              </div>

              <div 
                class="team-card" 
                :class="{ 
                  winner: match.winner === 'team2',
                  'seed-conflict-team': match.hasSeedConflict && isSeedTeam(match.team2Player1, match.team2Player2)
                }"
              >
                <span 
                  class="player-name"
                  :class="{ 'seed-player': selectedSeeds.includes(match.team2Player1) }"
                >{{ match.team2Player1 }}</span>
                <span class="player-separator">/</span>
                <span 
                  class="player-name"
                  :class="{ 'seed-player': selectedSeeds.includes(match.team2Player2) }"
                >{{ match.team2Player2 }}</span>
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
import { ref, computed, defineProps, watch, onMounted } from 'vue'
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
const resultsTab = ref('full') // 'full' 또는 'summary'
const selectedSeeds = ref([]) // 시드로 선택된 선수들

// 인원수별 권장 시드 번호 (이미지 참고)
const recommendedSeedIndices = {
  6: [0, 2],   // 1,3
  7: [0, 4],   // 1,5
  8: [0, 6],   // 1,7
  9: [0, 3, 7], // 1,4,8
  10: [0, 7, 9], // 1,8,A
  11: [0, 4, 7, 8], // 1,5,8,9
  12: [1, 2, 7, 9], // 2,3,8,A
  13: [0, 3, 5, 11], // 1,4,6,B
  14: [1, 4, 7, 11], // 2,5,8,C (C는 12번째 선수, 인덱스 11)
  15: [0, 3, 4, 9, 12], // 1,4,5,A,D (D는 13번째 선수, 인덱스 12)
  16: [0, 5, 10, 15, 6, 9] // 1,6,B,G,7,A (1=0, 6=5, B=10, G=15, 7=6, A=9)
}

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
  return getGroupLabel(groupId)
}

// 그룹 ID를 알파벳 레이블로 변환 (1 -> A, 2 -> B, ... 26 -> Z)
const getGroupLabel = (groupId) => {
  if (groupId >= 1 && groupId <= 26) {
    return String.fromCharCode(64 + groupId) + '그룹'
  }
  // 26개를 초과하면 AA, AB, ... 형식으로 표시
  let label = ''
  let num = groupId
  while (num > 0) {
    const remainder = (num - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    num = Math.floor((num - 1) / 26)
  }
  return label + '그룹'
}

// 선택된 그룹의 선수 목록 (시드 선택용)
const availablePlayersForSeeds = computed(() => {
  if (!selectedGroupId.value) return []
  const group = props.groups.find(g => g.id === selectedGroupId.value)
  if (!group) return []
  return group.players
    .filter(p => p.name && p.name.trim())
    .map(p => p.name)
})

// 권장 시드 개수
const recommendedSeeds = computed(() => {
  const playerCount = availablePlayersForSeeds.value.length
  const recommended = recommendedSeedIndices[playerCount]
  if (!recommended) return []
  return recommended.map(index => availablePlayersForSeeds.value[index]).filter(Boolean)
})

// 최대 시드 개수 (인원수에 따라)
const maxSeeds = computed(() => {
  const playerCount = availablePlayersForSeeds.value.length
  const recommended = recommendedSeedIndices[playerCount]
  return recommended ? recommended.length : Math.floor(playerCount / 2)
})

// 시드 초기화
const clearSeeds = () => {
  selectedSeeds.value = []
}

// 그룹 변경 시 시드 초기화
watch(selectedGroupId, () => {
  selectedSeeds.value = []
  // 그룹별 시드 정보 불러오기
  loadSeedsForGroup(selectedGroupId.value)
})

// 로컬스토리지에 저장
const saveKDKTabState = () => {
  try {
    const state = {
      kdkMatchesByGroup: Object.fromEntries(kdkMatchesByGroup.value),
      selectedViewGroupId: selectedViewGroupId.value,
      seedsByGroup: {} // 그룹별 시드 정보 저장
    }
    
    // 각 그룹별 시드 정보 저장
    props.groups.forEach(group => {
      const saved = localStorage.getItem(`polygonTennis_kdkSeeds_${group.id}`)
      if (saved) {
        try {
          state.seedsByGroup[group.id] = JSON.parse(saved)
        } catch (e) {
          // 무시
        }
      }
    })
    
    localStorage.setItem('polygonTennis_kdkTab', JSON.stringify(state))
  } catch (error) {
    console.error('한울AA 탭 데이터 저장 실패:', error)
  }
}

// 그룹별 시드 정보 저장
const saveSeedsForGroup = (groupId) => {
  if (!groupId) return
  try {
    localStorage.setItem(`polygonTennis_kdkSeeds_${groupId}`, JSON.stringify(selectedSeeds.value))
  } catch (error) {
    console.error('시드 정보 저장 실패:', error)
  }
}

// 그룹별 시드 정보 불러오기
const loadSeedsForGroup = (groupId) => {
  if (!groupId) {
    selectedSeeds.value = []
    return
  }
  try {
    const saved = localStorage.getItem(`polygonTennis_kdkSeeds_${groupId}`)
    if (saved) {
      selectedSeeds.value = JSON.parse(saved)
    } else {
      selectedSeeds.value = []
    }
  } catch (error) {
    console.error('시드 정보 불러오기 실패:', error)
    selectedSeeds.value = []
  }
}

// 로컬스토리지에서 불러오기
const loadKDKTabState = () => {
  try {
    const saved = localStorage.getItem('polygonTennis_kdkTab')
    if (saved) {
      const state = JSON.parse(saved)
      if (state.kdkMatchesByGroup) {
        // 실제로 존재하는 그룹만 필터링
        const validMatches = new Map()
        Object.entries(state.kdkMatchesByGroup).forEach(([groupId, matches]) => {
          const groupIdNum = typeof groupId === 'string' ? parseInt(groupId) : groupId
          const group = props.groups.find(g => g.id === groupIdNum)
          if (group) {
            validMatches.set(groupIdNum, matches)
          }
        })
        kdkMatchesByGroup.value = validMatches
        
        // selectedViewGroupId도 실제 존재하는 그룹인지 확인
        if (state.selectedViewGroupId) {
          const groupIdNum = typeof state.selectedViewGroupId === 'string' 
            ? parseInt(state.selectedViewGroupId) 
            : state.selectedViewGroupId
          const group = props.groups.find(g => g.id === groupIdNum)
          if (group && validMatches.has(groupIdNum)) {
            selectedViewGroupId.value = groupIdNum
          } else if (validMatches.size > 0) {
            // 선택된 그룹이 없으면 첫 번째 유효한 그룹 선택
            selectedViewGroupId.value = Array.from(validMatches.keys())[0]
          } else {
            selectedViewGroupId.value = null
          }
        }
      }
    }
  } catch (error) {
    console.error('한울AA 탭 데이터 불러오기 실패:', error)
  }
}

// kdkMatchesByGroup 변경 시 저장
watch(kdkMatchesByGroup, () => {
  saveKDKTabState()
}, { deep: true })

// selectedViewGroupId 변경 시 저장
watch(selectedViewGroupId, () => {
  saveKDKTabState()
})

// selectedSeeds 변경 시 저장
watch(selectedSeeds, () => {
  saveSeedsForGroup(selectedGroupId.value)
}, { deep: true })

// groups가 변경될 때 유효성 재검증
watch(() => props.groups, () => {
  // 실제로 존재하는 그룹만 유지
  const validMatches = new Map()
  kdkMatchesByGroup.value.forEach((matches, groupId) => {
    const group = props.groups.find(g => g.id === groupId)
    if (group) {
      validMatches.set(groupId, matches)
    }
  })
  kdkMatchesByGroup.value = validMatches
  
  // selectedViewGroupId도 재검증
  if (selectedViewGroupId.value) {
    const group = props.groups.find(g => g.id === selectedViewGroupId.value)
    if (!group || !validMatches.has(selectedViewGroupId.value)) {
      if (validMatches.size > 0) {
        selectedViewGroupId.value = Array.from(validMatches.keys())[0]
      } else {
        selectedViewGroupId.value = null
      }
    }
  }
}, { deep: true })

// 컴포넌트 마운트 시 불러오기
onMounted(() => {
  loadKDKTabState()
  if (selectedGroupId.value) {
    loadSeedsForGroup(selectedGroupId.value)
  }
})


// 시드 충돌 검증
const hasSeedConflicts = computed(() => {
  if (!selectedViewGroupId.value || !kdkMatchesByGroup.value.has(selectedViewGroupId.value)) {
    return false
  }
  const matches = kdkMatchesByGroup.value.get(selectedViewGroupId.value)
  return matches.some(match => match.hasSeedConflict)
})

const seedConflictCount = computed(() => {
  if (!selectedViewGroupId.value || !kdkMatchesByGroup.value.has(selectedViewGroupId.value)) {
    return 0
  }
  const matches = kdkMatchesByGroup.value.get(selectedViewGroupId.value)
  return matches.filter(match => match.hasSeedConflict).length
})

// 시드 팀인지 확인
const isSeedTeam = (player1, player2) => {
  if (!selectedSeeds.value || selectedSeeds.value.length < 2) return false
  return selectedSeeds.value.includes(player1) && selectedSeeds.value.includes(player2)
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

  // 시드 선수들이 선택되었는지 확인
  const hasSeeds = selectedSeeds.value.length > 0
  
  // 선수 목록을 랜덤으로 섞기 (Fisher-Yates 알고리즘)
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let round = 0; round < 3; round++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffled[i]
        shuffled[i] = shuffled[j]
        shuffled[j] = temp
      }
    }
    return shuffled
  }
  
  // 시드 배정 로직
  let players = []
  if (hasSeeds) {
    // 시드 선수들을 먼저 배정
    const seedPlayers = [...selectedSeeds.value]
    const nonSeedPlayers = originalPlayers.filter(p => !seedPlayers.includes(p))
    
    // 권장 시드 위치 가져오기
    const playerCount = originalPlayers.length
    const recommendedIndices = recommendedSeedIndices[playerCount] || []
    
    // 시드 선수 개수가 권장 개수보다 많은지 확인
    if (seedPlayers.length > recommendedIndices.length) {
      alert(`시드 선수 개수가 권장 개수(${recommendedIndices.length}명)를 초과합니다.\n권장 시드 개수 이하로 선택해주세요.`)
      return
    }
    
    // 시드 선수들을 정확히 권장 위치에 배정
    players = new Array(playerCount).fill(null)
    const shuffledNonSeeds = shuffleArray(nonSeedPlayers)
    
    // 1단계: 선택된 시드 선수들을 권장 위치의 앞부분에 배정
    for (let i = 0; i < seedPlayers.length; i++) {
      const seedPosition = recommendedIndices[i]
      // 배열 범위 체크
      if (seedPosition >= 0 && seedPosition < playerCount) {
        players[seedPosition] = seedPlayers[i]
      } else {
        console.error(`시드 위치 오류: ${seedPosition}는 유효한 범위(0-${playerCount - 1})를 벗어났습니다.`)
        alert('시드 배정에 오류가 발생했습니다. 다시 시도해주세요.')
        return
      }
    }
    
    // 2단계: 나머지 권장 시드 위치에 비시드 선수 배정 (시드 개수가 권장보다 적은 경우)
    let nonSeedIndex = 0
    for (let i = seedPlayers.length; i < recommendedIndices.length; i++) {
      const seedPosition = recommendedIndices[i]
      if (seedPosition >= 0 && seedPosition < playerCount && players[seedPosition] === null) {
        players[seedPosition] = shuffledNonSeeds[nonSeedIndex++]
      }
    }
    
    // 3단계: 나머지 모든 위치에 비시드 선수들을 랜덤으로 배정
    for (let i = 0; i < playerCount; i++) {
      if (players[i] === null) {
        players[i] = shuffledNonSeeds[nonSeedIndex++]
      }
    }
    
    // 모든 위치가 채워졌는지 확인
    if (players.some(p => p === null || p === undefined)) {
      console.error('시드 배정 오류: 모든 위치가 채워지지 않았습니다.')
      alert('시드 배정에 오류가 발생했습니다. 다시 시도해주세요.')
      return
    }
  } else {
    // 시드가 없으면 기존처럼 랜덤으로 섞기
    players = shuffleArray(originalPlayers)
  }

  const bracket = hanulAABrackets[players.length]
  if (!bracket) {
    alert(`${players.length}명의 한울AA 대진표가 준비되지 않았습니다.`)
    return
  }

  // 선수 번호 파싱 함수
  const parseTeam = (str) => {
    const indices = []
    let i = 0
    while (i < str.length) {
      if (str[i] >= '0' && str[i] <= '9') {
        indices.push(parseInt(str[i]) - 1)
        i++
      } else if (str[i] >= 'A' && str[i] <= 'Z') {
        // A=10번째 선수(인덱스9), B=11번째(인덱스10), ..., E=14번째(인덱스13), F=15번째(인덱스14)
        // 하지만 15명이면 E는 15번째 선수(인덱스14)가 맞음
        // A=10이므로 인덱스는 9, B=11이므로 인덱스는 10, ..., E=14이므로 인덱스는 13
        // 실제로는: A=10(인덱스9), B=11(인덱스10), C=12(인덱스11), D=13(인덱스12), E=14(인덱스13)
        // 그런데 15명이면 E는 15번째 선수이므로 인덱스는 14여야 함
        // 하지만 대진표에서 E는 14번째 선수를 의미하므로 인덱스는 13이 맞음
        const charIndex = str[i].charCodeAt(0) - 'A'.charCodeAt(0)
        const playerNumber = 10 + charIndex // A=10, B=11, ..., E=14
        indices.push(playerNumber - 1) // 인덱스로 변환 (A=9, B=10, ..., E=13)
        i++
      } else {
        i++
      }
    }
    return indices
  }

  // 시드 충돌 검증 함수
  const checkSeedConflict = (match, seeds) => {
    if (!seeds || seeds.length < 2) return false
    const team1Players = [match.team1Player1, match.team1Player2]
    const team2Players = [match.team2Player1, match.team2Player2]
    
    const team1Seeds = team1Players.filter(p => seeds.includes(p))
    const team2Seeds = team2Players.filter(p => seeds.includes(p))
    
    return team1Seeds.length >= 2 || team2Seeds.length >= 2
  }

  // 대진표 생성
  let matches = bracket.map((matchStr, index) => {
    const [team1Str, team2Str] = matchStr.split(';')
    const team1Indices = parseTeam(team1Str)
    const team2Indices = parseTeam(team2Str)

    const match = {
      id: index + 1,
      team1Player1: players[team1Indices[0]] || `선수${team1Indices[0] + 1}`,
      team1Player2: players[team1Indices[1]] || `선수${team1Indices[1] + 1}`,
      team2Player1: players[team2Indices[0]] || `선수${team2Indices[0] + 1}`,
      team2Player2: players[team2Indices[1]] || `선수${team2Indices[1] + 1}`,
      setScore1: null,
      setScore2: null,
      winner: null,
      hasSeedConflict: false
    }
    
    // 시드 충돌 검증
    if (hasSeeds) {
      match.hasSeedConflict = checkSeedConflict(match, selectedSeeds.value)
    }
    
    return match
  })
  
  // 시드 선수들이 서로 팀이 되지 않도록 검증
  if (hasSeeds && selectedSeeds.value.length >= 2) {
    let hasSeedConflict = false
    const conflictMatches = []
    
    matches.forEach(match => {
      if (match.hasSeedConflict) {
        hasSeedConflict = true
        conflictMatches.push(match.id)
      }
    })
    
    // 시드 충돌이 발생하면 상세 정보를 로그에 출력
    if (hasSeedConflict) {
      alert(`시드 선수들이 같은 팀에 배정되었습니다.\n충돌이 발생한 경기: ${conflictMatches.join(', ')}\n시드 배정을 다시 확인해주세요.`)
      return // 대진표 생성 중단
    }
  }

  kdkMatchesByGroup.value.set(group.id, matches)
  selectedViewGroupId.value = group.id
  
  // 로컬스토리지에 저장
  saveKDKTabState()
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

// 순위별 클래스 반환
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  if (rank === 4) return 'rank-4'
  return 'rank-default'
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-radius: 20px;
  padding: 1.5rem 0.75rem;
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

.kdk-matches-container::before {
  display: none;
}

.kdk-matches-container::after {
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

.group-tabs {
  display: flex;
  gap: 0.625rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.2);
  position: relative;
  z-index: 1;
  overflow-x: auto;
  overflow-y: hidden;
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
  white-space: nowrap;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
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

.matches-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  position: relative;
  z-index: 1;
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
  justify-content: space-between;
  gap: 0.5rem;
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

.score-input {
  width: 40px;
  padding: 0.25rem 0.4rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 4px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #2E7D32;
  transition: all 0.3s ease;
  background: white;
}

.score-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.score-separator {
  color: #999;
  font-weight: 400;
  font-size: 0.7rem;
  margin: 0 0.125rem;
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
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.summary-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.1);
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
}

.results-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.1);
}

.results-tab-btn {
  padding: 0.625rem 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  position: relative;
  bottom: -2px;
}

.results-tab-btn:hover {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.05);
}

.results-tab-btn.active {
  color: #2E7D32;
  border-bottom-color: #4CAF50;
  font-weight: 700;
}

.summary-title svg {
  color: #4CAF50;
}

.summary-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.summary-table-container::-webkit-scrollbar {
  height: 8px;
}

.summary-table-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.summary-table-container::-webkit-scrollbar-thumb {
  background: #7f5217;
  border-radius: 4px;
}

.summary-table-container::-webkit-scrollbar-thumb:hover {
  background: #6b4312;
}

.summary-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  table-layout: auto;
}

.summary-table-simple {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.summary-table-simple th,
.summary-table-simple td {
  padding: 0.5rem 0.375rem;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: center !important;
}

.summary-table-simple .player-cell {
  text-align: center !important;
}

.summary-table-simple .rank-cell {
  text-align: center !important;
}

.summary-table-simple .win-cell,
.summary-table-simple .loss-cell {
  text-align: center !important;
}

.summary-table-simple th:first-child,
.summary-table-simple td:first-child {
  width: 15%;
  text-align: center !important;
  padding: 0.5rem 0.375rem;
}

.summary-table-simple td:first-child {
  text-align: center !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0.5rem 0.375rem !important;
}

.summary-table-simple td:first-child .rank-cell {
  display: inline-flex;
  margin: 0;
}

.summary-table-simple th:nth-child(2),
.summary-table-simple td:nth-child(2) {
  width: 45%;
}

.summary-table-simple th:nth-child(3),
.summary-table-simple td:nth-child(3),
.summary-table-simple th:nth-child(4),
.summary-table-simple td:nth-child(4) {
  width: 20%;
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

.summary-table th:nth-child(11),
.summary-table td:last-child {
  width: auto;
  min-width: 50px;
  text-align: center !important;
}

.summary-table td:last-child {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
}

.summary-table td:last-child .rank-cell {
  text-align: center !important;
  margin: 0;
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
  color: #2196F3;
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
  color: #2196F3;
}

.diff-cell.negative {
  color: #f44336;
}

.rank-cell {
  font-weight: 700;
  font-size: 0.9rem;
  color: #2E7D32;
  text-align: center;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  transition: all 0.3s ease;
  position: relative;
  margin: 0 auto;
}

.rank-cell.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #8B4513;
  font-weight: 900;
  font-size: 1rem;
  box-shadow: 
    0 4px 12px rgba(255, 215, 0, 0.4),
    0 0 0 2px rgba(255, 215, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: rank1Glow 2s ease-in-out infinite;
  transform: scale(1.05);
  width: auto;
  min-width: 40px;
}

.rank-cell.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
  color: #2C2C2C;
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 
    0 3px 10px rgba(192, 192, 192, 0.3),
    0 0 0 2px rgba(192, 192, 192, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: rank2Shine 2.5s ease-in-out infinite;
}

.rank-cell.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
  color: #3E2723;
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 
    0 3px 10px rgba(205, 127, 50, 0.3),
    0 0 0 2px rgba(205, 127, 50, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: rank3Pulse 2s ease-in-out infinite;
}

.rank-cell.rank-4 {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(102, 187, 106, 0.3) 100%);
  color: #1B5E20;
  font-weight: 800;
  font-size: 0.9rem;
  box-shadow: 
    0 2px 8px rgba(76, 175, 80, 0.25),
    0 0 0 2px rgba(76, 175, 80, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.rank-cell.rank-default {
  background: rgba(76, 175, 80, 0.05);
  color: #2E7D32;
  font-weight: 600;
}

@keyframes rank1Glow {
  0%, 100% {
    box-shadow: 
      0 4px 12px rgba(255, 215, 0, 0.4),
      0 0 0 2px rgba(255, 215, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 
      0 6px 16px rgba(255, 215, 0, 0.6),
      0 0 0 3px rgba(255, 215, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}

@keyframes rank2Shine {
  0%, 100% {
    box-shadow: 
      0 3px 10px rgba(192, 192, 192, 0.3),
      0 0 0 2px rgba(192, 192, 192, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 
      0 4px 12px rgba(192, 192, 192, 0.4),
      0 0 0 2px rgba(192, 192, 192, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}

@keyframes rank3Pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 
      0 3px 10px rgba(205, 127, 50, 0.3),
      0 0 0 2px rgba(205, 127, 50, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 
      0 4px 12px rgba(205, 127, 50, 0.4),
      0 0 0 2px rgba(205, 127, 50, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
}

.player-cell-center {
  text-align: center !important;
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
    font-size: 16px;
  }
  
  .score-label {
    font-size: 0.7rem;
  }
  
  .seed-players-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    max-height: 150px;
  }

  .kdk-matches-container {
    padding: 1rem 0.5rem;
    border-radius: 16px;
  }

  .kdk-matches-container::after {
    border-radius: 16px;
  }

  .group-tabs {
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
  }

  .group-tab {
    flex: 0 0 calc((100% - 3 * 0.5rem) / 4);
    padding: 0.625rem 0.5rem;
    font-size: 0.75rem;
    min-width: 0;
  }
}

/* 태블릿 */
@media (min-width: 481px) {
  .kdk-matches-container {
    padding: 1.75rem 1rem;
    border-radius: 18px;
  }

  .kdk-matches-container::after {
    border-radius: 18px;
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .kdk-matches-container {
    padding: 2rem 1.5rem;
    border-radius: 24px;
  }

  .kdk-matches-container::after {
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

/* 시드 선택 섹션 */
.seed-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(76, 175, 80, 0.1);
}

.seed-hint {
  font-size: 0.7rem;
  color: #666;
  font-weight: 400;
  margin-left: 0.5rem;
}

.seed-selector {
  margin-top: 0.75rem;
}

.seed-info {
  margin-bottom: 0.75rem;
}

.seed-description {
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.seed-recommended {
  font-size: 0.75rem;
  color: #4CAF50;
  font-weight: 600;
  margin: 0;
}

.seed-players-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(76, 175, 80, 0.02);
  border-radius: 8px;
}

.seed-player-item {
  display: flex;
  align-items: center;
}

.seed-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  width: 100%;
}

.seed-checkbox:hover {
  background-color: rgba(76, 175, 80, 0.05);
}

.seed-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4CAF50;
  flex-shrink: 0;
}

.seed-checkbox input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.seed-checkbox-label {
  font-size: 0.85rem;
  color: #2E7D32;
  font-weight: 500;
  user-select: none;
}

.seed-selected-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.seed-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2E7D32;
}

.clear-seeds-btn {
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 6px;
  background: white;
  color: #4CAF50;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-seeds-btn:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: #4CAF50;
}

.clear-seeds-btn:active {
  transform: scale(0.98);
}

/* 시드 충돌 검증 알림 */
.seed-conflict-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(244, 67, 54, 0.1);
  border: 2px solid #f44336;
  border-radius: 12px;
  animation: shake 0.5s ease-in-out;
}

.seed-valid-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border: 2px solid #4CAF50;
  border-radius: 12px;
}

.alert-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #f44336;
}

.seed-valid-alert .alert-icon {
  color: #4CAF50;
}

.alert-content {
  flex: 1;
}

.alert-content strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #d32f2f;
  margin-bottom: 0.25rem;
}

.seed-valid-alert .alert-content strong {
  color: #2E7D32;
}

.alert-content p {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* 시드 충돌 매치 스타일 */
.match-card.seed-conflict {
  border: 3px solid #f44336;
  background: rgba(244, 67, 54, 0.05);
  animation: pulseRed 2s ease-in-out infinite;
}

.team-card.seed-conflict-team {
  background: rgba(244, 67, 54, 0.2);
  border: 2px solid #f44336;
}

.player-name.seed-player {
  position: relative;
  font-weight: 700;
}

.player-name.seed-player::after {
  content: '⭐';
  margin-left: 0.25rem;
  font-size: 0.7rem;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes pulseRed {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(244, 67, 54, 0); }
}
</style>

