# Polygon Tennis

테니스 대진표 관리 애플리케이션

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

Firebase 설정을 위해 환경 변수를 설정해야 합니다.

1. `.env.example` 파일을 `.env`로 복사합니다:
   ```bash
   cp .env.example .env
   ```

2. `.env` 파일을 열고 Firebase 프로젝트의 실제 값으로 채워주세요:
   - Firebase Console (https://console.firebase.google.com/)에서 프로젝트 설정으로 이동
   - 웹 앱의 Firebase 구성 정보를 복사하여 `.env` 파일에 입력

### 3. 개발 서버 실행

```bash
npm run dev
```

## 환경 변수

`.env` 파일에는 다음 Firebase 설정이 포함되어야 합니다:

- `VITE_FIREBASE_API_KEY`: Firebase API 키
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase 인증 도메인
- `VITE_FIREBASE_DATABASE_URL`: Realtime Database URL
- `VITE_FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Storage 버킷
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: 메시징 발신자 ID
- `VITE_FIREBASE_APP_ID`: 앱 ID

**⚠️ 중요**: `.env` 파일은 `.gitignore`에 포함되어 있어 GitHub에 올라가지 않습니다. 실제 Firebase 설정 값은 절대 공개 저장소에 커밋하지 마세요.

## Vercel 배포 시 환경 변수 설정

Vercel에 배포할 때는 Vercel 대시보드에서 환경 변수를 설정해야 합니다.

### 1. Vercel 대시보드 접속
1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 배포한 프로젝트 선택

### 2. 환경 변수 추가
1. 프로젝트 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭
3. 다음 환경 변수들을 하나씩 추가:

   | 변수 이름 | 값 |
   |---------|-----|
   | `VITE_FIREBASE_API_KEY` | Firebase API 키 |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 |
   | `VITE_FIREBASE_DATABASE_URL` | Realtime Database URL |
   | `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Storage 버킷 |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | 메시징 발신자 ID |
   | `VITE_FIREBASE_APP_ID` | 앱 ID |

4. 각 환경 변수 추가 시:
   - **Key**: 환경 변수 이름 (예: `VITE_FIREBASE_API_KEY`)
   - **Value**: 실제 Firebase 설정 값
   - **Environment**: `Production`, `Preview`, `Development` 모두 선택 (또는 필요한 환경만 선택)

### 3. 재배포
환경 변수를 추가한 후:
1. **Deployments** 탭으로 이동
2. 최신 배포의 **⋯** (점 3개) 메뉴 클릭
3. **Redeploy** 선택

또는 새로운 커밋을 푸시하면 자동으로 재배포됩니다.

### 빠른 설정 팁
로컬 `.env` 파일의 값들을 복사해서 Vercel에 붙여넣으면 됩니다.

### ⚠️ Vercel 경고 메시지에 대해

환경 변수를 추가할 때 다음과 같은 경고가 나타날 수 있습니다:
> "This key, which is prefixed with VITE_ and includes the term KEY, might expose sensitive information to the browser."

**이 경고는 무시해도 됩니다.** 이유는:

1. **Firebase API 키는 클라이언트에서 사용하는 것이 정상입니다**
   - Firebase는 클라이언트 측 애플리케이션을 위해 설계되었습니다
   - API 키는 브라우저에서 접근 가능하도록 만들어졌습니다

2. **실제 보안은 Firebase 보안 규칙으로 관리됩니다**
   - API 키가 노출되어도, Firebase Realtime Database의 보안 규칙(`database.rules.json`)이 데이터 접근을 제어합니다
   - 현재 설정: 모든 사용자가 읽기/쓰기 가능 (개발 단계)
   - 프로덕션에서는 보안 규칙을 더 엄격하게 설정할 수 있습니다

3. **Vite의 `VITE_` 접두사는 의도된 동작입니다**
   - Vite는 `VITE_` 접두사가 붙은 환경 변수를 클라이언트 번들에 포함시킵니다
   - 이것은 Vue.js 같은 클라이언트 프레임워크에서 필요한 동작입니다

**결론**: 경고를 무시하고 "Add" 버튼을 클릭하여 환경 변수를 추가하세요.

## 빌드

```bash
npm run build
```

## 기술 스택

- Vue 3
- Vite
- Firebase Realtime Database
