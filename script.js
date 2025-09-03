class FPCalculator {
    constructor() {
        this.functions = [];
        
        // FP 가중치 (IFPUG 표준)
        this.fpWeights = {
            'EI': { simple: 3, average: 4, complex: 6 },
            'EO': { simple: 4, average: 5, complex: 7 },
            'EQ': { simple: 3, average: 4, complex: 6 },
            'ILF': { simple: 7, average: 10, complex: 15 },
            'EIF': { simple: 5, average: 7, complex: 10 }
        };
        
        // 간이 추정법 평균 가중치
        this.simpleWeights = {
            'EI': 4.0, 'EO': 5.2, 'EQ': 3.9, 'ILF': 7.5, 'EIF': 5.4
        };
        
        this.fpUnitPrice = 51.92; // 기능점수당 단가 (만원)
        
        // UI/UX 인력 산정 비율 (화면당 MM)
        this.uiuxRates = {
            planner: 0.15,    // 기획자
            designer: 0.25,   // 디자이너  
            publisher: 0.20   // 퍼블리셔
        };
        
        this.templates = this.initializeTemplates();
        this.initializeEventListeners();
        this.initializeAccessibility();
        this.initializeTooltip();
    }

    initializeEventListeners() {
        console.log('이벤트 리스너 초기화 시작');
        
        // 기능 입력
        this.bindElement('addFunction', 'click', () => this.addFunction());
        this.bindElement('bulkAdd', 'click', () => this.bulkAddFunctions());
        this.bindElement('clearForm', 'click', () => this.clearInputForm());
        this.bindElement('clearBulk', 'click', () => this.clearBulkInput());
        
        // 탭 전환
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchTab(e.target.dataset.tab);
                }
            });
        });
        
        // 샘플 로드
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.loadTemplate(template);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const template = e.currentTarget.dataset.template;
                    this.loadTemplate(template);
                }
            });
        });
        
        // Excel 업로드/다운로드
        this.bindElement('uploadBtn', 'click', () => document.getElementById('excelUpload').click());
        this.bindElement('excelUpload', 'change', (e) => this.handleExcelUpload(e));
        this.bindElement('downloadBtn', 'click', () => this.downloadExcel());
        
        // 검증 및 내보내기
        this.bindElement('validateFunctions', 'click', () => this.validateFunctions());
        this.bindElement('clearAll', 'click', () => this.clearAllFunctions());
        this.bindElement('exportPDF', 'click', () => this.exportToPDF());
        this.bindElement('exportExcel', 'click', () => this.exportToExcel());
        this.bindElement('shareProject', 'click', () => this.shareProject());
        
        // Footer 모달
        this.bindElement('showMethodology', 'click', () => this.showModal('methodologyModal'));
        this.bindElement('showReferences', 'click', () => this.showReferencesAlert());
        this.bindElement('showDisclaimer', 'click', () => this.showDisclaimerAlert());
        
        // 모달 닫기
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // 엔터키 이벤트
        this.bindElement('functionName', 'keypress', (e) => {
            if (e.key === 'Enter') this.addFunction();
        });
        
        // 실시간 입력 검증
        this.bindElement('functionName', 'input', () => this.validateFunctionName());
        this.bindElement('screenCount', 'input', () => this.validateScreenCount());
        
        console.log('이벤트 리스너 초기화 완료');
    }

    // 안전한 이벤트 바인딩
    bindElement(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    // 접근성 초기화
    initializeAccessibility() {
        this.announcer = document.getElementById('announcements');
        this.initializeKeyboardNavigation();
        console.log('접근성 기능 초기화 완료');
    }

    // 툴팁 초기화
    initializeTooltip() {
        const tooltipButton = document.getElementById('fpTypeTooltip');
        const tooltipContent = document.getElementById('fp-type-tooltip');
        
        if (tooltipButton && tooltipContent) {
            // 클릭 이벤트
            tooltipButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleTooltip();
            });
            
            // 호버 이벤트
            tooltipButton.addEventListener('mouseenter', () => {
                this.showTooltip();
            });
            
            tooltipButton.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            // 포커스 이벤트
            tooltipButton.addEventListener('focus', () => {
                this.showTooltip();
            });
            
            tooltipButton.addEventListener('blur', () => {
                this.hideTooltip();
            });
            
            // 키보드 이벤트
            tooltipButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTooltip();
                } else if (e.key === 'Escape') {
                    this.hideTooltip();
                }
            });
            
            // 외부 클릭으로 툴팁 닫기
            document.addEventListener('click', (e) => {
                if (!tooltipButton.contains(e.target) && !tooltipContent.contains(e.target)) {
                    this.hideTooltip();
                }
            });
            
            console.log('툴팁 초기화 완료');
        } else {
            console.warn('툴팁 요소를 찾을 수 없습니다');
        }
    }

    showTooltip() {
        const tooltipContent = document.getElementById('fp-type-tooltip');
        if (tooltipContent) {
            tooltipContent.classList.add('show');
            tooltipContent.setAttribute('aria-hidden', 'false');
        }
    }

    hideTooltip() {
        const tooltipContent = document.getElementById('fp-type-tooltip');
        if (tooltipContent) {
            tooltipContent.classList.remove('show');
            tooltipContent.setAttribute('aria-hidden', 'true');
        }
    }

    toggleTooltip() {
        const tooltipContent = document.getElementById('fp-type-tooltip');
        if (tooltipContent) {
            if (tooltipContent.classList.contains('show')) {
                this.hideTooltip();
            } else {
                this.showTooltip();
            }
        }
    }

    // 키보드 네비게이션
    initializeKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal[style*="block"]');
                if (openModal) {
                    openModal.style.display = 'none';
                }
                this.hideTooltip();
            }
        });
    }

    // 스크린 리더 공지
    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
            setTimeout(() => {
                this.announcer.textContent = '';
            }, 1000);
        }
    }

    // 템플릿 초기화
    initializeTemplates() {
        return {
            government: [
                { name: '민원 접수', type: 'EI', complexity: 'average', screens: 3 },
                { name: '민원 조회', type: 'EQ', complexity: 'average', screens: 2 },
                { name: '민원 처리 현황', type: 'EO', complexity: 'complex', screens: 2 },
                { name: '공지사항 관리', type: 'EI', complexity: 'simple', screens: 3 },
                { name: '사용자 인증', type: 'EI', complexity: 'complex', screens: 2 },
                { name: '민원 DB', type: 'ILF', complexity: 'complex', screens: 0 },
                { name: '사용자 DB', type: 'ILF', complexity: 'average', screens: 0 }
            ],
            basic: [
                { name: '메인 페이지', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '회원 가입', type: 'EI', complexity: 'average', screens: 2 },
                { name: '로그인', type: 'EI', complexity: 'simple', screens: 1 },
                { name: '회원 정보 수정', type: 'EI', complexity: 'average', screens: 1 },
                { name: '공지사항', type: 'EQ', complexity: 'simple', screens: 2 },
                { name: '회원 DB', type: 'ILF', complexity: 'average', screens: 0 }
            ],
            ecommerce: [
                { name: '상품 목록', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '상품 상세', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '장바구니', type: 'EI', complexity: 'average', screens: 2 },
                { name: '주문/결제', type: 'EI', complexity: 'complex', screens: 3 },
                { name: '상품 DB', type: 'ILF', complexity: 'complex', screens: 0 },
                { name: '주문 DB', type: 'ILF', complexity: 'complex', screens: 0 }
            ],
            mobile: [
                { name: '스플래시', type: 'EQ', complexity: 'simple', screens: 1 },
                { name: '온보딩', type: 'EQ', complexity: 'average', screens: 3 },
                { name: '로그인', type: 'EI', complexity: 'average', screens: 2 },
                { name: '메인 화면', type: 'EQ', complexity: 'complex', screens: 1 },
                { name: '설정', type: 'EI', complexity: 'average', screens: 2 },
                { name: '사용자 DB', type: 'ILF', complexity: 'average', screens: 0 }
            ]
        };
    }

    // 탭 전환
    switchTab(tabName) {
        console.log('탭 전환:', tabName);
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        document.querySelectorAll('.input-method').forEach(method => {
            method.classList.remove('active');
            method.setAttribute('aria-hidden', 'true');
        });
        
        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const activeMethod = document.getElementById(`${tabName}-input`);
        
        if (activeTabBtn && activeMethod) {
            activeTabBtn.classList.add('active');
            activeTabBtn.setAttribute('aria-selected', 'true');
            activeMethod.classList.add('active');
            activeMethod.setAttribute('aria-hidden', 'false');
            
            this.announce(`${activeTabBtn.textContent} 탭으로 전환되었습니다.`);
        }
    }

    // 기능 추가
    addFunction() {
        console.log('기능 추가 시작');
        
        const nameInput = document.getElementById('functionName');
        const typeSelect = document.getElementById('fpType');
        const screenInput = document.getElementById('screenCount');
        const complexitySelect = document.getElementById('complexity');
        
        if (!this.validateRequiredElements([nameInput, typeSelect, screenInput, complexitySelect])) {
            return;
        }
        
        const name = nameInput.value.trim();
        const type = typeSelect.value;
        const screenCount = parseInt(screenInput.value) || 1;
        const complexity = complexitySelect.value;
        
        // 입력 검증
        if (!name) {
            this.showValidationError(nameInput, '기능명을 입력해주세요.');
            return;
        }
        
        if (screenCount < 0 || screenCount > 100) {
            this.showValidationError(screenInput, '화면 수는 0-100 사이의 값을 입력해주세요.');
            return;
        }
        
        // 중복 기능명 체크
        if (this.functions.some(func => func.name.toLowerCase() === name.toLowerCase())) {
            this.showValidationError(nameInput, '이미 존재하는 기능명입니다.');
            return;
        }
        
        const estimationMethod = document.getElementById('estimationMethod').value;
        const weight = estimationMethod === 'simple' 
            ? this.simpleWeights[type] 
            : this.fpWeights[type][complexity];
        
        const functionObj = {
            id: Date.now(),
            name: name,
            type: type,
            complexity: complexity,
            weight: weight,
            screenCount: screenCount,
            fp: weight * (type.includes('LF') ? 1 : screenCount),
            createdAt: new Date().toISOString()
        };
        
        this.functions.push(functionObj);
        this.updateFunctionTable();
        this.calculateResults();
        this.clearInputForm();
        
        this.announce(`${name} 기능이 추가되었습니다. 총 ${this.functions.length}개의 기능이 등록되었습니다.`);
        this.showSuccessMessage('기능이 성공적으로 추가되었습니다.');
        
        console.log('기능 추가 완료:', functionObj);
    }

    // 일괄 추가
    bulkAddFunctions() {
        console.log('일괄 추가 시작');
        
        const bulkTextarea = document.getElementById('bulkFunctions');
        if (!bulkTextarea) {
            console.error('일괄 입력 텍스트 영역을 찾을 수 없습니다');
            return;
        }
        
        const bulkText = bulkTextarea.value.trim();
        if (!bulkText) {
            alert('일괄 입력할 데이터를 입력해주세요.');
            return;
        }
        
        const lines = bulkText.split('\n');
        const estimationMethod = document.getElementById('estimationMethod').value;
        let addedCount = 0;
        
        lines.forEach((line, index) => {
            const parts = line.split(',').map(part => part.trim());
            if (parts.length >= 4) {
                const [name, type, screenCount, complexity] = parts;
                
                if (this.fpWeights[type] && name) {
                    const weight = estimationMethod === 'simple' 
                        ? this.simpleWeights[type] 
                        : this.fpWeights[type][complexity] || this.fpWeights[type]['average'];
                    
                    const functionObj = {
                        id: Date.now() + Math.random(),
                        name: name,
                        type: type,
                        complexity: complexity || 'average',
                        weight: weight,
                        screenCount: parseInt(screenCount) || 1,
                        fp: weight * (type.includes('LF') ? 1 : parseInt(screenCount) || 1),
                        createdAt: new Date().toISOString()
                    };
                    
                    this.functions.push(functionObj);
                    addedCount++;
                }
            }
        });
        
        bulkTextarea.value = '';
        this.updateFunctionTable();
        this.calculateResults();
        
        this.announce(`${addedCount}개의 기능이 일괄 추가되었습니다.`);
        this.showSuccessMessage(`${addedCount}개의 기능이 추가되었습니다.`);
        
        console.log('일괄 추가 완료. 추가된 기능 수:', addedCount);
    }

    // 샘플 로드
    loadTemplate(templateType) {
        if (!this.templates[templateType]) return;
        
        if (this.functions.length > 0) {
            if (!confirm('기존 기능 목록이 삭제됩니다. 계속하시겠습니까?')) {
                return;
            }
        }
        
        this.functions = [];
        const estimationMethod = document.getElementById('estimationMethod').value;
        
        this.templates[templateType].forEach(template => {
            const weight = estimationMethod === 'simple' 
                ? this.simpleWeights[template.type] 
                : this.fpWeights[template.type][template.complexity];
            
            const functionObj = {
                id: Date.now() + Math.random(),
                name: template.name,
                type: template.type,
                complexity: template.complexity,
                weight: weight,
                screenCount: template.screens,
                fp: weight * (template.type.includes('LF') ? 1 : template.screens),
                createdAt: new Date().toISOString()
            };
            
            this.functions.push(functionObj);
        });
        
        this.updateFunctionTable();
        this.calculateResults();
        
        this.announce(`${templateType} 샘플이 로드되었습니다.`);
        this.showSuccessMessage('샘플이 적용되었습니다.');
    }

    // Excel 업로드 처리
    handleExcelUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.showLoading();
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                this.parseExcelData(jsonData);
                this.hideLoading();
            } catch (error) {
                console.error('Excel 파일 읽기 오류:', error);
                alert('Excel 파일을 읽는 중 오류가 발생했습니다.');
                this.hideLoading();
            }
        };
        
        reader.readAsArrayBuffer(file);
    }

    parseExcelData(data) {
        if (data.length < 2) {
            alert('유효한 데이터가 없습니다.');
            return;
        }
        
        if (this.functions.length > 0) {
            if (!confirm('기존 기능 목록이 삭제됩니다. 계속하시겠습니까?')) {
                return;
            }
        }
        
        this.functions = [];
        const estimationMethod = document.getElementById('estimationMethod').value;
        
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length >= 4 && row[0]) {
                const [name, type, complexity, screenCount] = row;
                
                if (this.fpWeights[type] && name) {
                    const weight = estimationMethod === 'simple' 
                        ? this.simpleWeights[type] 
                        : this.fpWeights[type][complexity] || this.fpWeights[type]['average'];
                    
                    const functionObj = {
                        id: Date.now() + Math.random(),
                        name: name,
                        type: type,
                        complexity: complexity || 'average',
                        weight: weight,
                        screenCount: parseInt(screenCount) || 1,
                        fp: weight * (type.includes('LF') ? 1 : parseInt(screenCount) || 1),
                        createdAt: new Date().toISOString()
                    };
                    
                    this.functions.push(functionObj);
                }
            }
        }
        
        this.updateFunctionTable();
        this.calculateResults();
        
        this.announce(`${this.functions.length}개의 기능이 업로드되었습니다.`);
        this.showSuccessMessage(`${this.functions.length}개의 기능이 업로드되었습니다.`);
    }

    // Excel 다운로드
    downloadExcel() {
        if (this.functions.length === 0) {
            alert('다운로드할 기능이 없습니다.');
            return;
        }
        
        const data = [
            ['기능명', 'FP유형', '복잡도', '가중치', '화면수', 'FP', '비고']
        ];
        
        this.functions.forEach(func => {
            data.push([
                func.name,
                func.type,
                func.complexity,
                func.weight,
                func.screenCount,
                func.fp.toFixed(1),
                ''
            ]);
        });
        
        const totalFP = this.functions.reduce((sum, func) => sum + func.fp, 0);
        const totalCost = totalFP * this.fpUnitPrice;
        const totalScreens = this.functions.reduce((sum, func) => sum + func.screenCount, 0);
        
        data.push([]);
        data.push(['=== 산정 결과 ===']);
        data.push(['총 기능점수', totalFP.toFixed(1), 'FP']);
        data.push(['개발비용', totalCost.toFixed(0), '만원']);
        data.push(['총 화면수', totalScreens, '개']);
        data.push([]);
        data.push(['=== UI/UX 인력 산정 ===']);
        data.push(['UI/UX 기획자', (totalScreens * this.uiuxRates.planner).toFixed(2), 'MM']);
        data.push(['UI/UX 디자이너', (totalScreens * this.uiuxRates.designer).toFixed(2), 'MM']);
        data.push(['웹 퍼블리셔', (totalScreens * this.uiuxRates.publisher).toFixed(2), 'MM']);
        
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'FP산정결과');
        
        const projectName = document.getElementById('projectName').value || '프로젝트';
        const fileName = `${projectName}_FP산정결과_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        XLSX.writeFile(workbook, fileName);
        this.announce('Excel 파일이 다운로드되었습니다.');
    }

    // 기능 삭제
    removeFunction(id) {
        const func = this.functions.find(f => f.id === id);
        if (func && confirm(`'${func.name}' 기능을 삭제하시겠습니까?`)) {
            this.functions = this.functions.filter(f => f.id !== id);
            this.updateFunctionTable();
            this.calculateResults();
            this.announce(`${func.name} 기능이 삭제되었습니다.`);
        }
    }

    // 기능 수정
    editFunction(id) {
        const func = this.functions.find(f => f.id === id);
        if (!func) return;
        
        const newName = prompt('기능명:', func.name);
        if (newName === null) return;
        
        const newScreenCount = prompt('화면 수:', func.screenCount);
        if (newScreenCount === null) return;
        
        func.name = newName.trim();
        func.screenCount = parseInt(newScreenCount) || 1;
        func.fp = func.weight * (func.type.includes('LF') ? 1 : func.screenCount);
        
        this.updateFunctionTable();
        this.calculateResults();
        this.announce(`${func.name} 기능이 수정되었습니다.`);
    }

    // 전체 삭제
    clearAllFunctions() {
        if (this.functions.length === 0) return;
        
        if (confirm('모든 기능을 삭제하시겠습니까?')) {
            this.functions = [];
            this.updateFunctionTable();
            this.calculateResults();
            this.announce('모든 기능이 삭제되었습니다.');
        }
    }

    // 테이블 업데이트
    updateFunctionTable() {
        const tbody = document.querySelector('#functionTable tbody');
        const functionCount = document.getElementById('functionCount');
        
        tbody.innerHTML = '';
        
        this.functions.forEach(func => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${func.name}</td>
                <td><span class="fp-type-badge fp-${func.type.toLowerCase()}">${func.type}</span></td>
                <td>${func.complexity}</td>
                <td>${func.weight.toFixed(1)}</td>
                <td>${func.screenCount}</td>
                <td><strong>${func.fp.toFixed(1)}</strong></td>
                <td>
                    <button onclick="fpCalculator.editFunction(${func.id})" 
                            class="btn-small" aria-label="${func.name} 수정">수정</button>
                    <button onclick="fpCalculator.removeFunction(${func.id})" 
                            class="btn-small btn-danger" aria-label="${func.name} 삭제">삭제</button>
                </td>
            `;
        });
        
        // 합계 행 업데이트
        const totalFP = this.functions.reduce((sum, func) => sum + func.fp, 0);
        document.getElementById('totalFPInTable').textContent = totalFP.toFixed(1);
        
        // 기능 개수 업데이트
        if (functionCount) {
            functionCount.textContent = `(${this.functions.length}개)`;
        }
    }

    // 결과 계산
    calculateResults() {
        const totalFP = this.functions.reduce((sum, func) => sum + func.fp, 0);
        const totalCost = totalFP * this.fpUnitPrice;
        const totalScreens = this.functions.reduce((sum, func) => sum + func.screenCount, 0);
        const estimatedDuration = Math.ceil(totalFP / 100);
        
        // FP 결과 업데이트
        this.updateElementText('totalFP', totalFP.toFixed(1));
        this.updateElementText('totalCost', totalCost.toFixed(0));
        this.updateElementText('totalScreens', totalScreens.toString());
        this.updateElementText('estimatedDuration', estimatedDuration.toString());
        
        // UI/UX 인력 산정
        const uxPlannerMM = totalScreens * this.uiuxRates.planner;
        const uiDesignerMM = totalScreens * this.uiuxRates.designer;
        const publisherMM = totalScreens * this.uiuxRates.publisher;
        
        this.updateElementText('uxPlanner', uxPlannerMM.toFixed(2));
        this.updateElementText('uiDesigner', uiDesignerMM.toFixed(2));
        this.updateElementText('publisher', publisherMM.toFixed(2));
    }

    updateElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    // 검증 기능
    validateFunctions() {
        const issues = [];
        const results = document.getElementById('validationResults');
        
        if (this.functions.length === 0) {
            issues.push('기능이 하나도 입력되지 않았습니다.');
        }
        
        // 중복 기능명 검증
        const functionNames = this.functions.map(f => f.name.toLowerCase());
        const duplicates = functionNames.filter((name, index) => functionNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            issues.push(`중복된 기능명이 있습니다: ${[...new Set(duplicates)].join(', ')}`);
        }
        
        // FP 유형별 비율 검증
        const typeCount = {};
        this.functions.forEach(func => {
            typeCount[func.type] = (typeCount[func.type] || 0) + 1;
        });
        
        const totalCount = this.functions.length;
        if (typeCount.ILF && typeCount.ILF / totalCount > 0.4) {
            issues.push('내부논리파일(ILF)의 비율이 너무 높습니다. (40% 초과)');
        }
        
        if (!typeCount.ILF && !typeCount.EIF) {
            issues.push('데이터 기능(ILF 또는 EIF)이 없습니다.');
        }
        
        // 결과 표시
        results.innerHTML = '';
        if (issues.length === 0) {
            results.innerHTML = '<div class="validation-success">✅ 검증 완료: 문제가 발견되지 않았습니다.</div>';
            this.announce('검증이 완료되었습니다. 문제가 발견되지 않았습니다.');
        } else {
            issues.forEach(issue => {
                results.innerHTML += `<div class="validation-issue">⚠️ ${issue}</div>`;
            });
            this.announce(`검증 결과 ${issues.length}개의 문제가 발견되었습니다.`);
        }
    }

    // 입력 검증
    validateRequiredElements(elements) {
        for (let element of elements) {
            if (!element) {
                console.error('필수 입력 요소를 찾을 수 없습니다.');
                this.showErrorMessage('시스템 오류가 발생했습니다. 페이지를 새로고침해주세요.');
                return false;
            }
        }
        return true;
    }

    showValidationError(element, message) {
        element.focus();
        element.setAttribute('aria-invalid', 'true');
        
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        element.parentNode.appendChild(errorDiv);
        
        this.announce(`오류: ${message}`);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
            element.removeAttribute('aria-invalid');
        }, 3000);
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.setAttribute('role', 'status');
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message global-error';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // 실시간 검증
    validateFunctionName() {
        const nameInput = document.getElementById('functionName');
        const name = nameInput.value.trim();
        
        if (name && this.functions.some(func => func.name.toLowerCase() === name.toLowerCase())) {
            this.showValidationError(nameInput, '이미 존재하는 기능명입니다.');
        } else {
            nameInput.removeAttribute('aria-invalid');
            const errorMsg = nameInput.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
    }

    validateScreenCount() {
        const screenInput = document.getElementById('screenCount');
        const count = parseInt(screenInput.value);
        
        if (isNaN(count) || count < 0 || count > 100) {
            this.showValidationError(screenInput, '화면 수는 0-100 사이의 값을 입력해주세요.');
        } else {
            screenInput.removeAttribute('aria-invalid');
            const errorMsg = screenInput.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
    }

    // 입력 폼 관리
    clearInputForm() {
        document.getElementById('functionName').value = '';
        document.getElementById('screenCount').value = '1';
        document.getElementById('complexity').value = 'average';
    }

    clearBulkInput() {
        document.getElementById('bulkFunctions').value = '';
    }

    // PDF 내보내기
    exportToPDF() {
        if (this.functions.length === 0) {
            alert('내보낼 데이터가 없습니다.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFont('helvetica');
        
        const projectName = document.getElementById('projectName').value || '프로젝트';
        doc.setFontSize(20);
        doc.text(`${projectName} FP 산정 결과`, 20, 30);
        
        doc.setFontSize(12);
        const projectType = document.getElementById('projectType').value;
        const estimationMethod = document.getElementById('estimationMethod').value;
        doc.text(`프로젝트 유형: ${projectType}`, 20, 50);
        doc.text(`산정 방식: ${estimationMethod}`, 20, 60);
        doc.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, 20, 70);
        
        const totalFP = this.functions.reduce((sum, func) => sum + func.fp, 0);
        const totalCost = totalFP * this.fpUnitPrice;
        const totalScreens = this.functions.reduce((sum, func) => sum + func.screenCount, 0);
        
        doc.setFontSize(14);
        doc.text('=== 산정 결과 ===', 20, 90);
        doc.setFontSize(12);
        doc.text(`총 기능점수: ${totalFP.toFixed(1)} FP`, 20, 105);
        doc.text(`개발비용: ${totalCost.toFixed(0)} 만원`, 20, 115);
        doc.text(`총 화면수: ${totalScreens} 개`, 20, 125);
        
        doc.setFontSize(14);
        doc.text('=== UI/UX 인력 산정 ===', 20, 145);
        doc.setFontSize(12);
        doc.text(`UI/UX 기획자: ${(totalScreens * this.uiuxRates.planner).toFixed(2)} MM`, 20, 160);
        doc.text(`UI/UX 디자이너: ${(totalScreens * this.uiuxRates.designer).toFixed(2)} MM`, 20, 170);
        doc.text(`웹 퍼블리셔: ${(totalScreens * this.uiuxRates.publisher).toFixed(2)} MM`, 20, 180);
        
        const fileName = `${projectName}_FP산정결과_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        this.announce('PDF 파일이 다운로드되었습니다.');
    }

    exportToExcel() {
        this.downloadExcel();
    }

    // 공유 기능
    shareProject() {
        if (this.functions.length === 0) {
            alert('공유할 기능 목록이 없습니다.');
            return;
        }
        
        const shareData = {
            name: document.getElementById('projectName').value || '프로젝트',
            type: document.getElementById('projectType').value,
            estimationMethod: document.getElementById('estimationMethod').value,
            functions: this.functions
        };
        
        const encodedData = btoa(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.announce('공유 링크가 클립보드에 복사되었습니다.');
            this.showSuccessMessage('공유 링크가 클립보드에 복사되었습니다!');
        }).catch(() => {
            prompt('공유 링크:', shareUrl);
        });
    }

    // 모달 관리
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    showReferencesAlert() {
        alert(`상세 근거 자료:

1. IFPUG CPM 4.3.1 - 국제 표준 FP 측정법
2. ISO/IEC 20926:2009 - 소프트웨어 측정 국제 표준
3. KOSA SW사업 대가산정 가이드 (2024년판)
4. NIPA SW개발비 산정 가이드라인
5. 국내 SI 업체 평균 투입 공수 분석 데이터

※ 모든 계산식은 공인된 표준과 실무 데이터를 기반으로 합니다.`);
    }

    showDisclaimerAlert() {
        alert(`면책 사항:

본 도구는 간이 산정 목적으로 제작되었습니다.
- 정확한 산정을 위해서는 전문가 검토가 필요합니다.
- 프로젝트 특성에 따라 결과가 달라질 수 있습니다.
- 최종 의사결정 시 추가 검증을 권장합니다.

개발: Sophrosyne AI Lab
GitHub: https://github.com/difains/FP_UIUX`);
    }

    // 로딩 관리
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
        document.getElementById('loadingOverlay').setAttribute('aria-hidden', 'false');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
        document.getElementById('loadingOverlay').setAttribute('aria-hidden', 'true');
    }

    // 공유된 프로젝트 로드
    loadSharedProject() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareData = urlParams.get('share');
        
        if (shareData) {
            try {
                const projectData = JSON.parse(atob(shareData));
                
                document.getElementById('projectName').value = `${projectData.name} (공유됨)`;
                document.getElementById('projectType').value = projectData.type;
                document.getElementById('estimationMethod').value = projectData.estimationMethod;
                this.functions = [...projectData.functions];
                
                this.updateFunctionTable();
                this.calculateResults();
                
                window.history.replaceState({}, document.title, window.location.pathname);
                
                this.announce('공유된 프로젝트가 로드되었습니다.');
                this.showSuccessMessage('공유된 프로젝트가 로드되었습니다!');
            } catch (error) {
                console.error('공유 프로젝트 로드 오류:', error);
                alert('공유 링크가 올바르지 않습니다.');
            }
        }
    }

    // 초기화
    init() {
        this.loadSharedProject();
    }
}

// 전역 변수로 인스턴스 생성
let fpCalculator;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료');
    fpCalculator = new FPCalculator();
    fpCalculator.init();
    console.log('FP Calculator 초기화 완료');
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            e.target.setAttribute('aria-hidden', 'true');
        }
    });
});