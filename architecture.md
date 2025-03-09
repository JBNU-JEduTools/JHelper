# JEduTools 매뉴얼 페이지 아키텍처

## 프로젝트 개요
JEduTools는 전북대학교의 SW 교육을 위한 도구 모음입니다. 이 프로젝트는 JEduTools의 각 도구에 대한 매뉴얼 페이지를 생성하고 배포하기 위한 목적으로 개발되었습니다. Gatsby 기반으로 구축되어 마크다운 문서를 정적 웹사이트로 변환합니다.

## 기술 스택
- **프레임워크**: Gatsby (React 기반)
- **콘텐츠 관리**: MDX (Markdown + JSX)
- **스타일링**: Emotion, Theme UI
- **배포**: GitHub Actions (자동 빌드 및 배포)

## 디렉토리 구조

### 주요 디렉토리

```
/
├── content/             # 매뉴얼 문서 (MDX 형식)
│   ├── index.mdx        # 홈페이지 콘텐츠
│   ├── JHelper/         # JHelper 관련 문서
│   ├── JCode/           # JCode 관련 문서
│   ├── JFlow/           # JFlow 관련 문서
│   ├── JCloud/          # JCloud 관련 문서
│   ├── JIGSSO/          # JIGSSO 관련 문서
│   ├── Litmus/          # Litmus 관련 문서
│   └── Portal/          # Portal 관련 문서
├── src/                 # 소스 코드
│   ├── components/      # React 컴포넌트
│   ├── templates/       # 페이지 템플릿
│   ├── styles/          # 스타일 관련 파일
│   ├── context/         # React Context
│   ├── hooks/           # Custom React Hooks
│   └── gatsby-plugin-theme-ui/ # 테마 설정
│
├── public/              # 빌드된 정적 파일
│
└── images/              # 이미지 파일
```

### 주요 설정 파일
- **gatsby-config.js**: Gatsby 사이트 설정 및 플러그인 구성
- **gatsby-node.js**: 페이지 생성 로직 및 MDX 노드 처리
- **gatsby-browser.js**: 브라우저 관련 설정
- **gatsby-ssr.js**: 서버 사이드 렌더링 관련 설정
- **package.json**: 프로젝트 메타데이터 및 의존성 관리

## 콘텐츠 관리
모든 매뉴얼 문서는 `content/` 디렉토리에 MDX 형식으로 저장됩니다. 각 도구별로 디렉토리가 구분되어 있으며, 해당 디렉토리 내부에 관련 문서들이 포함됩니다.

각 MDX 파일은 다음과 같은 프론트매터(frontmatter)를 포함합니다:
```yaml
---
title: '문서 제목'
description: '문서 설명'
slug: '경로'
---
```

## 페이지 생성 로직
`gatsby-node.js` 파일에서 GraphQL을 사용하여 모든 MDX 파일을 조회하고, 각 파일에 대해 페이지를 생성합니다. 페이지 생성 시 `src/templates/docs` 템플릿을 사용합니다.

## UI 구성 요소
- **Layout.js**: 전체 레이아웃 구조
- **Header.js**: 상단 네비게이션 바
- **LeftSidebar**: 좌측 문서 목차
- **RightSidebar.js**: 우측 목차(Table of Contents)
- **SEO.js**: 검색 엔진 최적화 컴포넌트

## 자동화 빌드 및 배포
GitHub Actions를 통해 저장소에 변경사항이 푸시되면 자동으로 사이트를 빌드하고 배포합니다.

## 참여 방법
JEduTools는 오픈소스 프로젝트로, 누구나 개발에 참여할 수 있습니다. 특히 학생들이 실제 사용하는 도구에 대한 개발에 참여함으로써:
- SW 학습에 대한 동기 부여 향상
- 실무 역량 강화
- 오픈소스 SW에 대한 이해 증진 