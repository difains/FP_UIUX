class FPCalculator {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('fpProjects')) || {};
        this.currentProject = null;
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
        this.loadProjectList();
    }

    initializeEventListeners() {
        console.log('이벤트 리스너 초기화 시작');
        
        // 프로젝트 관리
        document.getElementById('newProject').addEventListener('click', () => this.createNewProject());
        document.getElementById('deleteProject').addEventListener('click', () => this.deleteProject());
        document.getElementById('projectList').addEventListener('change', (e) => this.loadProject(e.target.value));
        
        // 기능 입력 - 수정된 부분
        const addBtn = document.getElementById('addFunction');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                console.log('추가 버튼 클릭됨');
                this.addFunction();
            });
        }
        
        const bulkAddBtn = document.getElementById('bulkAdd');
        if (bulkAddBtn) {
            bulkAddBtn.addEventListener('click', () => {
                console.log('일괄 추가 버튼 클릭됨');
                this.bulkAddFunctions();
            });
        }
        
        // 엔터키 이벤트
        const functionNameInput = document.getElementById('functionName');
        if (functionNameInput) {
            functionNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('엔터키 입력됨');
                    this.addFunction();
                }
            });
        }
        
        // 탭 전환 - 수정된 부분
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('탭 클릭됨:', e.target.dataset.tab);
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 나머지 이벤트 리스너들...
        this.initializeOtherEventListeners();
        
        console.log('이벤트 리스너 초기화 완료');
    }

    initializeOtherEventListeners() {
        // 템플릿 로드
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.loadTemplate(template);
            });
        });
        
        // Excel 업로드/다운로드
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('excelUpload').click();
        });
        document.getElementById('excelUpload').addEventListener('change', (e) => this.handleExcelUpload(e));
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadExcel());
        
        // 검증 및 내보내기
        document.getElementById('validateFunctions').addEventListener('click', () => this.validateFunctions());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAllFunctions());
        document.getElementById('exportPDF').addEventListener('click', () => this.exportToPDF());
        document.getElementById('exportExcel').addEventListener('click', () => this.exportToExcel());
        document.getElementById('shareProject').addEventListener('click', () => this.shareProject());
        
        // 프로젝트 정보 변경 감지
        ['projectName', 'projectType', 'estimationMethod'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.saveCurrentProject());
            }
        });
        
        // 자동 저장
        setInterval(() => this.autoSave(), 30000);
    }

    // 템플릿 초기화
    initializeTemplates() {
        return {
            basic: [
                { name: '메인 페이지', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '회원 가입', type: 'EI', complexity: 'average', screens: 2 },
                { name: '로그인', type: 'EI', complexity: 'simple', screens: 1 },
                { name: '회원 정보 조회', type: 'EQ', complexity: 'simple', screens: 1 },
                { name: '회원 정보 수정', type: 'EI', complexity: 'average', screens: 1 },
                { name: '공지사항 목록', type: 'EQ', complexity: 'simple', screens: 1 },
                { name: '공지사항 상세', type: 'EQ', complexity: 'simple', screens: 1 },
                { name: '문의하기', type: 'EI', complexity: 'simple', screens: 1 },
                { name: '회원 DB', type: 'ILF', complexity: 'average', screens: 0 },
                { name: '공지사항 DB', type: 'ILF', complexity: 'simple', screens: 0 }
            ],
            ecommerce: [
                { name: '상품 목록', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '상품 상세', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '상품 검색', type: 'EQ', complexity: 'complex', screens: 1 },
                { name: '장바구니', type: 'EI', complexity: 'average', screens: 2 },
                { name: '주문하기', type: 'EI', complexity: 'complex', screens: 3 },
                { name: '결제', type: 'EI', complexity: 'complex', screens: 2 },
                { name: '주문 내역', type: 'EQ', complexity: 'average', screens: 2 },
                { name: '상품 관리', type: 'EI', complexity: 'complex', screens: 3 },
                { name: '재고 관리', type: 'EI', complexity: 'average', screens: 2 },
                { name: '매출 통계', type: 'EO', complexity: 'complex', screens: 2 },
                { name: '상품 DB', type: 'ILF', complexity: 'complex', screens: 0 },
                { name: '주문 DB', type: 'ILF', complexity: 'complex', screens: 0 },
                { name: '회원 DB', type: 'ILF', complexity: 'average', screens: 0 },
                { name: '결제 API', type: 'EIF', complexity: 'average', screens: 0 }
            ],
            cms: [
                { name: '게시글 목록', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '게시글 작성', type: 'EI', complexity: 'average', screens: 1 },
                { name: '게시글 수정', type: 'EI', complexity: 'average', screens: 1 },
                { name: '게시글 삭제', type: 'EI', complexity: 'simple', screens: 0 },
                { name: '게시글 검색', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '댓글 관리', type: 'EI', complexity: 'average', screens: 1 },
                { name: '파일 업로드', type: 'EI', complexity: 'average', screens: 1 },
                { name: '카테고리 관리', type: 'EI', complexity: 'simple', screens: 2 },
                { name: '사용자 권한 관리', type: 'EI', complexity: 'complex', screens: 2 },
                { name: '통계 대시보드', type: 'EO', complexity: 'average', screens: 1 },
                { name: '게시판 DB', type: 'ILF', complexity: 'average', screens: 0 },
                { name: '사용자 DB', type: 'ILF', complexity: 'average', screens: 0 },
                { name: '파일 DB', type: 'ILF', complexity: 'simple', screens: 0 }
            ],
            mobile: [
                { name: '스플래시 화면', type: 'EQ', complexity: 'simple', screens: 1 },
                { name: '온보딩', type: 'EQ', complexity: 'average', screens: 3 },
                { name: '로그인/회원가입', type: 'EI', complexity: 'average', screens: 2 },
                { name: '메인 대시보드', type: 'EQ', complexity: 'complex', screens: 1 },
                { name: '프로필 관리', type: 'EI', complexity: 'average', screens: 2 },
                { name: '설정', type: 'EI', complexity: 'average', screens: 3 },
                { name: '알림', type: 'EQ', complexity: 'average', screens: 1 },
                { name: '검색', type: 'EQ', complexity: 'average', screens: 2 },
                { name: '즐겨찾기', type: 'EI', complexity: 'simple', screens: 1 },
                { name: '푸시 알림', type: 'EO', complexity: 'average', screens: 0 },
                { name: '사용자 DB', type: 'ILF', complexity: 'average', screens: 0 },
                { name: '컨텐츠 DB', type: 'ILF', complexity: 'complex', screens: 0 },
                { name: '푸시 서비스 API', type: 'EIF', complexity: 'simple', screens: 0 }
            ]
        };
    }

    // 프로젝트 관리
    createNewProject() {
        const name = prompt('새 프로젝트 이름을 입력하세요:');
        if (!name) return;
        
        const projectId = Date.now().toString();
        const project = {
            id: projectId,
            name: name,
            type: 'web',
            estimationMethod: 'simple',
            functions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.projects[projectId] = project;
        this.saveProjects();
        this.loadProjectList();
        this.loadProject(projectId);
    }

    deleteProject() {
        if (!this.currentProject) return;
        
        if (confirm('현재 프로젝트를 삭제하시겠습니까?')) {
            delete this.projects[this.currentProject];
            this.saveProjects();
            this.currentProject = null;
            this.functions = [];
            this.loadProjectList();
            this.clearForm();
            this.updateDisplay();
        }
    }

    loadProject(projectId) {
        if (!projectId || !this.projects[projectId]) {
            this.currentProject = null;
            this.functions = [];
            this.clearForm();
            this.updateDisplay();
            return;
        }
        
        this.currentProject = projectId;
        const project = this.projects[projectId];
        this.functions = [...project.functions];
        
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectType').value = project.type;
        document.getElementById('estimationMethod').value = project.estimationMethod;
        
        this.updateFunctionTable();
        this.calculateResults();
    }

    loadProjectList() {
        const select = document.getElementById('projectList');
        select.innerHTML = '<option value="">새 프로젝트</option>';
        
        Object.values(this.projects).forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
        
        if (this.currentProject) {
            select.value = this.currentProject;
        }
    }

    saveCurrentProject() {
        if (!this.currentProject) return;
        
        const project = this.projects[this.currentProject];
        project.name = document.getElementById('projectName').value;
        project.type = document.getElementById('projectType').value;
        project.estimationMethod = document.getElementById('estimationMethod').value;
        project.functions = [...this.functions];
        project.updatedAt = new Date().toISOString();
        
        this.saveProjects();
        this.loadProjectList();
    }

    saveProjects() {
        localStorage.setItem('fpProjects', JSON.stringify(this.projects));
    }

    // 탭 전환 - 수정된 함수
    switchTab(tabName) {
        console.log('탭 전환:', tabName);
        
        // 모든 탭 버튼에서 active 클래스 제거
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 모든 입력 방법에서 active 클래스 제거
        document.querySelectorAll('.input-method').forEach(method => {
            method.classList.remove('active');
        });
        
        // 클릭된 탭 버튼에 active 클래스 추가
        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }
        
        // 해당 입력 방법에 active 클래스 추가
        const activeMethod = document.getElementById(`${tabName}-input`);
        if (activeMethod) {
            activeMethod.classList.add('active');
        }
        
        console.log('탭 전환 완료:', tabName);
    }

    // 기능 추가 - 수정된 함수
    addFunction() {
        console.log('addFunction 호출됨');
        
        const nameInput = document.getElementById('functionName');
        const typeSelect = document.getElementById('fpType');
        const screenInput = document.getElementById('screenCount');
        const complexitySelect = document.getElementById('complexity');
        
        if (!nameInput || !typeSelect || !screenInput || !complexitySelect) {
            console.error('필수 입력 요소를 찾을 수 없습니다');
            alert('입력 요소를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        const name = nameInput.value.trim();
        const type = typeSelect.value;
        const screenCount = parseInt(screenInput.value) || 1;
        const complexity = complexitySelect.value;
        
        console.log('입력값:', { name, type, screenCount, complexity });
        
        if (!name) {
            alert('기능명을 입력해주세요.');
            nameInput.focus();
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
            fp: weight * (type.includes('LF') ? 1 : screenCount)
        };
        
        console.log('생성된 기능 객체:', functionObj);
        
        this.functions.push(functionObj);
        this.updateFunctionTable();
        this.calculateResults();
        this.clearInputs();
        this.saveCurrentProject();
        
        console.log('기능 추가 완료. 총 기능 수:', this.functions.length);
    }

    // 일괄 추가 - 수정된 함수
    bulkAddFunctions() {
        console.log('bulkAddFunctions 호출됨');
        
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
        
        console.log('처리할 라인 수:', lines.length);
        
        lines.forEach((line, index) => {
            const parts = line.split(',').map(part => part.trim());
            if (parts.length >= 4) {
                const [name, type, screenCount, complexity] = parts;
                
                if (this.fpWeights[type]) {
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
                        fp: weight * (type.includes('LF') ? 1 : parseInt(screenCount) || 1)
                    };
                    
                    this.functions.push(functionObj);
                    addedCount++;
                    console.log(`라인 ${index + 1} 처리 완료:`, functionObj.name);
                } else {
                    console.warn(`라인 ${index + 1}: 잘못된 FP 유형 - ${type}`);
                }
            } else {
                console.warn(`라인 ${index + 1}: 형식이 올바르지 않음 - ${line}`);
            }
        });
        
        bulkTextarea.value = '';
        this.updateFunctionTable();
        this.calculateResults();
        this.saveCurrentProject();
        
        alert(`${addedCount}개의 기능이 추가되었습니다.`);
        console.log('일괄 추가 완료. 추가된 기능 수:', addedCount);
    }

    // 템플릿 로드
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
                fp: weight * (template.type.includes('LF') ? 1 : template.screens)
            };
            
            this.functions.push(functionObj);
        });
        
        this.updateFunctionTable();
        this.calculateResults();
        this.saveCurrentProject();
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
        
        // 헤더 확인 (첫 번째 행)
        const headers = data[0];
        const expectedHeaders = ['기능명', 'FP유형', '복잡도', '화면수'];
        
        if (!expectedHeaders.every(header => headers.includes(header))) {
            alert('Excel 파일 형식이 올바르지 않습니다.\n헤더: 기능명, FP유형, 복잡도, 화면수');
            return;
        }
        
        if (this.functions.length > 0) {
            if (!confirm('기존 기능 목록이 삭제됩니다. 계속하시겠습니까?')) {
                return;
            }
        }
        
        this.functions = [];
        const estimationMethod = document.getElementById('estimationMethod').value;
        
        // 데이터 파싱 (두 번째 행부터)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length >= 4 && row[0]) {
                const [name, type, complexity, screenCount] = row;
                
                if (this.fpWeights[type]) {
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
                        fp: weight * (type.includes('LF') ? 1 : parseInt(screenCount) || 1)
                    };
                    
                    this.functions.push(functionObj);
                }
            }
        }
        
        this.updateFunctionTable();
        this.calculateResults();
        this.saveCurrentProject();
        
        alert(`${this.functions.length}개의 기능이 업로드되었습니다.`);
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
        
        // 요약 정보 추가
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
    }

    // 기능 삭제
    removeFunction(id) {
        this.functions = this.functions.filter(func => func.id !== id);
        this.updateFunctionTable();
        this.calculateResults();
        this.saveCurrentProject();
    }

    // 전체 삭제
    clearAllFunctions() {
        if (this.functions.length === 0) return;
        
        if (confirm('모든 기능을 삭제하시겠습니까?')) {
            this.functions = [];
            this.updateFunctionTable();
            this.calculateResults();
            this.saveCurrentProject();
        }
    }

    // 기능 테이블 업데이트
    updateFunctionTable() {
        const tbody = document.querySelector('#functionTable tbody');
        tbody.innerHTML = '';
        
        this.functions.forEach(func => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${func.name}</td>
                <td><span class="fp-type-badge fp-${func.type.toLowerCase()}">${func.type}</span></td>
                <td>${func.complexity}</td>
                <td>${func.weight}</td>
                <td>${func.screenCount}</td>
                <td><strong>${func.fp.toFixed(1)}</strong></td>
                <td>
                    <button onclick="fpCalculator.editFunction(${func.id})" class="btn-small">수정</button>
                    <button onclick="fpCalculator.removeFunction(${func.id})" class="btn-small btn-danger">삭제</button>
                </td>
            `;
        });
    }

    // 기능 수정
    editFunction(id) {
        const func = this.functions.find(f => f.id === id);
        if (!func) return;
        
        const newName = prompt('기능명:', func.name);
        if (newName === null) return;
        
        const newScreenCount = prompt('화면 수:', func.screenCount);
        if (newScreenCount === null) return;
        
        func.name = newName;
        func.screenCount = parseInt(newScreenCount) || 1;
        func.fp = func.weight * (func.type.includes('LF') ? 1 : func.screenCount);
        
        this.updateFunctionTable();
        this.calculateResults();
        this.saveCurrentProject();
    }

    // 결과 계산
    calculateResults() {
        const totalFP = this.functions.reduce((sum, func) => sum + func.fp, 0);
        const totalCost = totalFP * this.fpUnitPrice;
        const totalScreens = this.functions.reduce((sum, func) => sum + func.screenCount, 0);
        const estimatedDuration = Math.ceil(totalFP / 100); // 100FP당 1개월 가정
        
        // FP 결과 업데이트
        document.getElementById('totalFP').textContent = totalFP.toFixed(1);
        document.getElementById('totalCost').textContent = totalCost.toFixed(0);
        document.getElementById('totalScreens').textContent = totalScreens;
        document.getElementById('estimatedDuration').textContent = estimatedDuration;
        
        // UI/UX 인력 산정
        const uxPlannerMM = totalScreens * this.uiuxRates.planner;
        const uiDesignerMM = totalScreens * this.uiuxRates.designer;
        const publisherMM = totalScreens * this.uiuxRates.publisher;
        
        document.getElementById('uxPlanner').textContent = uxPlannerMM.toFixed(2);
        document.getElementById('uiDesigner').textContent = uiDesignerMM.toFixed(2);
        document.getElementById('publisher').textContent = publisherMM.toFixed(2);
    }

    // 검증 기능
    validateFunctions() {
        const issues = [];
        const results = document.getElementById('validationResults');
        
        // 기본 검증
        if (this.functions.length === 0) {
            issues.push('기능이 하나도 입력되지 않았습니다.');
        }
        
        // 중복 기능명 검증
        const functionNames = this.functions.map(f => f.name.toLowerCase());
        const duplicates = functionNames.filter((name, index) => functionNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            issues.push(`중복된 기능명이 있습니다: ${[...new Set(duplicates)].join(', ')}`);
        }
        
        // FP 유형별 비율 검증 (IFPUG 권장사항)
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
        
        // 화면 수 검증
        const zeroScreenFunctions = this.functions.filter(f => f.screenCount === 0 && !f.type.includes('LF'));
        if (zeroScreenFunctions.length > 0) {
            issues.push(`화면 수가 0인 트랜잭션 기능이 있습니다: ${zeroScreenFunctions.map(f => f.name).join(', ')}`);
        }
        
        // 결과 표시
        results.innerHTML = '';
        if (issues.length === 0) {
            results.innerHTML = '<div class="validation-success">✅ 검증 완료: 문제가 발견되지 않았습니다.</div>';
        } else {
            issues.forEach(issue => {
                results.innerHTML += `<div class="validation-issue">⚠️ ${issue}</div>`;
            });
        }
    }

    // PDF 내보내기
    exportToPDF() {
        if (this.functions.length === 0) {
            alert('내보낼 데이터가 없습니다.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // 한글 폰트 설정 (기본 폰트 사용)
        doc.setFont('helvetica');
        
        // 제목
        doc.setFontSize(20);
        const projectName = document.getElementById('projectName').value || '프로젝트';
        doc.text(`${projectName} FP 산정 결과`, 20, 30);
        
        // 프로젝트 정보
        doc.setFontSize(12);
        const projectType = document.getElementById('projectType').value;
        const estimationMethod = document.getElementById('estimationMethod').value;
        doc.text(`프로젝트 유형: ${projectType}`, 20, 50);
        doc.text(`산정 방식: ${estimationMethod}`, 20, 60);
        doc.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, 20, 70);
        
        // 요약 정보
        const totalFP = this.functions.reduce((sum, func) => sum + func.fp, 0);
        const totalCost = totalFP * this.fpUnitPrice;
        const totalScreens = this.functions.reduce((sum, func) => sum + func.screenCount, 0);
        
        doc.setFontSize(14);
        doc.text('=== 산정 결과 ===', 20, 90);
        doc.setFontSize(12);
        doc.text(`총 기능점수: ${totalFP.toFixed(1)} FP`, 20, 105);
        doc.text(`개발비용: ${totalCost.toFixed(0)} 만원`, 20, 115);
        doc.text(`총 화면수: ${totalScreens} 개`, 20, 125);
        
        // UI/UX 인력 산정
        doc.setFontSize(14);
        doc.text('=== UI/UX 인력 산정 ===', 20, 145);
        doc.setFontSize(12);
        doc.text(`UI/UX 기획자: ${(totalScreens * this.uiuxRates.planner).toFixed(2)} MM`, 20, 160);
        doc.text(`UI/UX 디자이너: ${(totalScreens * this.uiuxRates.designer).toFixed(2)} MM`, 20, 170);
        doc.text(`웹 퍼블리셔: ${(totalScreens * this.uiuxRates.publisher).toFixed(2)} MM`, 20, 180);
        
        // 기능 목록 (새 페이지)
        doc.addPage();
        doc.setFontSize(14);
        doc.text('=== 기능 목록 ===', 20, 30);
        
        let yPos = 50;
        doc.setFontSize(10);
        
        this.functions.forEach((func, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 30;
            }
            
            doc.text(`${index + 1}. ${func.name}`, 20, yPos);
            doc.text(`${func.type} (${func.complexity})`, 120, yPos);
            doc.text(`${func.screenCount}화면`, 160, yPos);
            doc.text(`${func.fp.toFixed(1)}FP`, 180, yPos);
            yPos += 10;
        });
        
        // 파일 저장
        const fileName = `${projectName}_FP산정결과_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }

    // Excel 내보내기 (상세 버전)
    exportToExcel() {
        this.downloadExcel(); // 기존 함수 재사용
    }

    // 공유 링크 생성
    shareProject() {
        if (!this.currentProject) {
            alert('저장된 프로젝트가 없습니다.');
            return;
        }
        
        const project = this.projects[this.currentProject];
        const shareData = {
            name: project.name,
            type: project.type,
            estimationMethod: project.estimationMethod,
            functions: project.functions
        };
        
        const encodedData = btoa(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('공유 링크가 클립보드에 복사되었습니다!');
        }).catch(() => {
            prompt('공유 링크:', shareUrl);
        });
    }

    // 공유된 프로젝트 로드
    loadSharedProject() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareData = urlParams.get('share');
        
        if (shareData) {
            try {
                const projectData = JSON.parse(atob(shareData));
                
                // 새 프로젝트로 생성
                const projectId = Date.now().toString();
                const project = {
                    id: projectId,
                    name: `${projectData.name} (공유됨)`,
                    type: projectData.type,
                    estimationMethod: projectData.estimationMethod,
                    functions: projectData.functions,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                this.projects[projectId] = project;
                this.saveProjects();
                this.loadProjectList();
                this.loadProject(projectId);
                
                // URL에서 공유 파라미터 제거
                window.history.replaceState({}, document.title, window.location.pathname);
                
                alert('공유된 프로젝트가 로드되었습니다!');
            } catch (error) {
                console.error('공유 프로젝트 로드 오류:', error);
                alert('공유 링크가 올바르지 않습니다.');
            }
        }
    }

    // 입력 필드 초기화
    clearInputs() {
        document.getElementById('functionName').value = '';
        document.getElementById('screenCount').value = '1';
        document.getElementById('complexity').value = 'average';
    }

    // 폼 전체 초기화
    clearForm() {
        document.getElementById('projectName').value = '';
        document.getElementById('projectType').value = 'web';
        document.getElementById('estimationMethod').value = 'simple';
        this.clearInputs();
    }

    // 화면 업데이트
    updateDisplay() {
        this.updateFunctionTable();
        this.calculateResults();
    }

    // 로딩 표시
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    // 자동 저장
    autoSave() {
        if (this.currentProject) {
            this.saveCurrentProject();
        }
    }

    // 초기화
    init() {
        this.loadSharedProject();
        if (!this.currentProject && Object.keys(this.projects).length > 0) {
            const firstProject = Object.keys(this.projects)[0];
            this.loadProject(firstProject);
        }
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
    
    // Footer 모달 기능
    const modals = {
        methodology: document.getElementById('methodologyModal')
    };
    
    const modalTriggers = {
        methodology: document.getElementById('showMethodology'),
        references: document.getElementById('showReferences'),
        disclaimer: document.getElementById('showDisclaimer')
    };
    
    // 방법론 모달
    if (modalTriggers.methodology) {
        modalTriggers.methodology.addEventListener('click', () => {
            modals.methodology.style.display = 'block';
        });
    }
    
    // 상세 근거 버튼
    if (modalTriggers.references) {
        modalTriggers.references.addEventListener('click', () => {
            alert(`상세 근거 자료:
            
1. IFPUG CPM 4.3.1 - 국제 표준 FP 측정법
2. ISO/IEC 20926:2009 - 소프트웨어 측정 국제 표준
3. KOSA SW사업 대가산정 가이드 (2024년판)
4. NIPA SW개발비 산정 가이드라인
5. 국내 SI 업체 평균 투입 공수 분석 데이터

※ 모든 계산식은 공인된 표준과 실무 데이터를 기반으로 합니다.`);
        });
    }
    
    // 면책 사항 버튼
    if (modalTriggers.disclaimer) {
        modalTriggers.disclaimer.addEventListener('click', () => {
            alert(`면책 사항:

본 도구는 내부용 간이 산정 목적으로 제작되었습니다.
- 정확한 산정을 위해서는 전문가 검토가 필요합니다.
- 프로젝트 특성에 따라 결과가 달라질 수 있습니다.
- 최종 의사결정 시 추가 검증을 권장합니다.`);
        });
    }
    
    // 모달 닫기 기능
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        Object.values(modals).forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});
    
    // 키보드 단축키
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    fpCalculator.saveCurrentProject();
                    break;
                case 'n':
                    e.preventDefault();
                    fpCalculator.createNewProject();
                    break;
            }
        }
    });

