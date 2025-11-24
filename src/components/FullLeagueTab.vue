<template>
  <div class="full-league-tab">
    <div class="league-controls">
      <div class="controls-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3zM3 9h18M9 3v18"></path>
          </svg>
        </div>
        <h2 class="controls-title">풀리그</h2>
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

        <Tooltip text="풀리그에 참가할 팀을 선택합니다. 짝수명만 선택 가능합니다" position="top" v-if="selectedGroupId">
          <button 
            class="team-select-btn" 
            @click="openTeamSelectModal"
            :disabled="!selectedGroupId"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>팀 구성하기</span>
          </button>
        </Tooltip>

        <!-- 선택된 팀 미리보기 -->
        <div v-if="selectedGroupId && selectedPlayers.length >= 4 && selectedPlayers.length % 2 === 0" class="control-group">
          <label class="control-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            예선 경기 수
            <Tooltip text="각 팀이 예선에서 진행할 경기 수를 선택합니다. 팀 수에 따라 선택 가능한 경기 수가 달라질 수 있습니다" position="top">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="cursor: help; opacity: 0.6;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </Tooltip>
          </label>
          <div class="match-count-selector">
            <button
              v-for="count in [2, 3, 4]"
              :key="count"
              :class="['match-count-btn', { active: matchCount === count }]"
              @click="selectMatchCount(count)"
              :title="`각 팀이 ${count}경기를 진행합니다`"
            >
              {{ count }}경기
            </button>
          </div>
        </div>

        <Tooltip 
          :text="selectedPlayers.length < 4 ? '최소 4명(2팀)이 필요합니다' : selectedPlayers.length % 2 !== 0 ? '짝수명만 선택 가능합니다' : !matchCount ? '경기 수를 선택해주세요' : '예선 리그와 본선 토너먼트를 생성합니다'"
          position="top"
        >
          <div class="button-group">
            <button 
              class="generate-league-btn" 
              @click="generateFullLeague" 
              :disabled="!selectedGroupId || selectedPlayers.length < 4 || selectedPlayers.length % 2 !== 0 || !matchCount"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM3 9h18M9 3v18"></path>
              </svg>
              <span>풀리그 생성</span>
            </button>
            <button 
              class="reset-btn" 
              @click="resetBracket" 
              :disabled="!selectedGroupId"
              title="대진표 초기화"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
            </button>
          </div>
        </Tooltip>
      </div>
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
              class="confirm-team-btn" 
              @click="confirmTeamSelection" 
              :disabled="selectedPlayers.length < 4 || selectedPlayers.length % 2 !== 0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>확인 ({{ getTeamCount }}팀)</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="leagueDataByGroup.size > 0" class="league-container">
      <div class="group-tabs">
        <button
          v-for="[groupId, data] in sortedGroupEntries"
          :key="groupId"
          :class="['group-tab', { active: selectedViewGroupId === groupId }]"
          @click="selectedViewGroupId = groupId"
        >
          {{ getGroupName(groupId) }}
        </button>
      </div>

      <div v-if="selectedViewGroupId && leagueDataByGroup.has(selectedViewGroupId)" class="league-content">
        <div class="phase-tabs">
          <button
            :class="['phase-tab', { active: currentPhase === 'preliminary' }]"
            @click="currentPhase = 'preliminary'"
          >
            예선 리그
          </button>
          <button
            :class="['phase-tab', { active: currentPhase === 'final' }]"
            @click="currentPhase = 'final'"
            :disabled="!canViewFinal"
          >
            본선 토너먼트
          </button>
        </div>

        <!-- 예선 리그 -->
        <div v-show="currentPhase === 'preliminary'" class="preliminary-section">
          <div class="league-info-card">
            <div class="info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div class="info-content">
              <h3>예선 리그</h3>
              <p>각 팀은 {{ matchCount }}경기를 진행합니다. 1~4등은 토너먼트에 진출합니다.</p>
            </div>
          </div>

          <div class="standings-section">
            <div class="standings-header">
              <h3 class="standings-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h18v18H3zM3 9h18M9 3v18"></path>
                </svg>
                순위표
              </h3>
            </div>
            <div class="standings-table-container">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>팀</th>
                    <th>승</th>
                    <th>패</th>
                    <th>득점</th>
                    <th>실점</th>
                    <th>득실차</th>
                    <th>진출</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(team, index) in standings"
                    :key="team.teamId"
                    :class="{
                      'rank-1': team.rank === 1,
                      'rank-2': team.rank === 2,
                      'rank-3': team.rank === 3,
                      'rank-4': team.rank === 4 && team.advances,
                      'advances': team.advances
                    }"
                  >
                    <td class="rank-cell" :class="getRankClass(team.rank)">{{ team.rank }}</td>
                    <td class="team-cell">{{ team.teamName }}</td>
                    <td class="win-cell">{{ team.wins }}</td>
                    <td class="loss-cell">{{ team.losses }}</td>
                    <td class="points-cell">{{ team.pointsScored }}</td>
                    <td class="points-cell">{{ team.pointsConceded }}</td>
                    <td class="diff-cell" :class="{ positive: team.pointDiff > 0, negative: team.pointDiff < 0 }">
                      {{ team.pointDiff > 0 ? '+' : '' }}{{ team.pointDiff }}
                    </td>
                    <td class="advance-cell">
                      <span v-if="team.advances" class="advance-badge">진출</span>
                      <span v-else class="no-advance">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="matches-section">
            <div class="matches-header">
              <h3 class="matches-title">예선 경기</h3>
            </div>
            <div class="matches-grid">
              <div
                v-for="(match, index) in preliminaryMatches"
                :key="index"
                class="match-card"
                :class="{
                  'has-score': match.score1 !== null && match.score2 !== null,
                  'has-winner': match.winner !== null
                }"
              >
                <div class="match-header">
                  <span class="match-number">경기 {{ index + 1 }}</span>
                </div>
                <div class="match-body">
                  <div
                    class="team-card"
                    :class="{ winner: match.winner === 'team1' }"
                  >
                    <span class="team-name">{{ match.team1 }}</span>
                    <input
                      v-model.number="match.score1"
                      type="number"
                      class="score-input"
                      placeholder="0"
                      min="0"
                      @input="updateMatchScore(match)"
                      @blur="updateMatchScore(match)"
                    />
                  </div>
                  <div
                    class="team-card"
                    :class="{ winner: match.winner === 'team2' }"
                  >
                    <span class="team-name">{{ match.team2 }}</span>
                    <input
                      v-model.number="match.score2"
                      type="number"
                      class="score-input"
                      placeholder="0"
                      min="0"
                      @input="updateMatchScore(match)"
                      @blur="updateMatchScore(match)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 본선 토너먼트 -->
        <div v-show="currentPhase === 'final'" class="final-section">
          <div v-if="finalBracket && finalBracket.length > 0" class="bracket-container-wrapper">
            <BracketDisplay
              :bracket="finalBracket"
              :bracket-type="'double'"
              @champion-winner="handleChampionWinner"
            />
          </div>
          <div v-else class="empty-bracket">
            <p>예선이 완료되면 본선 대진표가 생성됩니다.</p>
          </div>
        </div>
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

    <!-- 경기 수 불가능 모달 -->
    <div v-if="showInvalidMatchCountModal" class="modal-overlay" @click.self="closeInvalidMatchCountModal">
      <div class="modal-content invalid-match-count-modal">
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="modal-icon" style="background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3>경기 수 선택 불가</h3>
              <p class="modal-subtitle">불가능한 조합입니다</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="closeInvalidMatchCountModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="invalid-match-count-content">
            <div class="invalid-info-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div class="invalid-info-text">
                <p><strong>{{ invalidMatchCountInfo.teamCount }}팀</strong>에서 <strong>{{ invalidMatchCountInfo.selectedCount }}경기</strong>는 선택할 수 없습니다.</p>
                <p class="invalid-reason">각 경기는 2팀이 참여하므로, 총 경기 수는 정수여야 합니다.</p>
                <p class="invalid-calculation">{{ invalidMatchCountInfo.teamCount }}팀 × {{ invalidMatchCountInfo.selectedCount }}경기 = {{ invalidMatchCountInfo.teamCount * invalidMatchCountInfo.selectedCount }} ÷ 2 = {{ (invalidMatchCountInfo.teamCount * invalidMatchCountInfo.selectedCount) / 2 }} (불가능)</p>
              </div>
            </div>
            
            <div class="available-counts-section">
              <h4 class="available-counts-title">가능한 경기 수</h4>
              <div v-if="invalidMatchCountInfo.availableCounts.length > 0" class="available-counts-list">
                <button
                  v-for="count in invalidMatchCountInfo.availableCounts"
                  :key="count"
                  class="available-count-btn"
                  @click="selectAvailableMatchCount(count)"
                >
                  {{ count }}경기
                </button>
              </div>
              <div v-else class="no-available-counts">
                <p>현재 인원수({{ invalidMatchCountInfo.teamCount }}팀)에서는 가능한 경기 수가 없습니다.</p>
                <p class="no-available-suggestion">인원수를 조정해주세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="showEmptyState" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 3h18v18H3zM3 9h18M9 3v18"></path>
        </svg>
      </div>
      <h3>풀리그를 생성해주세요</h3>
      <p>그룹을 선택하고 팀을 선택하여 풀리그를 생성하세요</p>
    </div>

    <!-- 생성 완료 모달 -->
    <SuccessModal 
      :show="showSuccessModal" 
      message="풀리그가 성공적으로 생성되었습니다."
      @close="showSuccessModal = false"
    />
    
    <!-- 대진표 초기화 확인 모달 -->
    <div v-if="showResetConfirmModal" class="modal-overlay" @click="closeResetConfirmModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>대진표 초기화 확인</h3>
        </div>
        <div class="modal-body">
          <p v-if="pendingReset">대진표를 초기화하시겠습니까?</p>
          <template v-else>
            <p>이 그룹에 이미 대진표가 있습니다.</p>
            <p>기존 대진표를 초기화하고 새로 생성하시겠습니까?</p>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeResetConfirmModal">취소</button>
          <button class="btn-confirm" @click="confirmResetBracket">예</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, onMounted, nextTick } from 'vue'
