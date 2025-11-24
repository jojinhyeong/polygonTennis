import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Firebase 설정 (환경 변수에서 가져오기)
// Vite에서는 import.meta.env를 사용하여 환경 변수에 접근
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// 디버깅: 환경 변수 확인 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('🔍 환경 변수 확인:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasDatabaseURL: !!firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId
  })
}

// 환경 변수 검증
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase 환경 변수가 설정되지 않았습니다.')
  console.error('⚠️ .env 파일을 생성하고 Firebase 설정을 입력해주세요.')
  console.error('📝 .env.example 파일을 참고하세요.')
  console.error('🔍 현재 환경 변수 상태:', {
    apiKey: firebaseConfig.apiKey ? '설정됨' : '없음',
    projectId: firebaseConfig.projectId ? '설정됨' : '없음',
    databaseURL: firebaseConfig.databaseURL ? '설정됨' : '없음'
  })
  
  // Vercel 배포 시 환경 변수가 없는 경우 안내
  if (import.meta.env.PROD) {
    console.error('⚠️ Vercel 배포 환경입니다.')
    console.error('📝 Vercel 대시보드에서 환경 변수를 확인하고 재배포해주세요.')
  }
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)
console.log('Firebase 앱 초기화 완료:', app.name)

// Realtime Database 초기화
export const db = getDatabase(app)
console.log('Realtime Database 초기화 완료')

export default app

