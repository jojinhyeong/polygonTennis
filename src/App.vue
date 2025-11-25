<template>
  <div class="app">
    <div class="background-pattern"></div>
    <div class="app-content">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-icon">
              <span class="tennis-ball-emoji">🎾</span>
            </div>
            <h1 class="app-title">폴리곤테니스</h1>
          </div>
        </div>
      </header>

      <nav class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon" v-html="tab.icon"></span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </nav>

      <div class="content-container">
        <div v-if="activeTab === 'groups'" class="bulk-add-section">
          <button class="guide-btn" @click="showGuideModal = true" title="그룹 관리 사용 방법을 확인하세요">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="white" stroke="#2196F3" stroke-width="2"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="#2196F3" stroke-width="2" stroke-linecap="round"></line>
            </svg>
            <span>사용법</span>
          </button>
          <Tooltip text="여러 선수를 한 번에 추가할 수 있습니다" position="bottom">
            <button class="bulk-add-top-btn" @click="showGroupSelectModal = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>선수 일괄 추가</span>
            </button>
          </Tooltip>
          <button class="save-groups-btn" @click="saveGroupsManually" title="그룹 데이터 저장">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>저장</span>
          </button>
        </div>

        <Transition name="fade-slide" mode="out-in">
          <GroupManager
            v-if="activeTab === 'groups'"
            :groups="groups"
            @add-group="addGroup"
            @remove-group="removeGroup"
            @update-group="updateGroup"
            key="groups"
          />
          <BracketTab
            v-else-if="activeTab === 'bracket'"
            :groups="groups"
            @update-bracket="updateBracket"
            @show-guide="showBracketGuideModal = true"
            @open-team-select="handleOpenTeamSelect"
            @close-team-select="closeTeamSelectModal"
            ref="bracketTabRef"
            key="bracket"
          />
          <RandomBracketTab
            v-else-if="activeTab === 'random'"
            :groups="groups"
            @show-guide="showRandomGuideModal = true"
            @generate-random="generateRandomBracket"
            key="random"
          />
          <KDKTab
            v-else-if="activeTab === 'kdk'"
            :groups="groups"
            @show-guide="showKDKGuideModal = true"
            key="kdk"
          />
          <FullLeagueTab
            v-else-if="activeTab === 'fullleague'"
            :groups="groups"
            @show-guide="showFullLeagueGuideModal = true"
            key="fullleague"
          />
        </Transition>
      </div>

      <!-- 그룹 선택 모달 -->
      <div v-if="showGroupSelectModal" class="modal-overlay" @click.self="showGroupSelectModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>그룹 선택</h3>
            <button class="modal-close-btn" @click="showGroupSelectModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint">선수를 추가할 그룹을 선택하세요</p>
            <div class="group-select-list">
              <button
                v-for="group in groups"
                :key="group.id"
                class="group-select-btn"
                @click="selectGroupForBulkAdd(group.id)"
              >
                <div class="group-select-info">
                  <span class="group-select-name">{{ group.name }}</span>
                  <span class="group-select-count">{{ group.players.length }}명</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 그룹 관리 사용 가이드 모달 -->
      <div v-if="showGuideModal" class="modal-overlay" @click.self="closeGuideModal">
        <div class="modal-content guide-modal">
          <div class="modal-header">
            <h3>그룹 관리 사용 가이드</h3>
            <button class="modal-close-btn" @click="closeGuideModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body guide-body">
            <div class="guide-section">
              <div class="guide-step">
                <div class="guide-step-number">1</div>
                <div class="guide-step-content">
                  <h4>그룹 생성</h4>
                  <p>하단의 "새 그룹 추가" 버튼을 클릭하여 새로운 그룹을 생성합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">2</div>
                <div class="guide-step-content">
                  <h4>선수 추가 방법</h4>
                  <p><strong>개별 추가:</strong> 각 그룹 카드의 "선수 추가" 버튼을 클릭하여 한 명씩 추가합니다.</p>
                  <p><strong>일괄 추가:</strong> 상단의 "선수 일괄 추가" 버튼을 클릭하여 여러 선수를 한 번에 추가합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">3</div>
                <div class="guide-step-content">
                  <h4>선수 관리</h4>
                  <p>선수 이름을 클릭하여 수정할 수 있고, 삭제 버튼으로 선수를 제거할 수 있습니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">4</div>
                <div class="guide-step-content">
                  <h4>그룹 활용</h4>
                  <p>생성한 그룹은 다른 탭(토너먼트, 랜덤 대진표, KDK, 풀리그)에서 사용할 수 있습니다.</p>
                </div>
              </div>
            </div>
            <div class="guide-footer">
              <label class="guide-checkbox">
                <input type="checkbox" v-model="dontShowAgain" />
                <span>다시 보지 않기</span>
              </label>
              <button class="guide-close-btn" @click="closeGuideModal">
                확인
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 팀 선택 사용 가이드 모달 -->
      <div v-if="showBracketGuideModal" class="modal-overlay" @click.self="closeBracketGuideModal">
        <div class="modal-content guide-modal">
          <div class="modal-header">
            <h3>팀 선택 사용 가이드</h3>
            <button class="modal-close-btn" @click="closeBracketGuideModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body guide-body">
            <div class="guide-section">
              <div class="guide-step">
                <div class="guide-step-number">1</div>
                <div class="guide-step-content">
                  <h4>그룹 선택</h4>
                  <p>먼저 선수를 추가한 그룹을 선택합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">2</div>
                <div class="guide-step-content">
                  <h4>팀 선택</h4>
                  <p>"팀 선택" 버튼을 클릭하면 선수 선택 화면이 열립니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">3</div>
                <div class="guide-step-content">
                  <h4>선수 선택</h4>
                  <p>선수 목록에서 팀을 구성할 선수들을 <strong>순서대로</strong> 선택합니다. 선택한 순서대로 2명씩 팀이 구성됩니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">4</div>
                <div class="guide-step-content">
                  <h4>팀 수 제한</h4>
                  <p>토너먼트를 위해 팀 수는 <strong>2, 4, 8, 16...</strong> (2의 거듭제곱)이어야 합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">5</div>
                <div class="guide-step-content">
                  <h4>대진표 생성</h4>
                  <p>"대진표 생성" 버튼을 클릭하면 복식 토너먼트 대진표가 생성됩니다.</p>
                </div>
              </div>
            </div>
            <div class="guide-footer">
              <label class="guide-checkbox">
                <input type="checkbox" v-model="dontShowBracketGuideAgain" />
                <span>다시 보지 않기</span>
              </label>
              <button class="guide-close-btn" @click="closeBracketGuideModal">
                확인
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 팀 랜덤 사용 가이드 모달 -->
      <div v-if="showRandomGuideModal" class="modal-overlay" @click.self="closeRandomGuideModal">
        <div class="modal-content guide-modal">
          <div class="modal-header">
            <h3>팀 랜덤 사용 가이드</h3>
            <button class="modal-close-btn" @click="closeRandomGuideModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body guide-body">
            <div class="guide-section">
              <div class="guide-step">
                <div class="guide-step-number">1</div>
                <div class="guide-step-content">
                  <h4>그룹 선택</h4>
                  <p>먼저 선수를 추가한 그룹을 선택합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">2</div>
                <div class="guide-step-content">
                  <h4>랜덤 대진 생성</h4>
                  <p>"랜덤 대진 생성" 버튼을 클릭하면 그룹의 선수들이 <strong>랜덤으로</strong> 2명씩 팀을 구성하여 대진표가 생성됩니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">3</div>
                <div class="guide-step-content">
                  <h4>팀 수 제한</h4>
                  <p>토너먼트를 위해 팀 수는 <strong>2, 4, 8, 16...</strong> (2의 거듭제곱)이어야 합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">4</div>
                <div class="guide-step-content">
                  <h4>대진표 확인</h4>
                  <p>생성된 대진표에서 경기 결과를 입력하고 우승자를 확인할 수 있습니다.</p>
                </div>
              </div>
            </div>
            <div class="guide-footer">
              <label class="guide-checkbox">
                <input type="checkbox" v-model="dontShowRandomGuideAgain" />
                <span>다시 보지 않기</span>
              </label>
              <button class="guide-close-btn" @click="closeRandomGuideModal">
                확인
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 한울AA 사용 가이드 모달 -->
      <div v-if="showKDKGuideModal" class="modal-overlay" @click.self="closeKDKGuideModal">
        <div class="modal-content guide-modal">
          <div class="modal-header">
            <h3>한울AA 사용 가이드</h3>
            <button class="modal-close-btn" @click="closeKDKGuideModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body guide-body">
            <div class="guide-section">
              <div class="guide-step">
                <div class="guide-step-number">1</div>
                <div class="guide-step-content">
                  <h4>그룹 선택</h4>
                  <p>먼저 선수를 추가한 그룹을 선택합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">2</div>
                <div class="guide-step-content">
                  <h4>시드 선택 (선택사항)</h4>
                  <p>강자끼리 팀이 되지 않도록 시드를 선택할 수 있습니다. 실력 차이가 나는 소수의 선수끼리 파트너가 되는 경우를 피하고 싶을 때 사용합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">3</div>
                <div class="guide-step-content">
                  <h4>대진표 생성</h4>
                  <p>"한울AA 대진표 생성" 버튼을 클릭하면 한울AA 리그전 대진표가 생성됩니다. 한울AA는 모든 선수가 4경기를 진행하는 방식입니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">4</div>
                <div class="guide-step-content">
                  <h4>경기 진행</h4>
                  <p>생성된 대진표에서 경기 결과를 입력하고 최종 순위를 확인할 수 있습니다.</p>
                </div>
              </div>
            </div>
            <div class="guide-footer">
              <label class="guide-checkbox">
                <input type="checkbox" v-model="dontShowKDKGuideAgain" />
                <span>다시 보지 않기</span>
              </label>
              <button class="guide-close-btn" @click="closeKDKGuideModal">
                확인
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 풀리그 사용 가이드 모달 -->
      <div v-if="showFullLeagueGuideModal" class="modal-overlay" @click.self="closeFullLeagueGuideModal">
        <div class="modal-content guide-modal">
          <div class="modal-header">
            <h3>풀리그 사용 가이드</h3>
            <button class="modal-close-btn" @click="closeFullLeagueGuideModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body guide-body">
            <div class="guide-section">
              <div class="guide-step">
                <div class="guide-step-number">1</div>
                <div class="guide-step-content">
                  <h4>그룹 선택</h4>
                  <p>먼저 선수를 추가한 그룹을 선택합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">2</div>
                <div class="guide-step-content">
                  <h4>팀 구성하기</h4>
                  <p>"팀 구성하기" 버튼을 클릭하면 선수 선택 화면이 열립니다. <strong>짝수명</strong>만 선택 가능합니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">3</div>
                <div class="guide-step-content">
                  <h4>선수 선택</h4>
                  <p>선수 목록에서 풀리그에 참가할 선수들을 <strong>순서대로</strong> 선택합니다. 선택한 순서대로 2명씩 팀이 구성됩니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">4</div>
                <div class="guide-step-content">
                  <h4>예선 경기수 선택</h4>
                  <p>선수 선택 후 예선 리그에서 각 팀이 진행할 경기 수를 선택합니다. 경기 수는 팀 수에 따라 자동으로 계산되며, 원하는 경기 수를 선택할 수 있습니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">5</div>
                <div class="guide-step-content">
                  <h4>풀리그 생성</h4>
                  <p>"풀리그 생성" 버튼을 클릭하면 선택한 경기 수에 따라 모든 팀이 서로 경기하는 풀리그 대진표가 생성됩니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">6</div>
                <div class="guide-step-content">
                  <h4>예선 경기 진행</h4>
                  <p>생성된 예선 리그 대진표에서 경기 결과를 입력하고 순위를 확인할 수 있습니다.</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="guide-step-number">7</div>
                <div class="guide-step-content">
                  <h4>본선 토너먼트</h4>
                  <p>예선 리그의 모든 경기가 완료되면, 상단의 "본선 토너먼트" 탭이 활성화됩니다. 본선 토너먼트에서는 예선 순위에 따라 토너먼트 대진표가 자동으로 생성되어 우승자를 결정합니다.</p>
                </div>
              </div>
            </div>
            <div class="guide-footer">
              <label class="guide-checkbox">
                <input type="checkbox" v-model="dontShowFullLeagueGuideAgain" />
                <span>다시 보지 않기</span>
              </label>
              <button class="guide-close-btn" @click="closeFullLeagueGuideModal">
                확인
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 팀 구성하기 모달 -->
      <div v-if="showTeamSelectModal" class="modal-overlay" @click.self="closeTeamSelectModal">
        <div class="modal-content team-select-modal" style="max-width: 800px;">
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
                <p class="modal-subtitle">{{ getBracketGroupName }}</p>
              </div>
            </div>
            <button class="modal-close-btn" @click="closeTeamSelectModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">
            <div class="modal-info-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>선수들을 선택한 순서대로 2명씩 팀이 구성됩니다</span>
            </div>
            <div v-if="bracketTabRef?.selectedPlayers && bracketTabRef.selectedPlayers.length >= 4 && (!bracketTabRef.isTeamCountValid || bracketTabRef.selectedPlayers.length % 2 !== 0) && bracketTabRef.getTeamCountSuggestion" class="team-count-alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div class="team-count-alert-content">
                <div v-if="bracketTabRef.selectedPlayers.length % 2 !== 0">홀수명은 선택할 수 없습니다. (현재: {{ bracketTabRef.selectedPlayers.length }}명)</div>
                <div v-else>토너먼트를 위해 팀 수는 2, 4, 8, 16... 이어야 합니다.</div>
                <div class="team-count-suggestion" v-if="bracketTabRef.getTeamCountSuggestion">현재: {{ bracketTabRef.getTeamCount }}팀 ({{ bracketTabRef.selectedPlayers.length }}명) → 추천: {{ bracketTabRef.getTeamCountSuggestion.teamCount }}팀 ({{ bracketTabRef.getTeamCountSuggestion.playerCount }}명, {{ bracketTabRef.getTeamCountSuggestion.diff }}명 {{ bracketTabRef.getTeamCountSuggestion.action }})</div>
              </div>
            </div>

            <!-- 선수 목록 -->
            <div v-if="bracketTabRef" class="player-section">
              <div class="player-section-header">
                <h4 class="player-section-title">선수 선택</h4>
                <span class="player-count">{{ bracketTabRef.availablePlayers?.length || 0 }}명</span>
              </div>
              <div class="player-list-grid">
                <button
                  v-for="player in bracketTabRef.availablePlayers || []"
                  :key="player"
                  :class="['player-chip', {
                    selected: bracketTabRef.selectedPlayers?.includes(player)
                  }]"
                  @click="bracketTabRef.togglePlayer(player)"
                >
                  <span class="player-name">{{ player }}</span>
                  <span v-if="bracketTabRef.selectedPlayers?.includes(player)" class="selection-order">
                    {{ bracketTabRef.getSelectionOrder(player) }}
                  </span>
                </button>
              </div>
            </div>
            <div v-else class="player-section">
              <div style="text-align: center; padding: 2rem; color: #9ca3af;">
                <p>로딩 중...</p>
              </div>
            </div>

            <div v-if="bracketTabRef" class="team-select-actions">
              <button class="clear-btn" @click="bracketTabRef.clearSelection()" :disabled="!bracketTabRef.selectedPlayers || bracketTabRef.selectedPlayers.length === 0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>전체 해제</span>
              </button>
              <button 
                class="generate-bracket-btn" 
                :class="{ 'invalid-team-count': bracketTabRef.selectedPlayers && bracketTabRef.selectedPlayers.length >= 4 && (!bracketTabRef.isTeamCountValid || bracketTabRef.selectedPlayers.length % 2 !== 0) }"
                @click="bracketTabRef.generateBracketFromSelected()" 
                :disabled="!bracketTabRef.selectedPlayers || bracketTabRef.selectedPlayers.length < 4 || bracketTabRef.selectedPlayers.length % 2 !== 0 || !bracketTabRef.isTeamCountValid"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span>대진표 생성 ({{ bracketTabRef.getTeamCount || 0 }}팀)</span>
                <span v-if="bracketTabRef.selectedPlayers && bracketTabRef.selectedPlayers.length >= 4 && (!bracketTabRef.isTeamCountValid || bracketTabRef.selectedPlayers.length % 2 !== 0)" class="team-count-warning">⚠️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 일괄 추가 모달 -->
      <div v-if="showBulkAddModal" class="modal-overlay" @click.self="closeBulkAddModal">
        <div class="modal-content bulk-add-modal">
          <div class="modal-header">
            <h3>선수 일괄 추가 - {{ selectedGroupName }}</h3>
            <button class="modal-close-btn" @click="closeBulkAddModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint">아래 선수 목록에서 추가할 선수를 선택하세요</p>
            <div class="player-list-grid">
              <button
                v-for="player in availablePlayersForGroup"
                :key="player.name"
                :class="['player-chip', { 
                  selected: selectedPlayers.includes(player.name),
                  disabled: player.isAdded
                }]"
                @click="!player.isAdded && togglePlayer(player.name)"
                :disabled="player.isAdded"
                :title="player.isAdded ? '이미 추가된 선수입니다' : ''"
              >
                {{ player.name }}
                <span v-if="player.isAdded" class="added-badge">추가됨</span>
              </button>
            </div>
            <div class="bulk-add-actions">
              <button class="select-all-btn" @click="selectAllPlayers">
                전체 선택
              </button>
              <button class="add-selected-btn" @click="addSelectedPlayersToGroup" :disabled="selectedPlayers.length === 0">
                선택한 {{ selectedPlayers.length }}명 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 맨 위로 가기 버튼 -->
    <button 
      v-if="showScrollToTop"
      class="scroll-to-top-btn"
      @click="scrollToTop"
      aria-label="맨 위로"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import GroupManager from './components/GroupManager.vue'