import SelectInput from './SelectInput.vue'
import BracketDisplay from './BracketDisplay.vue'
import SuccessModal from './SuccessModal.vue'
import Tooltip from './Tooltip.vue'
import { saveBracketToRealtime, loadBracketFromRealtime, deleteGroupBracketFromRealtime, PATHS } from '../firebase/realtimeService'

const props = defineProps({
  groups: {
    type: Array,
    required: true
  }
})

const selectedGroupId = ref('')
const selectedPlayers = ref([])
const matchCount = ref(null)
const leagueDataByGroup = ref(new Map())
const selectedViewGroupId = ref(null)
const currentPhase = ref('preliminary')
const showEmptyState = ref(true)
const showTeamSelectModal = ref(false)
const modalBodyRef = ref(null)
const playerListRef = ref(null)
const showCelebration = ref(false)
const showWinnerModal = ref(false)
const championWinner = ref('')
const lastChampionWinner = ref('') // 마지막으로 표시한 우승자 추적
const showInvalidMatchCountModal = ref(false)
const invalidMatchCountInfo = ref({ teamCount: 0, selectedCount: 0, availableCounts: [] })
const showSuccessModal = ref(false)
const showResetConfirmModal = ref(false)
const pendingTeamSelectModal = ref(null) // 팀 구성하기 모달 열기 함수를 저장
const pendingBracketGeneration = ref(null) // 대진표 생성 함수를 저장
const pendingReset = ref(null) // 초기화 함수를 저장

