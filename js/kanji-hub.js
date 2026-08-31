/**
 * File: js/kanji-hub.js
 * Quản lý giao diện Modal chọn trang Kanji tương tác, hiệu ứng vòng chọn trang (Kanji Wheel / Grid)
 * và kết nối với phiên học ôn tập.
 */

/**
 * Mở modal chọn trang Kanji
 */
function openKanjiModal(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const modal = document.getElementById('kanji-selector-modal');
    if (!modal) return;

    renderKanjiModalPages();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
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
    updateKanjiBadgeOnMenu();
}

/**
 * Đóng modal khi click vào nền overlay
 */
function closeKanjiModalOnOverlay(event) {
    if (event && event.target && event.target.id === 'kanji-selector-modal') {
        closeKanjiModal();
    }
}

/**
 * Render danh sách 9 trang Kanji vào grid của Modal
 */
function renderKanjiModalPages() {
    const container = document.getElementById('kanji-wheel-grid');
    if (!container) return;

    container.innerHTML = KANJI_PAGES_CONFIG.map(p => {
        const isChecked = selectedKanjiPages.has(p.id);
        return `
            <div class="kanji-page-card ${isChecked ? 'active' : ''}" id="kpc-${p.id}" onclick="toggleKanjiPageItem('${p.id}')">
                <div class="kpc-top-row">
                    <span class="kpc-badge">${p.shortName}</span>
                    <label class="kpc-checkbox-wrap" onclick="event.stopPropagation()">
                        <input type="checkbox" id="chk-kpc-${p.id}" ${isChecked ? 'checked' : ''} onchange="onKanjiCheckboxChange('${p.id}', this.checked)">
                        <span class="kpc-custom-check"></span>
                    </label>
                </div>

                <!-- Vòng tròn hiển thị chữ mẫu -->
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

    updateKanjiModalStats();
}

/**
 * Toggle chọn 1 trang Kanji khi click vào card
 */
function toggleKanjiPageItem(pageId) {
    const chk = document.getElementById(`chk-kpc-${pageId}`);
    if (chk) {
        chk.checked = !chk.checked;
        onKanjiCheckboxChange(pageId, chk.checked);
    }
}

/**
 * Xử lý khi checkbox của trang thay đổi
 */
function onKanjiCheckboxChange(pageId, isChecked) {
    if (isChecked) {
        selectedKanjiPages.add(pageId);
    } else {
        selectedKanjiPages.delete(pageId);
    }

    const card = document.getElementById(`kpc-${pageId}`);
    if (card) {
        if (isChecked) card.classList.add('active');
        else card.classList.remove('active');
    }

    updateKanjiModalStats();
    syncKanjiMainCardCheckbox();
}

/**
 * Chọn tất cả / Bỏ chọn tất cả trang trong Modal
 */
function selectAllKanjiModalPages(selectAll) {
    KANJI_PAGES_CONFIG.forEach(p => {
        if (selectAll) selectedKanjiPages.add(p.id);
        else selectedKanjiPages.delete(p.id);

        const chk = document.getElementById(`chk-kpc-${p.id}`);
        if (chk) chk.checked = selectAll;

        const card = document.getElementById(`kpc-${p.id}`);
        if (card) {
            if (selectAll) card.classList.add('active');
            else card.classList.remove('active');
        }
    });

    updateKanjiModalStats();
    syncKanjiMainCardCheckbox();
}

/**
 * Cập nhật số liệu thống kê trong Modal
 */
function updateKanjiModalStats() {
    const statsEl = document.getElementById('kanji-modal-selected-count');
    if (!statsEl) return;

    let totalChars = 0;
    KANJI_PAGES_CONFIG.forEach(p => {
        if (selectedKanjiPages.has(p.id)) {
            totalChars += p.count;
        }
    });

    const pageCount = selectedKanjiPages.size;
    statsEl.innerHTML = `${pageCount} / ${KANJI_PAGES_CONFIG.length} trang (${totalChars} chữ Hán)`;
}

/**
 * Đồng bộ trạng thái checkbox thẻ Kanji trên menu chính
 */
function syncKanjiMainCardCheckbox() {
    const mainChk = document.getElementById('chk-kanji');
    const mainCard = document.getElementById('card-kanji');
    if (mainChk) {
        mainChk.checked = selectedKanjiPages.size > 0;
        if (mainCard) {
            if (mainChk.checked) mainCard.classList.add('active');
            else mainCard.classList.remove('active');
        }
        if (typeof updateSelectedCount === 'function') {
            updateSelectedCount();
        }
    }
}

/**
 * Cập nhật nhãn & số lượng hiển thị trên thẻ Kanji ở Menu chính
 */
function updateKanjiBadgeOnMenu() {
    const badgeEl = document.getElementById('kanji-badge-count');
    const descEl = document.getElementById('kanji-card-desc');
    const tagEl = document.getElementById('kanji-card-tag');

    const totalPages = KANJI_PAGES_CONFIG.length;
    const selectedSize = selectedKanjiPages.size;

    let totalChars = 0;
    const selectedNames = [];
    KANJI_PAGES_CONFIG.forEach(p => {
        if (selectedKanjiPages.has(p.id)) {
            totalChars += p.count;
            selectedNames.push(p.label);
        }
    });

    if (badgeEl) {
        badgeEl.innerText = `${selectedSize}/${totalPages}`;
    }

    if (tagEl) {
        tagEl.innerText = `${selectedSize} Trang (${totalChars} chữ)`;
    }

    if (descEl) {
        if (selectedSize === totalPages) {
            descEl.innerText = `Đang chọn toàn bộ 9 trang (${totalChars} chữ Hán N5)`;
        } else if (selectedSize === 0) {
            descEl.innerText = `Chưa chọn trang nào (Bấm để chọn trang ôn tập)`;
        } else {
            descEl.innerText = `Đang chọn: ${selectedNames.join(', ')} (${totalChars} chữ)`;
        }
    }

    syncKanjiMainCardCheckbox();
}

/**
 * Xử lý khi người dùng tick trực tiếp vào checkbox thẻ Kanji trên menu
 */
function onKanjiCardCheckboxChange(isChecked) {
    if (isChecked) {
        if (selectedKanjiPages.size === 0) {
            selectAllKanjiModalPages(true);
        }
    } else {
        selectedKanjiPages.clear();
    }
    updateKanjiBadgeOnMenu();
}

/**
 * Học nhanh riêng duy nhất 1 trang Kanji được chọn
 */
function studySingleKanjiPage(pageId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const targetPage = KANJI_PAGES_CONFIG.find(p => p.id === pageId);
    if (!targetPage) return;

    const data = targetPage.getData();
    if (!data || Object.keys(data).length === 0) {
        alert("Dữ liệu trang này đang trống!");
        return;
    }

    closeKanjiModal();

    // Bắt đầu phiên học chỉ với trang này
    currentVocab = Object.assign({}, data);
    currentChapterName = targetPage.shortName + " (" + targetPage.title + ")";
    questions = Object.keys(currentVocab);
    markedQuestions.clear();

    const selectedModeInput = document.querySelector('input[name="studyMode"]:checked');
    if (selectedModeInput) {
        currentMode = selectedModeInput.value;
    }

    document.getElementById('menu').style.display = 'none';
    document.getElementById('flashcard').style.display = 'block';

    initRound();
    showToast(`🚀 Đang ôn tập riêng: ${targetPage.shortName} (${Object.keys(data).length} chữ)!`);
}

/**
 * Bắt đầu ôn tập trực tiếp từ nút trong Modal chọn trang Kanji
 */
function startStudyFromKanjiModal() {
    if (selectedKanjiPages.size === 0) {
        alert("Vui lòng chọn ít nhất 1 trang Kanji để bắt đầu!");
        return;
    }

    closeKanjiModal();
    const mainChk = document.getElementById('chk-kanji');
    if (mainChk) mainChk.checked = true;

    startReview();
}