import BracketTab from './components/BracketTab.vue'
import RandomBracketTab from './components/RandomBracketTab.vue'
import KDKTab from './components/KDKTab.vue'
import FullLeagueTab from './components/FullLeagueTab.vue'
import Tooltip from './components/Tooltip.vue'
import { saveGroupsToRealtime, loadGroupsFromRealtime, testRealtimeConnection, deleteGroupBracketFromRealtime, PATHS } from './firebase/realtimeService'

const activeTab = ref('groups')
const showGroupSelectModal = ref(false)
const showBulkAddModal = ref(false)
const showGuideModal = ref(false)
const showBracketGuideModal = ref(false)
const showRandomGuideModal = ref(false)
const showKDKGuideModal = ref(false)
const showFullLeagueGuideModal = ref(false)
const showTeamSelectModal = ref(false)
const bracketTabRef = ref(null)
const selectedGroupId = ref(null)
const selectedPlayers = ref([])
const showScrollToTop = ref(false)
const dontShowAgain = ref(false)
const dontShowBracketGuideAgain = ref(false)
const dontShowRandomGuideAgain = ref(false)
const dontShowKDKGuideAgain = ref(false)
const dontShowFullLeagueGuideAgain = ref(false)
const teamSelectGroupId = ref(null)

// 제공된 선수 목록
const availablePlayers = [
  '고바우', '김동혁', '김시편', '김지은', '김태형', '김형수', '김혜민', '김혜선',
  '류수영', '민선기', '박기백', '박리롱', '박성용', '박윤진', '박정음', '박혜림',
  '백인호', '성수빈', '송슨곤', '송승훈', '유동균', '유제금', '윤여명', '이다솜',
  '이민우', '이종훈', '이혜지', '임보아', '장완희', '장인혜', '전민경', '전성현',
  '정우빈', '진철현', '조진형', '양준석', '황원기'
]