// 그룹 ID를 알파벳 레이블로 변환
const getGroupLabel = (groupId) => {
  if (groupId >= 1 && groupId <= 26) {
    return String.fromCharCode(64 + groupId) + '그룹'
  }
  let label = ''
  let num = groupId
  while (num > 0) {
    const remainder = (num - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    num = Math.floor((num - 1) / 26)
  }
  return label + '그룹'
}

const getGroupName = (groupId) => {
  return getGroupLabel(groupId)
}

// 그룹 탭을 A~Z 순서로 정렬
const sortedGroupEntries = computed(() => {
  const entries = Array.from(leagueDataByGroup.value.entries())
  return entries.sort(([idA], [idB]) => {
    const nameA = getGroupLabel(idA)
    const nameB = getGroupLabel(idB)
    return nameA.localeCompare(nameB, 'ko', { numeric: true })
  })
})

const selectedGroupName = computed(() => {
  return getGroupLabel(selectedGroupId.value)
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

const getTeamCount = computed(() => {
  return Math.floor(selectedPlayers.value.length / 2)
})

const getSelectionOrder = (playerName) => {
  const index = selectedPlayers.value.indexOf(playerName)
  if (index === -1) return null
  return index + 1
}

// 가능한 경기 수 계산
const getAvailableMatchCounts = (teamCount) => {
  const available = []
  for (let count = 2; count <= 4; count++) {
    const totalMatchesNeeded = (teamCount * count) / 2
    const maxPossiblePairs = (teamCount * (teamCount - 1)) / 2
    
    // 홀수 팀 수에서 홀수 경기 수는 불가능
    if (teamCount % 2 === 1 && count % 2 === 1) {
      continue
    }
    
    // 총 경기 수가 정수이고 가능한 조합 수를 초과하지 않으면 가능
    if (Number.isInteger(totalMatchesNeeded) && totalMatchesNeeded <= maxPossiblePairs) {
      available.push(count)
    }
  }
  return available
}

// 경기 수 선택
const selectMatchCount = (count) => {
  const teamCount = Math.floor(selectedPlayers.value.length / 2)
  
  // 수학적 가능성 확인
  const totalMatchesNeeded = (teamCount * count) / 2
  const maxPossiblePairs = (teamCount * (teamCount - 1)) / 2
  
  // 홀수 팀 수에서 홀수 경기 수는 불가능
  if (teamCount % 2 === 1 && count % 2 === 1) {
    const availableCounts = getAvailableMatchCounts(teamCount)
    invalidMatchCountInfo.value = {
      teamCount,
      selectedCount: count,
      availableCounts
    }
    showInvalidMatchCountModal.value = true
    return
  }
  
  // 총 경기 수가 정수가 아니면 불가능
  if (!Number.isInteger(totalMatchesNeeded)) {
    const availableCounts = getAvailableMatchCounts(teamCount)
    invalidMatchCountInfo.value = {
      teamCount,
      selectedCount: count,
      availableCounts
    }
    showInvalidMatchCountModal.value = true
    return
  }
  
  // 가능한 조합 수를 초과하면 불가능
  if (totalMatchesNeeded > maxPossiblePairs) {
    const availableCounts = getAvailableMatchCounts(teamCount)
    invalidMatchCountInfo.value = {
      teamCount,
      selectedCount: count,
      availableCounts
    }
    showInvalidMatchCountModal.value = true
    return
  }
  
  // 가능한 경우 경기 수 설정
  matchCount.value = count
}

// 가능한 경기 수 선택
const selectAvailableMatchCount = (count) => {
  matchCount.value = count
  closeInvalidMatchCountModal()
}

// 경기 수 불가능 모달 닫기
const closeInvalidMatchCountModal = () => {
  showInvalidMatchCountModal.value = false
}

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
    alert(`${getGroupLabel(group.id)}에는 최소 4명의 선수가 필요합니다.`)
    return
  }

  // 기존 대진표가 있는지 확인
  if (leagueDataByGroup.value.has(selectedGroupId.value)) {
    // 기존 대진표가 있으면 확인 모달 표시
    pendingTeamSelectModal.value = () => {
      openTeamSelectModalInternal()
    }
    showResetConfirmModal.value = true
    return
  }

  // 기존 대진표가 없으면 바로 팀 구성하기 모달 열기
  openTeamSelectModalInternal()
}

const openTeamSelectModalInternal = () => {
  showTeamSelectModal.value = true
  
  // 모달이 열릴 때 페이지 스크롤을 맨 위로 이동
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  // 모달이 열릴 때 모달 내부 스크롤을 맨 위로 초기화
  setTimeout(() => {
    if (modalBodyRef.value) {
      modalBodyRef.value.scrollTop = 0
    }
  }, 100)
}

const closeTeamSelectModal = () => {
  showTeamSelectModal.value = false
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

const clearSelection = () => {
  selectedPlayers.value = []
}

const confirmTeamSelection = () => {
  if (selectedPlayers.value.length < 4) {
    alert('최소 4명(2팀)이 필요합니다.')
    return
  }

  if (selectedPlayers.value.length % 2 !== 0) {
    alert('홀수명은 선택할 수 없습니다. 2명씩 팀을 구성해야 합니다.')
    return
  }

  closeTeamSelectModal()
}

// 예선 경기 목록
const preliminaryMatches = computed(() => {
  if (!selectedViewGroupId.value || !leagueDataByGroup.value.has(selectedViewGroupId.value)) {
    return []
  }
  const data = leagueDataByGroup.value.get(selectedViewGroupId.value)
  return data.preliminaryMatches || []
})

// 순위표
const standings = computed(() => {
  if (!selectedViewGroupId.value || !leagueDataByGroup.value.has(selectedViewGroupId.value)) {
    return []
  }
  const data = leagueDataByGroup.value.get(selectedViewGroupId.value)
  return data.standings || []
})

// 본선 대진표
const finalBracket = computed(() => {
  if (!selectedViewGroupId.value || !leagueDataByGroup.value.has(selectedViewGroupId.value)) {
    return null
  }
  const data = leagueDataByGroup.value.get(selectedViewGroupId.value)
  return data.finalBracket || null
})

// 본선 진출 가능 여부
const canViewFinal = computed(() => {
  if (!selectedViewGroupId.value || !leagueDataByGroup.value.has(selectedViewGroupId.value)) {
    return false
  }
  const data = leagueDataByGroup.value.get(selectedViewGroupId.value)
  return data.finalBracket && data.finalBracket.length > 0
})

// 순위 클래스
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  if (rank === 4) return 'rank-4'
  return 'rank-default'
}

// 랜덤 경기 생성 (중복 없이, 모든 팀이 정확히 matchCount만큼 경기)
const generateRandomMatches = (teams, matchCount) => {
  // 수학적 가능성 확인
  const totalMatchesNeeded = (teams.length * matchCount) / 2
  const maxPossiblePairs = (teams.length * (teams.length - 1)) / 2
  
  if (totalMatchesNeeded > maxPossiblePairs) {
    console.error('수학적으로 불가능한 조합입니다.')
    return []
  }
  
  // 홀수 팀 수에서 홀수 경기 수는 수학적으로 불가능
  // 예: 9팀 * 3경기 = 27, 27 / 2 = 13.5 (정수가 아님)
  // 각 경기는 2팀이 참여하므로, 총 경기 수는 정수여야 함
  if (teams.length % 2 === 1 && matchCount % 2 === 1) {
    console.error(`홀수 팀 수(${teams.length}팀)에서 홀수 경기 수(${matchCount}경기)는 수학적으로 불가능합니다.`)
    console.error(`총 필요한 경기 수: ${totalMatchesNeeded} (정수가 아님)`)
    return []
  }
  
  const matches = []
  const playedPairs = new Set()
  
  // 각 팀이 정해진 경기 수만큼 경기하도록
  const teamMatchCount = new Map()
  teams.forEach(team => {
    teamMatchCount.set(team, 0)
  })

  // 가능한 모든 팀 조합 생성 (중복 없이)
  const possiblePairs = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      possiblePairs.push([teams[i], teams[j]])
    }
  }

  // 각 팀이 정확히 matchCount만큼 경기하도록 보장하는 알고리즘
  // 더 많은 시도와 더 나은 휴리스틱 사용
  const maxAttempts = 1000
  let attempts = 0
  
  while (attempts < maxAttempts) {
    // 초기화
    matches.length = 0
    playedPairs.clear()
    teams.forEach(team => {
      teamMatchCount.set(team, 0)
    })
    
    // 가능한 조합을 랜덤으로 섞기
    const shuffledPairs = [...possiblePairs].sort(() => Math.random() - 0.5)
    
    // 각 팀의 남은 경기 수를 추적
    const remainingMatches = new Map()
    teams.forEach(team => {
      remainingMatches.set(team, matchCount)
    })
    
    // 우선순위: 남은 경기 수가 적은 팀부터 매칭
    for (const [team1, team2] of shuffledPairs) {
      const pairKey1 = `${team1}|${team2}`
      const pairKey2 = `${team2}|${team1}`
      
      // 이미 경기한 조합이면 스킵
      if (playedPairs.has(pairKey1) || playedPairs.has(pairKey2)) continue
      
      const team1Remaining = remainingMatches.get(team1) || 0
      const team2Remaining = remainingMatches.get(team2) || 0
      
      // 두 팀 모두 경기 수가 부족한 경우에만 추가
      if (team1Remaining > 0 && team2Remaining > 0) {
        matches.push({
          team1,
          team2,
          score1: null,
          score2: null,
          winner: null
        })
        playedPairs.add(pairKey1)
        remainingMatches.set(team1, team1Remaining - 1)
        remainingMatches.set(team2, team2Remaining - 1)
        teamMatchCount.set(team1, (teamMatchCount.get(team1) || 0) + 1)
        teamMatchCount.set(team2, (teamMatchCount.get(team2) || 0) + 1)
      }
    }
    
    // 모든 팀이 정확히 matchCount만큼 경기했는지 확인
    const allTeamsHaveExactMatches = teams.every(team => 
      (teamMatchCount.get(team) || 0) === matchCount
    )
    
    if (allTeamsHaveExactMatches) {
      // 성공적으로 모든 팀이 정확히 matchCount만큼 경기함
      return matches
    }
    
    attempts++
  }
  
  // 최대 시도 횟수를 초과했지만 정확한 매칭을 찾지 못한 경우
  // 남은 조합으로 추가 시도 (더 공격적인 접근)
  const teamsNeedingMatches = teams.filter(team => 
    (teamMatchCount.get(team) || 0) < matchCount
  )
  
  if (teamsNeedingMatches.length > 0) {
    // 남은 가능한 조합으로 추가 시도
    const remainingPairs = possiblePairs.filter(([t1, t2]) => {
      const pairKey1 = `${t1}|${t2}`
      const pairKey2 = `${t2}|${t1}`
      return !playedPairs.has(pairKey1) && !playedPairs.has(pairKey2)
    })
    
    // 남은 경기 수가 많은 팀부터 우선 매칭
    remainingPairs.sort(([t1a, t2a], [t1b, t2b]) => {
      const a1Remaining = matchCount - (teamMatchCount.get(t1a) || 0)
      const a2Remaining = matchCount - (teamMatchCount.get(t2a) || 0)
      const b1Remaining = matchCount - (teamMatchCount.get(t1b) || 0)
      const b2Remaining = matchCount - (teamMatchCount.get(t2b) || 0)
      const aMax = Math.max(a1Remaining, a2Remaining)
      const bMax = Math.max(b1Remaining, b2Remaining)
      return bMax - aMax
    })
    
    for (const [team1, team2] of remainingPairs) {
      const team1Count = teamMatchCount.get(team1) || 0
      const team2Count = teamMatchCount.get(team2) || 0
      
      // 두 팀 모두 정확히 matchCount만큼 경기했으면 스킵
      if (team1Count >= matchCount && team2Count >= matchCount) continue
      
      // 두 팀 모두 부족한 경우에만 추가
      if (team1Count < matchCount && team2Count < matchCount) {
        const pairKey1 = `${team1}|${team2}`
        matches.push({
          team1,
          team2,
          score1: null,
          score2: null,
          winner: null
        })
        playedPairs.add(pairKey1)
        teamMatchCount.set(team1, team1Count + 1)
        teamMatchCount.set(team2, team2Count + 1)
        
        // 모든 팀이 정확히 matchCount만큼 경기했는지 확인
        const allComplete = teams.every(team => 
          (teamMatchCount.get(team) || 0) === matchCount
        )
        if (allComplete) break
      }
    }
  }
  
  // 최종 검증: 모든 팀이 정확히 matchCount만큼 경기했는지 확인
  const finalCheck = teams.every(team => 
    (teamMatchCount.get(team) || 0) === matchCount
  )
  
  if (!finalCheck) {
    console.warn('일부 팀이 정확히 지정된 경기 수만큼 경기하지 못했습니다.')
    console.warn('팀별 경기 수:', Array.from(teamMatchCount.entries()).map(([team, count]) => `${team}: ${count}경기`))
    // 실패한 경우 빈 배열 반환하여 재시도 유도
    return []
  }
  
  // 중복 경기 검증: 같은 팀 조합이 두 번 이상 있는지 확인
  const matchPairs = new Set()
  for (const match of matches) {
    const pairKey1 = `${match.team1}|${match.team2}`
    const pairKey2 = `${match.team2}|${match.team1}`
    
    if (matchPairs.has(pairKey1) || matchPairs.has(pairKey2)) {
      console.error('중복 경기가 발견되었습니다!', match.team1, 'vs', match.team2)
      // 중복이 발견되면 해당 경기 제거
      const index = matches.indexOf(match)
      if (index > -1) {
        matches.splice(index, 1)
      }
      continue
    }
    
    matchPairs.add(pairKey1)
  }

  return matches
}

