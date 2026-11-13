/**
 * File: js/kanji-hub.js
 * Bộ điều khiển thống nhất cho Modal chọn trang Kanji theo từng Part (Part 1 N5, Part 2 N4, ...).
 * Dùng chung 1 Modal (#kanji-selector-modal) cho mọi session Kanji trong KANJI_PARTS_CONFIG.
 */

let activeKanjiPartId = 'kanji';
let isKanjiOverlayGesture = false;

function getKanjiPartById(partId) {
    if (typeof KANJI_PARTS_CONFIG === 'undefined') return null;
    return KANJI_PARTS_CONFIG.find(p => p.id === partId) || null;
}

function initKanjiModalOverlay() {
    const modal = document.getElementById('kanji-selector-modal');
    if (!modal || modal._hasOverlayBound) return;
    modal._hasOverlayBound = true;

    modal.addEventListener('mousedown', (e) => {
        isKanjiOverlayGesture = (e.target === modal);
    });
    modal.addEventListener('touchstart', (e) => {
        isKanjiOverlayGesture = (e.target === modal);
    }, { passive: true });
}

/**
 * Mở modal chọn trang Kanji cho một Part cụ thể (mặc định Part 1)
 */
function openKanjiPartModal(partId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const part = getKanjiPartById(partId);
    const modal = document.getElementById('kanji-selector-modal');
    if (!part || !modal) return;

    activeKanjiPartId = part.id;
    initKanjiModalOverlay();
    syncKanjiModalHeader(part);
    renderKanjiModalPages(part.id);

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function openKanjiModal(event) {
    openKanjiPartModal('kanji', event);
}

/**
 * Cập nhật tiêu đề, mô tả & nút nhanh của Modal theo Part đang mở
 */
function syncKanjiModalHeader(part) {
    const totalPages = part.pagesConfig.length;
    const totalChars = part.pagesConfig.reduce((sum, p) => sum + p.count, 0);

    const iconEl = document.getElementById('kanji-modal-icon');
    const headingEl = document.getElementById('kanji-modal-heading');
    const subheadingEl = document.getElementById('kanji-modal-subheading');
    const selectAllBtn = document.getElementById('kanji-modal-select-all-btn');

    if (iconEl) iconEl.textContent = part.icon;
    if (headingEl) headingEl.textContent = part.modalTitle || part.title;
    if (subheadingEl) {
        subheadingEl.textContent = `${part.partBadge} • Chọn các trang bạn muốn ôn tập • ${totalPages} trang (${totalChars} chữ)`;
    }
    if (selectAllBtn) {
        selectAllBtn.textContent = `✨ Chọn tất cả ${totalPages} trang`;
    }
}

/**
 * Đóng modal chọn trang Kanji
 */
function closeKanjiModal() {
    const modal = document.getElementById('kanji-selector-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    updateKanjiPartBadgeOnMenu(activeKanjiPartId);
}

function closeKanjiModalOnOverlay(event) {
    if (isKanjiOverlayGesture && event && event.target && event.target.id === 'kanji-selector-modal') {
        closeKanjiModal();
    }
    isKanjiOverlayGesture = false;
}

/**
 * Render danh sách các trang của Part đang mở vào lưới Modal
 */
function renderKanjiModalPages(partId = activeKanjiPartId) {
    const container = document.getElementById('kanji-wheel-grid');
    const part = getKanjiPartById(partId);
    if (!container || !part) return;

    container.innerHTML = part.pagesConfig.map(p => {
        const isChecked = part.selectedPages.has(p.id);
        return `
            <div class="kanji-page-card ${isChecked ? 'active' : ''}" id="kpc-${p.id}" onclick="toggleKanjiPageItem('${p.id}')">
                <div class="kpc-top-row">
                    <span class="kpc-badge">${p.shortName}</span>
                    <label class="kpc-checkbox-wrap" onclick="event.stopPropagation()">
                        <input type="checkbox" id="chk-kpc-${p.id}" ${isChecked ? 'checked' : ''} onchange="onKanjiCheckboxChange('${p.id}', this.checked)">
                        <span class="kpc-custom-check"></span>
                    </label>
                </div>

                <div class="kpc-circle-preview">
                    ${p.samples.map(ch => `<span class="kpc-char-tag">${ch}</span>`).join('')}
                </div>

                <div class="kpc-body">
                    <h4 class="kpc-title">${p.title}</h4>
                    <div class="kpc-range">Phạm vi: <b>${p.range}</b></div>
                    <div class="kpc-desc">${p.desc}</div>
                </div>

                <div class="kpc-footer">
                    <span class="kpc-count-badge">📝 ${p.count} chữ Hán</span>
                    <button type="button" class="kpc-quick-study-btn" onclick="studySingleKanjiPage('${p.id}', event)" title="Chỉ học riêng trang này">
                        ⚡ Học ngay
                    </button>
                </div>
            </div>
        `;
    }).join('');

    updateKanjiModalStats(part.id);
}

function toggleKanjiPageItem(pageId) {
    const chk = document.getElementById(`chk-kpc-${pageId}`);
    if (chk) {
        chk.checked = !chk.checked;
        onKanjiCheckboxChange(pageId, chk.checked);
    }
}

function onKanjiCheckboxChange(pageId, isChecked, partId = activeKanjiPartId) {
    const part = getKanjiPartById(partId);
    if (!part) return;

    if (isChecked) part.selectedPages.add(pageId);
    else part.selectedPages.delete(pageId);

    const card = document.getElementById(`kpc-${pageId}`);
    if (card) card.classList.toggle('active', isChecked);

    updateKanjiModalStats(part.id);
    syncKanjiPartMainCheckbox(part.id);
}

function selectAllKanjiModalPages(selectAll, partId = activeKanjiPartId) {
    const part = getKanjiPartById(partId);
    if (!part) return;

    part.pagesConfig.forEach(p => {
        if (selectAll) part.selectedPages.add(p.id);
        else part.selectedPages.delete(p.id);

        const chk = document.getElementById(`chk-kpc-${p.id}`);
        if (chk) chk.checked = selectAll;

        const card = document.getElementById(`kpc-${p.id}`);
        if (card) card.classList.toggle('active', selectAll);
    });

    updateKanjiModalStats(part.id);
    syncKanjiPartMainCheckbox(part.id);
}

function updateKanjiModalStats(partId = activeKanjiPartId) {
    const statsEl = document.getElementById('kanji-modal-selected-count');
    const part = getKanjiPartById(partId);
    if (!statsEl || !part) return;

    let totalChars = 0;
    part.pagesConfig.forEach(p => {
        if (part.selectedPages.has(p.id)) totalChars += p.count;
    });

    statsEl.innerHTML = `${part.selectedPages.size} / ${part.pagesConfig.length} trang (${totalChars} chữ Hán)`;
}

function syncKanjiPartMainCheckbox(partId) {
    const part = getKanjiPartById(partId);
    if (!part) return;

    const mainChk = document.getElementById(`chk-${part.id}`);
    const mainCard = document.getElementById(`card-${part.id}`);
    if (mainChk) {
        mainChk.checked = part.selectedPages.size > 0;
        if (mainCard) mainCard.classList.toggle('active', mainChk.checked);
        if (typeof updateSelectedCount === 'function') {
            updateSelectedCount();
        }
    }
}

/**
 * Cập nhật nhãn & số lượng hiển thị trên thẻ Part Kanji ở Menu chính
 */
function updateKanjiPartBadgeOnMenu(partId) {
    const part = getKanjiPartById(partId);
    if (!part) return;

    const badgeEl = document.getElementById(`kanji-badge-count-${part.id}`);
    const descEl = document.getElementById(`kanji-card-desc-${part.id}`);
    const tagEl = document.getElementById(`kanji-card-tag-${part.id}`);

    const totalPages = part.pagesConfig.length;
    const selectedSize = part.selectedPages.size;

    let totalChars = 0;
    const selectedNames = [];
    part.pagesConfig.forEach(p => {
        if (part.selectedPages.has(p.id)) {
            totalChars += p.count;
            selectedNames.push(p.label);
        }
    });

    if (badgeEl) badgeEl.innerText = `${selectedSize}/${totalPages}`;
    if (tagEl) tagEl.innerText = `${selectedSize} Trang (${totalChars} chữ)`;

    if (descEl) {
        if (selectedSize === totalPages) {
            descEl.innerText = `Đang chọn toàn bộ ${totalPages} trang (${part.allSelectedLabel || `${totalChars} chữ`})`;
        } else if (selectedSize === 0) {
            descEl.innerText = `Chưa chọn trang nào (Bấm để chọn trang ôn tập)`;
        } else {
            descEl.innerText = `Đang chọn: ${selectedNames.join(', ')} (${totalChars} chữ)`;
        }
    }

    syncKanjiPartMainCheckbox(part.id);
}

function updateAllKanjiPartBadges() {
    if (typeof KANJI_PARTS_CONFIG === 'undefined') return;
    KANJI_PARTS_CONFIG.forEach(p => updateKanjiPartBadgeOnMenu(p.id));
}

function onKanjiPartCheckboxChange(partId, isChecked) {
    const part = getKanjiPartById(partId);
    if (!part) return;

    if (isChecked) {
        if (part.selectedPages.size === 0) {
            selectAllKanjiModalPages(true, part.id);
        }
    } else {
        part.selectedPages.clear();
    }
    updateKanjiPartBadgeOnMenu(part.id);
}

function studySingleKanjiPage(pageId, event, partId = activeKanjiPartId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const part = getKanjiPartById(partId);
    const targetPage = part ? part.pagesConfig.find(p => p.id === pageId) : null;
    if (!targetPage) return;

    const data = targetPage.getData();
    if (!data || Object.keys(data).length === 0) {
        alert("Dữ liệu trang này đang trống!");
        return;
    }

    closeKanjiModal();

    currentVocab = Object.assign({}, data);
    currentChapterName = `${part.shortName} • ${targetPage.shortName} (${targetPage.title})`;
    questions = Object.keys(currentVocab);
    markedQuestions.clear();

    const selectedModeInput = document.querySelector('input[name="studyMode"]:checked');
    if (selectedModeInput) {
        currentMode = selectedModeInput.value;
    }

    document.getElementById('menu').style.display = 'none';
    document.getElementById('flashcard').style.display = 'block';

    initRound();
    showToast(`🚀 Đang ôn tập riêng: ${part.shortName} • ${targetPage.shortName} (${Object.keys(data).length} chữ)!`);
}

function startStudyFromKanjiModal() {
    const part = getKanjiPartById(activeKanjiPartId);
    if (!part || part.selectedPages.size === 0) {
        alert("Vui lòng chọn ít nhất 1 trang Kanji để bắt đầu!");
        return;
    }

    closeKanjiModal();
    const mainChk = document.getElementById(`chk-${part.id}`);
    if (mainChk) mainChk.checked = true;

    startReview();
}