const selectedGroupName = computed(() => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  return group ? group.name : ''
})

const availablePlayersForGroup = computed(() => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  if (!group) return availablePlayers.map(name => ({ name, isAdded: false }))
  
  const existingNames = group.players.map(p => p.name)
  return availablePlayers.map(name => ({
    name,
    isAdded: existingNames.includes(name)
  }))
})

const selectGroupForBulkAdd = (groupId) => {
  selectedGroupId.value = groupId
  showGroupSelectModal.value = false
  showBulkAddModal.value = true
  selectedPlayers.value = []
}

const togglePlayer = (playerName) => {
  // 이미 추가된 선수는 선택할 수 없음
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  if (group) {
    const existingNames = group.players.map(p => p.name)
    if (existingNames.includes(playerName)) {
      return
    }
  }
  
  const index = selectedPlayers.value.indexOf(playerName)
  if (index > -1) {
    selectedPlayers.value.splice(index, 1)
  } else {
    selectedPlayers.value.push(playerName)
  }
}

const selectAllPlayers = () => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  if (group) {
    const existingNames = group.players.map(p => p.name)
    selectedPlayers.value = availablePlayers.filter(name => !existingNames.includes(name))
  } else {
    selectedPlayers.value = [...availablePlayers]
  }
}