// 순위 계산
const calculateStandings = (teams, matches) => {
  const teamStats = new Map()
  
  teams.forEach(team => {
    teamStats.set(team, {
      teamId: team,
      teamName: team,
      wins: 0,
      losses: 0,
      pointsScored: 0,
      pointsConceded: 0,
      pointDiff: 0
    })
  })

  matches.forEach(match => {
    if (match.score1 !== null && match.score2 !== null && match.winner) {
      const team1Stats = teamStats.get(match.team1)
      const team2Stats = teamStats.get(match.team2)

      team1Stats.pointsScored += match.score1 || 0
      team1Stats.pointsConceded += match.score2 || 0
      team2Stats.pointsScored += match.score2 || 0
      team2Stats.pointsConceded += match.score1 || 0

      if (match.winner === 'team1') {
        team1Stats.wins++
        team2Stats.losses++
      } else {
        team2Stats.wins++
        team1Stats.losses++
      }
    }
  })

  // 득실차 계산
  teamStats.forEach(stats => {
    stats.pointDiff = stats.pointsScored - stats.pointsConceded
  })

  // 순위 정렬 (승률 > 득실차 > 득점)
  const standings = Array.from(teamStats.values()).sort((a, b) => {
    const winRateA = a.wins / (a.wins + a.losses) || 0
    const winRateB = b.wins / (b.wins + b.losses) || 0
    if (winRateB !== winRateA) return winRateB - winRateA
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
    return b.pointsScored - a.pointsScored
  })

  // 순위 할당
  standings.forEach((team, index) => {
    team.rank = index + 1
  })

  return standings
}

