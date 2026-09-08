/**
 * File: js/kanji-lesson-hub.js
 * Quản lý giao diện Modal chọn bài học Từ vựng Kanji (単語＆漢字 N5 Đông Du),
 * hiệu ứng lưới chọn bài học và kết nối với phiên học Flashcard ôn tập.
 */

let isKanjiLessonOverlayGesture = false;

function initKanjiLessonModalOverlay() {
    const modal = document.getElementById('kanji-lesson-modal');
    if (!modal || modal._hasOverlayBound) return;
    modal._hasOverlayBound = true;

    modal.addEventListener('mousedown', (e) => {
        isKanjiLessonOverlayGesture = (e.target === modal);
    });
    modal.addEventListener('touchstart', (e) => {
        isKanjiLessonOverlayGesture = (e.target === modal);
    }, { passive: true });
}

/**
 * Mở modal chọn bài học Kanji
 */
function openKanjiLessonModal(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const modal = document.getElementById('kanji-lesson-modal');
    if (!modal) return;

    initKanjiLessonModalOverlay();
    renderKanjiLessonModalCards();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Đóng modal chọn bài học Kanji
 */
function closeKanjiLessonModal() {
    const modal = document.getElementById('kanji-lesson-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    updateKanjiLessonBadgeOnMenu();
}

/**
 * Đóng modal khi click vào nền overlay
 */
function closeKanjiLessonModalOnOverlay(event) {
    if (isKanjiLessonOverlayGesture && event && event.target && event.target.id === 'kanji-lesson-modal') {
        closeKanjiLessonModal();
    }
    isKanjiLessonOverlayGesture = false;
}

/**
 * Render danh sách các bài học Kanji vào grid của Modal
 */
function renderKanjiLessonModalCards() {
    const container = document.getElementById('kanji-lesson-wheel-grid');
    if (!container) return;

    container.innerHTML = KANJI_LESSONS_CONFIG.map(l => {
        const isChecked = selectedKanjiLessons.has(l.id);
        return `
            <div class="kanji-page-card ${isChecked ? 'active' : ''}" id="klc-${l.id}" onclick="toggleKanjiLessonItem('${l.id}')">
                <div class="kpc-top-row">
                    <span class="kpc-badge">${l.shortName}</span>
                    <label class="kpc-checkbox-wrap" onclick="event.stopPropagation()">
                        <input type="checkbox" id="chk-klc-${l.id}" ${isChecked ? 'checked' : ''} onchange="onKanjiLessonCheckboxChange('${l.id}', this.checked)">
                        <span class="kpc-custom-check"></span>
                    </label>
                </div>

                <!-- Chữ mẫu tiêu biểu -->
                <div class="kpc-circle-preview">
                    ${l.samples.map(ch => `<span class="kpc-char-tag">${ch}</span>`).join('')}
                </div>

                <div class="kpc-body">
                    <h4 class="kpc-title">${l.title}</h4>
                    <div class="kpc-range">Phạm vi: <b>${l.range}</b></div>
                    <div class="kpc-desc">${l.desc}</div>
                </div>

                <div class="kpc-footer">
                    <span class="kpc-count-badge">📝 ${l.count} từ Hán tự</span>
                    <button type="button" class="kpc-quick-study-btn" onclick="studySingleKanjiLesson('${l.id}', event)" title="Chỉ học riêng bài này">
                        ⚡ Học ngay
                    </button>
                </div>
            </div>
        `;
    }).join('');

    updateKanjiLessonModalStats();
}

/**
 * Toggle chọn 1 bài học Kanji khi click vào card
 */
function toggleKanjiLessonItem(lessonId) {
    const chk = document.getElementById(`chk-klc-${lessonId}`);
    if (chk) {
        chk.checked = !chk.checked;
        onKanjiLessonCheckboxChange(lessonId, chk.checked);
    }
}

/**
 * Xử lý khi checkbox của bài học thay đổi
 */
function onKanjiLessonCheckboxChange(lessonId, isChecked) {
    if (isChecked) {
        selectedKanjiLessons.add(lessonId);
    } else {
        selectedKanjiLessons.delete(lessonId);
    }

    const card = document.getElementById(`klc-${lessonId}`);
    if (card) {
        if (isChecked) card.classList.add('active');
        else card.classList.remove('active');
    }

    updateKanjiLessonModalStats();
    syncKanjiLessonMainCardCheckbox();
}

/**
 * Chọn tất cả / Bỏ chọn tất cả bài học trong Modal
 */
function selectAllKanjiLessonCards(selectAll) {
    KANJI_LESSONS_CONFIG.forEach(l => {
        if (selectAll) selectedKanjiLessons.add(l.id);
        else selectedKanjiLessons.delete(l.id);

        const chk = document.getElementById(`chk-klc-${l.id}`);
        if (chk) chk.checked = selectAll;

        const card = document.getElementById(`klc-${l.id}`);
        if (card) {
            if (selectAll) card.classList.add('active');
            else card.classList.remove('active');
        }
    });

    updateKanjiLessonModalStats();
    syncKanjiLessonMainCardCheckbox();
}

/**
 * Cập nhật số liệu thống kê trong Modal
 */
function updateKanjiLessonModalStats() {
    const statsEl = document.getElementById('kanji-lesson-modal-selected-count');
    if (!statsEl) return;

    let totalWords = 0;
    KANJI_LESSONS_CONFIG.forEach(l => {
        if (selectedKanjiLessons.has(l.id)) {
            totalWords += l.count;
        }
    });

    const lessonCount = selectedKanjiLessons.size;
    statsEl.innerHTML = `${lessonCount} / ${KANJI_LESSONS_CONFIG.length} bài (${totalWords} từ Hán tự)`;
}

/**
 * Đồng bộ trạng thái checkbox thẻ Kanji Bài trên menu chính
 */
function syncKanjiLessonMainCardCheckbox() {
    const mainChk = document.getElementById('chk-kanji_lessons');
    const mainCard = document.getElementById('card-kanji_lessons');
    if (mainChk) {
        mainChk.checked = selectedKanjiLessons.size > 0;
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
 * Cập nhật nhãn & số lượng hiển thị trên thẻ Kanji Bài ở Menu chính
 */
function updateKanjiLessonBadgeOnMenu() {
    const badgeEl = document.getElementById('kanji-lesson-badge-count');
    const descEl = document.getElementById('kanji-lesson-card-desc');
    const tagEl = document.getElementById('kanji-lesson-card-tag');

    const totalLessons = KANJI_LESSONS_CONFIG.length;
    const selectedSize = selectedKanjiLessons.size;

    let totalWords = 0;
    const selectedNames = [];
    KANJI_LESSONS_CONFIG.forEach(l => {
        if (selectedKanjiLessons.has(l.id)) {
            totalWords += l.count;
            selectedNames.push(l.label);
        }
    });

    if (badgeEl) {
        badgeEl.innerText = `${selectedSize}/${totalLessons}`;
    }

    if (tagEl) {
        tagEl.innerText = `${selectedSize} Bài (${totalWords} từ)`;
    }

    if (descEl) {
        if (selectedSize === totalLessons) {
            descEl.innerText = `Đang chọn toàn bộ 11 bài (${totalWords} từ vựng Hán tự N5)`;
        } else if (selectedSize === 0) {
            descEl.innerText = `Chưa chọn bài nào (Bấm để chọn bài ôn tập)`;
        } else {
            descEl.innerText = `Đang chọn: ${selectedNames.join(', ')} (${totalWords} từ)`;
        }
    }

    syncKanjiLessonMainCardCheckbox();
}

/**
 * Xử lý khi người dùng tick trực tiếp vào checkbox thẻ Kanji Bài trên menu
 */
function onKanjiLessonCardCheckboxChange(isChecked) {
    if (isChecked) {
        if (selectedKanjiLessons.size === 0) {
            selectAllKanjiLessonCards(true);
        }
    } else {
        selectedKanjiLessons.clear();
    }
    updateKanjiLessonBadgeOnMenu();
}

/**
 * Học nhanh riêng duy nhất 1 bài học Kanji được chọn
 */
function studySingleKanjiLesson(lessonId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const targetLesson = KANJI_LESSONS_CONFIG.find(l => l.id === lessonId);
    if (!targetLesson) return;

    const data = targetLesson.getData();
    if (!data || Object.keys(data).length === 0) {
        alert("Dữ liệu bài này đang trống!");
        return;
    }

    closeKanjiLessonModal();

    // Bắt đầu phiên học chỉ với bài này
    currentVocab = Object.assign({}, data);
    currentChapterName = targetLesson.shortName + " (" + targetLesson.title + ")";
    questions = Object.keys(currentVocab);
    markedQuestions.clear();

    const selectedModeInput = document.querySelector('input[name="studyMode"]:checked');
    if (selectedModeInput) {
        currentMode = selectedModeInput.value;
    }

    document.getElementById('menu').style.display = 'none';
    document.getElementById('flashcard').style.display = 'block';

    initRound();
    showToast(`🚀 Đang ôn tập riêng: ${targetLesson.shortName} (${Object.keys(data).length} từ)!`);
}

/**
 * Bắt đầu ôn tập trực tiếp từ nút trong Modal chọn bài học Kanji
 */
function startStudyFromKanjiLessonModal() {
    if (selectedKanjiLessons.size === 0) {
        alert("Vui lòng chọn ít nhất 1 bài học Kanji để bắt đầu!");
        return;
    }

    closeKanjiLessonModal();
    const mainChk = document.getElementById('chk-kanji_lessons');
    if (mainChk) mainChk.checked = true;

    startReview();
}