const addSelectedPlayersToGroup = () => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  if (group && selectedPlayers.value.length > 0) {
    selectedPlayers.value.forEach(playerName => {
      if (!group.players.some(p => p.name === playerName)) {
        group.players.push({ name: playerName })
      }
    })
    updateGroup(selectedGroupId.value, { players: group.players })
    closeBulkAddModal()
  }
}

const closeBulkAddModal = () => {
  showBulkAddModal.value = false
  selectedGroupId.value = null
  selectedPlayers.value = []
}

const closeGuideModal = () => {
  showGuideModal.value = false
  if (dontShowAgain.value) {
    localStorage.setItem('polygonTennis_guideShown', 'true')
  }
  dontShowAgain.value = false
}

const closeBracketGuideModal = () => {
  showBracketGuideModal.value = false
  if (dontShowBracketGuideAgain.value) {
    localStorage.setItem('polygonTennis_bracketGuideShown', 'true')
  }
  dontShowBracketGuideAgain.value = false
}

const closeRandomGuideModal = () => {
  showRandomGuideModal.value = false
  if (dontShowRandomGuideAgain.value) {
    localStorage.setItem('polygonTennis_randomGuideShown', 'true')
  }
  dontShowRandomGuideAgain.value = false
}

const closeKDKGuideModal = () => {
  showKDKGuideModal.value = false
  if (dontShowKDKGuideAgain.value) {
    localStorage.setItem('polygonTennis_kdkGuideShown', 'true')
  }
  dontShowKDKGuideAgain.value = false
}

const closeFullLeagueGuideModal = () => {
  showFullLeagueGuideModal.value = false
  if (dontShowFullLeagueGuideAgain.value) {
    localStorage.setItem('polygonTennis_fullLeagueGuideShown', 'true')
  }
  dontShowFullLeagueGuideAgain.value = false
}