// 본선 진출 팀 결정
const determineAdvancingTeams = (standings, totalTeams) => {
  // 기본적으로 1~3등 진출
  const advancingCount = Math.min(3, Math.floor(totalTeams / 2))
  
  // 부전승이 없도록 조정 (본선이 2의 거듭제곱이 되도록)
  let finalBracketSize = 2
  while (finalBracketSize < advancingCount) {
    finalBracketSize *= 2
  }
  
  // 4등도 진출시켜야 할 경우
  if (finalBracketSize > advancingCount && standings.length >= 4) {
    standings.forEach(team => {
      if (team.rank <= finalBracketSize) {
        team.advances = true
      } else {
        team.advances = false
      }
    })
  } else {
    standings.forEach(team => {
      team.advances = team.rank <= advancingCount
    })
  }

  return standings.filter(team => team.advances)
}

// 본선 대진표 생성
const createFinalBracket = (advancingTeams) => {
  if (advancingTeams.length < 2) return null

  // 2의 거듭제곱으로 맞추기
  let bracketSize = 2
  while (bracketSize < advancingTeams.length) {
    bracketSize *= 2
  }

  // 팀을 순위대로 배치
  const teams = []
  for (let i = 0; i < bracketSize; i++) {
    if (i < advancingTeams.length) {
      // teamName은 \n으로 구분되어 있음
      const teamNameParts = advancingTeams[i].teamName.split('\n')
      teams.push({
        id: i + 1,
        player1: teamNameParts[0] || '',
        player2: teamNameParts[1] || '',
        teamName: advancingTeams[i].teamName,
        groupName: getGroupLabel(selectedViewGroupId.value)
      })
    } else {
      teams.push(null) // 부전승 자리
    }
  }

  // 토너먼트 라운드 생성
  const rounds = []
  let currentRoundTeams = [...teams]
  let roundNumber = 0

  // 첫 라운드
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

  // 다음 라운드들
  let remainingMatches = firstRound.length
  while (remainingMatches > 1) {
    const nextRound = []
    const matchesInRound = remainingMatches / 2
    
    for (let i = 0; i < matchesInRound; i++) {
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
    
    rounds.push([...nextRound])
    remainingMatches = matchesInRound
    roundNumber++
  }

  return rounds
}

// 경기 점수 업데이트
const updateMatchScore = (match) => {
  if (match.score1 === null || match.score1 === '') match.score1 = 0
  if (match.score2 === null || match.score2 === '') match.score2 = 0

  const score1 = Number(match.score1) || 0
  const score2 = Number(match.score2) || 0

  if (score1 > score2) {
    match.winner = 'team1'
  } else if (score2 > score1) {
    match.winner = 'team2'
  } else {
    match.winner = null
  }

  // 순위표 재계산
  updateStandings()
}

// 예선 완료 여부 확인
const isPreliminaryComplete = (matches) => {
  return matches.every(match => 
    match.score1 !== null && match.score2 !== null && match.winner !== null
  )
}

// 순위표 업데이트
const updateStandings = () => {
  if (!selectedViewGroupId.value || !leagueDataByGroup.value.has(selectedViewGroupId.value)) {
    return
  }

  const data = leagueDataByGroup.value.get(selectedViewGroupId.value)
  const teams = data.teams
  const matches = data.preliminaryMatches

  const standings = calculateStandings(teams, matches)
  const advancingTeams = determineAdvancingTeams(standings, teams.length)

  // 예선이 완료되면 본선 대진표 생성
  let finalBracket = data.finalBracket
  if (isPreliminaryComplete(matches) && advancingTeams.length >= 2) {
    finalBracket = createFinalBracket(advancingTeams)
  }

  data.standings = standings
  data.finalBracket = finalBracket

  leagueDataByGroup.value.set(selectedViewGroupId.value, data)
  saveLeagueData()
}

// 풀리그 생성
const generateFullLeague = () => {
  if (selectedGroupId.value === '') {
    alert('그룹을 선택해주세요.')
    return
  }

  if (selectedPlayers.value.length < 4) {
    alert('최소 4명(2팀)이 필요합니다.')
    return
  }

  if (selectedPlayers.value.length % 2 !== 0) {
    alert('홀수명은 선택할 수 없습니다.')
    return
  }

  if (!matchCount.value || matchCount.value < 2 || matchCount.value > 4) {
    alert('예선 경기 수를 선택해주세요. (2~4경기)')
    return
  }

  const group = props.groups.find(g => g.id === selectedGroupId.value)
  if (!group) return

  // 기존 대진표가 있는지 확인
  if (leagueDataByGroup.value.has(group.id)) {
    // 기존 대진표가 있으면 확인 모달 표시
    pendingBracketGeneration.value = () => {
      createFullLeagueInternal(group)
    }
    showResetConfirmModal.value = true
    return
  }

  // 대진표 생성 (팀 구성하기 모달에서 호출되므로 이미 초기화 확인 완료)
  createFullLeagueInternal(group)
}

const createFullLeagueInternal = (group) => {
  // 팀 구성 (2명씩)
  const teams = []
  for (let i = 0; i < selectedPlayers.value.length; i += 2) {
    const teamName = `${selectedPlayers.value[i]}\n${selectedPlayers.value[i + 1]}`
    teams.push(teamName)
  }

  // 수학적 가능성 사전 확인 (이미 selectMatchCount에서 검증했지만 이중 확인)
  const totalMatchesNeeded = (teams.length * matchCount.value) / 2
  if (teams.length % 2 === 1 && matchCount.value % 2 === 1) {
    const availableCounts = getAvailableMatchCounts(teams.length)
    invalidMatchCountInfo.value = {
      teamCount: teams.length,
      selectedCount: matchCount.value,
      availableCounts
    }
    showInvalidMatchCountModal.value = true
    return
  }
  
  // 랜덤 경기 생성 (실패 시 재시도)
  let preliminaryMatches = generateRandomMatches(teams, matchCount.value)
  let retryCount = 0
  const maxRetries = 10
  
  while (preliminaryMatches.length === 0 && retryCount < maxRetries) {
    retryCount++
    preliminaryMatches = generateRandomMatches(teams, matchCount.value)
  }
  
  if (preliminaryMatches.length === 0) {
    alert('경기 생성에 실패했습니다. 다시 시도해주세요.')
    return
  }

  // 초기 순위표
  const standings = teams.map(team => ({
    teamId: team,
    teamName: team,
    wins: 0,
    losses: 0,
    pointsScored: 0,
    pointsConceded: 0,
    pointDiff: 0,
    rank: 0,
    advances: false
  }))

  // 본선 대진표 (초기에는 빈 상태)
  const finalBracket = null

  const leagueData = {
    teams,
    preliminaryMatches,
    standings,
    finalBracket,
    matchCount: matchCount.value
  }

  leagueDataByGroup.value.set(group.id, leagueData)
  selectedViewGroupId.value = group.id
  currentPhase.value = 'preliminary'
  showEmptyState.value = false // empty-state 숨기기

  saveLeagueData()
  
  // 생성 완료 모달 표시 (다음 틱에서 표시하여 DOM 업데이트 보장)
  nextTick(() => {
    showSuccessModal.value = true
  })
}

const closeResetConfirmModal = () => {
  showResetConfirmModal.value = false
  pendingTeamSelectModal.value = null
  pendingBracketGeneration.value = null
  pendingReset.value = null
}

const confirmResetBracket = () => {
  // 초기화 함수가 있으면 실행
  if (pendingReset.value) {
    pendingReset.value()
    pendingReset.value = null
    closeResetConfirmModal()
    return
  }
  
  // 기존 대진표 삭제
  if (selectedGroupId.value && leagueDataByGroup.value.has(selectedGroupId.value)) {
    leagueDataByGroup.value.delete(selectedGroupId.value)
    saveLeagueData()
  }
  
  // 저장된 함수 실행 (팀 구성하기 모달 열기 또는 대진표 생성)
  if (pendingTeamSelectModal.value) {
    pendingTeamSelectModal.value()
    pendingTeamSelectModal.value = null
  } else if (pendingBracketGeneration.value) {
    pendingBracketGeneration.value()
    pendingBracketGeneration.value = null
  }
  
  closeResetConfirmModal()
}

// 대진표 초기화 함수 (확인 모달 표시)
const resetBracket = () => {
  if (!selectedGroupId.value) return
  
  const groupId = Number(selectedGroupId.value)
  if (!leagueDataByGroup.value?.has(groupId)) return
  
  // 초기화 함수를 저장하고 모달 표시
  pendingReset.value = resetBracketInternal
  showResetConfirmModal.value = true
}

// 실제 초기화 실행 함수
const resetBracketInternal = async () => {
  if (!selectedGroupId.value) return
  
  const groupId = Number(selectedGroupId.value)
  if (!leagueDataByGroup.value?.has(groupId)) return
  
  try {
    // 로컬에서 삭제
    leagueDataByGroup.value.delete(groupId)
    
    // selectedViewGroupId가 삭제된 그룹이면 null로 설정
    if (selectedViewGroupId.value === groupId) {
      selectedViewGroupId.value = null
    }
    
    // Realtime Database에서 삭제
    await deleteGroupBracketFromRealtime(PATHS.FULL_LEAGUE_TAB, 'default', groupId)
    
    // 저장
    saveLeagueData()
    
    console.log('✅ 대진표가 초기화되었습니다.')
  } catch (error) {
    console.error('❌ 대진표 초기화 실패:', error)
    alert('대진표 초기화에 실패했습니다.')
  }
}

// 우승자 처리
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
  }, 300)
}

