# JEdutools Documentation

전북대학교 SW교육도구모음 JEduTools의 통합 문서입니다.

## 프로젝트 빌드 및 확인 방법

### 로컬 개발 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/JBNU-JEduTools/JHelper.git
cd JHelper
```

2. 의존성 설치
```bash
yarn install
```
첫 설치 시, 시스템 사양에 따라 3-5분 정도 걸릴 수 있습니다. 

3. 개발 서버 실행
```bash
yarn run develop
```
개발 서버가 실행되면 `http://localhost:8000`에서 문서를 확인할 수 있습니다.

다른 포트로 개발 서버를 실행하려면 다음 명령어를 사용합니다:
```bash
yarn run develop -p 3000 # 3000번 포트로 실행
```
위 명령어를 실행하면 `http://localhost:3000`에서 문서를 확인할 수 있습니다.

### 빌드 및 배포

프로젝트 빌드:
```bash
yarn run build
```

GitHub Pages 배포를 위한 빌드:
```bash
yarn run build:ghpage
```
이 명령어는 `docs` 디렉토리에 빌드 결과물을 생성합니다.

### GitHub Codespace 개발 환경 구성

로컬 환경에서 개발 환경 구성이 어려운 경우, GitHub Codespace를 활용할 수 있습니다:

1. JHelper 저장소를 포크하여 개인 저장소로 복제합니다.
2. 포크한 저장소에서 Codespace를 생성합니다.
3. 웹 기반 Visual Studio Code 환경에서 작업을 수행합니다.
4. 개발 서버 미리보기는 포트 패널에서 8000번 포트 주소를 통해 접근할 수 있습니다.
5. 작업 완료 후에는 할당된 Codespace 사용량을 고려하여 Codespace를 삭제합니다.

### 원본 프로젝트

JEduTools 도움말 프로젝트는 codebushi의 gatsby-theme-document-example를 수정해 사용하고 있습니다.
```
git clone https://github.com/codebushi/gatsby-theme-document-example
```

# 릴리즈

V1.0.0 (Released 23.06.04)
1. 기본 문서 템플릿 적용
2. Github Action을 통한 배포
3. pages 배포 위해 원본 프로젝트의 gatsby-documentation 폴더를 루트 폴더로 이동
4. 빌드명령어에서 /public이 아닌 /docs에서 빌드되도록
5. 4번으로 인해 우측 문서 바로가기 동작 하지 않는 문제 수정

v1.0.1(Released 24.01.19)
1. URL changed to "jedutools.jbnu.ac.kr"
