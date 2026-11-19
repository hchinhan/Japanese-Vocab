/**
 * File: js/app.js
 * Hệ thống điều khiển giao diện Session phân cấp (Accordion & Drill-down):
 * - Gói gọn toàn bộ học phần vào 5 Session chính: Từ vựng, Kanji, Katakana, Tha động từ, Đếm số
 * - Khi bấm vào từng Session sẽ mở ra các mục nhỏ hơn:
 *   + Từ vựng -> 3 Chặng bài học (Bài 01–10, Bài 11–19, Bài 21–26) -> Từng bài học
 *   + Kanji -> 3 Thành phần con: (1) Theo Bộ Kanji, (2) Từ Vựng Kanji Theo Bài, (3) Kanji Theo Trang (Part 1 N5 & Part 2 N4)
 *   + Katakana -> 7 Chủ đề từ ngoại lai
 *   + Tha động từ -> 3 Phần cụm tha động từ
 *   + Đếm số -> 7 Chuyên mục đếm & thời gian
 */

// Trạng thái đóng/mở của các tầng Session
let activeSessionId = null;          // 'vocab' | 'kanji' | 'katakana' | 'thadongtu' | 'dem' | null
let activeVocabStageId = 'stage_1';  // 'stage_1' | 'stage_2' | 'stage_3' | 'all' | null
let activeKanjiSubId = null;         // 'radicals' | 'lessons' | 'pages' | null
let activeKanjiPagePartId = 'kanji'; // 'kanji' (Part 1 N5) | 'kanji800' (Part 2 N4)
let homeRadicalStrokeFilter = 'all';
let isPreviewModalOverlayGesture = false;

// ==========================================================================
// 1. TIỆN ÍCH CƠ BẢN
// ==========================================================================

function escapeAppHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAppJsArg(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function removeVnTonesApp(str) {
    if (!str) return '';
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase();
}

function getVocabChaptersList() {
    return CHAPTERS_CONFIG.filter(c => !c.isSpecial);
}

function getChapterWordCount(chapter) {
    if (!chapter || typeof chapter.getData !== 'function') return 0;
    const d = chapter.getData();
    return d ? Object.keys(d).length : 0;
}

// ==========================================================================
// 2. RENDER GIAO DIỆN 5 SESSION CHÍNH & CÁC MỤC CON
// ==========================================================================

function renderChapterCards() {
    const accordion = document.getElementById('sessions-accordion');
    const legacyMount = document.getElementById('legacy-checkbox-mount');
    if (!accordion) return;

    // Mount các checkbox đại diện cho các nhóm đặc biệt để study.js tương thích tuyệt đối
    if (legacyMount) {
        legacyMount.innerHTML = `
            <input type="checkbox" id="chk-kanji">
            <input type="checkbox" id="chk-kanji800">
            <input type="checkbox" id="chk-kanji_radicals_group">
            <input type="checkbox" id="chk-kanji_lessons">
            <input type="checkbox" id="chk-kata">
            <input type="checkbox" id="chk-tha_dong_tu">
            <input type="checkbox" id="chk-dem">
        `;
    }

    accordion.innerHTML = `
        ${renderVocabSessionHtml()}
        ${renderKanjiSessionHtml()}
        ${renderKatakanaSessionHtml()}
        ${renderThaDongTuSessionHtml()}
        ${renderCounterSessionHtml()}
        ${renderDictionarySessionHtml()}
    `;

    renderHomeRadicalCards();
    updateSelectedCount();
}

// --------------------------------------------------------------------------
// 2.1 SESSION 1: TỪ VỰNG THEO BÀI (MINNA N5 - 25 BÀI / 3 CHẶNG)
// --------------------------------------------------------------------------

function renderVocabSessionHtml() {
    const vocabChapters = getVocabChaptersList();
    const totalWords = vocabChapters.reduce((sum, ch) => sum + getChapterWordCount(ch), 0);

    const stagesCardsHtml = VOCAB_STAGES_CONFIG.map(stage => {
        const isActive = activeVocabStageId === stage.id;
        return `
            <div class="subsession-card ${isActive ? 'expanded' : ''}" id="vocab-stage-card-${stage.id}" onclick="switchVocabStage('${stage.id}')">
                <div class="ssc-top">
                    <span class="ssc-badge">${escapeAppHtml(stage.badge)}</span>
                    <label class="ssc-check-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn toàn bộ ${stage.title}">
                        <input type="checkbox" id="chk-stage-${stage.id}" onchange="toggleVocabStageSelection('${stage.id}', this.checked)">
                        <span class="ssc-custom-check"></span>
                    </label>
                </div>
                <div class="ssc-main">
                    <span class="ssc-icon">${stage.icon}</span>
                    <div class="ssc-info">
                        <div class="ssc-title">${escapeAppHtml(stage.title)}</div>
                        <div class="ssc-desc">${escapeAppHtml(stage.desc)}</div>
                    </div>
                </div>
                <div class="ssc-footer">
                    <span class="ssc-status-pill" id="stage-status-${stage.id}">0/${stage.chapterIds.length} bài</span>
                    <span class="ssc-expand-hint">${isActive ? '▴ Đang mở' : '▾ Bấm xem bài'}</span>
                </div>
            </div>
        `;
    }).join('');

    const allLessonsHtml = vocabChapters.map(ch => {
        const wordCount = getChapterWordCount(ch);
        return `
            <div class="compact-item-card vocab-lesson-card" id="card-${ch.id}" data-stage="${ch.stageId || ''}" data-search="${escapeAppHtml(removeVnTonesApp(`${ch.label} ${ch.title} ${ch.desc}`))}" onclick="toggleVocabChapterCard('${ch.id}', event)">
                <input type="checkbox" id="chk-${ch.id}" class="hidden-item-chk" onchange="updateSelectedCount()">
                <div class="cic-top">
                    <span class="cic-tag">${escapeAppHtml(ch.label)}</span>
                    <span class="cic-checkbox"></span>
                </div>
                <div class="cic-body">
                    <div class="cic-title-row">
                        <span class="cic-icon">${ch.icon}</span>
                        <h4 class="cic-title">${escapeAppHtml(ch.title)}</h4>
                    </div>
                    <p class="cic-desc">${escapeAppHtml(ch.desc)}</p>
                </div>
                <div class="cic-footer">
                    <span class="cic-count">📝 ${wordCount} từ</span>
                    <div class="cic-actions" onclick="event.stopPropagation()">
                        <button type="button" class="cic-btn cic-btn-view" onclick="previewVocabChapter('${ch.id}', event)" title="Xem danh sách từ vựng ${ch.label}">👁️</button>
                        <button type="button" class="cic-btn cic-btn-study" onclick="studySingleVocabChapter('${ch.id}', event)" title="Học ngay riêng ${ch.label}">⚡ Học</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="session-card" id="session-card-vocab">
            <div class="session-header" onclick="toggleSessionAccordion('vocab', event)">
                <div class="sh-left">
                    <label class="sh-checkbox-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn toàn bộ 25 bài Từ vựng">
                        <input type="checkbox" id="chk-session-vocab" onchange="toggleEntireVocabSession(this.checked)">
                        <span class="sh-custom-check"></span>
                    </label>
                    <div class="sh-icon-box sh-icon-vocab">📚</div>
                    <div class="sh-title-group">
                        <div class="sh-title-row">
                            <h3 class="sh-title">Từ Vựng Theo Bài (Minna N5)</h3>
                            <span class="sh-meta-pill">${vocabChapters.length} bài • ${totalWords} từ</span>
                        </div>
                        <p class="sh-subtitle">Chia làm 3 chặng nhỏ: Cơ bản (Bài 01–10) • Mở rộng (Bài 11–19) • Nâng cao (Bài 21–26)</p>
                    </div>
                </div>
                <div class="sh-right">
                    <span class="sh-selection-badge" id="session-badge-vocab">Chưa chọn</span>
                    <span class="sh-chevron">▾</span>
                </div>
            </div>

            <div class="session-body" id="session-body-vocab" style="display: none;">
                <div class="subsession-header-bar">
                    <div class="shb-actions">
                        <button type="button" class="mini-pill-btn ${activeVocabStageId === 'all' ? 'active' : ''}" id="btn-vocab-stage-all" onclick="switchVocabStage('all')">📋 Tất cả 25 bài</button>
                        <button type="button" class="mini-pill-btn" onclick="toggleEntireVocabSession(true)">✓ Chọn cả 25 bài</button>
                        <button type="button" class="mini-pill-btn" onclick="toggleEntireVocabSession(false)">✕ Bỏ chọn</button>
                    </div>
                </div>

                <!-- 3 Thẻ Chặng Từ Vựng -->
                <div class="subsessions-grid subsessions-grid-3">
                    ${stagesCardsHtml}
                </div>

                <!-- Khung danh sách bài học của Chặng đang mở -->
                <div class="nested-items-panel" id="vocab-lessons-panel">
                    <div class="nip-toolbar">
                        <div class="nip-title" id="vocab-stage-panel-title">🌱 Chặng 1: Bài 01 ➔ Bài 10</div>
                        <div class="nip-search-wrap">
                            <span>🔍</span>
                            <input type="text" id="vocab-lesson-search" placeholder="Tìm nhanh bài học (VD: Bài 5, tính từ, gia đình...)" oninput="filterVocabStageLessons()" autocomplete="off">
                        </div>
                    </div>
                    <div class="compact-cards-grid" id="chapter-options">
                        ${allLessonsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --------------------------------------------------------------------------
// 2.2 SESSION 2: KANJI 漢字 (TÁCH 3 THÀNH PHẦN: THEO BỘ • TỪ VỰNG KANJI • THEO TRANG)
// --------------------------------------------------------------------------

function renderKanjiSessionHtml() {
    const totalRadicals = typeof KANJI_RADICALS_CONFIG !== 'undefined' ? KANJI_RADICALS_CONFIG.length : 178;
    const totalLessons = typeof KANJI_LESSONS_CONFIG !== 'undefined' ? KANJI_LESSONS_CONFIG.length : 17;
    const totalLessonWords = typeof KANJI_LESSONS_CONFIG !== 'undefined'
        ? KANJI_LESSONS_CONFIG.reduce((s, l) => s + l.count, 0) : 574;
    const n5Pages = KANJI_PARTS_CONFIG[0].pagesConfig;
    const n4Pages = KANJI_PARTS_CONFIG[1].pagesConfig;
    const totalPages = n5Pages.length + n4Pages.length;

    // Render 17 thẻ Từ vựng Kanji theo bài
    const kanjiLessonsCardsHtml = (typeof KANJI_LESSONS_CONFIG !== 'undefined' ? KANJI_LESSONS_CONFIG : []).map(l => {
        const isChecked = typeof selectedKanjiLessons !== 'undefined' && selectedKanjiLessons.has(l.id);
        return `
            <div class="compact-item-card ${isChecked ? 'active' : ''}" id="home-klc-${l.id}" onclick="toggleHomeKanjiLesson('${l.id}', event)">
                <input type="checkbox" id="chk-home-klc-${l.id}" class="hidden-item-chk" ${isChecked ? 'checked' : ''} onchange="onHomeKanjiLessonChange('${l.id}', this.checked)">
                <div class="cic-top">
                    <span class="cic-tag tag-teal">${escapeAppHtml(l.shortName)}</span>
                    <span class="cic-checkbox"></span>
                </div>
                <div class="cic-samples-row">
                    ${l.samples.map(s => `<span class="cic-sample-pill">${escapeAppHtml(s)}</span>`).join('')}
                </div>
                <div class="cic-body">
                    <h4 class="cic-title">${escapeAppHtml(l.title)}</h4>
                    <div class="cic-range">${escapeAppHtml(l.range)}</div>
                </div>
                <div class="cic-footer">
                    <span class="cic-count">📝 ${l.count} từ</span>
                    <div class="cic-actions" onclick="event.stopPropagation()">
                        <button type="button" class="cic-btn cic-btn-view" onclick="previewHomeKanjiLesson('${l.id}', event)" title="Xem danh sách từ vựng ${l.shortName}">👁️</button>
                        <button type="button" class="cic-btn cic-btn-study" onclick="studySingleKanjiLesson('${l.id}', event)" title="Học ngay ${l.shortName}">⚡ Học</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Render thẻ các trang của Part 1 N5 và Part 2 N4
    const renderPagesGridForPart = (part) => {
        return part.pagesConfig.map(p => {
            const isChecked = part.selectedPages.has(p.id);
            return `
                <div class="compact-item-card ${isChecked ? 'active' : ''}" id="home-kpc-${p.id}" onclick="toggleHomeKanjiPage('${part.id}', '${p.id}', event)">
                    <input type="checkbox" id="chk-home-kpc-${p.id}" class="hidden-item-chk" ${isChecked ? 'checked' : ''} onchange="onHomeKanjiPageChange('${part.id}', '${p.id}', this.checked)">
                    <div class="cic-top">
                        <span class="cic-tag">${escapeAppHtml(p.shortName)}</span>
                        <span class="cic-checkbox"></span>
                    </div>
                    <div class="cic-samples-row">
                        ${p.samples.map(ch => `<span class="cic-char-circle">${escapeAppHtml(ch)}</span>`).join('')}
                    </div>
                    <div class="cic-body">
                        <h4 class="cic-title">${escapeAppHtml(p.title)}</h4>
                        <div class="cic-range">Phạm vi: <b>${escapeAppHtml(p.range)}</b></div>
                        <p class="cic-desc">${escapeAppHtml(p.desc)}</p>
                    </div>
                    <div class="cic-footer">
                        <span class="cic-count">📝 ${p.count} chữ</span>
                        <div class="cic-actions" onclick="event.stopPropagation()">
                            <button type="button" class="cic-btn cic-btn-view" onclick="previewHomeKanjiPage('${part.id}', '${p.id}', event)" title="Xem chữ Hán trong ${p.shortName}">👁️</button>
                            <button type="button" class="cic-btn cic-btn-study" onclick="studySingleKanjiPage('${p.id}', event, '${part.id}')" title="Học ngay ${p.shortName}">⚡ Học</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    return `
        <div class="session-card" id="session-card-kanji">
            <div class="session-header" onclick="toggleSessionAccordion('kanji', event)">
                <div class="sh-left">
                    <label class="sh-checkbox-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn toàn bộ học phần Kanji">
                        <input type="checkbox" id="chk-session-kanji" onchange="toggleEntireKanjiSession(this.checked)">
                        <span class="sh-custom-check"></span>
                    </label>
                    <div class="sh-icon-box sh-icon-kanji">🈁</div>
                    <div class="sh-title-group">
                        <div class="sh-title-row">
                            <h3 class="sh-title">Kanji 漢字 (N5 &amp; N4 Đông Du)</h3>
                            <span class="sh-meta-pill">3 học phần con</span>
                        </div>
                        <p class="sh-subtitle">Tách thành 3 mục nhỏ: 🧩 Theo Bộ Kanji (${totalRadicals} bộ) • 📗 Từ Vựng Kanji (${totalLessons} bài) • 📘 Kanji Theo Trang (${totalPages} trang)</p>
                    </div>
                </div>
                <div class="sh-right">
                    <span class="sh-selection-badge" id="session-badge-kanji">Chưa chọn</span>
                    <span class="sh-chevron">▾</span>
                </div>
            </div>

            <div class="session-body" id="session-body-kanji" style="display: none;">
                <!-- 3 THÀNH PHẦN NHỎ HƠN CỦA KANJI -->
                <div class="subsessions-grid subsessions-grid-3">
                    <!-- Thành phần 1: Theo Bộ Kanji -->
                    <div class="subsession-card" id="kanji-subcard-radicals" onclick="switchKanjiSubSession('radicals')">
                        <div class="ssc-top">
                            <span class="ssc-badge ssc-badge-emerald">01 • THEO BỘ</span>
                            <label class="ssc-check-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn các bộ đang lọc">
                                <input type="checkbox" id="chk-kanji-sub-radicals" onchange="selectHomeVisibleRadicals(this.checked)">
                                <span class="ssc-custom-check"></span>
                            </label>
                        </div>
                        <div class="ssc-main">
                            <span class="ssc-icon">🧩</span>
                            <div class="ssc-info">
                                <div class="ssc-title">Theo Bộ Kanji</div>
                                <div class="ssc-desc">Phân loại theo ${totalRadicals} Bộ thủ Đông Du (Bộ chính &amp; Bộ cấu thành)</div>
                            </div>
                        </div>
                        <div class="ssc-footer">
                            <span class="ssc-status-pill" id="kanji-sub-badge-radicals">0/${totalRadicals} bộ</span>
                            <span class="ssc-expand-hint" id="kanji-sub-hint-radicals">▾ Mở</span>
                        </div>
                    </div>

                    <!-- Thành phần 2: Từ Vựng Kanji Theo Bài -->
                    <div class="subsession-card" id="kanji-subcard-lessons" onclick="switchKanjiSubSession('lessons')">
                        <div class="ssc-top">
                            <span class="ssc-badge ssc-badge-emerald">02 • TỪ VỰNG KANJI</span>
                            <label class="ssc-check-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn toàn bộ 17 bài Từ vựng Kanji">
                                <input type="checkbox" id="chk-kanji-sub-lessons" onchange="toggleAllHomeKanjiLessons(this.checked)">
                                <span class="ssc-custom-check"></span>
                            </label>
                        </div>
                        <div class="ssc-main">
                            <span class="ssc-icon">📗</span>
                            <div class="ssc-info">
                                <div class="ssc-title">Từ Vựng Kanji Theo Bài</div>
                                <div class="ssc-desc">${totalLessons} bài chuyên đề Đông Du (${totalLessonWords} từ vựng Hán tự Bài 1–25)</div>
                            </div>
                        </div>
                        <div class="ssc-footer">
                            <span class="ssc-status-pill" id="kanji-sub-badge-lessons">0/${totalLessons} bài</span>
                            <span class="ssc-expand-hint" id="kanji-sub-hint-lessons">▾ Mở</span>
                        </div>
                    </div>

                    <!-- Thành phần 3: Kanji Theo Trang -->
                    <div class="subsession-card" id="kanji-subcard-pages" onclick="switchKanjiSubSession('pages')">
                        <div class="ssc-top">
                            <span class="ssc-badge ssc-badge-emerald">03 • THEO TRANG</span>
                            <label class="ssc-check-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn tất cả 20 trang Kanji N5 & N4">
                                <input type="checkbox" id="chk-kanji-sub-pages" onchange="toggleAllHomeKanjiPages(this.checked)">
                                <span class="ssc-custom-check"></span>
                            </label>
                        </div>
                        <div class="ssc-main">
                            <span class="ssc-icon">📘</span>
                            <div class="ssc-info">
                                <div class="ssc-title">Kanji Theo Trang (N5 &amp; N4)</div>
                                <div class="ssc-desc">Part 1 N5 (Trang 0➔9 • 541 chữ) &amp; Part 2 N4 (Trang 1➔10 • 477 chữ)</div>
                            </div>
                        </div>
                        <div class="ssc-footer">
                            <span class="ssc-status-pill" id="kanji-sub-badge-pages">0/${totalPages} trang</span>
                            <span class="ssc-expand-hint" id="kanji-sub-hint-pages">▾ Mở</span>
                        </div>
                    </div>
                </div>

                <!-- PANEL CON 1: THEO BỘ KANJI -->
                <div class="nested-items-panel" id="kanji-subpanel-radicals" style="display: none;">
                    <div class="nip-toolbar nip-toolbar-wrap">
                        <div class="nip-title">🧩 Chọn Bộ Thủ Kanji Để Ôn Tập</div>
                        <div class="nip-search-wrap">
                            <span>🔍</span>
                            <input type="text" id="home-radical-search" placeholder="Tìm bộ chữ (nhân đứng, thủy, mộc, tâm, 氵, 心...)" oninput="renderHomeRadicalCards()" autocomplete="off">
                        </div>
                        <div class="shb-actions">
                            <button type="button" class="mini-pill-btn" onclick="selectHomeVisibleRadicals(true)">✓ Chọn bộ đang lọc</button>
                            <button type="button" class="mini-pill-btn" onclick="selectHomeVisibleRadicals(false)">✕ Bỏ chọn bộ</button>
                        </div>
                    </div>

                    <!-- Bộ lọc nhanh Bộ thủ -->
                    <div class="compact-filters-bar">
                        <div class="cfb-group">
                            <span class="cfb-label">Phân loại:</span>
                            <button type="button" class="cfb-pill active" id="home-rad-mode-all" onclick="setHomeRadicalMatchMode(true)">🎯 Cả Bộ chính &amp; Cấu thành</button>
                            <button type="button" class="cfb-pill" id="home-rad-mode-primary" onclick="setHomeRadicalMatchMode(false)">📌 Chỉ Bộ chính</button>
                        </div>
                        <div class="cfb-group">
                            <span class="cfb-label">Cấp độ:</span>
                            <button type="button" class="cfb-pill active" id="home-rad-lvl-all" onclick="setHomeRadicalLevel('all')">Tất cả (N5+N4)</button>
                            <button type="button" class="cfb-pill" id="home-rad-lvl-N5" onclick="setHomeRadicalLevel('N5')">Chỉ N5</button>
                            <button type="button" class="cfb-pill" id="home-rad-lvl-N4" onclick="setHomeRadicalLevel('N4')">Chỉ N4</button>
                        </div>
                        <div class="cfb-group">
                            <span class="cfb-label">Số nét:</span>
                            <button type="button" class="cfb-pill active" data-home-stroke="all" onclick="setHomeRadicalStroke('all')">Tất cả</button>
                            <button type="button" class="cfb-pill" data-home-stroke="1-2" onclick="setHomeRadicalStroke('1-2')">1–2</button>
                            <button type="button" class="cfb-pill" data-home-stroke="3" onclick="setHomeRadicalStroke('3')">3</button>
                            <button type="button" class="cfb-pill" data-home-stroke="4" onclick="setHomeRadicalStroke('4')">4</button>
                            <button type="button" class="cfb-pill" data-home-stroke="5-6" onclick="setHomeRadicalStroke('5-6')">5–6</button>
                            <button type="button" class="cfb-pill" data-home-stroke="7+" onclick="setHomeRadicalStroke('7+')">7+</button>
                        </div>
                    </div>

                    <div class="compact-cards-grid compact-scroll-box" id="home-radicals-grid">
                        <!-- Rendered dynamically by renderHomeRadicalCards() -->
                    </div>
                </div>

                <!-- PANEL CON 2: TỪ VỰNG KANJI THEO BÀI -->
                <div class="nested-items-panel" id="kanji-subpanel-lessons" style="display: none;">
                    <div class="nip-toolbar">
                        <div class="nip-title">📗 Từ Vựng Hán Tự Theo Bài (17 Bài Chuyên Đề Đông Du • 574 Từ)</div>
                        <div class="shb-actions">
                            <button type="button" class="mini-pill-btn" onclick="toggleAllHomeKanjiLessons(true)">✓ Chọn tất cả 17 bài</button>
                            <button type="button" class="mini-pill-btn" onclick="toggleAllHomeKanjiLessons(false)">✕ Bỏ chọn</button>
                        </div>
                    </div>
                    <div class="compact-cards-grid compact-scroll-box" id="home-kanji-lessons-grid">
                        ${kanjiLessonsCardsHtml}
                    </div>
                </div>

                <!-- PANEL CON 3: KANJI THEO TRANG (TÁCH PART 1 N5 & PART 2 N4) -->
                <div class="nested-items-panel" id="kanji-subpanel-pages" style="display: none;">
                    <div class="nip-toolbar nip-toolbar-wrap">
                        <div class="nip-title">📘 Chọn Cấp Độ &amp; Trang Kanji</div>
                        <div class="part-switcher-tabs">
                            <button type="button" class="part-tab-btn active" id="part-tab-btn-kanji" onclick="switchHomeKanjiPagePart('kanji')">
                                <span>🈁 Part 1 • N5 (HT400 — Trang 0➔9)</span>
                                <span class="part-tab-badge" id="part-tab-badge-kanji">0/10</span>
                            </button>
                            <button type="button" class="part-tab-btn" id="part-tab-btn-kanji800" onclick="switchHomeKanjiPagePart('kanji800')">
                                <span>🈯 Part 2 • N4 (HT800 — Trang 1➔10)</span>
                                <span class="part-tab-badge" id="part-tab-badge-kanji800">0/10</span>
                            </button>
                        </div>
                    </div>

                    <!-- Lưới 10 trang Part 1 N5 -->
                    <div id="home-kanji-part-panel-kanji">
                        <div class="part-subbar">
                            <span><b>Part 1 • N5 (Cơ bản &amp; Đông Du HT400):</b> 10 trang (541 mục chữ &amp; bộ)</span>
                            <div class="shb-actions">
                                <button type="button" class="mini-pill-btn" onclick="toggleHomeKanjiPartAllPages('kanji', true)">✓ Chọn cả 10 trang N5</button>
                                <button type="button" class="mini-pill-btn" onclick="toggleHomeKanjiPartAllPages('kanji', false)">✕ Bỏ chọn N5</button>
                            </div>
                        </div>
                        <div class="compact-cards-grid">
                            ${renderPagesGridForPart(KANJI_PARTS_CONFIG[0])}
                        </div>
                    </div>

                    <!-- Lưới 10 trang Part 2 N4 -->
                    <div id="home-kanji-part-panel-kanji800" style="display: none;">
                        <div class="part-subbar">
                            <span><b>Part 2 • N4 (Đông Du HT800 Mở rộng):</b> 10 trang (477 mục mới ngoài HT400)</span>
                            <div class="shb-actions">
                                <button type="button" class="mini-pill-btn" onclick="toggleHomeKanjiPartAllPages('kanji800', true)">✓ Chọn cả 10 trang N4</button>
                                <button type="button" class="mini-pill-btn" onclick="toggleHomeKanjiPartAllPages('kanji800', false)">✕ Bỏ chọn N4</button>
                            </div>
                        </div>
                        <div class="compact-cards-grid">
                            ${renderPagesGridForPart(KANJI_PARTS_CONFIG[1])}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --------------------------------------------------------------------------
// 2.3 SESSION 3: KATAKANA カタカナ (TÁCH 7 CHỦ ĐỀ TỪ NGOẠI LAI)
// --------------------------------------------------------------------------

function renderKatakanaSessionHtml() {
    const totalTopics = KATA_GROUPS_CONFIG.length;
    const totalWords = typeof vocabKata !== 'undefined' ? Object.keys(vocabKata).length : 109;

    const cardsHtml = KATA_GROUPS_CONFIG.map(g => {
        const isChecked = selectedKataGroups.has(g.id);
        return `
            <div class="compact-item-card ${isChecked ? 'active' : ''}" id="kata-card-${g.id}" onclick="toggleKataGroupItem('${g.id}', event)">
                <input type="checkbox" id="chk-kata-${g.id}" class="hidden-item-chk" ${isChecked ? 'checked' : ''} onchange="onKataGroupCheckboxChange('${g.id}', this.checked)">
                <div class="cic-top">
                    <span class="cic-tag">${escapeAppHtml(g.label)}</span>
                    <span class="cic-checkbox"></span>
                </div>
                <div class="cic-samples-row">
                    ${g.samples.map(s => `<span class="cic-sample-pill">${escapeAppHtml(s)}</span>`).join('')}
                </div>
                <div class="cic-body">
                    <div class="cic-title-row">
                        <span class="cic-icon">${g.icon}</span>
                        <h4 class="cic-title">${escapeAppHtml(g.title)}</h4>
                    </div>
                    <p class="cic-desc">${escapeAppHtml(g.desc)}</p>
                </div>
                <div class="cic-footer">
                    <span class="cic-count">📝 ${g.count} từ</span>
                    <div class="cic-actions" onclick="event.stopPropagation()">
                        <button type="button" class="cic-btn cic-btn-view" onclick="previewKataGroup('${g.id}', event)" title="Xem danh sách từ ${g.title}">👁️</button>
                        <button type="button" class="cic-btn cic-btn-study" onclick="studySingleKataGroup('${g.id}', event)" title="Học ngay ${g.title}">⚡ Học</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="session-card" id="session-card-katakana">
            <div class="session-header" onclick="toggleSessionAccordion('katakana', event)">
                <div class="sh-left">
                    <label class="sh-checkbox-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn toàn bộ Katakana">
                        <input type="checkbox" id="chk-session-katakana" onchange="toggleEntireKataSession(this.checked)">
                        <span class="sh-custom-check"></span>
                    </label>
                    <div class="sh-icon-box sh-icon-kata">🅰️</div>
                    <div class="sh-title-group">
                        <div class="sh-title-row">
                            <h3 class="sh-title">Katakana カタカナ (Từ Ngoại Lai)</h3>
                            <span class="sh-meta-pill">${totalTopics} chủ đề • ${totalWords} từ</span>
                        </div>
                        <p class="sh-subtitle">Tách thành 7 chủ đề nhỏ: Quốc gia, Thiết bị, Phương tiện, Ẩm thực, Âm nhạc &amp; Thể thao, Động thực vật, Sự kiện</p>
                    </div>
                </div>
                <div class="sh-right">
                    <span class="sh-selection-badge" id="session-badge-katakana">Chưa chọn</span>
                    <span class="sh-chevron">▾</span>
                </div>
            </div>

            <div class="session-body" id="session-body-katakana" style="display: none;">
                <div class="subsession-header-bar">
                    <div class="shb-actions">
                        <button type="button" class="mini-pill-btn" onclick="toggleEntireKataSession(true)">✓ Chọn cả 7 chủ đề (${totalWords} từ)</button>
                        <button type="button" class="mini-pill-btn" onclick="toggleEntireKataSession(false)">✕ Bỏ chọn</button>
                    </div>
                </div>
                <div class="compact-cards-grid">
                    ${cardsHtml}
                </div>
            </div>
        </div>
    `;
}

// --------------------------------------------------------------------------
// 2.4 SESSION 4: THA ĐỘNG TỪ 他動詞 (TÁCH 3 PHẦN CỤM TỪ)
// --------------------------------------------------------------------------

function renderThaDongTuSessionHtml() {
    const totalParts = THA_DONG_TU_GROUPS_CONFIG.length;
    const totalPhrases = typeof vocabThaDongTu !== 'undefined' ? Object.keys(vocabThaDongTu).length : 34;

    const cardsHtml = THA_DONG_TU_GROUPS_CONFIG.map(g => {
        const isChecked = selectedThaDongTuGroups.has(g.id);
        return `
            <div class="compact-item-card ${isChecked ? 'active' : ''}" id="tdt-card-${g.id}" onclick="toggleThaDongTuGroupItem('${g.id}', event)">
                <input type="checkbox" id="chk-tdt-${g.id}" class="hidden-item-chk" ${isChecked ? 'checked' : ''} onchange="onThaDongTuGroupCheckboxChange('${g.id}', this.checked)">
                <div class="cic-top">
                    <span class="cic-tag">${escapeAppHtml(g.label)}</span>
                    <span class="cic-checkbox"></span>
                </div>
                <div class="cic-samples-row">
                    ${g.samples.map(s => `<span class="cic-sample-pill">${escapeAppHtml(s)}</span>`).join('')}
                </div>
                <div class="cic-body">
                    <h4 class="cic-title">${escapeAppHtml(g.title)}</h4>
                    <div class="cic-range">Phạm vi: <b>${escapeAppHtml(g.range)}</b></div>
                    <p class="cic-desc">${escapeAppHtml(g.desc)}</p>
                </div>
                <div class="cic-footer">
                    <span class="cic-count">📝 ${g.count} cụm từ</span>
                    <div class="cic-actions" onclick="event.stopPropagation()">
                        <button type="button" class="cic-btn cic-btn-view" onclick="previewThaDongTuGroup('${g.id}', event)" title="Xem danh sách cụm từ ${g.label}">👁️</button>
                        <button type="button" class="cic-btn cic-btn-study" onclick="studySingleThaDongTuGroup('${g.id}', event)" title="Học ngay ${g.label}">⚡ Học</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="session-card" id="session-card-thadongtu">
            <div class="session-header" onclick="toggleSessionAccordion('thadongtu', event)">
                <div class="sh-left">
                    <label class="sh-checkbox-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn toàn bộ Tha động từ">
                        <input type="checkbox" id="chk-session-thadongtu" onchange="toggleEntireThaDongTuSession(this.checked)">
                        <span class="sh-custom-check"></span>
                    </label>
                    <div class="sh-icon-box sh-icon-tdt">🔄</div>
                    <div class="sh-title-group">
                        <div class="sh-title-row">
                            <h3 class="sh-title">Tha Động Từ 他動詞</h3>
                            <span class="sh-meta-pill">${totalParts} phần • ${totalPhrases} cụm từ</span>
                        </div>
                        <p class="sh-subtitle">34 cụm tha động từ thông dụng chia làm 3 phần nhỏ dễ thuộc (Điện nước • Đóng mở • Sinh hoạt)</p>
                    </div>
                </div>
                <div class="sh-right">
                    <span class="sh-selection-badge" id="session-badge-thadongtu">Chưa chọn</span>
                    <span class="sh-chevron">▾</span>
                </div>
            </div>

            <div class="session-body" id="session-body-thadongtu" style="display: none;">
                <div class="subsession-header-bar">
                    <div class="shb-actions">
                        <button type="button" class="mini-pill-btn" onclick="toggleEntireThaDongTuSession(true)">✓ Chọn cả 3 phần (${totalPhrases} cụm)</button>
                        <button type="button" class="mini-pill-btn" onclick="toggleEntireThaDongTuSession(false)">✕ Bỏ chọn</button>
                    </div>
                </div>
                <div class="compact-cards-grid">
                    ${cardsHtml}
                </div>
            </div>
        </div>
    `;
}

// --------------------------------------------------------------------------
// 2.5 SESSION 5: ĐẾM SỐ & THỜI GIAN (TÁCH 7 CHUYÊN MỤC ĐẾM)
// --------------------------------------------------------------------------

function renderCounterSessionHtml() {
    const totalCounters = COUNTER_GROUPS_CONFIG.length;

    const cardsHtml = COUNTER_GROUPS_CONFIG.map(g => {
        const isChecked = selectedCounterGroups.has(g.id);
        return `
            <div class="compact-item-card ${isChecked ? 'active' : ''}" id="dem-card-${g.id}" onclick="toggleCounterGroupItem('${g.id}', event)">
                <input type="checkbox" id="chk-dem-${g.id}" class="hidden-item-chk" ${isChecked ? 'checked' : ''} onchange="onCounterGroupCheckboxChange('${g.id}', this.checked)">
                <div class="cic-top">
                    <span class="cic-tag">${escapeAppHtml(g.label)}</span>
                    <span class="cic-checkbox"></span>
                </div>
                <div class="cic-samples-row">
                    ${g.samples.map(s => `<span class="cic-sample-pill">${escapeAppHtml(s)}</span>`).join('')}
                </div>
                <div class="cic-body">
                    <div class="cic-title-row">
                        <span class="cic-icon">${g.icon}</span>
                        <h4 class="cic-title">${escapeAppHtml(g.title)}</h4>
                    </div>
                    <p class="cic-desc">${escapeAppHtml(g.desc)}</p>
                </div>
                <div class="cic-footer">
                    <span class="cic-count">🎲 Sinh đề ngẫu nhiên</span>
                    <div class="cic-actions" onclick="event.stopPropagation()">
                        <button type="button" class="cic-btn cic-btn-view" onclick="previewCounterGroup('${g.id}', event)" title="Xem mẫu câu đếm ${g.title}">👁️</button>
                        <button type="button" class="cic-btn cic-btn-study" onclick="studySingleCounterGroup('${g.id}', event)" title="Luyện ngay ${g.title}">⚡ Học</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="session-card" id="session-card-dem">
            <div class="session-header" onclick="toggleSessionAccordion('dem', event)">
                <div class="sh-left">
                    <label class="sh-checkbox-wrap" onclick="event.stopPropagation()" title="Chọn / bỏ chọn toàn bộ 7 mục Đếm số">
                        <input type="checkbox" id="chk-session-dem" onchange="toggleEntireCounterSession(this.checked)">
                        <span class="sh-custom-check"></span>
                    </label>
                    <div class="sh-icon-box sh-icon-dem">🔢</div>
                    <div class="sh-title-group">
                        <div class="sh-title-row">
                            <h3 class="sh-title">Luyện Đếm Số &amp; Thời Gian</h3>
                            <span class="sh-meta-pill">${totalCounters} chuyên mục</span>
                        </div>
                        <p class="sh-subtitle">Tách thành 7 mục nhỏ: Đồ vật &amp; Con vật (10 loại), Tuổi tác, Số tầng, Tiền Yên, Thứ, Ngày tháng &amp; Giờ phút</p>
                    </div>
                </div>
                <div class="sh-right">
                    <span class="sh-selection-badge" id="session-badge-dem">Chưa chọn</span>
                    <span class="sh-chevron">▾</span>
                </div>
            </div>

            <div class="session-body" id="session-body-dem" style="display: none;">
                <div class="subsession-header-bar">
                    <div class="shb-actions">
                        <button type="button" class="mini-pill-btn" onclick="toggleEntireCounterSession(true)">✓ Chọn cả 7 mục đếm</button>
                        <button type="button" class="mini-pill-btn" onclick="toggleEntireCounterSession(false)">✕ Bỏ chọn</button>
                    </div>
                </div>
                <div class="compact-cards-grid">
                    ${cardsHtml}
                </div>
            </div>
        </div>
    `;
}

// --------------------------------------------------------------------------
// 2.6 SESSION 6: TÌM KIẾM TỪ VỰNG THEO THỨ TỰ TỪ ĐIỂN (A-Z • 50 ÂM あ-わ • HÁN-VIỆT)
// --------------------------------------------------------------------------

function renderDictionarySessionHtml() {
    return `
        <div class="session-card" id="session-card-dictionary">
            <div class="session-header" onclick="toggleSessionAccordion('dictionary', event)">
                <div class="sh-left">
                    <div class="sh-icon-box sh-icon-vocab">📖</div>
                    <div class="sh-title-group">
                        <div class="sh-title-row">
                            <h3 class="sh-title">Tìm Kiếm Từ Vựng Theo Thứ Tự Từ Điển</h3>
                            <span class="sh-meta-pill">A ➔ Y • 50 Âm あ ➔ わ • Hán-Việt</span>
                        </div>
                        <p class="sh-subtitle">Tra cứu chính xác theo từ khóa &amp; duyệt theo Bảng chữ cái Tiếng Việt, Bảng 50 âm Tiếng Nhật hoặc Âm Hán-Việt</p>
                    </div>
                </div>
                <div class="sh-right">
                    <span class="sh-selection-badge active">Tra cứu &amp; Xuất MD</span>
                    <span class="sh-chevron">▾</span>
                </div>
            </div>

            <div class="session-body" id="session-body-dictionary" style="display: none;">
                <div class="dictionary-workspace" id="dictionary-workspace">
                    <!-- Hàng 1: Thanh tìm kiếm chính xác + Chế độ khớp + Nút toàn màn hình -->
                    <div class="dict-top-bar">
                        <div class="search-input-box dict-search-box" onclick="document.getElementById('vocab-search-input').focus()">
                            <span class="search-icon">🔍</span>
                            <input type="text" id="vocab-search-input" placeholder="Nhập từ cần tìm (VD: ăn, cá, điện thoại, sensei, 先生, せんせい...)" autocomplete="off" autocapitalize="off" spellcheck="false" oninput="handleVocabSearchInput()">
                            <button type="button" class="search-clear-btn" id="search-clear-btn" onclick="clearVocabSearch(event)" style="display: none;">✕</button>
                        </div>

                        <div class="dict-precision-switch">
                            <button type="button" class="dict-prec-btn active" id="search-mode-exact" onclick="setSearchPrecisionMode('exact')" title="Chỉ hiển thị từ khớp đúng trọng tâm, loại bỏ từ nhiễu">🎯 Chính xác</button>
                            <button type="button" class="dict-prec-btn" id="search-mode-broad" onclick="setSearchPrecisionMode('broad')" title="Hiển thị thêm các từ có chứa chuỗi ký tự liên quan">🔎 Mở rộng</button>
                        </div>

                        <button type="button" class="mini-pill-btn dict-fs-btn" id="dict-fullscreen-btn" onclick="toggleDictionaryFullscreen()">⛶ Toàn màn hình</button>
                    </div>

                    <!-- Hàng 2: 4 Tab Thứ Tự Từ Điển + Bộ lọc bài học -->
                    <div class="dict-order-tabs-bar">
                        <div class="dict-order-tabs">
                            <button type="button" class="dict-order-tab active" id="dict-mode-btn-vn_az" onclick="setDictionaryOrderMode('vn_az')">
                                🔤 Từ điển Việt (A ➔ Y)
                            </button>
                            <button type="button" class="dict-order-tab" id="dict-mode-btn-jp_50" onclick="setDictionaryOrderMode('jp_50')">
                                🇯🇵 Từ điển Nhật (50 Âm あ ➔ わ)
                            </button>
                            <button type="button" class="dict-order-tab" id="dict-mode-btn-hv_az" onclick="setDictionaryOrderMode('hv_az')">
                                🈴 Từ điển Hán-Việt (A ➔ Y)
                            </button>
                            <button type="button" class="dict-order-tab" id="dict-mode-btn-chapter" onclick="setDictionaryOrderMode('chapter')">
                                📚 Theo Bài Học
                            </button>
                        </div>

                        <div class="dict-chapter-select-wrap">
                            <select id="vocab-chapter-filter" onchange="filterVocabTable(true)"></select>
                        </div>
                    </div>

                    <!-- Hàng 3: Thanh Chỉ Mục Chữ Cái A-Y / Hàng 50 Âm あ-わ -->
                    <div class="dict-alphabet-bar" id="dict-alphabet-bar"></div>
                    <div class="dict-subkana-bar" id="dict-subkana-bar" style="display: none;"></div>

                    <!-- Hàng 4: Thống kê kết quả & Thao tác Ôn tập / Xuất Markdown -->
                    <div class="dict-actions-strip">
                        <span id="vocab-count-info" class="count-badge-text">Đang tải dữ liệu...</span>
                        <div class="toolbar-actions">
                            <button type="button" class="btn-md-export" onclick="studyCurrentFilteredVocab()">
                                🚀 Ôn danh sách này
                            </button>
                            <button type="button" class="btn-md-export" onclick="exportVocabToMarkdown()">
                                📥 Xuất .MD
                            </button>
                            <button type="button" class="btn-md-copy" onclick="copyVocabMarkdown()">
                                📋 Copy MD
                            </button>
                        </div>
                    </div>

                    <!-- Hàng 5: Bảng dữ liệu Từ điển -->
                    <div class="vocab-table-wrapper dict-table-wrapper">
                        <table class="vocab-data-table">
                            <thead>
                                <tr>
                                    <th style="width: 52px; text-align: center;">STT</th>
                                    <th style="width: 120px;">Học phần</th>
                                    <th>Tiếng Nhật</th>
                                    <th>Nghĩa Tiếng Việt &amp; Hán-Việt</th>
                                    <th style="width: 68px; text-align: center;">Đọc</th>
                                </tr>
                            </thead>
                            <tbody id="vocab-table-body"></tbody>
                        </table>

                        <div class="vocab-empty-view" id="vocab-empty-state" style="display: none;">
                            <div class="empty-emoji">🔍</div>
                            <h4>Không tìm thấy mục từ phù hợp</h4>
                            <p>Thử chuyển sang vần khác hoặc bật chế độ Mở rộng.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==========================================================================
// 3. ĐIỀU KHIỂN ĐÓNG / MỞ SESSION & SUB-SESSION (ACCORDION LOGIC)
// ==========================================================================

function toggleSessionAccordion(sessionId, event) {
    if (event && event.target.closest('.sh-checkbox-wrap')) return;

    const isOpening = activeSessionId !== sessionId;
    activeSessionId = isOpening ? sessionId : null;

    ['vocab', 'kanji', 'katakana', 'thadongtu', 'dem', 'dictionary'].forEach(id => {
        const card = document.getElementById(`session-card-${id}`);
        const body = document.getElementById(`session-body-${id}`);
        const open = (id === activeSessionId);
        if (card) card.classList.toggle('expanded', open);
        if (body) body.style.display = open ? 'block' : 'none';
    });

    if (activeSessionId === 'vocab') {
        if (!activeVocabStageId) activeVocabStageId = 'stage_1';
        applyVocabStageFilter();
    } else if (activeSessionId === 'kanji') {
        syncKanjiSubPanelsVisibility();
    } else if (activeSessionId === 'dictionary') {
        if (typeof renderDictionaryIndexBar === 'function') {
            renderDictionaryIndexBar();
            initVocabTableListeners();
            filterVocabTable(true);
        }
    }
}

function collapseAllSessions() {
    activeSessionId = null;
    ['vocab', 'kanji', 'katakana', 'thadongtu', 'dem', 'dictionary'].forEach(id => {
        const card = document.getElementById(`session-card-${id}`);
        const body = document.getElementById(`session-body-${id}`);
        if (card) card.classList.remove('expanded');
        if (body) body.style.display = 'none';
    });
}

// --------------------------------------------------------------------------
// 3.1 ĐIỀU KHIỂN CHẶNG TỪ VỰNG (TRONG SESSION 1)
// --------------------------------------------------------------------------

function switchVocabStage(stageId) {
    if (activeVocabStageId === stageId) {
        // Bấm lại vào chặng đang mở -> thu gọn khung bài học của chặng đó
        activeVocabStageId = null;
    } else {
        activeVocabStageId = stageId;
    }
    applyVocabStageFilter();
}

function applyVocabStageFilter() {
    const panel = document.getElementById('vocab-lessons-panel');
    const titleEl = document.getElementById('vocab-stage-panel-title');
    const allBtn = document.getElementById('btn-vocab-stage-all');

    VOCAB_STAGES_CONFIG.forEach(s => {
        const card = document.getElementById(`vocab-stage-card-${s.id}`);
        const isAct = activeVocabStageId === s.id;
        if (card) {
            card.classList.toggle('expanded', isAct);
            const hint = card.querySelector('.ssc-expand-hint');
            if (hint) hint.textContent = isAct ? '▴ Đang mở' : '▾ Bấm xem bài';
        }
    });

    if (allBtn) allBtn.classList.toggle('active', activeVocabStageId === 'all');

    if (!activeVocabStageId) {
        if (panel) panel.style.display = 'none';
        return;
    }

    if (panel) panel.style.display = 'block';

    if (activeVocabStageId === 'all') {
        if (titleEl) titleEl.textContent = '📋 Tất cả 25 bài Từ vựng (Bài 01 ➔ Bài 26)';
    } else {
        const stg = VOCAB_STAGES_CONFIG.find(s => s.id === activeVocabStageId);
        if (stg && titleEl) {
            titleEl.textContent = `${stg.icon} ${stg.badge}: ${stg.title}`;
        }
    }

    filterVocabStageLessons();
}

function filterVocabStageLessons() {
    const searchInput = document.getElementById('vocab-lesson-search');
    const query = searchInput ? removeVnTonesApp(searchInput.value.trim()) : '';
    const cards = document.querySelectorAll('#chapter-options .vocab-lesson-card');

    cards.forEach(card => {
        const cardStage = card.getAttribute('data-stage');
        const matchesStage = (activeVocabStageId === 'all') || !activeVocabStageId || (cardStage === activeVocabStageId);
        const searchData = card.getAttribute('data-search') || '';
        const matchesQuery = !query || searchData.includes(query);

        card.style.display = (matchesStage && matchesQuery) ? '' : 'none';
    });
}

function toggleVocabChapterCard(chapterId, event) {
    if (event && event.target.closest('.cic-actions')) return;
    const chk = document.getElementById(`chk-${chapterId}`);
    if (chk) {
        chk.checked = !chk.checked;
        updateSelectedCount();
    }
}

function toggleVocabStageSelection(stageId, isChecked) {
    const stage = VOCAB_STAGES_CONFIG.find(s => s.id === stageId);
    if (!stage) return;
    stage.chapterIds.forEach(chId => {
        const chk = document.getElementById(`chk-${chId}`);
        if (chk) chk.checked = isChecked;
    });
    updateSelectedCount();
}

function toggleEntireVocabSession(isChecked) {
    getVocabChaptersList().forEach(ch => {
        const chk = document.getElementById(`chk-${ch.id}`);
        if (chk) chk.checked = isChecked;
    });
    updateSelectedCount();
}

// --------------------------------------------------------------------------
// 3.2 ĐIỀU KHIỂN 3 THÀNH PHẦN CON TRONG SESSION 2 (KANJI)
// --------------------------------------------------------------------------

function switchKanjiSubSession(subId) {
    if (activeKanjiSubId === subId) {
        activeKanjiSubId = null; // Bấm lại để thu gọn
    } else {
        activeKanjiSubId = subId;
    }
    syncKanjiSubPanelsVisibility();
}

function syncKanjiSubPanelsVisibility() {
    const hints = {
        radicals: '▾ Bấm chọn bộ',
        lessons: '▾ Bấm chọn bài',
        pages: '▾ Bấm chọn trang'
    };

    ['radicals', 'lessons', 'pages'].forEach(id => {
        const card = document.getElementById(`kanji-subcard-${id}`);
        const panel = document.getElementById(`kanji-subpanel-${id}`);
        const hintEl = document.getElementById(`kanji-sub-hint-${id}`);
        const isOpen = (activeKanjiSubId === id);

        if (card) card.classList.toggle('expanded', isOpen);
        if (panel) panel.style.display = isOpen ? 'block' : 'none';
        if (hintEl) hintEl.textContent = isOpen ? '▴ Đang mở' : hints[id];
    });

    if (activeKanjiSubId === 'radicals') {
        renderHomeRadicalCards();
    }
}

function switchHomeKanjiPagePart(partId) {
    activeKanjiPagePartId = partId;
    ['kanji', 'kanji800'].forEach(id => {
        const btn = document.getElementById(`part-tab-btn-${id}`);
        const panel = document.getElementById(`home-kanji-part-panel-${id}`);
        const isAct = (id === partId);
        if (btn) btn.classList.toggle('active', isAct);
        if (panel) panel.style.display = isAct ? 'block' : 'none';
    });
}

// --- A. Điều khiển Theo Bộ Kanji trên Trang chủ ---

function matchesHomeStrokeFilter(strokes, range) {
    if (range === 'all') return true;
    if (range === '1-2') return strokes <= 2;
    if (range === '3') return strokes === 3;
    if (range === '4') return strokes === 4;
    if (range === '5-6') return strokes === 5 || strokes === 6;
    if (range === '7+') return strokes >= 7;
    return true;
}

function getHomeFilteredRadicalBuckets() {
    if (typeof getRadicalItemsMap !== 'function' || typeof KANJI_RADICALS_CONFIG === 'undefined') {
        return [];
    }
    const statsMap = getRadicalItemsMap({
        includeComponents: homeRadicalIncludeComponents,
        level: homeRadicalLevelFilter,
        includeRadicalEntry: true
    });

    const input = document.getElementById('home-radical-search');
    const queryRaw = input ? input.value.trim() : '';
    const qNorm = removeVnTonesApp(queryRaw);
    const qLower = queryRaw.toLowerCase();

    const buckets = [];
    KANJI_RADICALS_CONFIG.forEach(rad => {
        const bucket = statsMap.get(rad.name);
        if (!bucket || bucket.items.length === 0) return;
        if (!matchesHomeStrokeFilter(rad.strokes, homeRadicalStrokeFilter)) return;

        if (queryRaw) {
            const hay = removeVnTonesApp(`${rad.name} ${rad.hanViet} ${rad.meaning} ${rad.char} ${rad.kangxi}`);
            if (!hay.includes(qNorm) && !rad.name.toLowerCase().includes(qLower) && !rad.char.includes(queryRaw)) {
                return;
            }
        }
        buckets.push(bucket);
    });
    return buckets;
}

function renderHomeRadicalCards() {
    const container = document.getElementById('home-radicals-grid');
    if (!container) return;

    const buckets = getHomeFilteredRadicalBuckets();
    if (buckets.length === 0) {
        container.innerHTML = `
            <div class="vocab-empty-view" style="grid-column: 1 / -1; padding: 28px;">
                <div class="empty-emoji">🧩</div>
                <h4>Không tìm thấy bộ chữ phù hợp</h4>
                <p>Thử đổi từ khóa hoặc bộ lọc số nét / cấp độ.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = buckets.map(b => {
        const r = b.radical;
        const isChecked = selectedHomeRadicals.has(r.name);
        const samples = b.items.slice(0, 5);
        const extra = Math.max(0, b.items.length - samples.length);
        const safeName = escapeAppJsArg(r.name);

        return `
            <div class="compact-item-card ${isChecked ? 'active' : ''}" id="home-rad-card-${r.id}" onclick="toggleHomeRadical('${safeName}', event)">
                <input type="checkbox" id="chk-home-rad-${r.id}" class="hidden-item-chk" ${isChecked ? 'checked' : ''} onchange="onHomeRadicalChange('${safeName}', this.checked)">
                <div class="cic-top">
                    <span class="cic-tag">#${r.kangxi} • ${r.strokes} nét</span>
                    <span class="cic-checkbox"></span>
                </div>
                <div class="cic-radical-hero">
                    <span class="cic-radical-glyph">${escapeAppHtml(r.char)}</span>
                    <div class="cic-radical-meta">
                        <h4 class="cic-title">${escapeAppHtml(r.name)}</h4>
                        <p class="cic-desc">${escapeAppHtml(r.meaning)}</p>
                    </div>
                </div>
                <div class="cic-samples-row">
                    ${samples.map(it => `<span class="cic-sample-pill" title="${escapeAppHtml(it.label)}">${escapeAppHtml(it.char)}</span>`).join('')}
                    ${extra > 0 ? `<span class="cic-sample-more">+${extra}</span>` : ''}
                </div>
                <div class="cic-footer">
                    <span class="cic-count">📝 ${b.items.length} chữ</span>
                    <div class="cic-actions" onclick="event.stopPropagation()">
                        <button type="button" class="cic-btn cic-btn-view" onclick="previewHomeRadical('${safeName}', event)" title="Xem tất cả chữ thuộc Bộ ${escapeAppHtml(r.name)}">👁️</button>
                        <button type="button" class="cic-btn cic-btn-study" onclick="studySingleHomeRadical('${safeName}', event)" title="Học ngay Bộ ${escapeAppHtml(r.name)}">⚡ Học</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setHomeRadicalMatchMode(includeComps) {
    homeRadicalIncludeComponents = includeComps;
    document.getElementById('home-rad-mode-all')?.classList.toggle('active', includeComps);
    document.getElementById('home-rad-mode-primary')?.classList.toggle('active', !includeComps);
    renderHomeRadicalCards();
    updateSelectedCount();
}

function setHomeRadicalLevel(level) {
    homeRadicalLevelFilter = level;
    ['all', 'N5', 'N4'].forEach(lvl => {
        document.getElementById(`home-rad-lvl-${lvl}`)?.classList.toggle('active', lvl === level);
    });
    renderHomeRadicalCards();
    updateSelectedCount();
}

function setHomeRadicalStroke(range) {
    homeRadicalStrokeFilter = range;
    document.querySelectorAll('[data-home-stroke]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-home-stroke') === range);
    });
    renderHomeRadicalCards();
}

function toggleHomeRadical(radName, event) {
    if (event && event.target.closest('.cic-actions')) return;
    const next = !selectedHomeRadicals.has(radName);
    onHomeRadicalChange(radName, next);
}

function onHomeRadicalChange(radName, isChecked) {
    if (isChecked) selectedHomeRadicals.add(radName);
    else selectedHomeRadicals.delete(radName);

    const rad = typeof KANJI_RADICAL_BY_NAME !== 'undefined' ? KANJI_RADICAL_BY_NAME[radName] : null;
    if (rad) {
        const card = document.getElementById(`home-rad-card-${rad.id}`);
        const chk = document.getElementById(`chk-home-rad-${rad.id}`);
        if (card) card.classList.toggle('active', isChecked);
        if (chk) chk.checked = isChecked;
    }
    updateSelectedCount();
}

function selectHomeVisibleRadicals(selectAll) {
    if (!selectAll) {
        selectedHomeRadicals.clear();
    } else {
        const buckets = getHomeFilteredRadicalBuckets();
        buckets.forEach(b => selectedHomeRadicals.add(b.radical.name));
    }
    renderHomeRadicalCards();
    updateSelectedCount();
}

// --- B. Điều khiển Từ Vựng Kanji Theo Bài trên Trang chủ ---

function toggleHomeKanjiLesson(lessonId, event) {
    if (event && event.target.closest('.cic-actions')) return;
    const next = !selectedKanjiLessons.has(lessonId);
    onHomeKanjiLessonChange(lessonId, next);
}

function onHomeKanjiLessonChange(lessonId, isChecked) {
    if (isChecked) selectedKanjiLessons.add(lessonId);
    else selectedKanjiLessons.delete(lessonId);

    const card = document.getElementById(`home-klc-${lessonId}`);
    const chk = document.getElementById(`chk-home-klc-${lessonId}`);
    if (card) card.classList.toggle('active', isChecked);
    if (chk) chk.checked = isChecked;

    updateSelectedCount();
}

function toggleAllHomeKanjiLessons(selectAll) {
    if (typeof KANJI_LESSONS_CONFIG === 'undefined') return;
    KANJI_LESSONS_CONFIG.forEach(l => {
        if (selectAll) selectedKanjiLessons.add(l.id);
        else selectedKanjiLessons.delete(l.id);

        const card = document.getElementById(`home-klc-${l.id}`);
        const chk = document.getElementById(`chk-home-klc-${l.id}`);
        if (card) card.classList.toggle('active', selectAll);
        if (chk) chk.checked = selectAll;
    });
    updateSelectedCount();
}

// --- C. Điều khiển Kanji Theo Trang (Part 1 N5 & Part 2 N4) trên Trang chủ ---

function toggleHomeKanjiPage(partId, pageId, event) {
    if (event && event.target.closest('.cic-actions')) return;
    const part = KANJI_PARTS_CONFIG.find(p => p.id === partId);
    if (!part) return;
    const next = !part.selectedPages.has(pageId);
    onHomeKanjiPageChange(partId, pageId, next);
}

function onHomeKanjiPageChange(partId, pageId, isChecked) {
    const part = KANJI_PARTS_CONFIG.find(p => p.id === partId);
    if (!part) return;

    if (isChecked) part.selectedPages.add(pageId);
    else part.selectedPages.delete(pageId);

    const card = document.getElementById(`home-kpc-${pageId}`);
    const chk = document.getElementById(`chk-home-kpc-${pageId}`);
    if (card) card.classList.toggle('active', isChecked);
    if (chk) chk.checked = isChecked;

    updateSelectedCount();
}

function toggleHomeKanjiPartAllPages(partId, selectAll) {
    const part = KANJI_PARTS_CONFIG.find(p => p.id === partId);
    if (!part) return;

    part.pagesConfig.forEach(p => {
        if (selectAll) part.selectedPages.add(p.id);
        else part.selectedPages.delete(p.id);

        const card = document.getElementById(`home-kpc-${p.id}`);
        const chk = document.getElementById(`chk-home-kpc-${p.id}`);
        if (card) card.classList.toggle('active', selectAll);
        if (chk) chk.checked = selectAll;
    });
    updateSelectedCount();
}

function toggleAllHomeKanjiPages(selectAll) {
    KANJI_PARTS_CONFIG.forEach(part => {
        toggleHomeKanjiPartAllPages(part.id, selectAll);
    });
}

function toggleEntireKanjiSession(selectAll) {
    if (!selectAll) {
        selectedHomeRadicals.clear();
        renderHomeRadicalCards();
        toggleAllHomeKanjiLessons(false);
        toggleAllHomeKanjiPages(false);
    } else {
        toggleAllHomeKanjiLessons(true);
        toggleAllHomeKanjiPages(true);
    }
    updateSelectedCount();
}

// --------------------------------------------------------------------------
// 3.3 ĐIỀU KHIỂN SESSION 3 (KATAKANA), SESSION 4 (THA ĐỘNG TỪ), SESSION 5 (ĐẾM SỐ)
// --------------------------------------------------------------------------

function toggleKataGroupItem(groupId, event) {
    if (event && event.target.closest('.cic-actions')) return;
    const next = !selectedKataGroups.has(groupId);
    onKataGroupCheckboxChange(groupId, next);
}

function onKataGroupCheckboxChange(groupId, isChecked) {
    if (isChecked) selectedKataGroups.add(groupId);
    else selectedKataGroups.delete(groupId);

    const card = document.getElementById(`kata-card-${groupId}`);
    const chk = document.getElementById(`chk-kata-${groupId}`);
    if (card) card.classList.toggle('active', isChecked);
    if (chk) chk.checked = isChecked;

    updateSelectedCount();
}

function toggleEntireKataSession(selectAll) {
    KATA_GROUPS_CONFIG.forEach(g => {
        if (selectAll) selectedKataGroups.add(g.id);
        else selectedKataGroups.delete(g.id);

        const card = document.getElementById(`kata-card-${g.id}`);
        const chk = document.getElementById(`chk-kata-${g.id}`);
        if (card) card.classList.toggle('active', selectAll);
        if (chk) chk.checked = selectAll;
    });
    updateSelectedCount();
}

function toggleThaDongTuGroupItem(groupId, event) {
    if (event && event.target.closest('.cic-actions')) return;
    const next = !selectedThaDongTuGroups.has(groupId);
    onThaDongTuGroupCheckboxChange(groupId, next);
}

function onThaDongTuGroupCheckboxChange(groupId, isChecked) {
    if (isChecked) selectedThaDongTuGroups.add(groupId);
    else selectedThaDongTuGroups.delete(groupId);

    const card = document.getElementById(`tdt-card-${groupId}`);
    const chk = document.getElementById(`chk-tdt-${groupId}`);
    if (card) card.classList.toggle('active', isChecked);
    if (chk) chk.checked = isChecked;

    updateSelectedCount();
}

function toggleEntireThaDongTuSession(selectAll) {
    THA_DONG_TU_GROUPS_CONFIG.forEach(g => {
        if (selectAll) selectedThaDongTuGroups.add(g.id);
        else selectedThaDongTuGroups.delete(g.id);

        const card = document.getElementById(`tdt-card-${g.id}`);
        const chk = document.getElementById(`chk-tdt-${g.id}`);
        if (card) card.classList.toggle('active', selectAll);
        if (chk) chk.checked = selectAll;
    });
    updateSelectedCount();
}

function toggleCounterGroupItem(groupId, event) {
    if (event && event.target.closest('.cic-actions')) return;
    const next = !selectedCounterGroups.has(groupId);
    onCounterGroupCheckboxChange(groupId, next);
}

function onCounterGroupCheckboxChange(groupId, isChecked) {
    if (isChecked) selectedCounterGroups.add(groupId);
    else selectedCounterGroups.delete(groupId);

    const card = document.getElementById(`dem-card-${groupId}`);
    const chk = document.getElementById(`chk-dem-${groupId}`);
    if (card) card.classList.toggle('active', isChecked);
    if (chk) chk.checked = isChecked;

    updateSelectedCount();
}

function toggleEntireCounterSession(selectAll) {
    COUNTER_GROUPS_CONFIG.forEach(g => {
        if (selectAll) selectedCounterGroups.add(g.id);
        else selectedCounterGroups.delete(g.id);

        const card = document.getElementById(`dem-card-${g.id}`);
        const chk = document.getElementById(`chk-dem-${g.id}`);
        if (card) card.classList.toggle('active', selectAll);
        if (chk) chk.checked = selectAll;
    });
    updateSelectedCount();
}

// ==========================================================================
// 4. ĐỒNG BỘ TRẠNG THÁI ĐÃ CHỌN, BADGE TỪNG SESSION & THANH TÓM TẮT
// ==========================================================================

function updateSelectedCount() {
    // 1. Đồng bộ thẻ chế độ học
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        const input = card.querySelector('input[type="radio"]');
        card.classList.toggle('active', !!(input && input.checked));
    });

    // 2. Đồng bộ Session 1: Từ vựng
    const vocabChapters = getVocabChaptersList();
    let selectedVocabCount = 0;
    vocabChapters.forEach(ch => {
        const chk = document.getElementById(`chk-${ch.id}`);
        const card = document.getElementById(`card-${ch.id}`);
        const checked = !!(chk && chk.checked);
        if (card) card.classList.toggle('active', checked);
        if (checked) selectedVocabCount++;
    });

    // Đồng bộ 3 Chặng Từ vựng
    VOCAB_STAGES_CONFIG.forEach(stage => {
        let stageSelected = 0;
        stage.chapterIds.forEach(chId => {
            const chk = document.getElementById(`chk-${chId}`);
            if (chk && chk.checked) stageSelected++;
        });
        const stageChk = document.getElementById(`chk-stage-${stage.id}`);
        const stageStatus = document.getElementById(`stage-status-${stage.id}`);
        const stageCard = document.getElementById(`vocab-stage-card-${stage.id}`);
        if (stageChk) stageChk.checked = (stageSelected === stage.chapterIds.length && stageSelected > 0);
        if (stageStatus) {
            stageStatus.textContent = stageSelected > 0
                ? `Đã chọn ${stageSelected}/${stage.chapterIds.length} bài`
                : `0/${stage.chapterIds.length} bài`;
            stageStatus.classList.toggle('has-selected', stageSelected > 0);
        }
        if (stageCard) stageCard.classList.toggle('has-selection', stageSelected > 0);
    });

    const vocabSessionChk = document.getElementById('chk-session-vocab');
    const vocabSessionBadge = document.getElementById('session-badge-vocab');
    const vocabSessionCard = document.getElementById('session-card-vocab');
    if (vocabSessionChk) vocabSessionChk.checked = (selectedVocabCount === vocabChapters.length && selectedVocabCount > 0);
    if (vocabSessionBadge) {
        vocabSessionBadge.textContent = selectedVocabCount > 0 ? `Đã chọn ${selectedVocabCount}/25 bài` : 'Chưa chọn';
        vocabSessionBadge.classList.toggle('active', selectedVocabCount > 0);
    }
    if (vocabSessionCard) vocabSessionCard.classList.toggle('has-selection', selectedVocabCount > 0);

    // 3. Đồng bộ Session 2: Kanji (Theo Bộ + Từ vựng Kanji + Theo Trang N5/N4)
    const p1Selected = KANJI_PARTS_CONFIG[0].selectedPages.size;
    const p1Total = KANJI_PARTS_CONFIG[0].pagesConfig.length;
    const p2Selected = KANJI_PARTS_CONFIG[1].selectedPages.size;
    const p2Total = KANJI_PARTS_CONFIG[1].pagesConfig.length;
    const totalPagesSelected = p1Selected + p2Selected;
    const totalPagesAll = p1Total + p2Total;

    const radSelected = selectedHomeRadicals.size;
    const totalRadicals = typeof KANJI_RADICALS_CONFIG !== 'undefined' ? KANJI_RADICALS_CONFIG.length : 178;

    const lessonSelected = typeof selectedKanjiLessons !== 'undefined' ? selectedKanjiLessons.size : 0;
    const totalLessons = typeof KANJI_LESSONS_CONFIG !== 'undefined' ? KANJI_LESSONS_CONFIG.length : 17;

    // Đồng bộ legacy checkboxes cho study.js
    const legacyKanji1 = document.getElementById('chk-kanji');
    const legacyKanji2 = document.getElementById('chk-kanji800');
    const legacyRad = document.getElementById('chk-kanji_radicals_group');
    const legacyLes = document.getElementById('chk-kanji_lessons');
    if (legacyKanji1) legacyKanji1.checked = p1Selected > 0;
    if (legacyKanji2) legacyKanji2.checked = p2Selected > 0;
    if (legacyRad) legacyRad.checked = radSelected > 0;
    if (legacyLes) legacyLes.checked = lessonSelected > 0;

    // Badge trên 3 thẻ thành phần con của Kanji
    const subBadgeRad = document.getElementById('kanji-sub-badge-radicals');
    const subBadgeLes = document.getElementById('kanji-sub-badge-lessons');
    const subBadgePag = document.getElementById('kanji-sub-badge-pages');
    if (subBadgeRad) {
        subBadgeRad.textContent = radSelected > 0 ? `Đã chọn ${radSelected} bộ` : `0/${totalRadicals} bộ`;
        subBadgeRad.classList.toggle('has-selected', radSelected > 0);
    }
    if (subBadgeLes) {
        subBadgeLes.textContent = lessonSelected > 0 ? `Đã chọn ${lessonSelected}/${totalLessons} bài` : `0/${totalLessons} bài`;
        subBadgeLes.classList.toggle('has-selected', lessonSelected > 0);
    }
    if (subBadgePag) {
        subBadgePag.textContent = totalPagesSelected > 0 ? `Đã chọn ${totalPagesSelected}/${totalPagesAll} trang` : `0/${totalPagesAll} trang`;
        subBadgePag.classList.toggle('has-selected', totalPagesSelected > 0);
    }

    document.getElementById('kanji-subcard-radicals')?.classList.toggle('has-selection', radSelected > 0);
    document.getElementById('kanji-subcard-lessons')?.classList.toggle('has-selection', lessonSelected > 0);
    document.getElementById('kanji-subcard-pages')?.classList.toggle('has-selection', totalPagesSelected > 0);

    const subChkRad = document.getElementById('chk-kanji-sub-radicals');
    const subChkLes = document.getElementById('chk-kanji-sub-lessons');
    const subChkPag = document.getElementById('chk-kanji-sub-pages');
    if (subChkRad) subChkRad.checked = radSelected > 0;
    if (subChkLes) subChkLes.checked = (lessonSelected === totalLessons && totalLessons > 0);
    if (subChkPag) subChkPag.checked = (totalPagesSelected === totalPagesAll && totalPagesAll > 0);

    const partBadge1 = document.getElementById('part-tab-badge-kanji');
    const partBadge2 = document.getElementById('part-tab-badge-kanji800');
    if (partBadge1) partBadge1.textContent = `${p1Selected}/${p1Total}`;
    if (partBadge2) partBadge2.textContent = `${p2Selected}/${p2Total}`;

    const totalKanjiUnits = radSelected + lessonSelected + totalPagesSelected;
    const kanjiSessionChk = document.getElementById('chk-session-kanji');
    const kanjiSessionBadge = document.getElementById('session-badge-kanji');
    const kanjiSessionCard = document.getElementById('session-card-kanji');
    if (kanjiSessionChk) kanjiSessionChk.checked = totalKanjiUnits > 0;
    if (kanjiSessionBadge) {
        const partsText = [];
        if (radSelected > 0) partsText.push(`${radSelected} bộ`);
        if (lessonSelected > 0) partsText.push(`${lessonSelected} bài`);
        if (totalPagesSelected > 0) partsText.push(`${totalPagesSelected} trang`);
        kanjiSessionBadge.textContent = partsText.length > 0 ? `Đã chọn: ${partsText.join(' + ')}` : 'Chưa chọn';
        kanjiSessionBadge.classList.toggle('active', totalKanjiUnits > 0);
    }
    if (kanjiSessionCard) kanjiSessionCard.classList.toggle('has-selection', totalKanjiUnits > 0);

    // 4. Đồng bộ Session 3: Katakana
    const kataSelected = selectedKataGroups.size;
    const kataTotal = KATA_GROUPS_CONFIG.length;
    const legacyKata = document.getElementById('chk-kata');
    if (legacyKata) legacyKata.checked = kataSelected > 0;

    const kataSessionChk = document.getElementById('chk-session-katakana');
    const kataSessionBadge = document.getElementById('session-badge-katakana');
    const kataSessionCard = document.getElementById('session-card-katakana');
    if (kataSessionChk) kataSessionChk.checked = (kataSelected === kataTotal && kataTotal > 0);
    if (kataSessionBadge) {
        kataSessionBadge.textContent = kataSelected > 0 ? `Đã chọn ${kataSelected}/${kataTotal} chủ đề` : 'Chưa chọn';
        kataSessionBadge.classList.toggle('active', kataSelected > 0);
    }
    if (kataSessionCard) kataSessionCard.classList.toggle('has-selection', kataSelected > 0);

    // 5. Đồng bộ Session 4: Tha động từ
    const tdtSelected = selectedThaDongTuGroups.size;
    const tdtTotal = THA_DONG_TU_GROUPS_CONFIG.length;
    const legacyTdt = document.getElementById('chk-tha_dong_tu');
    if (legacyTdt) legacyTdt.checked = tdtSelected > 0;

    const tdtSessionChk = document.getElementById('chk-session-thadongtu');
    const tdtSessionBadge = document.getElementById('session-badge-thadongtu');
    const tdtSessionCard = document.getElementById('session-card-thadongtu');
    if (tdtSessionChk) tdtSessionChk.checked = (tdtSelected === tdtTotal && tdtTotal > 0);
    if (tdtSessionBadge) {
        tdtSessionBadge.textContent = tdtSelected > 0 ? `Đã chọn ${tdtSelected}/${tdtTotal} phần` : 'Chưa chọn';
        tdtSessionBadge.classList.toggle('active', tdtSelected > 0);
    }
    if (tdtSessionCard) tdtSessionCard.classList.toggle('has-selection', tdtSelected > 0);

    // 6. Đồng bộ Session 5: Đếm số
    const demSelected = selectedCounterGroups.size;
    const demTotal = COUNTER_GROUPS_CONFIG.length;
    const legacyDem = document.getElementById('chk-dem');
    if (legacyDem) legacyDem.checked = demSelected > 0;

    const demSessionChk = document.getElementById('chk-session-dem');
    const demSessionBadge = document.getElementById('session-badge-dem');
    const demSessionCard = document.getElementById('session-card-dem');
    if (demSessionChk) demSessionChk.checked = (demSelected === demTotal && demTotal > 0);
    if (demSessionBadge) {
        demSessionBadge.textContent = demSelected > 0 ? `Đã chọn ${demSelected}/${demTotal} mục` : 'Chưa chọn';
        demSessionBadge.classList.toggle('active', demSelected > 0);
    }
    if (demSessionCard) demSessionCard.classList.toggle('has-selection', demSelected > 0);

    // 7. Tổng số mục nhỏ đang được chọn trên toàn ứng dụng
    const totalSelectedItems = selectedVocabCount + totalKanjiUnits + kataSelected + tdtSelected + demSelected;

    const countNum = document.getElementById('count-num');
    if (countNum) countNum.innerText = totalSelectedItems;

    const startBadge = document.getElementById('start-count-badge');
    if (startBadge) startBadge.innerText = `${totalSelectedItems} mục được chọn`;

    renderActiveSelectionStrip(selectedVocabCount, radSelected, lessonSelected, p1Selected, p2Selected, kataSelected, tdtSelected, demSelected);
}

function renderActiveSelectionStrip(vocabCount, radCount, kLessonCount, p1Count, p2Count, kataCount, tdtCount, demCount) {
    const bar = document.getElementById('active-selection-bar');
    const chipsContainer = document.getElementById('active-selection-chips');
    if (!bar || !chipsContainer) return;

    const chips = [];
    if (vocabCount > 0) {
        chips.push(`<span class="asb-chip" onclick="openAndFocusSession('vocab')">📚 Từ vựng: <b>${vocabCount} bài</b> <button type="button" onclick="event.stopPropagation(); toggleEntireVocabSession(false)" title="Bỏ chọn Từ vựng">✕</button></span>`);
    }
    if (radCount > 0) {
        chips.push(`<span class="asb-chip" onclick="openAndFocusSession('kanji', 'radicals')">🧩 Bộ Kanji: <b>${radCount} bộ</b> <button type="button" onclick="event.stopPropagation(); selectHomeVisibleRadicals(false)" title="Bỏ chọn Bộ Kanji">✕</button></span>`);
    }
    if (kLessonCount > 0) {
        chips.push(`<span class="asb-chip" onclick="openAndFocusSession('kanji', 'lessons')">📗 Từ vựng Kanji: <b>${kLessonCount} bài</b> <button type="button" onclick="event.stopPropagation(); toggleAllHomeKanjiLessons(false)" title="Bỏ chọn Từ vựng Kanji">✕</button></span>`);
    }
    if (p1Count > 0) {
        chips.push(`<span class="asb-chip" onclick="openAndFocusSession('kanji', 'pages', 'kanji')">🈁 Kanji N5: <b>${p1Count} trang</b> <button type="button" onclick="event.stopPropagation(); toggleHomeKanjiPartAllPages('kanji', false)" title="Bỏ chọn Kanji N5">✕</button></span>`);
    }
    if (p2Count > 0) {
        chips.push(`<span class="asb-chip" onclick="openAndFocusSession('kanji', 'pages', 'kanji800')">🈯 Kanji N4: <b>${p2Count} trang</b> <button type="button" onclick="event.stopPropagation(); toggleHomeKanjiPartAllPages('kanji800', false)" title="Bỏ chọn Kanji N4">✕</button></span>`);
    }
    if (kataCount > 0) {
        chips.push(`<span class="asb-chip" onclick="openAndFocusSession('katakana')">🅰️ Katakana: <b>${kataCount} chủ đề</b> <button type="button" onclick="event.stopPropagation(); toggleEntireKataSession(false)" title="Bỏ chọn Katakana">✕</button></span>`);
    }
    if (tdtCount > 0) {
        chips.push(`<span class="asb-chip" onclick="openAndFocusSession('thadongtu')">🔄 Tha động từ: <b>${tdtCount} phần</b> <button type="button" onclick="event.stopPropagation(); toggleEntireThaDongTuSession(false)" title="Bỏ chọn Tha động từ">✕</button></span>`);
    }
    if (demCount > 0) {
        chips.push(`<span class="asb-chip" onclick="openAndFocusSession('dem')">🔢 Đếm số: <b>${demCount} mục</b> <button type="button" onclick="event.stopPropagation(); toggleEntireCounterSession(false)" title="Bỏ chọn Đếm số">✕</button></span>`);
    }

    if (chips.length === 0) {
        bar.style.display = 'none';
        chipsContainer.innerHTML = '';
    } else {
        bar.style.display = 'flex';
        chipsContainer.innerHTML = chips.join('');
    }
}

function openAndFocusSession(sessionId, kanjiSub = null, kanjiPart = null) {
    if (activeSessionId !== sessionId) {
        toggleSessionAccordion(sessionId, null);
    }
    if (sessionId === 'kanji' && kanjiSub) {
        activeKanjiSubId = kanjiSub;
        syncKanjiSubPanelsVisibility();
        if (kanjiSub === 'pages' && kanjiPart) {
            switchHomeKanjiPagePart(kanjiPart);
        }
    }
    const card = document.getElementById(`session-card-${sessionId}`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Chọn tất cả hoặc bỏ chọn tất cả học phần trên toàn trang
 */
function toggleSelectAll(selectAll) {
    toggleEntireVocabSession(selectAll);
    if (!selectAll) {
        selectedHomeRadicals.clear();
        renderHomeRadicalCards();
    }
    toggleAllHomeKanjiLessons(selectAll);
    toggleAllHomeKanjiPages(selectAll);
    toggleEntireKataSession(selectAll);
    toggleEntireThaDongTuSession(selectAll);
    toggleEntireCounterSession(selectAll);
    updateSelectedCount();
}

// ==========================================================================
// 5. HỌC NHANH 1 MỤC CON (⚡ HỌC) & XEM CHI TIẾT MỤC CON (👁️ XEM)
// ==========================================================================

function studySingleVocabChapter(chapterId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const ch = CHAPTERS_CONFIG.find(c => c.id === chapterId);
    if (!ch) return;
    const data = ch.getData();
    if (!data || Object.keys(data).length === 0) return;

    startFlashcardSession(
        data,
        `${ch.label} (${ch.title})`,
        () => studySingleVocabChapter(chapterId, null)
    );
    showToast(`🚀 Đang ôn tập: ${ch.label} - ${ch.title} (${Object.keys(data).length} từ)`);
}

function studySingleHomeRadical(radicalName, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (typeof getKanjiByRadical !== 'function') return;
    const items = getKanjiByRadical(radicalName, {
        includeComponents: homeRadicalIncludeComponents,
        level: homeRadicalLevelFilter,
        includeRadicalEntry: true
    });
    if (items.length === 0) {
        alert('Không có chữ Hán nào khớp bộ lọc hiện tại!');
        return;
    }

    const vocabMap = {};
    const usedKeys = new Set();
    items.forEach(item => {
        let key = item.label || item.hanViet || item.char;
        if (usedKeys.has(key) && vocabMap[key] !== item.char) {
            key = `${key} [${item.char}]`;
        }
        usedKeys.add(key);
        vocabMap[key] = item.char;
    });

    startFlashcardSession(
        vocabMap,
        `Bộ ${radicalName} (${items.length} chữ)`,
        () => studySingleHomeRadical(radicalName, null)
    );
    showToast(`🧩 Đang ôn Bộ ${radicalName} (${items.length} chữ)!`);
}

function studySingleKataGroup(groupId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const g = KATA_GROUPS_CONFIG.find(item => item.id === groupId);
    if (!g) return;
    const data = g.getData();
    startFlashcardSession(
        data,
        `Katakana • ${g.label} (${g.title})`,
        () => studySingleKataGroup(groupId, null)
    );
    showToast(`🅰️ Đang ôn Katakana: ${g.title} (${Object.keys(data).length} từ)!`);
}

function studySingleThaDongTuGroup(groupId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const g = THA_DONG_TU_GROUPS_CONFIG.find(item => item.id === groupId);
    if (!g) return;
    const data = g.getData();
    startFlashcardSession(
        data,
        `Tha động từ • ${g.label} (${g.title})`,
        () => studySingleThaDongTuGroup(groupId, null)
    );
    showToast(`🔄 Đang ôn Tha động từ: ${g.title} (${Object.keys(data).length} cụm)!`);
}

function studySingleCounterGroup(groupId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const g = COUNTER_GROUPS_CONFIG.find(item => item.id === groupId);
    if (!g) return;
    const data = g.getData(g.defaultAmount || 8);
    startFlashcardSession(
        data,
        `Đếm số • ${g.title}`,
        () => studySingleCounterGroup(groupId, null)
    );
    showToast(`🔢 Đang luyện: ${g.title}!`);
}

// --------------------------------------------------------------------------
// 5.2 MODAL XEM TRƯỚC CHI TIẾT MỤC NHỎ (👁️ XEM)
// --------------------------------------------------------------------------

function initItemPreviewModalOverlay() {
    const modal = document.getElementById('item-preview-modal');
    if (!modal || modal._hasOverlayBound) return;
    modal._hasOverlayBound = true;
    modal.addEventListener('mousedown', e => { isPreviewModalOverlayGesture = (e.target === modal); });
    modal.addEventListener('touchstart', e => { isPreviewModalOverlayGesture = (e.target === modal); }, { passive: true });
}

function openItemPreviewModal({ icon, heading, subheading, entries, isKanjiLesson = false, isKanji = false, onStart }) {
    const modal = document.getElementById('item-preview-modal');
    if (!modal) return;
    initItemPreviewModalOverlay();

    const iconEl = document.getElementById('ipm-icon');
    const headingEl = document.getElementById('ipm-heading');
    const subheadingEl = document.getElementById('ipm-subheading');
    const gridEl = document.getElementById('ipm-grid');
    const startBtn = document.getElementById('ipm-start-btn');

    if (iconEl) iconEl.textContent = icon || '📖';
    if (headingEl) headingEl.textContent = heading || 'Chi tiết mục học';
    if (subheadingEl) subheadingEl.textContent = subheading || `${entries.length} mục`;

    if (gridEl) {
        gridEl.innerHTML = entries.map((entry, idx) => {
            const safeSpeak = escapeAppHtml(entry.speakText || entry.jp);
            let radHtml = '';
            if (isKanji && entry.primaryRadical) {
                radHtml = `<div class="pic-rad">📌 ${escapeAppHtml(entry.primaryRadical)}</div>`;
            }
            let hvHtml = '';
            if (entry.hanViet) {
                hvHtml = `<span class="pic-hv">${escapeAppHtml(entry.hanViet)}</span>`;
            }

            return `
                <div class="preview-item-card">
                    <div class="pic-top">
                        <span class="pic-idx">#${idx + 1}</span>
                        <button type="button" class="table-speak-btn pic-speak-btn" data-speak="${safeSpeak}" title="Nghe phát âm">🔊</button>
                    </div>
                    <div class="pic-jp">${escapeAppHtml(entry.jpDisplay)}</div>
                    ${hvHtml}
                    <div class="pic-vn">${escapeAppHtml(entry.vnDisplay)}</div>
                    ${radHtml}
                </div>
            `;
        }).join('');

        if (!gridEl._hasAudioBound) {
            gridEl._hasAudioBound = true;
            gridEl.addEventListener('click', e => {
                const btn = e.target.closest('.pic-speak-btn');
                if (btn) {
                    e.stopPropagation();
                    const txt = btn.getAttribute('data-speak');
                    if (txt && typeof speakJapanese === 'function') {
                        speakJapanese(txt);
                    }
                }
            });
        }
    }

    if (startBtn) {
        startBtn.onclick = () => {
            closeItemPreviewModal();
            if (typeof onStart === 'function') onStart();
        };
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeItemPreviewModal() {
    const modal = document.getElementById('item-preview-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closeItemPreviewModalOnOverlay(event) {
    if (isPreviewModalOverlayGesture && event && event.target && event.target.id === 'item-preview-modal') {
        closeItemPreviewModal();
    }
    isPreviewModalOverlayGesture = false;
}

function previewVocabChapter(chapterId, event) {
    if (event) event.stopPropagation();
    const ch = CHAPTERS_CONFIG.find(c => c.id === chapterId);
    if (!ch) return;
    const data = ch.getData() || {};
    const entries = Object.entries(data).map(([vn, jp]) => ({
        jpDisplay: jp,
        vnDisplay: vn,
        speakText: jp
    }));

    openItemPreviewModal({
        icon: ch.icon,
        heading: `${ch.label} — ${ch.title}`,
        subheading: `${entries.length} từ vựng • ${ch.desc}`,
        entries,
        onStart: () => studySingleVocabChapter(chapterId, null)
    });
}

function previewHomeKanjiPage(partId, pageId, event) {
    if (event) event.stopPropagation();
    const part = KANJI_PARTS_CONFIG.find(p => p.id === partId);
    const page = part ? part.pagesConfig.find(p => p.id === pageId) : null;
    if (!page) return;
    const data = page.getData() || {};
    const entries = Object.entries(data).map(([vn, ch]) => {
        const tagInfo = typeof getKanjiRadicalTagInfo === 'function' ? getKanjiRadicalTagInfo(ch) : null;
        return {
            jpDisplay: ch,
            vnDisplay: vn,
            speakText: ch,
            primaryRadical: tagInfo ? tagInfo.primaryRadical : ''
        };
    });

    openItemPreviewModal({
        icon: part.icon,
        heading: `${page.shortName} — ${page.title}`,
        subheading: `${entries.length} chữ Hán • Phạm vi: ${page.range}`,
        entries,
        isKanji: true,
        onStart: () => studySingleKanjiPage(pageId, null, partId)
    });
}

function previewHomeKanjiLesson(lessonId, event) {
    if (event) event.stopPropagation();
    if (typeof KANJI_LESSONS_CONFIG === 'undefined') return;
    const lesson = KANJI_LESSONS_CONFIG.find(l => l.id === lessonId);
    if (!lesson) return;
    const data = lesson.getData() || {};
    const entries = Object.entries(data).map(([kanjiWord, hira]) => {
        const meta = typeof KANJI_LESSON_META !== 'undefined' ? KANJI_LESSON_META[kanjiWord] : null;
        return {
            jpDisplay: `${kanjiWord} (${hira})`,
            hanViet: meta ? meta.hanViet : '',
            vnDisplay: meta ? meta.nghia : hira,
            speakText: hira
        };
    });

    openItemPreviewModal({
        icon: '📗',
        heading: `${lesson.shortName} — ${lesson.title}`,
        subheading: `${entries.length} từ vựng Hán tự • ${lesson.range}`,
        entries,
        isKanjiLesson: true,
        onStart: () => studySingleKanjiLesson(lessonId, null)
    });
}

function previewHomeRadical(radicalName, event) {
    if (event) event.stopPropagation();
    if (typeof getKanjiByRadical !== 'function') return;
    const rad = typeof KANJI_RADICAL_BY_NAME !== 'undefined' ? KANJI_RADICAL_BY_NAME[radicalName] : null;
    const items = getKanjiByRadical(radicalName, {
        includeComponents: homeRadicalIncludeComponents,
        level: homeRadicalLevelFilter,
        includeRadicalEntry: true
    });
    const entries = items.map(it => ({
        jpDisplay: it.char,
        vnDisplay: it.label,
        speakText: it.char,
        primaryRadical: it.primaryRadical
    }));

    openItemPreviewModal({
        icon: rad ? rad.char : '🧩',
        heading: `Bộ ${radicalName}`,
        subheading: `${rad ? rad.meaning + ' • ' : ''}${entries.length} chữ Hán`,
        entries,
        isKanji: true,
        onStart: () => studySingleHomeRadical(radicalName, null)
    });
}

function previewKataGroup(groupId, event) {
    if (event) event.stopPropagation();
    const g = KATA_GROUPS_CONFIG.find(item => item.id === groupId);
    if (!g) return;
    const data = g.getData() || {};
    const entries = Object.entries(data).map(([vn, jp]) => ({
        jpDisplay: jp,
        vnDisplay: vn,
        speakText: jp
    }));

    openItemPreviewModal({
        icon: g.icon,
        heading: `Katakana • ${g.label}: ${g.title}`,
        subheading: `${entries.length} từ ngoại lai • ${g.desc}`,
        entries,
        onStart: () => studySingleKataGroup(groupId, null)
    });
}

function previewThaDongTuGroup(groupId, event) {
    if (event) event.stopPropagation();
    const g = THA_DONG_TU_GROUPS_CONFIG.find(item => item.id === groupId);
    if (!g) return;
    const data = g.getData() || {};
    const entries = Object.entries(data).map(([vn, jp]) => ({
        jpDisplay: jp,
        vnDisplay: vn,
        speakText: jp
    }));

    openItemPreviewModal({
        icon: '🔄',
        heading: `Tha động từ • ${g.label}: ${g.title}`,
        subheading: `${entries.length} cụm tha động từ • ${g.range}`,
        entries,
        onStart: () => studySingleThaDongTuGroup(groupId, null)
    });
}

function previewCounterGroup(groupId, event) {
    if (event) event.stopPropagation();
    const g = COUNTER_GROUPS_CONFIG.find(item => item.id === groupId);
    if (!g) return;
    const data = g.getData(10) || {};
    const entries = Object.entries(data).map(([vn, jp]) => ({
        jpDisplay: jp.replace(/\n/g, ' '),
        vnDisplay: vn,
        speakText: jp
    }));

    openItemPreviewModal({
        icon: g.icon,
        heading: `Đếm số • ${g.title}`,
        subheading: `${entries.length} mẫu câu đếm minh họa • ${g.desc}`,
        entries,
        onStart: () => studySingleCounterGroup(groupId, null)
    });
}

// ==========================================================================
// 6. DROPDOWN TRA CỨU TỪ VỰNG, TOAST & PHÍM TẮT TOÀN CỤC
// ==========================================================================

function renderChapterSelectOptions() {
    const select = document.getElementById('vocab-chapter-filter');
    if (!select) return;

    let optionsHtml = '<option value="all">📚 Tất cả các bài (Toàn bộ từ vựng)</option>';
    CHAPTERS_CONFIG.forEach(chapter => {
        if (chapter.skipInSummary) return;
        if (chapter.isKanjiPageGroup && Array.isArray(chapter.pagesConfig)) {
            const totalChars = chapter.pagesConfig.reduce((acc, p) => acc + p.count, 0);
            const totalPages = chapter.pagesConfig.length;
            optionsHtml += `<optgroup label="${chapter.icon} ${chapter.title} (${totalChars} chữ)">`;
            optionsHtml += `<option value="${chapter.id}">${chapter.icon} Tất cả ${totalPages} trang ${chapter.shortName} (${totalChars} chữ)</option>`;
            chapter.pagesConfig.forEach(p => {
                optionsHtml += `<option value="${p.id}">&nbsp;&nbsp;&nbsp;↳ ${p.shortName}: ${p.title} (${p.count} chữ)</option>`;
            });
            optionsHtml += `</optgroup>`;
        } else if (chapter.isKanjiLessonGroup) {
            const totalLessonWords = typeof KANJI_LESSONS_CONFIG !== 'undefined'
                ? KANJI_LESSONS_CONFIG.reduce((acc, l) => acc + l.count, 0)
                : 574;
            const totalLessonCount = typeof KANJI_LESSONS_CONFIG !== 'undefined'
                ? KANJI_LESSONS_CONFIG.length
                : 17;
            optionsHtml += `<optgroup label="📗 Từ Vựng Kanji Theo Bài (${totalLessonWords} từ)">`;
            optionsHtml += `<option value="${chapter.id}">📗 Tất cả ${totalLessonCount} bài Kanji (${totalLessonWords} từ)</option>`;
            if (typeof KANJI_LESSONS_CONFIG !== 'undefined') {
                KANJI_LESSONS_CONFIG.forEach(l => {
                    optionsHtml += `<option value="${l.id}">&nbsp;&nbsp;&nbsp;↳ ${l.shortName}: ${l.title} (${l.count} từ)</option>`;
                });
            }
            optionsHtml += `</optgroup>`;
        } else {
            const prefix = chapter.isSpecial ? `${chapter.icon} ` : `${chapter.label} - `;
            optionsHtml += `<option value="${chapter.id}">${prefix}${chapter.title}</option>`;
        }
    });

    select.innerHTML = optionsHtml;
}

function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (typeof isDictionaryFullscreen !== 'undefined' && isDictionaryFullscreen) {
            toggleDictionaryFullscreen(false);
            return;
        }

        const previewModal = document.getElementById('item-preview-modal');
        if (previewModal && previewModal.style.display !== 'none') {
            closeItemPreviewModal();
            return;
        }

        const kanjiModal = document.getElementById('kanji-selector-modal');
        if (kanjiModal && kanjiModal.style.display !== 'none') {
            closeKanjiModal();
            return;
        }

        const kanjiLessonModal = document.getElementById('kanji-lesson-modal');
        if (kanjiLessonModal && kanjiLessonModal.style.display !== 'none') {
            closeKanjiLessonModal();
            return;
        }

        const modal = document.getElementById('vocab-summary-modal');
        if (modal && modal.style.display !== 'none') {
            closeVocabSummaryModal();
            return;
        }
    }

    const targetTag = event.target ? event.target.tagName : '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) {
        return;
    }
    const previewModal = document.getElementById('item-preview-modal');
    if (previewModal && previewModal.style.display !== 'none') return;
    const summaryModal = document.getElementById('vocab-summary-modal');
    if (summaryModal && summaryModal.style.display !== 'none') return;
    const kanjiModal = document.getElementById('kanji-selector-modal');
    if (kanjiModal && kanjiModal.style.display !== 'none') return;
    const kanjiLessonModal = document.getElementById('kanji-lesson-modal');
    if (kanjiLessonModal && kanjiLessonModal.style.display !== 'none') return;

    const flashcard = document.getElementById('flashcard');
    const endScreen = document.getElementById('end-screen');
    if (flashcard && flashcard.style.display === 'block' && (!endScreen || endScreen.style.display === 'none')) {
        if (event.key === 'Enter' || event.key === 'ArrowRight') {
            handleMainLogic();
        } else if (event.key === 'ArrowLeft') {
            prevQuestion(null);
        } else if (event.key === 'm' || event.key === 'M') {
            event.preventDefault();
            if (typeof toggleMark === 'function') {
                toggleMark(null);
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderChapterCards();
    renderChapterSelectOptions();
    updateSelectedCount();
});