const closeWinnerModal = () => {
  showWinnerModal.value = false
  showCelebration.value = false
  // 모달을 닫을 때는 lastChampionWinner를 초기화하지 않음 (같은 우승자 재표시 방지)
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

// Realtime Database 저장
const saveLeagueData = async () => {
  try {
    const state = {
      leagueDataByGroup: Object.fromEntries(leagueDataByGroup.value),
      selectedViewGroupId: selectedViewGroupId.value,
      currentPhase: currentPhase.value,
      selectedPlayers: selectedPlayers.value,
      selectedGroupId: selectedGroupId.value
    }
    
    // Realtime Database에 저장
    await saveBracketToRealtime(PATHS.FULL_LEAGUE_TAB, 'default', state)
    console.log('✅ Realtime Database에 풀리그 데이터 저장 완료')
  } catch (error) {
    console.error('풀리그 데이터 저장 실패:', error)
  }
}

// Realtime Database 불러오기
const loadLeagueData = async () => {
  try {
    let state = null
    
    // Realtime Database에서 불러오기 시도
    try {
      const realtimeData = await loadBracketFromRealtime(PATHS.FULL_LEAGUE_TAB, 'default')
      if (realtimeData) {
        state = realtimeData
      }
    } catch (realtimeError) {
      console.warn('Realtime Database 불러오기 실패:', realtimeError)
    }
    
    if (state) {
      if (state.leagueDataByGroup) {
        const validData = new Map()
        Object.entries(state.leagueDataByGroup).forEach(([groupId, data]) => {
          const groupIdNum = typeof groupId === 'string' ? parseInt(groupId) : groupId
          const group = props.groups.find(g => g.id === groupIdNum)
          if (group) {
            validData.set(groupIdNum, data)
          }
        })
        leagueDataByGroup.value = validData
        showEmptyState.value = validData.size === 0 // 데이터가 있으면 empty-state 숨기기

        if (state.selectedViewGroupId) {
          const groupIdNum = typeof state.selectedViewGroupId === 'string' 
            ? parseInt(state.selectedViewGroupId) 
            : state.selectedViewGroupId
          const group = props.groups.find(g => g.id === groupIdNum)
          if (group && validData.has(groupIdNum)) {
            selectedViewGroupId.value = groupIdNum
            currentPhase.value = state.currentPhase || 'preliminary'
          }
        }
      }
      
      // selectedPlayers와 selectedGroupId 불러오기
      if (state.selectedGroupId) {
        const groupIdNum = typeof state.selectedGroupId === 'string' 
          ? parseInt(state.selectedGroupId) 
          : state.selectedGroupId
        const group = props.groups.find(g => g.id === groupIdNum)
        if (group && state.selectedPlayers && Array.isArray(state.selectedPlayers)) {
          // 선택된 선수들이 해당 그룹에 존재하는지 확인
          const allPlayers = group.players
            .filter(p => p.name && p.name.trim())
            .map(p => p.name)
          selectedPlayers.value = state.selectedPlayers.filter(name => allPlayers.includes(name))
          selectedGroupId.value = groupIdNum
        }
      }
    }
  } catch (error) {
    console.error('풀리그 데이터 불러오기 실패:', error)
  }
}

// 데이터 변경 시 저장
watch(leagueDataByGroup, () => {
  saveLeagueData()
}, { deep: true })

watch(selectedViewGroupId, () => {
  saveLeagueData()
})

watch(currentPhase, () => {
  saveLeagueData()
})

watch(selectedPlayers, () => {
  saveLeagueData()
}, { deep: true })

watch(selectedGroupId, () => {
  saveLeagueData()
})

// 그룹 변경 시 초기화
watch(selectedGroupId, () => {
  selectedPlayers.value = []
  matchCount.value = null
})

// 컴포넌트 마운트 시 불러오기
onMounted(() => {
  loadLeagueData()
})
</script>

<style scoped>
.full-league-tab {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.league-controls {
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


.match-count-selector {
  display: flex;
  gap: 0;
  width: 100%;
}

.match-count-btn {
  flex: 1 1 0;
  min-width: 0;
  width: 0;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 0;
  background: white;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.match-count-btn:first-child {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.match-count-btn:last-child {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.match-count-btn:not(:first-child) {
  border-left: none;
}

.match-count-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.1), transparent);
  transition: left 0.4s;
}

.match-count-btn:hover::before {
  left: 100%;
}

.match-count-btn:hover {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.match-count-btn.active {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  transform: translateY(-2px) scale(1.02);
  animation: matchCountActive 0.3s ease-out;
}

@keyframes matchCountActive {
  0% {
    transform: translateY(-2px) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.05);
  }
  100% {
    transform: translateY(-2px) scale(1.02);
  }
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.generate-league-btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  min-height: 44px;
  position: relative;
  overflow: hidden;
}

.generate-league-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.generate-league-btn:hover::before {
  left: 100%;
}

.generate-league-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.45);
}

.generate-league-btn:active:not(:disabled) {
  transform: translateY(-1px) scale(1);
}

.generate-league-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #f44336;
  border-radius: 12px;
  background: white;
  color: #f44336;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.reset-btn:hover:not(:disabled) {
  background: #f44336;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.reset-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: #ccc;
  color: #ccc;
}