const handleOpenTeamSelect = (groupId) => {
  console.log('handleOpenTeamSelect called with groupId:', groupId)
  console.log('Current activeTab:', activeTab.value)
  console.log('Current bracketTabRef:', bracketTabRef.value)
  teamSelectGroupId.value = groupId
  
  // activeTab이 'bracket'이 아니면 먼저 탭을 변경
  if (activeTab.value !== 'bracket') {
    console.log('Switching to bracket tab')
    activeTab.value = 'bracket'
    
    // nextTick을 여러 번 사용하여 컴포넌트가 마운트될 때까지 기다림
    nextTick(() => {
      nextTick(() => {
        if (bracketTabRef.value) {
          console.log('bracketTabRef found after tab switch (nextTick), opening modal')
          bracketTabRef.value.selectedGroupId = groupId
          bracketTabRef.value.selectedPlayers = []
          showTeamSelectModal.value = true
        } else {
          console.log('bracketTabRef still null, waiting with setTimeout')
          // 추가 대기 시간
          setTimeout(() => {
            if (bracketTabRef.value) {
              console.log('bracketTabRef found after setTimeout, opening modal')
              bracketTabRef.value.selectedGroupId = groupId
              bracketTabRef.value.selectedPlayers = []
              showTeamSelectModal.value = true
            } else {
              console.error('bracketTabRef is still null after all waits')
              alert('팀 선택 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.')
            }
          }, 300)
        }
      })
    })
  } else {
    // 이미 bracket 탭이 활성화되어 있으면 바로 처리
    console.log('Already on bracket tab')
    if (bracketTabRef.value) {
      console.log('bracketTabRef exists, opening modal')
      bracketTabRef.value.selectedGroupId = groupId
      bracketTabRef.value.selectedPlayers = []
      showTeamSelectModal.value = true
    } else {
      console.log('bracketTabRef is null on bracket tab, waiting...')
      // ref가 없으면 기다림
      nextTick(() => {
        if (bracketTabRef.value) {
          console.log('bracketTabRef found after nextTick, opening modal')
          bracketTabRef.value.selectedGroupId = groupId
          bracketTabRef.value.selectedPlayers = []
          showTeamSelectModal.value = true
        } else {
          setTimeout(() => {
            if (bracketTabRef.value) {
              console.log('bracketTabRef found after setTimeout, opening modal')
              bracketTabRef.value.selectedGroupId = groupId
              bracketTabRef.value.selectedPlayers = []
              showTeamSelectModal.value = true
            } else {
              console.error('bracketTabRef is still null after timeout')
              alert('팀 선택 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.')
            }
          }, 300)
        }
      })
    }
  }
}

const closeTeamSelectModal = () => {
  showTeamSelectModal.value = false
  if (bracketTabRef.value) {
    bracketTabRef.value.selectedPlayers = []
  }
  teamSelectGroupId.value = null
}

// BracketTab에서 모달 닫기 이벤트 수신
watch(() => bracketTabRef.value, (newRef) => {
  if (newRef) {
    // 모달이 닫혀야 할 때 감지
    watch(() => newRef.selectedPlayers, () => {
      // 대진표 생성 후 모달이 자동으로 닫히도록 처리
    })
  }
})

const getBracketGroupName = computed(() => {
  if (!teamSelectGroupId.value) return ''
  const group = groups.value.find(g => g.id === teamSelectGroupId.value)
  if (!group) return ''
  
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
  
  return getGroupLabel(group.id)
})

const tabs = [
  { 
    id: 'groups', 
    label: '그룹 관리',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  },
  { 
    id: 'bracket', 
    label: '팀 선택',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>'
  },
  { 
    id: 'random', 
    label: '팀 랜덤',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
  },
  { 
    id: 'kdk', 
    label: '한울AA',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
  },
  { 
    id: 'fullleague', 
    label: '풀리그',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3zM3 9h18M9 3v18"></path></svg>'
  }
]

// Realtime Database에서 그룹 불러오기
const loadGroupsFromStorage = async () => {
  console.log('=== 그룹 불러오기 시작 ===')
  try {
    console.log('Realtime Database에서 그룹 데이터 불러오기 시도...')
    const realtimeGroups = await loadGroupsFromRealtime('default')
    console.log('Realtime Database 응답:', realtimeGroups)
    
    if (realtimeGroups && Array.isArray(realtimeGroups) && realtimeGroups.length > 0) {
      // 각 그룹에 players 배열이 없으면 빈 배열로 초기화
      const normalizedGroups = realtimeGroups.map(group => ({
        ...group,
        players: group.players || []
      }))
      console.log('✅ Realtime Database에서 그룹 데이터를 불러왔습니다:', normalizedGroups.length, '개 그룹')
      console.log('불러온 그룹:', normalizedGroups)
      console.log('=== 그룹 불러오기 완료 ===')
      return normalizedGroups
    } else {
      console.log('⚠️ Realtime Database에 그룹 데이터가 없습니다.')
    }
  } catch (realtimeError) {
    console.error('❌ Realtime Database 불러오기 실패:', realtimeError)
    console.error('에러 코드:', realtimeError?.code)
    console.error('에러 메시지:', realtimeError?.message)
  }
  
  // 기본값 반환 (데이터가 없을 경우)
  console.log('기본 그룹 데이터를 사용합니다')
  console.log('=== 그룹 불러오기 완료 ===')
  return [
    {
      id: 1,
      name: '그룹 1',
      players: []
    }
  ]
}

// 비어있는 선수 제거 함수 (변경 여부 반환)
const removeEmptyPlayers = () => {
  let hasChanges = false
  groups.value.forEach(group => {
    if (group.players && Array.isArray(group.players)) {
      const originalLength = group.players.length
      group.players = group.players.filter(player => 
        player && player.name && player.name.trim() !== ''
      )
      if (group.players.length !== originalLength) {
        hasChanges = true
      }
    }
  })
  return hasChanges
}

// 저장 중 플래그 (무한 루프 방지)
let isSaving = false
let isRemovingEmpty = false

