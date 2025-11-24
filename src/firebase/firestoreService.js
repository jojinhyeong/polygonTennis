import { db } from './config'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'

// 컬렉션 이름 상수
const COLLECTIONS = {
  BRACKET_TAB: 'bracketTab',
  RANDOM_BRACKET_TAB: 'randomBracketTab',
  KDK_TAB: 'kdkTab',
  FULL_LEAGUE_TAB: 'fullLeagueTab',
  GROUPS: 'groups'
}

/**
 * 그룹 데이터를 Firestore에 저장
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @param {Array} groups - 저장할 그룹 배열
 * @returns {Promise<void>}
 */
export const saveGroupsToFirestore = async (userId = 'default', groups) => {
  try {
    console.log('=== Firestore 저장 시작 ===')
    console.log('컬렉션:', COLLECTIONS.GROUPS)
    console.log('문서 ID:', userId)
    console.log('저장할 그룹 수:', groups?.length || 0)
    console.log('그룹 데이터:', JSON.stringify(groups, null, 2))
    
    // 중첩 배열을 Firestore 호환 형식으로 변환
    const convertedGroups = convertNestedArrays(groups)
    console.log('변환된 그룹 데이터:', JSON.stringify(convertedGroups, null, 2))
    
    const docRef = doc(db, COLLECTIONS.GROUPS, userId)
    console.log('문서 참조 생성 완료')
    console.log('문서 경로:', docRef.path)
    
    const dataToSave = {
      groups: convertedGroups,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }
    console.log('저장할 데이터:', JSON.stringify(dataToSave, null, 2))
    
    console.log('setDoc 호출 시작...')
    console.log('setDoc 파라미터 확인:', {
      docRef: docRef.path,
      dataKeys: Object.keys(dataToSave),
      hasGroups: !!dataToSave.groups,
      groupsLength: dataToSave.groups?.length
    })
    
    try {
      // 타임아웃 설정 (30초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('setDoc 타임아웃: 30초 내에 완료되지 않았습니다.'))
        }, 30000)
      })
      
      const setDocPromise = setDoc(docRef, dataToSave, { merge: true })
      console.log('setDoc Promise 생성 완료, 대기 중...')
      
      await Promise.race([setDocPromise, timeoutPromise])
      console.log('✅ setDoc 완료 - 그룹 데이터가 Firestore에 저장되었습니다.')
      console.log('=== Firestore 저장 완료 ===')
    } catch (setDocError) {
      console.error('❌ setDoc 호출 중 에러 발생:', setDocError)
      console.error('setDoc 에러 타입:', typeof setDocError)
      console.error('setDoc 에러 코드:', setDocError?.code)
      console.error('setDoc 에러 메시지:', setDocError?.message)
      console.error('setDoc 에러 이름:', setDocError?.name)
      console.error('setDoc 전체 에러:', setDocError)
      if (setDocError?.stack) {
        console.error('setDoc 에러 스택:', setDocError.stack)
      }
      throw setDocError
    }
  } catch (error) {
    console.error('❌ 그룹 Firestore 저장 실패:', error)
    console.error('에러 코드:', error.code)
    console.error('에러 메시지:', error.message)
    console.error('에러 스택:', error.stack)
    throw error
  }
}

/**
 * Firestore에서 그룹 데이터 불러오기
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @returns {Promise<Array|null>}
 */
export const loadGroupsFromFirestore = async (userId = 'default') => {
  try {
    const docRef = doc(db, COLLECTIONS.GROUPS, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      // Timestamp를 일반 객체로 변환
      let convertedData = convertTimestamps(data)
      // 중첩 배열 복원
      if (convertedData.groups) {
        convertedData.groups = restoreNestedArrays(convertedData.groups)
      }
      console.log('그룹 데이터를 Firestore에서 불러왔습니다.')
      return convertedData.groups || null
    } else {
      console.log('그룹 문서를 찾을 수 없습니다.')
      return null
    }
  } catch (error) {
    console.error('그룹 Firestore 불러오기 실패:', error)
    throw error
  }
}

/**
 * 중첩 배열을 Firestore 호환 형식으로 변환
 * @param {any} obj - 변환할 객체
 * @returns {any} - 변환된 객체
 */
const convertNestedArrays = (obj) => {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  // 배열인 경우
  if (Array.isArray(obj)) {
    // 배열의 요소가 배열인지 확인 (중첩 배열)
    const hasNestedArrays = obj.some(item => Array.isArray(item))
    
    if (hasNestedArrays) {
      // 중첩 배열을 객체로 변환: [arr1, arr2] -> {0: arr1, 1: arr2}
      const converted = {}
      obj.forEach((item, index) => {
        converted[index] = convertNestedArrays(item)
      })
      return converted
    } else {
      // 일반 배열은 그대로 반환
      return obj.map(item => convertNestedArrays(item))
    }
  }
  
  // 객체인 경우
  if (typeof obj === 'object') {
    const converted = {}
    Object.keys(obj).forEach(key => {
      converted[key] = convertNestedArrays(obj[key])
    })
    return converted
  }
  
  // 원시 타입은 그대로 반환
  return obj
}

/**
 * Firestore에서 불러온 객체를 원래 형식으로 복원
 * @param {any} obj - 복원할 객체
 * @returns {any} - 복원된 객체
 */