.team-select-btn {
  width: 100%;
  padding: 0.875rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  min-height: 44px;
  position: relative;
  overflow: hidden;
}

.team-select-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.team-select-btn:hover::before {
  left: 100%;
}

.team-select-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.45);
}

.team-select-btn:active:not(:disabled) {
  transform: translateY(-1px) scale(1);
}

.team-select-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


/* 모달 스타일 */
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
  border-radius: 24px;
  width: 100%;
  max-width: 680px;
  max-height: 75vh;
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
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  border-bottom: 2px solid rgba(76, 175, 80, 0.15);
  flex-shrink: 0;
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.modal-header h3 {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  color: #2E7D32;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.modal-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #6b7280;
}

.modal-close-btn:hover {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.modal-info-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(102, 187, 106, 0.08) 100%);
  border-radius: 10px;
  border: 1px solid rgba(76, 175, 80, 0.2);
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #4b5563;
  font-weight: 500;
  flex-shrink: 0;
}

.modal-info-card svg {
  color: #4CAF50;
  flex-shrink: 0;
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
  margin-bottom: 0.625rem;
  flex-shrink: 0;
}

.player-section-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
}

.player-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 0.3rem 0.625rem;
  border-radius: 8px;
}

.player-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.625rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.8) 100%);
  border-radius: 12px;
  border: 2px solid rgba(76, 175, 80, 0.15);
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  max-height: 100%;
}

.player-chip {
  padding: 0.875rem 1rem;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
  color: #374151;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  touch-action: manipulation;
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
  gap: 0.625rem;
  margin-top: 0.75rem;
  flex-shrink: 0;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(76, 175, 80, 0.1);
}