// 그룹을 Firestore에 저장 (비어있는 선수 제거 없이)
const saveGroupsToStorage = async (skipRemoveEmpty = false) => {
  if (isSaving) {
    console.log('⚠️ 이미 저장 중입니다. 건너뜁니다.')
    return // 이미 저장 중이면 무시
  }
  
  console.log('=== 그룹 저장 함수 호출 ===')
  console.log('현재 그룹 수:', groups.value.length)
  console.log('skipRemoveEmpty:', skipRemoveEmpty)
  console.log('isRemovingEmpty:', isRemovingEmpty)
  
  try {
    isSaving = true
    // skipRemoveEmpty가 false일 때만 비어있는 선수 제거
    if (!skipRemoveEmpty && !isRemovingEmpty) {
      isRemovingEmpty = true
      removeEmptyPlayers()
      isRemovingEmpty = false
    }
    
    console.log('Realtime Database 저장 시도...')
    console.log('저장할 그룹:', groups.value)
    
    // Realtime Database에 저장
    await saveGroupsToRealtime('default', groups.value)
    console.log('✅ Realtime Database에 그룹 데이터 저장 완료:', groups.value.length, '개 그룹')
  } catch (error) {
    console.error('❌ 그룹 데이터 저장 실패:', error)
    console.error('에러 상세:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    alert(`그룹 저장 실패: ${error.message}\n콘솔을 확인해주세요.`)
  } finally {
    isSaving = false
    console.log('=== 그룹 저장 함수 종료 ===')
  }
}

// 그룹 데이터를 비동기로 불러오기 (초기값 설정)
const groups = ref([
  {
    id: 1,
    name: '그룹 1',
    players: []
  }
])

// 그룹이 변경될 때마다 자동 저장하지 않음 (저장 버튼으로만 저장)
// watch(groups, () => {
//   if (!isSaving && !isRemovingEmpty) {
//     saveGroupsToStorage(true) // skipRemoveEmpty = true
//   }
// }, { deep: true })

// 탭 변경 시 비어있는 선수 제거
watch(activeTab, () => {
  // nextTick을 사용하여 현재 렌더링 사이클이 끝난 후 실행
  nextTick(() => {
    if (isSaving || isRemovingEmpty) return
    isRemovingEmpty = true
    const hasChanges = removeEmptyPlayers()
    isRemovingEmpty = false
    if (hasChanges && !isSaving) {
      saveGroupsToStorage(true) // skipRemoveEmpty = true (이미 제거했으므로)
    }
    
    // 탭 변경 시 첫 사용자 가이드 체크
    if (activeTab.value === 'groups') {
      const guideShown = localStorage.getItem('polygonTennis_guideShown')
      if (!guideShown) {
        setTimeout(() => {
          showGuideModal.value = true
        }, 500)
      }
    } else if (activeTab.value === 'bracket') {
      const bracketGuideShown = localStorage.getItem('polygonTennis_bracketGuideShown')
      if (!bracketGuideShown) {
        setTimeout(() => {
          showBracketGuideModal.value = true
        }, 500)
      }
    } else if (activeTab.value === 'random') {
      const randomGuideShown = localStorage.getItem('polygonTennis_randomGuideShown')
      if (!randomGuideShown) {
        setTimeout(() => {
          showRandomGuideModal.value = true
        }, 500)
      }
    } else if (activeTab.value === 'kdk') {
      const kdkGuideShown = localStorage.getItem('polygonTennis_kdkGuideShown')
      if (!kdkGuideShown) {
        setTimeout(() => {
          showKDKGuideModal.value = true
        }, 500)
      }
    } else if (activeTab.value === 'fullleague') {
      const fullLeagueGuideShown = localStorage.getItem('polygonTennis_fullLeagueGuideShown')
      if (!fullLeagueGuideShown) {
        setTimeout(() => {
          showFullLeagueGuideModal.value = true
        }, 500)
      }
    }
  })
})

// 스크롤 감지 및 맨 위로 가기
const handleScroll = () => {
  const scrollY = window.scrollY || document.documentElement.scrollTop
  showScrollToTop.value = scrollY > 300 // 300px 이상 스크롤 시 버튼 표시
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 컴포넌트 마운트 시 저장 (초기 로드 후, 비어있는 선수 제거 포함)
onMounted(async () => {
  // Realtime Database 연결 테스트
  console.log('=== 앱 마운트 시작 ===')
  const isConnected = await testRealtimeConnection()
  if (!isConnected) {
    alert('Realtime Database 연결에 실패했습니다. 콘솔을 확인해주세요.')
  }
  
  // 그룹 데이터 불러오기
  const loadedGroups = await loadGroupsFromStorage()
  if (loadedGroups && Array.isArray(loadedGroups) && loadedGroups.length > 0) {
    groups.value = loadedGroups
    console.log('불러온 그룹으로 초기화 완료:', groups.value.length, '개')
  } else {
    console.log('기본 그룹으로 초기화')
  }
  
  nextTick(() => {
    if (!isRemovingEmpty) {
      isRemovingEmpty = true
      removeEmptyPlayers()
      isRemovingEmpty = false
    }
    saveGroupsToStorage(true)
  })
  // 스크롤 이벤트 리스너 등록
  window.addEventListener('scroll', handleScroll)
  handleScroll() // 초기 상태 확인
  
  // 첫 사용자 체크 - 가이드 모달 표시
  const guideShown = localStorage.getItem('polygonTennis_guideShown')
  if (!guideShown && activeTab.value === 'groups') {
    // 약간의 지연 후 가이드 표시 (UI가 완전히 로드된 후)
    setTimeout(() => {
      showGuideModal.value = true
    }, 500)
  }
  
  // 팀 선택 탭 첫 사용자 체크
  const bracketGuideShown = localStorage.getItem('polygonTennis_bracketGuideShown')
  if (!bracketGuideShown && activeTab.value === 'bracket') {
    setTimeout(() => {
      showBracketGuideModal.value = true
    }, 500)
  }
  
  // 팀 랜덤 탭 첫 사용자 체크
  const randomGuideShown = localStorage.getItem('polygonTennis_randomGuideShown')
  if (!randomGuideShown && activeTab.value === 'random') {
    setTimeout(() => {
      showRandomGuideModal.value = true
    }, 500)
  }
  
  // 한울AA 탭 첫 사용자 체크
  const kdkGuideShown = localStorage.getItem('polygonTennis_kdkGuideShown')
  if (!kdkGuideShown && activeTab.value === 'kdk') {
    setTimeout(() => {
      showKDKGuideModal.value = true
    }, 500)
  }
  
  // 풀리그 탭 첫 사용자 체크
  const fullLeagueGuideShown = localStorage.getItem('polygonTennis_fullLeagueGuideShown')
  if (!fullLeagueGuideShown && activeTab.value === 'fullleague') {
    setTimeout(() => {
      showFullLeagueGuideModal.value = true
    }, 500)
  }
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const addGroup = () => {
  const newGroupId = groups.value.length > 0 
    ? Math.max(...groups.value.map(g => g.id)) + 1 
    : 1
  groups.value.push({
    id: newGroupId,
    name: `그룹 ${newGroupId}`,
    players: []
  })
  // 자동 저장하지 않음 (저장 버튼으로만 저장)
}

const removeGroup = (groupId) => {
  if (groups.value.length > 1) {
    // 그룹 삭제 전에 해당 그룹의 대진표 데이터도 삭제
    removeGroupBracketData(groupId)
    
    groups.value = groups.value.filter(g => g.id !== groupId)
    // 자동 저장하지 않음 (저장 버튼으로만 저장)
  } else {
    alert('최소 1개의 그룹이 필요합니다.')
  }
}

// 그룹 삭제 시 해당 그룹의 대진표 데이터를 Realtime Database에서 삭제
const removeGroupBracketData = async (groupId) => {
  try {
    // 팀 선택 탭 데이터 삭제
    try {
      await deleteGroupBracketFromRealtime(PATHS.BRACKET_TAB, 'default', groupId)
    } catch (error) {
      console.warn('Realtime Database 그룹 삭제 실패 (bracketTab):', error)
    }
    
    // 팀 랜덤 탭 데이터 삭제
    try {
      await deleteGroupBracketFromRealtime(PATHS.RANDOM_BRACKET_TAB, 'default', groupId)
    } catch (error) {
      console.warn('Realtime Database 그룹 삭제 실패 (randomBracketTab):', error)
    }
    
    // 한울AA 탭 데이터 삭제
    try {
      await deleteGroupBracketFromRealtime(PATHS.KDK_TAB, 'default', groupId)
    } catch (error) {
      console.warn('Realtime Database 그룹 삭제 실패 (kdkTab):', error)
    }
    
    // 풀리그 탭 데이터 삭제
    try {
      await deleteGroupBracketFromRealtime(PATHS.FULL_LEAGUE_TAB, 'default', groupId)
    } catch (error) {
      console.warn('Realtime Database 그룹 삭제 실패 (fullLeagueTab):', error)
    }
  } catch (error) {
    console.error('그룹 대진표 데이터 삭제 실패:', error)
  }
}

const updateGroup = (groupId, updatedGroup) => {
  const index = groups.value.findIndex(g => g.id === groupId)
  if (index !== -1) {
    // players 업데이트 시 비어있는 선수는 제거하지 않음 (탭 이동 시에만 제거)
    groups.value[index] = { ...groups.value[index], ...updatedGroup }
    // 자동 저장하지 않음 (저장 버튼으로만 저장)
  }
}

// 수동 저장 함수
const saveGroupsManually = async () => {
  try {
    // 비어있는 선수 제거 후 저장
    isRemovingEmpty = true
    removeEmptyPlayers()
    isRemovingEmpty = false
    
    await saveGroupsToStorage(true)
    alert('그룹 데이터가 저장되었습니다.')
  } catch (error) {
    console.error('저장 실패:', error)
    alert('저장에 실패했습니다. 콘솔을 확인해주세요.')
  }
}

const updateBracket = (bracketData) => {
  console.log('대진표 업데이트:', bracketData)
}

const generateRandomBracket = (bracketData) => {
  console.log('랜덤 대진 생성:', bracketData)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  overflow-x: hidden;
}

.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: none;
  pointer-events: none;
  z-index: 0;
}

.app-content {
  position: relative;
  z-index: 1;
  padding: 1rem 0.75rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  margin-bottom: 1rem;
  animation: fadeInDown 0.8s ease-out;
}

.header-content {
  text-align: center;
}

.logo-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  margin-bottom: 0.375rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
  animation: float 3s ease-in-out infinite;
  flex-shrink: 0;
}

.tennis-ball-emoji {
  font-size: 26px;
  line-height: 1;
  display: block;
}

.app-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  color: #2E7D32;
  letter-spacing: -0.02em;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.app-subtitle {
  font-size: 0.8rem;
  color: #666666;
  margin: 0.375rem 0 0 0;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.tabs-container {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  margin-top: 0;
  padding-top: 0.25rem;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 0.5rem;
  overflow-y: hidden;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab-button {
  flex: 1;
  min-width: 0;
  padding: 0.625rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  background: #f5f5f5;
  color: #666666;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transform: translateY(0);
}

.tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.tab-button:hover::before {
  left: 100%;
}

.tab-button:hover {
  background: #e8f5e9;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.25);
  color: #2E7D32;
}

.tab-button.active {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  border-color: transparent;
  transform: translateY(-2px) scale(1.03);
  animation: tabActivePulse 0.3s ease-out;
}

@keyframes tabActivePulse {
  0% {
    transform: translateY(-2px) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.05);
  }
  100% {
    transform: translateY(-2px) scale(1.03);
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.tab-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.tab-label {
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1.2;
}

.content-container {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bulk-add-section {
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.8s ease-out 0.4s both;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.bulk-add-top-btn {
  width: auto;
  padding: 0.75rem 1.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
}

.bulk-add-top-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(76, 175, 80, 0.4);
}

.bulk-add-top-btn:active {
  transform: translateY(0);
}

.bulk-add-top-btn svg {
  flex-shrink: 0;
}

.guide-btn {
  width: auto;
  padding: 0.75rem 1.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2196F3 0%, #42A5F5 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative;
  z-index: 1;
}

.guide-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(33, 150, 243, 0.4);
}

.guide-btn:active {
  transform: translateY(0);
}

.guide-btn svg {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-btn span {
  display: flex;
  align-items: center;
  line-height: 1;
}

.save-groups-btn {
  width: auto;
  padding: 0.75rem 1.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.save-groups-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 152, 0, 0.4);
}

.save-groups-btn:active {
  transform: translateY(0);
}

.save-groups-btn svg {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.save-groups-btn span {
  display: flex;
  align-items: center;
  line-height: 1;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.bulk-add-modal {
  max-width: 600px;
}

.guide-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.modal-close-btn:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-hint {
  margin: 0 0 1rem 0;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.group-select-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-select-btn {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.group-select-btn:hover {
  border-color: #4CAF50;
  background: #e8f5e9;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.group-select-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.group-select-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.group-select-count {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.group-select-btn svg {
  color: #9ca3af;
  flex-shrink: 0;
}

.group-select-btn:hover svg {
  color: #4CAF50;
}

.player-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.25rem;
  -webkit-overflow-scrolling: touch;
}

.player-chip {
  padding: 0.625rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-size: 0.85rem;
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
}

.player-chip:hover:not(.disabled) {
  border-color: #4CAF50;
  background: #e8f5e9;
  transform: translateY(-2px);
}

.player-chip.selected {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  font-weight: 600;
}

.player-chip.selected::before {
  content: '✓';
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #2E7D32;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(46, 125, 50, 0.4);
  border: 2px solid white;
}

.player-chip.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6;
  border-color: #d1d5db;
  position: relative;
}

.player-chip.disabled:hover {
  transform: none;
  border-color: #d1d5db;
  background: #f3f4f6;
}

.added-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: #9ca3af;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  white-space: nowrap;
}

.bulk-add-actions {
  display: flex;
  gap: 0.75rem;
}

.select-all-btn {
  flex: 1;
  padding: 0.875rem 1.25rem;
  font-size: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
}

.select-all-btn:hover {
  border-color: #4CAF50;
  background: #e8f5e9;
  color: #4CAF50;
}

.add-selected-btn {
  flex: 2;
  padding: 0.875rem 1.25rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
}

.add-selected-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.add-selected-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 가이드 모달 스타일 */
.guide-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.guide-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.guide-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.guide-step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2196F3 0%, #42A5F5 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.guide-step-content {
  flex: 1;
}

.guide-step-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.guide-step-content p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #4b5563;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.guide-step-content p strong {
  color: #2196F3;
  font-weight: 600;
}

.guide-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #f3f4f6;
  margin-top: 1rem;
}

.guide-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}

.guide-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2196F3;
}

.guide-close-btn {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #2196F3 0%, #42A5F5 100%);
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.guide-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.guide-close-btn:active {
  transform: translateY(0);
}

/* 팀 구성하기 모달 스타일 */
.team-select-modal {
  max-width: 800px;
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.modal-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.modal-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
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
  line-height: 1.4;
}

.modal-info-card svg {
  color: #4CAF50;
  flex-shrink: 0;
}

.team-count-alert {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
  border-radius: 12px;
  border: 2px solid rgba(251, 191, 36, 0.3);
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.team-count-alert svg {
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.team-count-alert-content {
  flex: 1;
  font-size: 0.8rem;
  color: #92400e;
  line-height: 1.5;
}

.team-count-alert-content > div {
  margin-bottom: 0.25rem;
}

.team-count-alert-content > div:last-child {
  margin-bottom: 0;
}

.team-count-suggestion {
  font-weight: 600;
  margin-top: 0.375rem;
  padding-top: 0.375rem;
  border-top: 1px solid rgba(251, 191, 36, 0.3);
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
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
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
  max-height: 400px;
}

.player-list-grid::-webkit-scrollbar {
  width: 8px;
}

.player-list-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.player-list-grid::-webkit-scrollbar-thumb {
  background: #7f5217;
  border-radius: 4px;
}

.player-list-grid::-webkit-scrollbar-thumb:hover {
  background: #6b4312;
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
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
}

.clear-btn:hover:not(:disabled) {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.15) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.generate-bracket-btn {
  flex: 2;
  padding: 0.875rem 1.25rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  position: relative;
}

.generate-bracket-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
}

.generate-bracket-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.generate-bracket-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.generate-bracket-btn.invalid-team-count {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%);
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
}

.generate-bracket-btn.invalid-team-count:hover:not(:disabled) {
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
}

.team-count-warning {
  font-size: 1rem;
  margin-left: 0.25rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 탭 전환 애니메이션 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 태블릿 */
@media (min-width: 481px) {
  .bulk-add-top-btn {
    padding: 0.875rem 1.75rem;
    font-size: 0.85rem;
  }

  .modal-content {
    max-width: 550px;
  }

  .bulk-add-modal {
    max-width: 700px;
  }

  .player-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  .app-content {
    padding: 2rem 1.5rem;
  }

  .app-header {
    margin-bottom: 2.5rem;
  }

  .logo-section {
    flex-direction: row;
    gap: 1.25rem;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }

  .logo-icon svg {
    width: 32px;
    height: 32px;
  }

  .app-title {
    font-size: 2.25rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .tabs-container {
    justify-content: center;
    gap: 0.75rem;
  }

  .tab-button {
    flex: 0 1 auto;
    flex-direction: row;
    padding: 1rem 1.5rem;
    font-size: 0.95rem;
    gap: 0.5rem;
  }

  .tab-label {
    font-size: 0.875rem;
  }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .app-content {
    padding: 3rem 1.5rem;
  }

  .app-header {
    margin-bottom: 3rem;
  }

  .logo-icon {
    width: 64px;
    height: 64px;
  }

  .logo-icon svg {
    width: 36px;
    height: 36px;
  }

  .app-title {
    font-size: 3rem;
  }

  .app-subtitle {
    font-size: 1.1rem;
  }

  .tabs-container {
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .tab-button {
    padding: 1rem 2rem;
    font-size: 1rem;
    gap: 0.75rem;
  }

  .tab-label {
    font-size: 1rem;
  }
}

/* 맨 위로 가기 버튼 */
.scroll-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(107, 114, 128, 0.7);
  backdrop-filter: blur(8px);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.3s ease-out;
}

.scroll-to-top-btn:hover {
  background: rgba(107, 114, 128, 0.85);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.scroll-to-top-btn:active {
  transform: translateY(0);
}

.scroll-to-top-btn svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .scroll-to-top-btn {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
  }

  .scroll-to-top-btn svg {
    width: 18px;
    height: 18px;
  }

  .bulk-add-section {
    flex-direction: row;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .guide-btn {
    padding: 0.625rem 1rem;
    font-size: 0.75rem;
    min-height: 40px;
  }

  .guide-btn span {
    display: inline;
  }

  .bulk-add-top-btn {
    padding: 0.625rem 1rem;
    font-size: 0.75rem;
    min-height: 40px;
  }

  .save-groups-btn {
    padding: 0.625rem 1rem;
    font-size: 0.75rem;
    min-height: 40px;
  }

  .save-groups-btn span {
    display: inline;
  }
}
</style>
