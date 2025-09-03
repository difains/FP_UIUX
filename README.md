# UI/UX FP 간이 산정 도구

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://difains.github.io/FP_UIUX/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)]()

KOSA SW사업 대가산정 가이드 (2024) 준수 UI/UX 기능점수 간이 산정 도구입니다.

## 🎯 프로젝트 소개

UI/UX 전문 FP(Function Point) 산정 시스템으로, 소프트웨어 개발 프로젝트의 UI/UX 작업량을 정확하게 산정할 수 있는 웹 기반 도구입니다.

### 주요 특징

- **IFPUG 표준 준수**: 국제 기능점수 표준 (IFPUG CPM 4.3.1) 기반 산정
- **KOSA 가이드라인 적용**: SW사업 대가산정 가이드 (2024) 준수
- **UI/UX 특화**: 화면 수 기반 UI/UX 인력 산정 알고리즘
- **접근성 지원**: WCAG 2.1 AA 수준 접근성 구현
- **반응형 디자인**: 웹/태블릿/모바일 모든 환경 지원

## ✨ 주요 기능

### 📊 FP 산정 기능
- **간편 추정법**: 기능 수 × 4.7 방식
- **상세 산정법**: IFPUG 표준 복잡도 기반 산정
- **실시간 계산**: 입력과 동시에 FP 및 비용 자동 업데이트
- **검증 기능**: 입력 데이터 자동 검증 및 오류 체크

### 👥 UI/UX 인력 산정
- **UI/UX 기획자**: 화면 수 × 0.15MM
- **UI/UX 디자이너**: 화면 수 × 0.25MM  
- **웹 퍼블리셔**: 화면 수 × 0.20MM
- **예상 개발 기간**: 총 FP ÷ 100 (개월)

### 📁 데이터 관리
- **Excel 연동**: 업로드/다운로드 지원
- **표준 샘플**: 전자정부/웹/모바일/전자상거래 샘플
- **공유 기능**: URL 기반 프로젝트 공유

### 📋 결과 내보내기
- **PDF 보고서**: 산정 결과 PDF 다운로드
- **Excel 파일**: 상세 데이터 Excel 내보내기
- **공유 링크**: 프로젝트 공유 URL 생성

## 🚀 사용 방법

### 1. 웹사이트 접속
```
https://difains.github.io/FP_UIUX/
```

### 2. 프로젝트 정보 입력
- 프로젝트명, 유형, 산정 방식 선택
- 표준 샘플 활용 또는 직접 입력

### 3. 기능 목록 입력
- **수동 입력**: 기능별 개별 입력 (FP 유형 툴팁 참고)
- **일괄 입력**: CSV 형식 일괄 입력
- **Excel 업로드**: 기존 데이터 업로드

### 4. 결과 확인 및 내보내기
- FP 산정 결과 실시간 확인
- UI/UX 인력 산정 결과 검토
- PDF/Excel 형태로 결과 다운로드

## 📖 FP 유형 설명

### EI (외부입력)
애플리케이션 경계를 통해 들어오는 데이터나 제어정보를 처리하는 기능

### EO (외부출력)
애플리케이션에서 사용자에게 전달되는 데이터나 제어정보를 생성하는 기능

### EQ (외부조회)
입력과 출력의 조합으로 데이터를 검색하고 표시하는 기능

### ILF (내부논리파일)
애플리케이션 내부에서 유지관리되는 사용자 식별 가능한 데이터 그룹

### EIF (외부연계파일)
다른 애플리케이션에서 관리되지만 현재 애플리케이션에서 참조하는 데이터 그룹

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries**: 
  - SheetJS (Excel 처리)
  - jsPDF (PDF 생성)
- **Design**: KOSA 가이드라인 기반 디자인 시스템
- **Accessibility**: WCAG 2.1 AA 준수
- **Storage**: localStorage (클라이언트 사이드)

## 📱 지원 환경

- **브라우저**: Chrome, Firefox, Safari, Edge (최신 버전)
- **디바이스**: 데스크톱, 태블릿, 모바일
- **해상도**: 320px ~ 1400px 반응형 지원
- **접근성**: 스크린 리더, 키보드 네비게이션 지원

## 📊 산정 근거

### FP 가중치
- **IFPUG CPM 4.3.1**: 국제 표준 기능점수 가중치
- **ISO/IEC 20926:2009**: 소프트웨어 측정 국제 표준

### 단가 기준
- **기능점수 단가**: 519,203원/FP (KOSA 2024년 기준)
- **UI/UX 인력 산정**: NIPA SW개발 표준 프로세스 기반

### 참고 문헌
- 한국소프트웨어산업협회 SW사업 대가산정 가이드 (2024)
- 정보통신산업진흥원 SW개발비 산정 가이드라인
- IFPUG Counting Practices Manual Release 4.3.1

## 🤝 기여하기

1. 이 저장소를 Fork 합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 개발자

**Sophrosyne AI Lab**
- GitHub: [https://github.com/difains](https://github.com/difains)
- Website: [https://difains.github.io/FP_UIUX/](https://difains.github.io/FP_UIUX/)

## 📞 문의 및 지원

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 통해 남겨주세요.

- Issues: [https://github.com/difains/FP_UIUX/issues](https://github.com/difains/FP_UIUX/issues)
- Discussions: [https://github.com/difains/FP_UIUX/discussions](https://github.com/difains/FP_UIUX/discussions)

## 🔄 업데이트 내역

### v1.0.0 (2025-09-03)
- 초기 버전 출시
- KOSA 가이드라인 준수 UI/UX 구현
- IFPUG 표준 FP 산정 기능
- Excel 업로드/다운로드 기능
- 반응형 웹 디자인 적용
- 접근성 기능 구현
- FP 유형 설명 툴팁 추가

---

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!