.clear-btn {
  flex: 1;
  padding: 0.875rem 0.875rem;
  font-size: 0.75rem;
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
  color: #ef4444;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  touch-action: manipulation;
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

.confirm-team-btn {
  flex: 2;
  padding: 0.875rem 0.875rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  font-weight: 800;
  transition: all 0.3s ease;
  touch-action: manipulation;
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

.confirm-team-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 32px rgba(76, 175, 80, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.confirm-team-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.confirm-team-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.league-container {
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

.league-container::after {
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
  transition: all 0.3s ease;
}

.group-tab:hover {
  border-color: rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
  transform: translateY(-1px);
}

.group-tab.active {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.league-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.phase-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.1);
}

.phase-tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  bottom: -2px;
}

.phase-tab:hover:not(:disabled) {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.05);
}

.phase-tab.active {
  color: #2E7D32;
  border-bottom-color: #4CAF50;
  font-weight: 700;
}

.phase-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.league-info-card {
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

.standings-section {
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.1);
}

.standings-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.1);
}

.standings-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
}

.standings-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.standings-table thead {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%);
}

.standings-table th {
  padding: 0.5rem 0.375rem;
  text-align: center;
  font-weight: 700;
  color: #2E7D32;
  font-size: 0.7rem;
  border-bottom: 2px solid rgba(76, 175, 80, 0.2);
  white-space: nowrap;
}

.standings-table td {
  padding: 0.5rem 0.375rem;
  border-bottom: 1px solid rgba(76, 175, 80, 0.1);
  font-size: 0.75rem;
  text-align: center;
}

.standings-table tbody tr:hover {
  background: rgba(76, 175, 80, 0.05);
}

.standings-table tbody tr.advances {
  background: rgba(76, 175, 80, 0.1);
}

.rank-cell {
  font-weight: 700;
  font-size: 0.8rem;
  text-align: center;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
}

.rank-cell.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #8B4513;
  font-size: 0.85rem;
}

.rank-cell.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
  color: #2C2C2C;
  font-size: 0.8rem;
}

.rank-cell.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
  color: #3E2723;
  font-size: 0.8rem;
}

.rank-cell.rank-4 {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(102, 187, 106, 0.3) 100%);
  color: #1B5E20;
  font-size: 0.75rem;
}

.team-cell {
  font-weight: 600;
  color: #2E7D32;
  font-size: 0.7rem;
  text-align: center;
  white-space: pre-line;
  line-height: 1.4;
}

.win-cell {
  color: #2196F3;
  font-weight: 600;
  font-size: 0.7rem;
}

.loss-cell {
  color: #f44336;
  font-weight: 600;
  font-size: 0.7rem;
}

.points-cell {
  font-weight: 500;
  font-size: 0.7rem;
}

.diff-cell {
  font-weight: 600;
  font-size: 0.7rem;
}

.diff-cell.positive {
  color: #2196F3;
}

.diff-cell.negative {
  color: #f44336;
}

.advance-cell {
  text-align: center;
}

.advance-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 700;
}

.no-advance {
  color: #999;
  font-size: 0.7rem;
}

.matches-section {
  margin-top: 1rem;
}

.matches-header {
  margin-bottom: 0.75rem;
}

.matches-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}

.match-card {
  background: white;
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.match-card.has-score {
  border-color: #4CAF50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(102, 187, 106, 0.05) 100%);
}

.match-card.has-winner {
  border-color: #4CAF50;
  border-width: 2px;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
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
  border-color: #4CAF50;
  border-width: 2px;
  font-weight: 700;
}

.team-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #2E7D32;
  flex: 1;
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

.bracket-container-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  padding: 0.75rem 0.5rem;
}

.empty-bracket {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
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
  padding: 1rem;
  overflow-y: auto;
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
  margin: auto;
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
  color: #2E7D32;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.winner-content {
  margin-bottom: 2rem;
}

.winner-names {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.6;
  word-break: keep-all;
}

.winner-close-btn {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.winner-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.winner-close-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .winner-modal-overlay {
    padding: 0.5rem;
  }

  .winner-modal {
    max-height: 90vh;
  }
}

/* 경기 수 불가능 모달 */
.invalid-match-count-modal {
  max-width: 500px;
}

.invalid-match-count-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.invalid-info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%);
  border-radius: 12px;
  border: 2px solid rgba(244, 67, 54, 0.3);
}

.invalid-info-card svg {
  color: #f44336;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.invalid-info-text {
  flex: 1;
}

.invalid-info-text p {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #1f2937;
}

.invalid-info-text p:last-child {
  margin-bottom: 0;
}

.invalid-info-text strong {
  color: #f44336;
  font-weight: 700;
}

.invalid-reason {
  color: #6b7280;
  font-size: 0.85rem;
}

.invalid-calculation {
  color: #92400e;
  font-weight: 600;
  font-size: 0.85rem;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

.available-counts-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.available-counts-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #2E7D32;
}

.available-counts-list {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.available-count-btn {
  flex: 1;
  min-width: 100px;
  padding: 0.875rem 1.25rem;
  border: 2px solid #4CAF50;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.available-count-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.available-count-btn:active {
  transform: translateY(0);
}

.no-available-counts {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}

.no-available-counts p {
  margin: 0.5rem 0;
}

.no-available-suggestion {
  color: #f44336;
  font-weight: 600;
  margin-top: 0.75rem !important;
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

@media (min-width: 481px) {
  .league-container {
    padding: 1.75rem 1rem;
    border-radius: 18px;
  }

  .league-container::after {
    border-radius: 18px;
  }

  .matches-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (min-width: 769px) {
  .league-container {
    padding: 2rem 1.5rem;
    border-radius: 24px;
  }

  .league-container::after {
    border-radius: 24px;
  }

  .matches-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}

@media (min-width: 481px) {
  .modal-content {
    max-width: 700px;
    border-radius: 24px;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
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
    max-height: 75vh;
    width: calc(100% - 1rem);
    margin: 0 auto;
  }

  .modal-header {
    padding: 0.75rem 1rem;
  }

  .modal-body {
    padding: 0.875rem;
  }

  .modal-header h3 {
    font-size: 0.9rem;
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
}

/* 대진표 초기화 확인 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2rem;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: modalSlideUp 0.3s ease;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

