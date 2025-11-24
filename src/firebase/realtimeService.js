import { db } from './config'
import { 
  ref, 
  set, 
  get, 
  remove,
  update,
  serverTimestamp,
  push
} from 'firebase/database'

// 데이터베이스 경로 상수
const PATHS = {
  GROUPS: 'groups',
  BRACKET_TAB: 'bracketTab',
  RANDOM_BRACKET_TAB: 'randomBracketTab',
  KDK_TAB: 'kdkTab',
  FULL_LEAGUE_TAB: 'fullLeagueTab'
}

/**
 * 그룹 데이터를 Realtime Database에 저장
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @param {Array} groups - 저장할 그룹 배열
 * @returns {Promise<void>}
 */
export const saveGroupsToRealtime = async (userId = 'default', groups) => {
  try {
    console.log('=== Realtime Database 저장 시작 ===')
    console.log('경로:', `${PATHS.GROUPS}/${userId}`)
    console.log('저장할 그룹 수:', groups?.length || 0)
    console.log('그룹 데이터:', JSON.stringify(groups, null, 2))
    
    const groupsRef = ref(db, `${PATHS.GROUPS}/${userId}`)
    console.log('데이터베이스 참조 생성 완료')
    
    const dataToSave = {
      groups: groups,
      updatedAt: Date.now(),
      createdAt: Date.now()
    }
    console.log('저장할 데이터:', JSON.stringify(dataToSave, null, 2))
    
    console.log('set 호출 시작...')
    await set(groupsRef, dataToSave)
    console.log('✅ set 완료 - 그룹 데이터가 Realtime Database에 저장되었습니다.')
    console.log('=== Realtime Database 저장 완료 ===')
  } catch (error) {
    console.error('❌ 그룹 Realtime Database 저장 실패:', error)
    console.error('에러 코드:', error.code)
    console.error('에러 메시지:', error.message)
    console.error('에러 스택:', error.stack)
    throw error
  }
}

/**
 * Realtime Database에서 그룹 데이터 불러오기
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @returns {Promise<Array|null>}
 */
export const loadGroupsFromRealtime = async (userId = 'default') => {
  try {
    console.log('=== Realtime Database 불러오기 시작 ===')
    console.log('경로:', `${PATHS.GROUPS}/${userId}`)
    
    const groupsRef = ref(db, `${PATHS.GROUPS}/${userId}`)
    console.log('데이터베이스 참조 생성 완료')
    
    console.log('get 호출 시작...')
    const snapshot = await get(groupsRef)
    console.log('get 완료')
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      console.log('데이터 존재:', data)
      
      if (data.groups && Array.isArray(data.groups) && data.groups.length > 0) {
        console.log('✅ Realtime Database에서 그룹 데이터를 불러왔습니다:', data.groups.length, '개 그룹')
        console.log('=== Realtime Database 불러오기 완료 ===')
        return data.groups
      } else {
        console.log('⚠️ groups 배열이 없거나 비어있습니다.')
      }
    } else {
      console.log('⚠️ 데이터가 존재하지 않습니다.')
    }
    
    console.log('=== Realtime Database 불러오기 완료 (데이터 없음) ===')
    return null
  } catch (error) {
    console.error('❌ 그룹 Realtime Database 불러오기 실패:', error)
    console.error('에러 코드:', error.code)
    console.error('에러 메시지:', error.message)
    console.error('에러 스택:', error.stack)
    throw error
  }
}

/**
 * Realtime Database 연결 테스트
 * @returns {Promise<boolean>}
 */
export const testRealtimeConnection = async () => {
  try {
    console.log('=== Realtime Database 연결 테스트 시작 ===')
    const testRef = ref(db, 'test/connection')
    console.log('테스트 경로:', testRef.toString())
    
    console.log('테스트 데이터 저장 시도...')
    await set(testRef, {
      test: true,
      timestamp: Date.now()
    })
    console.log('✅ Realtime Database 연결 성공 - 테스트 데이터 저장 완료')
    
    // 테스트 데이터 삭제
    console.log('테스트 데이터 삭제 시도...')
    await remove(testRef)
    console.log('테스트 데이터 삭제 완료')
    console.log('=== Realtime Database 연결 테스트 완료 ===')
    return true
  } catch (error) {
    console.error('❌ Realtime Database 연결 실패:', error)
    console.error('에러 코드:', error.code)
    console.error('에러 메시지:', error.message)
    console.error('에러 스택:', error.stack)
    return false
  }
}

/**
 * undefined 값을 null로 변환하는 재귀 함수
 * Firebase Realtime Database는 undefined 값을 허용하지 않음
 * null 값은 유효하므로 유지
 */
const removeUndefined = (obj) => {
  if (obj === undefined) {
    return null
  }
  
  if (obj === null) {
    return null
  }
  
  if (Array.isArray(obj)) {
    // 배열의 undefined 항목을 null로 변환 (필터링하지 않음)
    return obj.map(item => item === undefined ? null : removeUndefined(item))
  }
  
  if (typeof obj === 'object') {
    const cleaned = {}
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key])
      }
    }
    return cleaned
  }
  
  return obj
}

