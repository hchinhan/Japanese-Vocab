/**
 * File: js/kanji-page.js
 * Bộ điều khiển cho trang Kanji chuyên biệt (kanji.html):
 * - Tab 1: Học theo trang (Part 1 N5 + Part 2 N4)
 * - Tab 2: Học theo bộ chữ (dựa trên KANJI_RADICALS_CONFIG & KANJI_CHARACTER_TAGS)
 * - Tab 3: Tra cứu & phân loại Kanji + Xuất Markdown (.md)
 * - Kết nối trực tiếp với Flashcard engine (js/study.js)
 */

const selectedStudioPages = new Set();
const selectedStudioRadicals = new Set();
const selectedStudioLessons = new Set();

let activeKanjiTab = 'pages';
let radicalIncludeComponents = true;
let radicalLevelFilter = 'all';
let radicalStrokeFilter = 'all';

let explorerFilteredList = [];
let explorerRenderedCount = 0;
const EXPLORER_BATCH_SIZE = 80;
let isDetailModalOverlayGesture = false;

// ==========================================================================
// 1. TIỆN ÍCH CƠ BẢN
// ==========================================================================

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeJsArg(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function removeVietnameseTones(str) {
    if (!str) return '';
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase();
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

function syncKanjiModeCards() {
    document.querySelectorAll('.mode-card').forEach(card => {
        const input = card.querySelector('input[type="radio"]');
        card.classList.toggle('active', !!(input && input.checked));
    });
}

// ==========================================================================
// 2. HERO STATS & TAB NAVIGATION
// ==========================================================================

function renderHeroStats() {
    const container = document.getElementById('kanji-hero-stats');
    const catalog = getUnifiedKanjiCatalog();
    const n5PagesCount = typeof KANJI_PAGES_CONFIG !== 'undefined' ? KANJI_PAGES_CONFIG.length : 0;
    const n4PagesCount = typeof KANJI_800_PAGES_CONFIG !== 'undefined' ? KANJI_800_PAGES_CONFIG.length : 0;
    const n5TotalEntries = typeof KANJI_PAGES_CONFIG !== 'undefined'
        ? KANJI_PAGES_CONFIG.reduce((s, p) => s + p.count, 0) : 0;
    const n4TotalEntries = typeof KANJI_800_PAGES_CONFIG !== 'undefined'
        ? KANJI_800_PAGES_CONFIG.reduce((s, p) => s + p.count, 0) : 0;
    const radicalsCount = typeof KANJI_RADICALS_CONFIG !== 'undefined' ? KANJI_RADICALS_CONFIG.length : 0;

    if (container) {
        container.innerHTML = `
            <div class="khs-item">
                <div class="khs-label">Part 1 • N5 (HT400)</div>
                <div class="khs-value">${n5TotalEntries} mục</div>
                <div class="khs-sub">${n5PagesCount} trang (Trang 0 ➔ 9)</div>
            </div>
            <div class="khs-item">
                <div class="khs-label">Part 2 • N4 (HT800)</div>
                <div class="khs-value">${n4TotalEntries} mục</div>
                <div class="khs-sub">${n4PagesCount} trang (Trang 1 ➔ 10)</div>
            </div>
            <div class="khs-item">
                <div class="khs-label">Kho Bộ Chữ Đông Du</div>
                <div class="khs-value">${radicalsCount} bộ</div>
                <div class="khs-sub">Tag Bộ chính &amp; Cấu thành</div>
            </div>
            <div class="khs-item">
                <div class="khs-label">Tổng Chữ &amp; Bộ Duy Nhất</div>
                <div class="khs-value">${catalog.length} chữ</div>
                <div class="khs-sub">Đã phân tích &amp; gắn tag 100%</div>
            </div>
        `;
    }

    const tabPagesBadge = document.getElementById('tab-count-pages');
    const tabRadBadge = document.getElementById('tab-count-radicals');
    const tabExpBadge = document.getElementById('tab-count-explorer');
    if (tabPagesBadge) tabPagesBadge.textContent = `${n5PagesCount + n4PagesCount} trang`;
    if (tabRadBadge) tabRadBadge.textContent = `${radicalsCount} bộ`;
    if (tabExpBadge) tabExpBadge.textContent = `${catalog.length} chữ`;
}

function switchKanjiTab(tabName) {
    activeKanjiTab = tabName;
    ['pages', 'radicals', 'lessons', 'explorer'].forEach(name => {
        const panel = document.getElementById(`tab-panel-${name}`);
        const btn = document.getElementById(`tab-btn-${name}`);
        if (panel) panel.style.display = (name === tabName) ? 'block' : 'none';
        if (btn) btn.classList.toggle('active', name === tabName);
    });

    if (tabName === 'radicals') {
        renderRadicalCards();
    } else if (tabName === 'lessons') {
        renderStudioKanjiLessons();
    } else if (tabName === 'explorer') {
        handleExplorerFilterChange();
    }
}

function toggleStudioPartAccordion(partKey, event) {
    if (event) event.stopPropagation();
    const grid = document.getElementById(`kanji-${partKey}-pages-grid`);
    const btn = document.getElementById(`studio-part-toggle-${partKey}`);
    if (!grid) return;

    const isHidden = grid.style.display === 'none';
    grid.style.display = isHidden ? 'grid' : 'none';
    if (btn) {
        const label = partKey.toUpperCase();
        btn.textContent = isHidden ? '▴ Thu gọn' : `▾ Mở 10 trang ${label}`;
    }
}

function renderStudioKanjiLessons() {
    const container = document.getElementById('studio-kanji-lessons-grid');
    if (!container || typeof KANJI_LESSONS_CONFIG === 'undefined') return;

    container.innerHTML = KANJI_LESSONS_CONFIG.map(l => {
        const isChecked = selectedStudioLessons.has(l.id);
        return `
            <div class="kanji-page-card ${isChecked ? 'active' : ''}" id="skl-card-${l.id}" onclick="toggleStudioKanjiLesson('${l.id}')">
                <div class="kpc-top-row">
                    <span class="kpc-badge">${escapeHtml(l.shortName)}</span>
                    <label class="kpc-checkbox-wrap" onclick="event.stopPropagation()">
                        <input type="checkbox" id="chk-skl-${l.id}" ${isChecked ? 'checked' : ''} onchange="onStudioKanjiLessonCheckbox('${l.id}', this.checked)">
                        <span class="kpc-custom-check"></span>
                    </label>
                </div>

                <div class="kpc-circle-preview">
                    ${l.samples.map(ch => `<span class="kpc-char-tag" style="width:auto;min-width:38px;padding:0 8px;border-radius:10px;font-size:0.95rem;">${escapeHtml(ch)}</span>`).join('')}
                </div>

                <div class="kpc-body">
                    <h4 class="kpc-title">${escapeHtml(l.title)}</h4>
                    <div class="kpc-range">Phạm vi: <b>${escapeHtml(l.range)}</b></div>
                    <div class="kpc-desc">${escapeHtml(l.desc)}</div>
                </div>

                <div class="kpc-footer">
                    <span class="kpc-count-badge">📝 ${l.count} từ Hán tự</span>
                    <div class="kpc-btn-group">
                        <button type="button" class="kpc-preview-btn" onclick="previewStudioKanjiLesson('${l.id}', event)" title="Xem danh sách từ vựng bài này">
                            👁️ Xem
                        </button>
                        <button type="button" class="kpc-quick-study-btn" onclick="studySingleStudioKanjiLesson('${l.id}', event)" title="Chỉ học riêng bài này">
                            ⚡ Học
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    updateStudioLessonsStatusLabel();
}

function toggleStudioKanjiLesson(lessonId) {
    const chk = document.getElementById(`chk-skl-${lessonId}`);
    const next = chk ? !chk.checked : !selectedStudioLessons.has(lessonId);
    if (chk) chk.checked = next;
    onStudioKanjiLessonCheckbox(lessonId, next);
}

function onStudioKanjiLessonCheckbox(lessonId, isChecked) {
    if (isChecked) selectedStudioLessons.add(lessonId);
    else selectedStudioLessons.delete(lessonId);

    const card = document.getElementById(`skl-card-${lessonId}`);
    if (card) card.classList.toggle('active', isChecked);

    updateStudioLessonsStatusLabel();
    updateStudioSelectedTotals();
}

function selectAllStudioKanjiLessons(selectAll) {
    if (typeof KANJI_LESSONS_CONFIG === 'undefined') return;
    KANJI_LESSONS_CONFIG.forEach(l => {
        if (selectAll) selectedStudioLessons.add(l.id);
        else selectedStudioLessons.delete(l.id);

        const chk = document.getElementById(`chk-skl-${l.id}`);
        if (chk) chk.checked = selectAll;

        const card = document.getElementById(`skl-card-${l.id}`);
        if (card) card.classList.toggle('active', selectAll);
    });
    updateStudioLessonsStatusLabel();
    updateStudioSelectedTotals();
}

function updateStudioLessonsStatusLabel() {
    const el = document.getElementById('studio-lessons-status');
    if (!el || typeof KANJI_LESSONS_CONFIG === 'undefined') return;
    const totalWords = KANJI_LESSONS_CONFIG.reduce((s, l) => s + l.count, 0);
    let selCount = 0;
    let selWords = 0;
    KANJI_LESSONS_CONFIG.forEach(l => {
        if (selectedStudioLessons.has(l.id)) {
            selCount++;
            selWords += l.count;
        }
    });
    el.textContent = selCount > 0
        ? `Đang chọn ${selCount}/${KANJI_LESSONS_CONFIG.length} bài (${selWords}/${totalWords} từ vựng Hán tự)`
        : `${KANJI_LESSONS_CONFIG.length} bài chuyên đề • ${totalWords} từ vựng Hán tự`;
}

function studySingleStudioKanjiLesson(lessonId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (typeof KANJI_LESSONS_CONFIG === 'undefined') return;
    const targetLesson = KANJI_LESSONS_CONFIG.find(l => l.id === lessonId);
    if (!targetLesson) return;
    const data = targetLesson.getData ? targetLesson.getData() : null;
    if (!data || Object.keys(data).length === 0) return;

    startFlashcardSession(
        data,
        `${targetLesson.shortName} (${targetLesson.title})`,
        () => studySingleStudioKanjiLesson(lessonId, null),
        { isKanjiLesson: true }
    );
    showToast(`🚀 Đang ôn tập: ${targetLesson.shortName} (${Object.keys(data).length} từ)`);
}

function previewStudioKanjiLesson(lessonId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (typeof KANJI_LESSONS_CONFIG === 'undefined') return;
    const targetLesson = KANJI_LESSONS_CONFIG.find(l => l.id === lessonId);
    if (!targetLesson) return;
    const data = targetLesson.getData ? targetLesson.getData() : null;
    if (!data) return;

    const items = Object.entries(data).map(([kanjiWord, hira]) => {
        const meta = typeof KANJI_LESSON_META !== 'undefined' ? KANJI_LESSON_META[kanjiWord] : null;
        return {
            char: kanjiWord,
            hanViet: meta ? `${meta.hanViet} • ${hira}` : hira,
            meaning: meta ? meta.nghia : '',
            primaryRadical: 'Từ vựng Hán tự',
            radicals: []
        };
    });

    openKanjiDetailModal({
        icon: '📗',
        heading: `${targetLesson.shortName} — ${targetLesson.title}`,
        subheading: `${items.length} từ vựng Hán tự • ${targetLesson.range}`,
        items,
        onStart: () => {
            closeKanjiDetailModal();
            studySingleStudioKanjiLesson(lessonId, null);
        }
    });
}

// ==========================================================================
// 3. TAB 1: HỌC THEO TRANG (N5 + N4)
// ==========================================================================

function findPageConfigById(pageId) {
    if (typeof KANJI_PAGES_CONFIG !== 'undefined') {
        const p1 = KANJI_PAGES_CONFIG.find(p => p.id === pageId);
        if (p1) return { page: p1, part: KANJI_PARTS_CONFIG[0], level: 'N5' };
    }
    if (typeof KANJI_800_PAGES_CONFIG !== 'undefined') {
        const p2 = KANJI_800_PAGES_CONFIG.find(p => p.id === pageId);
        if (p2) return { page: p2, part: KANJI_PARTS_CONFIG[1], level: 'N4' };
    }
    return null;
}

function renderPartPagesGrid(pagesConfig, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(pagesConfig)) return;

    container.innerHTML = pagesConfig.map(p => {
        const isChecked = selectedStudioPages.has(p.id);
        return `
            <div class="kanji-page-card ${isChecked ? 'active' : ''}" id="sp-card-${p.id}" onclick="toggleStudioPage('${p.id}')">
                <div class="kpc-top-row">
                    <span class="kpc-badge">${escapeHtml(p.shortName)}</span>
                    <label class="kpc-checkbox-wrap" onclick="event.stopPropagation()">
                        <input type="checkbox" id="chk-sp-${p.id}" ${isChecked ? 'checked' : ''} onchange="onStudioPageCheckbox('${p.id}', this.checked)">
                        <span class="kpc-custom-check"></span>
                    </label>
                </div>

                <div class="kpc-circle-preview">
                    ${p.samples.map(ch => `<span class="kpc-char-tag">${escapeHtml(ch)}</span>`).join('')}
                </div>

                <div class="kpc-body">
                    <h4 class="kpc-title">${escapeHtml(p.title)}</h4>
                    <div class="kpc-range">Phạm vi: <b>${escapeHtml(p.range)}</b></div>
                    <div class="kpc-desc">${escapeHtml(p.desc)}</div>
                </div>

                <div class="kpc-footer">
                    <span class="kpc-count-badge">📝 ${p.count} chữ</span>
                    <div class="kpc-btn-group">
                        <button type="button" class="kpc-preview-btn" onclick="previewStudioPage('${p.id}', event)" title="Xem danh sách chữ &amp; bộ của trang này">
                            👁️ Xem
                        </button>
                        <button type="button" class="kpc-quick-study-btn" onclick="studySingleStudioPage('${p.id}', event)" title="Chỉ học riêng trang này">
                            ⚡ Học
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAllPageCards() {
    if (typeof KANJI_PAGES_CONFIG !== 'undefined') {
        renderPartPagesGrid(KANJI_PAGES_CONFIG, 'kanji-n5-pages-grid');
    }
    if (typeof KANJI_800_PAGES_CONFIG !== 'undefined') {
        renderPartPagesGrid(KANJI_800_PAGES_CONFIG, 'kanji-n4-pages-grid');
    }
    updatePartStatusLabels();
}

function toggleStudioPage(pageId) {
    const chk = document.getElementById(`chk-sp-${pageId}`);
    if (chk) {
        chk.checked = !chk.checked;
        onStudioPageCheckbox(pageId, chk.checked);
    }
}

function onStudioPageCheckbox(pageId, isChecked) {
    if (isChecked) selectedStudioPages.add(pageId);
    else selectedStudioPages.delete(pageId);

    const card = document.getElementById(`sp-card-${pageId}`);
    if (card) card.classList.toggle('active', isChecked);

    updatePartStatusLabels();
    updateStudioSelectedTotals();
}

function selectAllPartPages(partId, selectAll) {
    const pages = partId === 'kanji' ? KANJI_PAGES_CONFIG : KANJI_800_PAGES_CONFIG;
    if (!Array.isArray(pages)) return;

    pages.forEach(p => {
        if (selectAll) selectedStudioPages.add(p.id);
        else selectedStudioPages.delete(p.id);

        const chk = document.getElementById(`chk-sp-${p.id}`);
        if (chk) chk.checked = selectAll;

        const card = document.getElementById(`sp-card-${p.id}`);
        if (card) card.classList.toggle('active', selectAll);
    });

    updatePartStatusLabels();
    updateStudioSelectedTotals();
}

function updatePartStatusLabels() {
    const updateOne = (pages, elId, labelPrefix) => {
        const el = document.getElementById(elId);
        if (!el || !Array.isArray(pages)) return;
        const totalEntries = pages.reduce((s, p) => s + p.count, 0);
        let selPages = 0;
        let selChars = 0;
        pages.forEach(p => {
            if (selectedStudioPages.has(p.id)) {
                selPages++;
                selChars += p.count;
            }
        });
        el.textContent = selPages > 0
            ? `${labelPrefix} • Đang chọn ${selPages}/${pages.length} trang (${selChars}/${totalEntries} mục)`
            : `${labelPrefix} (${pages.length} trang • ${totalEntries} mục)`;
    };

    updateOne(KANJI_PAGES_CONFIG, 'n5-pages-status', 'Trang 0 ➔ 9');
    updateOne(KANJI_800_PAGES_CONFIG, 'n4-pages-status', 'Trang 1 ➔ 10');
}

function studySingleStudioPage(pageId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const found = findPageConfigById(pageId);
    if (!found) return;
    const data = found.page.getData ? found.page.getData() : null;
    if (!data || Object.keys(data).length === 0) {
        alert('Dữ liệu trang này đang trống!');
        return;
    }

    startFlashcardSession(
        data,
        `${found.level} • ${found.page.shortName} (${found.page.title})`,
        () => studySingleStudioPage(pageId, null)
    );
    showToast(`🚀 Đang ôn tập: ${found.page.title} (${Object.keys(data).length} chữ)`);
}

function previewStudioPage(pageId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const found = findPageConfigById(pageId);
    if (!found) return;
    const data = found.page.getData ? found.page.getData() : null;
    if (!data) return;

    const items = Object.entries(data).map(([label, ch]) => {
        const parsed = parseKanjiLabel(label);
        const tagInfo = getKanjiRadicalTagInfo(ch) || { primaryRadical: '', radicals: [] };
        return {
            char: ch,
            label,
            hanViet: parsed.hanViet,
            meaning: parsed.meaning,
            level: found.level,
            primaryRadical: tagInfo.primaryRadical,
            radicals: tagInfo.radicals || []
        };
    });

    openKanjiDetailModal({
        icon: found.level === 'N5' ? '🈁' : '🈯',
        heading: `${found.page.shortName} — ${found.page.title}`,
        subheading: `${found.level} • ${items.length} chữ &amp; bộ • ${found.page.range}`,
        items,
        onStart: () => {
            closeKanjiDetailModal();
            studySingleStudioPage(pageId, null);
        }
    });
}

// ==========================================================================
// 4. TAB 2: HỌC THEO BỘ CHỮ (RADICAL TAGS)
// ==========================================================================

function setRadicalMatchMode(includeComps) {
    radicalIncludeComponents = includeComps;
    document.getElementById('rad-mode-all')?.classList.toggle('active', includeComps);
    document.getElementById('rad-mode-primary')?.classList.toggle('active', !includeComps);
    renderRadicalCards();
    updateStudioSelectedTotals();
}

function setRadicalLevelFilter(level) {
    radicalLevelFilter = level;
    ['all', 'N5', 'N4'].forEach(lvl => {
        document.getElementById(`rad-lvl-${lvl}`)?.classList.toggle('active', lvl === level);
    });
    renderRadicalCards();
    updateStudioSelectedTotals();
}

function setRadicalStrokeFilter(strokeRange) {
    radicalStrokeFilter = strokeRange;
    document.querySelectorAll('[data-stroke]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-stroke') === strokeRange);
    });
    renderRadicalCards();
}

function clearRadicalSearch() {
    const input = document.getElementById('radical-search-input');
    if (input) {
        input.value = '';
        renderRadicalCards();
        input.focus();
    }
}

function matchesStrokeFilter(strokes, range) {
    if (range === 'all') return true;
    if (range === '1-2') return strokes <= 2;
    if (range === '3') return strokes === 3;
    if (range === '4') return strokes === 4;
    if (range === '5-6') return strokes === 5 || strokes === 6;
    if (range === '7+') return strokes >= 7;
    return true;
}

function getFilteredRadicalBuckets() {
    const statsMap = getRadicalItemsMap({
        includeComponents: radicalIncludeComponents,
        level: radicalLevelFilter,
        includeRadicalEntry: true
    });

    const input = document.getElementById('radical-search-input');
    const queryRaw = input ? input.value.trim() : '';
    const clearBtn = document.getElementById('radical-search-clear');
    if (clearBtn) clearBtn.style.display = queryRaw ? 'inline-flex' : 'none';

    const qNorm = removeVietnameseTones(queryRaw);
    const qLower = queryRaw.toLowerCase();

    const buckets = [];
    KANJI_RADICALS_CONFIG.forEach(rad => {
        const bucket = statsMap.get(rad.name);
        if (!bucket || bucket.items.length === 0) return;
        if (!matchesStrokeFilter(rad.strokes, radicalStrokeFilter)) return;

        if (queryRaw) {
            const hay = removeVietnameseTones(`${rad.name} ${rad.hanViet} ${rad.meaning} ${rad.char} ${rad.kangxi}`);
            if (!hay.includes(qNorm) && !rad.name.toLowerCase().includes(qLower) && !rad.char.includes(queryRaw)) {
                return;
            }
        }
        buckets.push(bucket);
    });

    return buckets;
}

function renderRadicalCards() {
    const container = document.getElementById('radical-cards-grid');
    const filterStatsEl = document.getElementById('radical-filter-stats');
    if (!container) return;

    const buckets = getFilteredRadicalBuckets();
    if (filterStatsEl) {
        filterStatsEl.textContent = `Đang hiển thị ${buckets.length} bộ chữ (${radicalIncludeComponents ? 'gồm cả bộ cấu thành' : 'chỉ bộ chính'})`;
    }

    if (buckets.length === 0) {
        container.innerHTML = `
            <div class="vocab-empty-view" style="grid-column: 1 / -1;">
                <div class="empty-emoji">🧩</div>
                <h4>Không tìm thấy bộ chữ phù hợp</h4>
                <p>Thử xóa từ khóa hoặc đổi bộ lọc nét / cấp độ.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = buckets.map(b => {
        const r = b.radical;
        const isChecked = selectedStudioRadicals.has(r.name);
        const samples = b.items.slice(0, 6);
        const extraCount = Math.max(0, b.items.length - samples.length);
        const safeArg = escapeJsArg(r.name);

        return `
            <div class="radical-card ${isChecked ? 'active' : ''}" id="rad-card-${r.id}" onclick="toggleStudioRadical('${safeArg}')">
                <div class="rc-top">
                    <span class="rc-meta-badge">Khang Hi #${r.kangxi} • ${r.strokes} nét</span>
                    <label class="kpc-checkbox-wrap" onclick="event.stopPropagation()">
                        <input type="checkbox" id="chk-rad-${r.id}" ${isChecked ? 'checked' : ''} onchange="onStudioRadicalCheckbox('${safeArg}', this.checked)">
                        <span class="kpc-custom-check"></span>
                    </label>
                </div>

                <div class="rc-hero">
                    <div class="rc-glyph">${escapeHtml(r.char)}</div>
                    <div class="rc-name-wrap">
                        <h4 class="rc-name">${escapeHtml(r.name)}</h4>
                        <div class="rc-meaning">${escapeHtml(r.meaning)}</div>
                    </div>
                </div>

                <div class="rc-samples">
                    ${samples.map(item => `<span class="rc-sample-char" title="${escapeHtml(item.label)}">${escapeHtml(item.char)}</span>`).join('')}
                    ${extraCount > 0 ? `<span class="rc-sample-more">+${extraCount}</span>` : ''}
                </div>

                <div class="rc-counts">
                    <span class="rc-count-pill rc-count-total">📝 ${b.items.length} chữ</span>
                    ${b.n5Count > 0 ? `<span class="rc-count-pill rc-count-n5">N5: ${b.n5Count}</span>` : ''}
                    ${b.n4Count > 0 ? `<span class="rc-count-pill rc-count-n4">N4: ${b.n4Count}</span>` : ''}
                </div>

                <div class="kpc-footer">
                    <span class="kpc-count-badge">${escapeHtml(r.position || '')}</span>
                    <div class="kpc-btn-group">
                        <button type="button" class="kpc-preview-btn" onclick="previewStudioRadical('${safeArg}', event)" title="Xem tất cả chữ thuộc bộ này">
                            👁️ Xem
                        </button>
                        <button type="button" class="kpc-quick-study-btn" onclick="studySingleStudioRadical('${safeArg}', event)" title="Ôn ngay bộ này">
                            ⚡ Học
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleStudioRadical(radicalName) {
    const rad = KANJI_RADICAL_BY_NAME[radicalName];
    if (!rad) return;
    const chk = document.getElementById(`chk-rad-${rad.id}`);
    const next = chk ? !chk.checked : !selectedStudioRadicals.has(radicalName);
    if (chk) chk.checked = next;
    onStudioRadicalCheckbox(radicalName, next);
}

function onStudioRadicalCheckbox(radicalName, isChecked) {
    if (isChecked) selectedStudioRadicals.add(radicalName);
    else selectedStudioRadicals.delete(radicalName);

    const rad = KANJI_RADICAL_BY_NAME[radicalName];
    if (rad) {
        const card = document.getElementById(`rad-card-${rad.id}`);
        if (card) card.classList.toggle('active', isChecked);
    }
    updateStudioSelectedTotals();
}

function selectVisibleRadicals(selectAll) {
    if (!selectAll) {
        selectedStudioRadicals.clear();
        renderRadicalCards();
        updateStudioSelectedTotals();
        return;
    }

    const buckets = getFilteredRadicalBuckets();
    buckets.forEach(b => selectedStudioRadicals.add(b.radical.name));
    renderRadicalCards();
    updateStudioSelectedTotals();
}

function buildVocabMapFromCatalogItems(items) {
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
    return vocabMap;
}

function studySingleStudioRadical(radicalName, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const items = getKanjiByRadical(radicalName, {
        includeComponents: radicalIncludeComponents,
        level: radicalLevelFilter,
        includeRadicalEntry: true
    });
    if (items.length === 0) {
        alert('Không có chữ Hán nào khớp bộ lọc cấp độ hiện tại!');
        return;
    }

    const vocabMap = buildVocabMapFromCatalogItems(items);
    const scopeText = radicalIncludeComponents ? 'Chính + Cấu thành' : 'Bộ chính';
    const lvlText = radicalLevelFilter === 'all' ? 'N5+N4' : radicalLevelFilter;
    startFlashcardSession(
        vocabMap,
        `Bộ ${radicalName} (${scopeText} • ${lvlText})`,
        () => studySingleStudioRadical(radicalName, null)
    );
    showToast(`🧩 Đang ôn Bộ ${radicalName} (${items.length} chữ)`);
}

function previewStudioRadical(radicalName, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const rad = KANJI_RADICAL_BY_NAME[radicalName];
    const items = getKanjiByRadical(radicalName, {
        includeComponents: radicalIncludeComponents,
        level: radicalLevelFilter,
        includeRadicalEntry: true
    });

    openKanjiDetailModal({
        icon: rad ? rad.char : '🧩',
        heading: `Bộ ${radicalName}`,
        subheading: `${rad ? rad.meaning + ' • ' : ''}${items.length} chữ (${radicalIncludeComponents ? 'Bộ chính & Bộ cấu thành' : 'Chỉ Bộ chính'})`,
        items,
        onStart: () => {
            closeKanjiDetailModal();
            studySingleStudioRadical(radicalName, null);
        }
    });
}

// ==========================================================================
// 5. TÍNH TỔNG ĐÃ CHỌN & KHỞI CHẠY PHIÊN ÔN TẬP KẾT HỢP
// ==========================================================================

function collectSelectedStudioVocab() {
    // Nếu chỉ chọn đúng 1 trang và không chọn bộ / bài nào -> giữ nguyên bản gốc của trang đó
    if (selectedStudioPages.size === 1 && selectedStudioRadicals.size === 0 && selectedStudioLessons.size === 0) {
        const onlyPageId = Array.from(selectedStudioPages)[0];
        const found = findPageConfigById(onlyPageId);
        if (found && found.page.getData) {
            const raw = found.page.getData() || {};
            return {
                vocabMap: Object.assign({}, raw),
                uniqueCount: Object.keys(raw).length,
                title: `${found.level} • ${found.page.shortName} (${found.page.title})`,
                hasKanjiLessons: false,
                lessonKeys: []
            };
        }
    }

    const selectedChars = new Set();

    // Thu thập từ các trang được tick
    selectedStudioPages.forEach(pageId => {
        const found = findPageConfigById(pageId);
        const data = found && found.page.getData ? found.page.getData() : null;
        if (data) {
            Object.values(data).forEach(ch => selectedChars.add(ch));
        }
    });

    // Thu thập từ các bộ được tick
    selectedStudioRadicals.forEach(radName => {
        const items = getKanjiByRadical(radName, {
            includeComponents: radicalIncludeComponents,
            level: radicalLevelFilter,
            includeRadicalEntry: true
        });
        items.forEach(item => selectedChars.add(item.char));
    });

    const catalog = getUnifiedKanjiCatalog();
    const chosenItems = catalog.filter(item => selectedChars.has(item.char));
    const vocabMap = buildVocabMapFromCatalogItems(chosenItems);
    const lessonKeys = [];

    // Thu thập từ các bài Từ vựng Kanji được tick
    if (selectedStudioLessons.size > 0 && typeof KANJI_LESSONS_CONFIG !== 'undefined') {
        KANJI_LESSONS_CONFIG.forEach(l => {
            if (selectedStudioLessons.has(l.id)) {
                const lData = l.getData ? l.getData() : null;
                if (lData) {
                    Object.assign(vocabMap, lData);
                    Object.keys(lData).forEach(k => lessonKeys.push(k));
                }
            }
        });
    }

    const parts = [];
    if (selectedStudioPages.size > 0) parts.push(`${selectedStudioPages.size} trang`);
    if (selectedStudioRadicals.size > 0) parts.push(`${selectedStudioRadicals.size} bộ`);
    if (selectedStudioLessons.size > 0) parts.push(`${selectedStudioLessons.size} bài`);

    return {
        vocabMap,
        uniqueCount: Object.keys(vocabMap).length,
        title: `Kanji (${parts.join(' + ')})`,
        hasKanjiLessons: lessonKeys.length > 0,
        lessonKeys
    };
}

function updateStudioSelectedTotals() {
    const totalSources = selectedStudioPages.size + selectedStudioRadicals.size + selectedStudioLessons.size;
    const collected = totalSources > 0 ? collectSelectedStudioVocab() : { uniqueCount: 0 };

    const countNumEl = document.getElementById('kanji-count-num');
    const charNumEl = document.getElementById('kanji-char-count-num');
    const startBadgeEl = document.getElementById('kanji-start-count-badge');
    const radStatsEl = document.getElementById('radical-selected-stats');

    if (countNumEl) countNumEl.textContent = totalSources;
    if (charNumEl) charNumEl.textContent = collected.uniqueCount;
    if (startBadgeEl) {
        if (totalSources === 0) {
            startBadgeEl.textContent = '0 mục được chọn';
        } else {
            const parts = [];
            if (selectedStudioPages.size > 0) parts.push(`${selectedStudioPages.size} trang`);
            if (selectedStudioRadicals.size > 0) parts.push(`${selectedStudioRadicals.size} bộ`);
            if (selectedStudioLessons.size > 0) parts.push(`${selectedStudioLessons.size} bài`);
            startBadgeEl.textContent = `${parts.join(' + ')} (${collected.uniqueCount} mục)`;
        }
    }
    if (radStatsEl) {
        radStatsEl.innerHTML = `Đã chọn: <b>${selectedStudioRadicals.size} bộ</b>`;
    }
}

function startKanjiStudioReview() {
    if (selectedStudioPages.size === 0 && selectedStudioRadicals.size === 0 && selectedStudioLessons.size === 0) {
        alert('Vui lòng chọn ít nhất 1 trang Kanji, 1 bộ chữ hoặc 1 bài từ vựng Kanji để bắt đầu ôn tập!');
        return;
    }

    const collected = collectSelectedStudioVocab();
    if (collected.uniqueCount === 0) {
        alert('Không có chữ Hán nào khớp với bộ lọc hiện tại!');
        return;
    }

    startFlashcardSession(
        collected.vocabMap,
        collected.title,
        () => startKanjiStudioReview()
    );
    if (collected.hasKanjiLessons && typeof kanjiLessonQuestionKeys !== 'undefined') {
        collected.lessonKeys.forEach(k => kanjiLessonQuestionKeys.add(k));
        showQuestion();
    }
}

// ==========================================================================
// 6. TAB 3: TRA CỨU & PHÂN LOẠI KANJI (EXPLORER) + XUẤT MARKDOWN
// ==========================================================================

function initExplorerDropdowns() {
    const pageSelect = document.getElementById('explorer-page-filter');
    if (pageSelect) {
        let html = '<option value="all">📄 Tất cả các trang (N5 + N4)</option>';
        if (typeof KANJI_PAGES_CONFIG !== 'undefined') {
            html += '<optgroup label="🈁 Part 1 • N5 (Cơ bản & HT400)">';
            KANJI_PAGES_CONFIG.forEach(p => {
                html += `<option value="${p.id}">${escapeHtml(p.shortName)}: ${escapeHtml(p.title)} (${p.count})</option>`;
            });
            html += '</optgroup>';
        }
        if (typeof KANJI_800_PAGES_CONFIG !== 'undefined') {
            html += '<optgroup label="🈯 Part 2 • N4 (HT800)">';
            KANJI_800_PAGES_CONFIG.forEach(p => {
                html += `<option value="${p.id}">${escapeHtml(p.shortName)}: ${escapeHtml(p.title)} (${p.count})</option>`;
            });
            html += '</optgroup>';
        }
        pageSelect.innerHTML = html;
    }

    const radSelect = document.getElementById('explorer-radical-filter');
    if (radSelect && typeof KANJI_RADICALS_CONFIG !== 'undefined') {
        const statsMap = getRadicalItemsMap({ includeComponents: true, level: 'all', includeRadicalEntry: true });
        let html = '<option value="all">🧩 Tất cả bộ chữ</option>';
        KANJI_RADICALS_CONFIG.forEach(r => {
            const count = statsMap.get(r.name)?.items.length || 0;
            if (count > 0) {
                html += `<option value="${escapeHtml(r.name)}">${escapeHtml(r.name)} — ${count} chữ</option>`;
            }
        });
        radSelect.innerHTML = html;
    }

    const wrap = document.getElementById('explorer-table-wrap');
    if (wrap && !wrap._hasScrollBound) {
        wrap._hasScrollBound = true;
        wrap.addEventListener('scroll', () => {
            if (wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 250) {
                if (explorerRenderedCount < explorerFilteredList.length) {
                    renderExplorerRows(true);
                }
            }
        }, { passive: true });
    }
}

function clearExplorerSearch() {
    const input = document.getElementById('explorer-search-input');
    if (input) {
        input.value = '';
        handleExplorerFilterChange();
        input.focus();
    }
}

function filterExplorerByRadical(radicalName) {
    const radSelect = document.getElementById('explorer-radical-filter');
    if (radSelect) {
        radSelect.value = radicalName;
        handleExplorerFilterChange();
        showToast(`🧩 Đang lọc theo bộ: ${radicalName}`);
    }
}

function hasWholeWordInText(target, query) {
    if (!target || !query) return false;
    if (target === query) return true;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[\\s,;/\\(\\)\\[\\]\\.\\-\\?\\!~～・])${escaped}(?:$|[\\s,;/\\(\\)\\[\\]\\.\\-\\?\\!~～・])`, 'i');
    return re.test(target);
}

function scoreExplorerKanjiMatch(item, qRaw, qLower, qNorm, hasDiacritics) {
    if (item.char === qRaw) return 1000;
    if (item.char.includes(qRaw)) return 950;

    const hvLower = (item.hanViet || '').toLowerCase().trim();
    const meaningLower = (item.meaning || '').toLowerCase().trim();
    const segmentsLower = meaningLower.split(/[,;/・]+/).map(s => s.trim()).filter(Boolean);

    if (hasDiacritics) {
        if (hvLower === qLower || meaningLower === qLower) return 980;
        if (segmentsLower.includes(qLower)) return 920;
        if (hasWholeWordInText(hvLower, qLower)) return 850;
        if (segmentsLower.some(s => s.startsWith(qLower + ' '))) return 800;
        if (hasWholeWordInText(meaningLower, qLower)) return 720;
        return 0;
    }

    const hvNorm = removeVietnameseTones(hvLower);
    const meaningNorm = removeVietnameseTones(meaningLower);
    const segmentsNorm = segmentsLower.map(s => removeVietnameseTones(s));

    if (hvNorm === qNorm || meaningNorm === qNorm) return 970;
    if (segmentsNorm.includes(qNorm)) return 910;
    if (hasWholeWordInText(hvNorm, qNorm)) return 840;
    if (segmentsNorm.some(s => s.startsWith(qNorm + ' '))) return 790;
    if (hasWholeWordInText(meaningNorm, qNorm)) return 700;

    const primaryRadNorm = removeVietnameseTones(item.primaryRadical || '');
    if (hasWholeWordInText(primaryRadNorm, qNorm)) return 480;

    return 0;
}

function compareExplorerItems(a, b, sortVal) {
    if (sortVal === 'hv_az') {
        const cmp = (a.hanViet || '').localeCompare(b.hanViet || '', 'vi');
        if (cmp !== 0) return cmp;
        return (a.meaning || '').localeCompare(b.meaning || '', 'vi');
    }
    if (sortVal === 'vn_az') {
        const mA = (a.meaning || a.hanViet || '').toLowerCase();
        const mB = (b.meaning || b.hanViet || '').toLowerCase();
        return mA.localeCompare(mB, 'vi');
    }
    return 0;
}

function handleExplorerFilterChange() {
    const catalog = getUnifiedKanjiCatalog();
    const searchInput = document.getElementById('explorer-search-input');
    const clearBtn = document.getElementById('explorer-search-clear');
    const levelVal = document.getElementById('explorer-level-filter')?.value || 'all';
    const pageVal = document.getElementById('explorer-page-filter')?.value || 'all';
    const radVal = document.getElementById('explorer-radical-filter')?.value || 'all';
    const matchVal = document.getElementById('explorer-match-filter')?.value || 'all';
    const sortVal = document.getElementById('explorer-sort-filter')?.value || 'hv_az';

    const queryRaw = searchInput ? searchInput.value.trim() : '';
    if (clearBtn) clearBtn.style.display = queryRaw ? 'inline-flex' : 'none';
    const qLower = queryRaw.toLowerCase();
    const qNorm = removeVietnameseTones(qLower);
    const hasDiacritics = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(qLower);

    const baseList = catalog.filter(item => {
        if (levelVal !== 'all' && !item.levels.includes(levelVal)) return false;
        if (pageVal !== 'all' && !item.pages.some(p => p.id === pageVal)) return false;
        if (radVal !== 'all') {
            if (matchVal === 'primary') {
                if (item.primaryRadical !== radVal) return false;
            } else {
                if (!item.radicals.includes(radVal)) return false;
            }
        }
        return true;
    });

    if (!queryRaw) {
        explorerFilteredList = baseList.slice();
        if (sortVal !== 'page') {
            explorerFilteredList.sort((a, b) => compareExplorerItems(a, b, sortVal));
        }
        renderExplorerRows(false);
        return;
    }

    let scored = [];
    let maxScore = 0;
    baseList.forEach(item => {
        const score = scoreExplorerKanjiMatch(item, queryRaw, qLower, qNorm, hasDiacritics);
        if (score > 0) {
            if (score > maxScore) maxScore = score;
            scored.push({ item, score });
        }
    });

    // Nếu đã có kết quả khớp trực tiếp chữ / Hán-Việt / Nghĩa (≥ 700), cắt bỏ kết quả khớp phụ theo tên bộ thủ
    if (maxScore >= 700) {
        scored = scored.filter(r => r.score >= 700);
    }

    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return compareExplorerItems(a.item, b.item, sortVal);
    });

    explorerFilteredList = scored.map(r => r.item);
    renderExplorerRows(false);
}

function renderExplorerRows(append = false) {
    const tbody = document.getElementById('explorer-table-body');
    const emptyEl = document.getElementById('explorer-empty-state');
    const countEl = document.getElementById('explorer-count-info');
    const wrap = document.getElementById('explorer-table-wrap');
    const total = getUnifiedKanjiCatalog().length;

    if (!tbody) return;

    if (!append) {
        explorerRenderedCount = 0;
        tbody.innerHTML = '';
        if (wrap) wrap.scrollTop = 0;
        if (emptyEl) emptyEl.style.display = explorerFilteredList.length === 0 ? 'flex' : 'none';
    }

    if (countEl) {
        countEl.textContent = explorerFilteredList.length === total
            ? `Tổng cộng ${total} chữ Hán & bộ`
            : `Tìm thấy ${explorerFilteredList.length} / ${total} chữ`;
    }

    const start = explorerRenderedCount;
    const end = Math.min(start + EXPLORER_BATCH_SIZE, explorerFilteredList.length);
    if (start >= end) return;

    let html = '';
    for (let i = start; i < end; i++) {
        const item = explorerFilteredList[i];
        const levelClass = item.level === 'N5' ? 'exp-level-n5' : 'exp-level-n4';
        const pageLabels = item.pages.map(p => p.shortName).join(', ');
        const comps = item.radicals.filter(r => r !== item.primaryRadical);
        const safePrimary = escapeJsArg(item.primaryRadical);
        const safeChar = escapeJsArg(item.char);

        html += `
            <tr>
                <td class="td-index">${i + 1}</td>
                <td class="exp-kanji-cell">${escapeHtml(item.char)}</td>
                <td>
                    <div class="exp-hv-title">${escapeHtml(item.hanViet)}</div>
                    <div class="exp-meaning-sub">${escapeHtml(item.meaning || 'Bộ thủ cơ bản')}</div>
                    <div class="td-radical-tags" style="margin-top: 5px;">
                        <span class="exp-level-pill ${levelClass}">${escapeHtml(item.level)}</span>
                        <span class="td-rad-badge td-rad-comp">${escapeHtml(pageLabels)}</span>
                    </div>
                </td>
                <td>
                    <div class="td-radical-tags">
                        <span class="td-rad-badge td-rad-primary td-rad-clickable" onclick="filterExplorerByRadical('${safePrimary}')" title="Lọc theo bộ chính này">
                            📌 ${escapeHtml(item.primaryRadical)}
                        </span>
                        ${comps.map(r => `
                            <span class="td-rad-badge td-rad-comp td-rad-clickable" onclick="filterExplorerByRadical('${escapeJsArg(r)}')" title="Lọc theo bộ cấu thành này">
                                🧩 ${escapeHtml(r)}
                            </span>
                        `).join('')}
                    </div>
                </td>
                <td class="td-audio">
                    <button type="button" class="table-speak-btn" onclick="speakJapanese('${safeChar}')" title="Nghe phát âm">🔊</button>
                </td>
            </tr>
        `;
    }

    tbody.insertAdjacentHTML('beforeend', html);
    explorerRenderedCount = end;
}

function studyExplorerFiltered() {
    if (!explorerFilteredList || explorerFilteredList.length === 0) {
        alert('Không có chữ Hán nào trong danh sách đang lọc!');
        return;
    }
    const vocabMap = buildVocabMapFromCatalogItems(explorerFilteredList);
    startFlashcardSession(
        vocabMap,
        `Kanji Tra cứu (${explorerFilteredList.length} chữ)`,
        () => studyExplorerFiltered()
    );
}

function generateExplorerMarkdown() {
    let md = `# 🈁 BẢNG TỔNG HỢP KANJI N5 & N4 THEO BỘ CHỮ\n\n`;
    md += `> 📅 **Ngày xuất:** ${new Date().toLocaleDateString('vi-VN')}\n`;
    md += `> 🔢 **Tổng số chữ:** ${explorerFilteredList.length} chữ\n\n`;
    md += `| STT | Chữ | Cấp độ | Trang | Hán-Việt & Nghĩa | Bộ chính | Các bộ cấu thành |\n`;
    md += `| :---: | :---: | :---: | :--- | :--- | :--- | :--- |\n`;

    explorerFilteredList.forEach((item, idx) => {
        const pageStr = item.pages.map(p => p.shortName).join(', ');
        const meaningStr = item.meaning ? `${item.hanViet} (${item.meaning})` : item.hanViet;
        const comps = item.radicals.filter(r => r !== item.primaryRadical).join(', ') || '—';
        md += `| ${idx + 1} | ${item.char} | ${item.level} | ${pageStr} | ${meaningStr} | ${item.primaryRadical} | ${comps} |\n`;
    });

    md += `\n---\n*Xuất từ Kanji Studio - Japanese-Vocab*\n`;
    return md;
}

function exportExplorerMarkdown() {
    if (!explorerFilteredList.length) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    const md = generateExplorerMarkdown();
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Kanji_N5_N4_Bo_Chu_${dateStr}.md`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`✅ Đã xuất ${fileName}!`);
}

function copyExplorerMarkdown() {
    if (!explorerFilteredList.length) {
        alert('Không có dữ liệu để sao chép!');
        return;
    }
    const md = generateExplorerMarkdown();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(() => {
            showToast('📋 Đã sao chép bảng Kanji Markdown vào clipboard!');
        }).catch(() => {});
    }
}

// ==========================================================================
// 7. MODAL XEM CHI TIẾT TRANG / BỘ CHỮ
// ==========================================================================

function openKanjiDetailModal({ icon, heading, subheading, items, onStart }) {
    const modal = document.getElementById('kanji-detail-modal');
    if (!modal) return;

    if (!modal._hasOverlayBound) {
        modal._hasOverlayBound = true;
        modal.addEventListener('mousedown', (e) => {
            isDetailModalOverlayGesture = (e.target === modal);
        });
        modal.addEventListener('touchstart', (e) => {
            isDetailModalOverlayGesture = (e.target === modal);
        }, { passive: true });
    }

    document.getElementById('kdm-icon').textContent = icon || '🈁';
    document.getElementById('kdm-heading').textContent = heading || 'Danh sách chữ Hán';
    document.getElementById('kdm-subheading').innerHTML = subheading || '';

    const grid = document.getElementById('kdm-grid');
    if (grid) {
        grid.innerHTML = items.map(item => {
            const comps = (item.radicals || []).filter(r => r !== item.primaryRadical);
            const safeChar = escapeJsArg(item.char);
            return `
                <div class="preview-kanji-card">
                    <div class="pkc-head">
                        <div class="pkc-char">${escapeHtml(item.char)}</div>
                        <div class="pkc-info">
                            <div class="pkc-hv">${escapeHtml(item.hanViet || item.label)}</div>
                            <div class="pkc-meaning">${escapeHtml(item.meaning || 'Bộ thủ')}</div>
                        </div>
                        <button type="button" class="table-speak-btn" onclick="speakJapanese('${safeChar}')" title="Nghe">🔊</button>
                    </div>
                    <div class="td-radical-tags">
                        <span class="td-rad-badge td-rad-primary">📌 ${escapeHtml(item.primaryRadical)}</span>
                        ${comps.map(r => `<span class="td-rad-badge td-rad-comp">🧩 ${escapeHtml(r)}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    const startBtn = document.getElementById('kdm-start-btn');
    if (startBtn) {
        startBtn.onclick = onStart || null;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeKanjiDetailModal() {
    const modal = document.getElementById('kanji-detail-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closeKanjiDetailModalOnOverlay(event) {
    if (isDetailModalOverlayGesture && event && event.target && event.target.id === 'kanji-detail-modal') {
        closeKanjiDetailModal();
    }
    isDetailModalOverlayGesture = false;
}

// ==========================================================================
// 8. PHÍM TẮT & KHỞI TẠO TRANG
// ==========================================================================

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const detailModal = document.getElementById('kanji-detail-modal');
        if (detailModal && detailModal.style.display !== 'none') {
            closeKanjiDetailModal();
            return;
        }
    }

    const targetTag = event.target ? event.target.tagName : '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) return;

    const detailModal = document.getElementById('kanji-detail-modal');
    if (detailModal && detailModal.style.display !== 'none') return;

    const flashcard = document.getElementById('flashcard');
    const endScreen = document.getElementById('end-screen');
    if (flashcard && flashcard.style.display === 'block' && (!endScreen || endScreen.style.display === 'none')) {
        if (event.key === 'Enter' || event.key === 'ArrowRight') {
            handleMainLogic();
        } else if (event.key === 'ArrowLeft') {
            prevQuestion(null);
        } else if (event.key === 'm' || event.key === 'M') {
            event.preventDefault();
            if (typeof toggleMark === 'function') toggleMark(null);
        }
    }
});

function handleInitialRouteHash() {
    const hash = (window.location.hash || '').replace('#', '').toLowerCase();
    if (hash === 'radicals') {
        switchKanjiTab('radicals');
    } else if (hash === 'explorer') {
        switchKanjiTab('explorer');
    } else if (hash === 'n4') {
        switchKanjiTab('pages');
        setTimeout(() => {
            document.getElementById('kanji-n4-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    } else {
        switchKanjiTab('pages');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeroStats();
    renderAllPageCards();
    renderStudioKanjiLessons();
    initExplorerDropdowns();
    updateStudioSelectedTotals();
    handleInitialRouteHash();
});