const restoreNestedArrays = (obj) => {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  // 배열인 경우
  if (Array.isArray(obj)) {
    return obj.map(item => restoreNestedArrays(item))
  }
  
  // 객체인 경우
  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    
    // 숫자 키만 있는 객체인지 확인 (변환된 배열)
    // 모든 키가 숫자이고, 0부터 시작하는 연속된 숫자인지 확인
    const numericKeys = keys.filter(key => /^\d+$/.test(key))
    const isConvertedArray = numericKeys.length > 0 && 
                            numericKeys.length === keys.length &&
                            numericKeys.every((key, idx) => parseInt(key) === idx)
    
    if (isConvertedArray) {
      // 객체를 배열로 변환: {0: item1, 1: item2} -> [item1, item2]
      const arr = []
      numericKeys.sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
        arr[parseInt(key)] = restoreNestedArrays(obj[key])
      })
      return arr
    } else {
      // 일반 객체는 재귀적으로 처리
      const converted = {}
      Object.keys(obj).forEach(key => {
        converted[key] = restoreNestedArrays(obj[key])
      })
      return converted
    }
  }
  
  // 원시 타입은 그대로 반환
  return obj
}

/**
 * 대진표 데이터를 Firestore에 저장
 * @param {string} collectionName - 컬렉션 이름
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @param {Object} data - 저장할 데이터
 * @returns {Promise<void>}
 */
export const saveBracketToFirestore = async (collectionName, userId = 'default', data) => {
  try {
    // 중첩 배열을 Firestore 호환 형식으로 변환
    const convertedData = convertNestedArrays(data)
    
    const docRef = doc(db, collectionName, userId)
    await setDoc(docRef, {
      ...convertedData,
      updatedAt: serverTimestamp(),
      createdAt: data.createdAt || serverTimestamp()
    }, { merge: true })
    console.log(`${collectionName} 데이터가 Firestore에 저장되었습니다.`)
  } catch (error) {
    console.error(`${collectionName} Firestore 저장 실패:`, error)
    throw error
  }
}

/**
 * Firestore에서 대진표 데이터 불러오기
 * @param {string} collectionName - 컬렉션 이름
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @returns {Promise<Object|null>}
 */
export const loadBracketFromFirestore = async (collectionName, userId = 'default') => {
  try {
    const docRef = doc(db, collectionName, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      // Timestamp를 일반 객체로 변환
      let convertedData = convertTimestamps(data)
      // 중첩 배열 복원
      convertedData = restoreNestedArrays(convertedData)
      console.log(`${collectionName} 데이터를 Firestore에서 불러왔습니다.`)
      return convertedData
    } else {
      console.log(`${collectionName} 문서를 찾을 수 없습니다.`)
      return null
    }
  } catch (error) {
    console.error(`${collectionName} Firestore 불러오기 실패:`, error)
    throw error
  }
}

/**
 * Firestore에서 특정 그룹의 대진표 데이터 삭제
 * @param {string} collectionName - 컬렉션 이름
 * @param {string} userId - 사용자 ID (기본값: 'default')
 * @param {number} groupId - 삭제할 그룹 ID
 * @returns {Promise<void>}
 */
export const deleteGroupBracketFromFirestore = async (collectionName, userId = 'default', groupId) => {
  try {
    const docRef = doc(db, collectionName, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      
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
      
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
      console.log(`${collectionName}에서 그룹 ${groupId}의 대진표가 삭제되었습니다.`)
    }
  } catch (error) {
    console.error(`${collectionName} Firestore 그룹 삭제 실패:`, error)
    throw error
  }
}

/**
 * Timestamp 객체를 일반 객체로 변환
 * @param {Object} data - 변환할 데이터
 * @returns {Object}
 */
const convertTimestamps = (data) => {
  if (!data) return data
  
  const converted = { ...data }
  
  // Timestamp 필드를 변환
  Object.keys(converted).forEach(key => {
    const value = converted[key]
    
    if (value && typeof value === 'object') {
      // Firestore Timestamp 객체인지 확인
      if (value.seconds !== undefined && value.nanoseconds !== undefined) {
        converted[key] = new Date(value.seconds * 1000).toISOString()
      } else if (Array.isArray(value)) {
        converted[key] = value.map(item => convertTimestamps(item))
      } else if (value.constructor === Object) {
        converted[key] = convertTimestamps(value)
      }
    }
  })
  
  return converted
}

// 컬렉션 이름 export
export { COLLECTIONS }

/**
 * Firestore 연결 테스트
 * @returns {Promise<boolean>}
 */
export const testFirestoreConnection = async () => {
  try {
    console.log('=== Firestore 연결 테스트 시작 ===')
    const testDocRef = doc(db, 'test', 'connection')
    console.log('테스트 문서 경로:', testDocRef.path)
    
    console.log('테스트 문서 저장 시도...')
    try {
      await setDoc(testDocRef, {
        test: true,
        timestamp: serverTimestamp()
      })
      console.log('✅ Firestore 연결 성공 - 테스트 문서 저장 완료')
    } catch (testError) {
      console.error('❌ 테스트 문서 저장 실패:', testError)
      console.error('테스트 에러 코드:', testError?.code)
      console.error('테스트 에러 메시지:', testError?.message)
      throw testError
    }
    
    // 테스트 문서 삭제
    console.log('테스트 문서 삭제 시도...')
    await deleteDoc(testDocRef)
    console.log('테스트 문서 삭제 완료')
    console.log('=== Firestore 연결 테스트 완료 ===')
    return true
  } catch (error) {
    console.error('❌ Firestore 연결 실패:', error)
    console.error('에러 코드:', error.code)
    console.error('에러 메시지:', error.message)
    console.error('에러 스택:', error.stack)
    return false
  }
}

