# JEdutools Documentation

전북대학교 운영체제 연구실에서 서비스하는 JBNU Edu Tools의 통합 문서입니다.

### 원본 프로젝트

이 프로젝트는 codebushi의 gatsby-theme-document-example에서 시작되었습니다. 
```

git clone https://github.com/codebushi/gatsby-theme-document-example
```


# 컨트리뷰션 가이드라인

 ## A. 컨트리뷰션 방법
 1. 해당 리포지토리를 Fork한다. 
 2. main브랜치에서 내용을 수정한다. 
    * 소스코드를 수정했을 시, 빌드 테스트까지 수행한다.
 3. 해당 레포지토리에서 Pull Request를 요청한다.


## B.문서 추가시 참고할 내용

### 1.계층구조
* 폴더 내에 계층 안에 들어갈 문서 작성
* 폴더명과 같은 이름의 문서.mdx 작성

### 2.좌측 네비게이션 정렬 순서
* 기본적으로 slug명, 없다면 파일명으로 정렬된다.
* gatsby-config.js에서 slug와 매칭되는 문자에 대해서 강제로 정렬할 수 있다.
 * 해당 파일의 sidebarConfig.forcedNavOrder 에서 설정하면 된다. 


## 3.도메인 수정시 참고할 내용
현재 레포지토리 이름이 /document이므로 github pages에서 /document로 서비스한다.   
그러므로, 빌드 시 설정에 루트 경로를 /document로 설정해놓은 상태이다.  

만약 도메인을 연결해 루트경로에서 서비스할 수 있게된다면 아래 항목을 수정해야 합니다.
* package.json > yarn run build > build:ghpage > PREFIX_PATHS=true gatsby build 항목을 gatsby build 로 변경
* gatsby-config.js > pathPrefix 항목 삭제


## C.[관리자]Github Action 자동배포를 위한, 시크릿 설정

**개인용 PAT 만들기**
* https://github.com/settings/profile > Developer Settins
* Personal Access Token (classic) > Generate New Token 선택
* repo 권한체크해서 생성하기. (값 복사, 추후 사용) 

**문서화 레포지토리에 PAT 등록**
* 문서화 레포지토리 > Settings
* Secrets And Variables > Actions
* 앞서 만든 개인 PAT 추가

# 릴리즈

V1.0.0 (Released 23.06.04)
1. 기본 문서 템플릿 적용
2. Github Action을 통한 배포
3. pages 배포 위해 원본 프로젝트의 gatsby-documentation 폴더를 루트 폴더로 이동
4. 빌드명령어에서 /public이 아닌 /docs에서 빌드되도록
5. 4번으로 인해 우측 문서 바로가기 동작 안하는문제 수정