/**
 * 대진표 데이터를 Realtime Database에 저장
 * @param {string} pathName - 경로 이름 (PATHS 상수 사용)
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @param {Object} data - 저장할 데이터
 * @returns {Promise<void>}
 */
export const saveBracketToRealtime = async (pathName, userId = 'default', data) => {
  try {
    console.log('=== Realtime Database 저장 시작 ===')
    console.log('경로:', `${pathName}/${userId}`)
    
    const bracketRef = ref(db, `${pathName}/${userId}`)
    console.log('데이터베이스 참조 생성 완료')
    
    // undefined 값 제거
    const cleanedData = removeUndefined(data)
    
    const dataToSave = {
      ...cleanedData,
      updatedAt: Date.now(),
      createdAt: Date.now()
    }
    console.log('저장할 데이터 (cleaned):', JSON.stringify(dataToSave, null, 2))
    
    console.log('set 호출 시작...')
    await set(bracketRef, dataToSave)
    console.log('✅ set 완료 - 대진표 데이터가 Realtime Database에 저장되었습니다.')
    console.log('=== Realtime Database 저장 완료 ===')
  } catch (error) {
    console.error('❌ 대진표 Realtime Database 저장 실패:', error)
    console.error('에러 코드:', error.code)
    console.error('에러 메시지:', error.message)
    console.error('에러 스택:', error.stack)
    throw error
  }
}

/**
 * Realtime Database에서 대진표 데이터 불러오기
 * @param {string} pathName - 경로 이름 (PATHS 상수 사용)
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @returns {Promise<Object|null>}
 */
export const loadBracketFromRealtime = async (pathName, userId = 'default') => {
  try {
    console.log('=== Realtime Database 불러오기 시작 ===')
    console.log('경로:', `${pathName}/${userId}`)
    
    const bracketRef = ref(db, `${pathName}/${userId}`)
    console.log('데이터베이스 참조 생성 완료')
    
    console.log('get 호출 시작...')
    const snapshot = await get(bracketRef)
    console.log('get 완료')
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      console.log('데이터 존재:', data)
      console.log('✅ Realtime Database에서 대진표 데이터를 불러왔습니다.')
      console.log('=== Realtime Database 불러오기 완료 ===')
      
      // updatedAt, createdAt 제거 (필요시)
      delete data.updatedAt
      delete data.createdAt
      
      return data
    } else {
      console.log('⚠️ 데이터가 존재하지 않습니다.')
      console.log('=== Realtime Database 불러오기 완료 (데이터 없음) ===')
      return null
    }
  } catch (error) {
    console.error('❌ 대진표 Realtime Database 불러오기 실패:', error)
    console.error('에러 코드:', error.code)
    console.error('에러 메시지:', error.message)
    console.error('에러 스택:', error.stack)
    throw error
  }
}

/**
 * Realtime Database에서 특정 그룹의 대진표 데이터 삭제
 * @param {string} pathName - 경로 이름 (PATHS 상수 사용)
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @param {number} groupId - 삭제할 그룹 ID
 * @returns {Promise<void>}
 */
export const deleteGroupBracketFromRealtime = async (pathName, userId = 'default', groupId) => {
  try {
    console.log('=== Realtime Database 그룹 삭제 시작 ===')
    console.log('경로:', `${pathName}/${userId}`)
    console.log('삭제할 그룹 ID:', groupId)
    
    const bracketRef = ref(db, `${pathName}/${userId}`)
    const snapshot = await get(bracketRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      
      // bracketsByGroup 또는 kdkMatchesByGroup 또는 leagueDataByGroup에서 해당 그룹 삭제
      if (data.bracketsByGroup && data.bracketsByGroup[groupId]) {
        delete data.bracketsByGroup[groupId]
      }
      if (data.kdkMatchesByGroup && data.kdkMatchesByGroup[groupId]) {
        delete data.kdkMatchesByGroup[groupId]
      }
      if (data.leagueDataByGroup && data.leagueDataByGroup[groupId]) {
        delete data.leagueDataByGroup[groupId]
      }
      
      // selectedViewGroupId가 삭제된 그룹이면 null로 설정
      if (data.selectedViewGroupId === groupId) {
        data.selectedViewGroupId = null
      }
      
      await set(bracketRef, {
        ...data,
        updatedAt: Date.now()
      })
      console.log('✅ Realtime Database에서 그룹 대진표가 삭제되었습니다.')
      console.log('=== Realtime Database 그룹 삭제 완료 ===')
    }
  } catch (error) {
    console.error('❌ Realtime Database 그룹 삭제 실패:', error)
    console.error('에러 코드:', error.code)
    console.error('에러 메시지:', error.message)
    throw error
  }
}

// 경로 상수 export
export { PATHS }

