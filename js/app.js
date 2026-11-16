/**
 * File: js/app.js
 * Điểm khởi đầu ứng dụng: Render giao diện bài học động, quản lý trạng thái chọn bài,
 * lắng nghe phím tắt và hiển thị thông báo Toast.
 */

/**
 * Render thẻ nhóm Kanji thống nhất (dùng cho mọi Part Kanji và Từ vựng Kanji theo bài)
 */
function renderKanjiGroupCardHtml(chapter, opts) {
    const partBadgeHtml = chapter.partBadge
        ? `<span class="chapter-tag tag-part">${chapter.partBadge}</span>`
        : '';

    return `
        <div class="product-card special-card kanji-group-card" id="card-${chapter.id}" onclick="${opts.clickHandler}">
            <input type="checkbox" id="chk-${chapter.id}" onchange="${opts.changeHandler}">
            <div class="card-content">
                <div class="card-header-row">
                    <div class="card-tag-group">
                        ${partBadgeHtml}
                        <span class="chapter-tag ${chapter.tagClass || ''}" id="${opts.tagId}">${opts.initialTag}</span>
                    </div>
                    <span class="card-checkbox"></span>
                </div>
                <div class="card-icon">${chapter.icon}</div>
                <div class="card-title">${chapter.title}</div>
                <div class="card-desc" id="${opts.descId}">${chapter.desc}</div>
                <div class="kanji-action-row">
                    <button type="button" class="kanji-config-btn" onclick="${opts.modalFn}" title="${opts.btnTitle}">
                        <span>${opts.btnLabel}</span>
                        <span class="kanji-selected-badge" id="${opts.badgeId}">${opts.initialBadge}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render thẻ bài học chuẩn (dùng cho Bài 1~26, Đếm số, Katakana, Tha động từ)
 */
function renderSimpleChapterCardHtml(chapter) {
    return `
        <label class="product-card ${chapter.isSpecial ? 'special-card' : ''}" id="card-${chapter.id}">
            <input type="checkbox" id="chk-${chapter.id}" onchange="updateSelectedCount()">
            <div class="card-content">
                <div class="card-header-row">
                    <span class="chapter-tag ${chapter.tagClass || ''}">${chapter.tag}</span>
                    <span class="card-checkbox"></span>
                </div>
                <div class="card-icon">${chapter.icon}</div>
                <div class="card-title">${chapter.title}</div>
                <div class="card-desc">${chapter.desc}</div>
            </div>
        </label>
    `;
}

/**
 * Render danh sách thẻ bài học lên giao diện Menu
 */
function renderChapterCards() {
    const container = document.getElementById('chapter-options');
    const kanjiPartsContainer = document.getElementById('kanji-parts-options');
    const kanjiLessonsContainer = document.getElementById('kanji-lessons-options');
    const thaDongTuContainer = document.getElementById('tha-dong-tu-options');
    if (!container) return;

    let mainHtml = '';
    let kanjiPartsHtml = '';
    let kanjiLessonsHtml = '';
    let thaDongTuHtml = '';

    CHAPTERS_CONFIG.forEach(chapter => {
        if (chapter.isKanjiPageGroup) {
            const totalPages = chapter.pagesConfig ? chapter.pagesConfig.length : 0;
            kanjiPartsHtml += renderKanjiGroupCardHtml(chapter, {
                clickHandler: `handleKanjiPartCardClick(event, '${chapter.id}')`,
                changeHandler: `onKanjiPartCheckboxChange('${chapter.id}', this.checked)`,
                tagId: `kanji-card-tag-${chapter.id}`,
                initialTag: `0 Trang (0 chữ)`,
                descId: `kanji-card-desc-${chapter.id}`,
                modalFn: `openKanjiPartModal('${chapter.id}', event)`,
                btnTitle: `Mở bảng chọn chi tiết từng trang của ${chapter.title}`,
                btnLabel: '⚙️ Chọn trang học',
                badgeId: `kanji-badge-count-${chapter.id}`,
                initialBadge: `0/${totalPages}`
            });
        } else if (chapter.isKanjiLessonGroup) {
            const totalLessons = typeof KANJI_LESSONS_CONFIG !== 'undefined' ? KANJI_LESSONS_CONFIG.length : 17;
            kanjiLessonsHtml += renderKanjiGroupCardHtml(chapter, {
                clickHandler: 'handleKanjiLessonCardClick(event)',
                changeHandler: 'onKanjiLessonCardCheckboxChange(this.checked)',
                tagId: 'kanji-lesson-card-tag',
                initialTag: chapter.tag,
                descId: 'kanji-lesson-card-desc',
                modalFn: 'openKanjiLessonModal(event)',
                btnTitle: 'Mở bảng chọn chi tiết từng bài học Kanji',
                btnLabel: '⚙️ Chọn bài Kanji',
                badgeId: 'kanji-lesson-badge-count',
                initialBadge: `0/${totalLessons}`
            });
        } else if (chapter.isThaDongTuSection) {
            thaDongTuHtml += renderSimpleChapterCardHtml(chapter);
        } else {
            mainHtml += renderSimpleChapterCardHtml(chapter);
        }
    });

    container.innerHTML = mainHtml;
    if (kanjiPartsContainer) kanjiPartsContainer.innerHTML = kanjiPartsHtml;
    if (kanjiLessonsContainer) kanjiLessonsContainer.innerHTML = kanjiLessonsHtml;
    if (thaDongTuContainer) thaDongTuContainer.innerHTML = thaDongTuHtml;

    if (typeof updateAllKanjiPartBadges === 'function') {
        updateAllKanjiPartBadges();
    }
    if (typeof updateKanjiLessonBadgeOnMenu === 'function') {
        updateKanjiLessonBadgeOnMenu();
    }
}

function toggleKanjiGroupCardByClick(event, chkId, changeFn) {
    if (event.target.closest('.kanji-config-btn')) {
        return; // Nút chọn chi tiết đã tự xử lý
    }
    const chk = document.getElementById(chkId);
    if (chk && event.target !== chk) {
        chk.checked = !chk.checked;
        if (typeof changeFn === 'function') {
            changeFn(chk.checked);
        }
    }
}

function handleKanjiPartCardClick(event, partId) {
    toggleKanjiGroupCardByClick(
        event,
        `chk-${partId}`,
        (checked) => {
            if (typeof onKanjiPartCheckboxChange === 'function') {
                onKanjiPartCheckboxChange(partId, checked);
            }
        }
    );
}

function handleKanjiLessonCardClick(event) {
    toggleKanjiGroupCardByClick(
        event,
        'chk-kanji_lessons',
        typeof onKanjiLessonCardCheckboxChange === 'function' ? onKanjiLessonCardCheckboxChange : null
    );
}

/**
 * Render danh sách tùy chọn bài học vào thẻ select của Modal tra cứu
 */
function renderChapterSelectOptions() {
    const select = document.getElementById('vocab-chapter-filter');
    if (!select) return;

    let optionsHtml = '<option value="all">📚 Tất cả các bài (Toàn bộ từ vựng)</option>';
    CHAPTERS_CONFIG.forEach(chapter => {
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
            optionsHtml += `<optgroup label="🈴 Từ Vựng Kanji Theo Bài (${totalLessonWords} từ)">`;
            optionsHtml += `<option value="${chapter.id}">🈴 Tất cả ${totalLessonCount} bài Kanji (${totalLessonWords} từ)</option>`;
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

/**
 * Cập nhật số lượng bài học đang chọn và trạng thái active của card
 */
function updateSelectedCount() {
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        const input = card.querySelector('input[type="radio"]');
        card.classList.toggle('active', !!(input && input.checked));
    });

    const productCards = document.querySelectorAll(
        '#chapter-options .product-card, #kanji-parts-options .product-card, #kanji-lessons-options .product-card, #tha-dong-tu-options .product-card'
    );
    let count = 0;
    productCards.forEach(card => {
        const input = card.querySelector('input[type="checkbox"]');
        if (input && input.checked) {
            card.classList.add('active');
            count++;
        } else {
            card.classList.remove('active');
        }
    });

    const countNum = document.getElementById('count-num');
    if (countNum) countNum.innerText = count;

    const startBadge = document.getElementById('start-count-badge');
    if (startBadge) startBadge.innerText = `${count} bài được chọn`;
}

/**
 * Chọn tất cả hoặc bỏ chọn tất cả bài học
 */
function toggleSelectAll(selectAll) {
    const containers = ['chapter-options', 'kanji-parts-options', 'kanji-lessons-options', 'tha-dong-tu-options'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(chk => {
            chk.checked = selectAll;
            const partId = chk.id.replace(/^chk-/, '');
            if (typeof getKanjiPartById === 'function' && getKanjiPartById(partId)) {
                onKanjiPartCheckboxChange(partId, selectAll);
            } else if (chk.id === 'chk-kanji_lessons' && typeof onKanjiLessonCardCheckboxChange === 'function') {
                onKanjiLessonCardCheckboxChange(selectAll);
            }
        });
    });
    updateSelectedCount();
}

/**
 * Hiển thị thông báo Toast
 */
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
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Lắng nghe phím tắt toàn cục
 */
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
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
    const summaryModal = document.getElementById('vocab-summary-modal');
    if (summaryModal && summaryModal.style.display !== 'none') {
        return;
    }
    const kanjiModal = document.getElementById('kanji-selector-modal');
    if (kanjiModal && kanjiModal.style.display !== 'none') {
        return;
    }
    const kanjiLessonModal = document.getElementById('kanji-lesson-modal');
    if (kanjiLessonModal && kanjiLessonModal.style.display !== 'none') {
        return;
    }

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

/**
 * Khởi tạo ứng dụng khi tài liệu HTML sẵn sàng
 */
document.addEventListener('DOMContentLoaded', () => {
    renderChapterCards();
    renderChapterSelectOptions();
    updateSelectedCount();
});
