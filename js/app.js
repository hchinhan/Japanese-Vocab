/**
 * File: js/app.js
 * Điểm khởi đầu ứng dụng: Render giao diện bài học động, quản lý trạng thái chọn bài,
 * lắng nghe phím tắt và hiển thị thông báo Toast.
 */

/**
 * Render danh sách thẻ bài học lên giao diện Menu
 */
function renderChapterCards() {
    const container = document.getElementById('chapter-options');
    if (!container) return;

    container.innerHTML = CHAPTERS_CONFIG.map(chapter => {
        if (chapter.isKanjiGroup) {
            return `
                <div class="product-card special-card kanji-group-card" id="card-${chapter.id}" onclick="handleKanjiCardClick(event)">
                    <input type="checkbox" id="chk-${chapter.id}" onchange="onKanjiCardCheckboxChange(this.checked)">
                    <div class="card-content">
                        <div class="card-header-row">
                            <span class="chapter-tag ${chapter.tagClass || ''}" id="kanji-card-tag">${chapter.tag}</span>
                            <span class="card-checkbox"></span>
                        </div>
                        <div class="card-icon">${chapter.icon}</div>
                        <div class="card-title">${chapter.title}</div>
                        <div class="card-desc" id="kanji-card-desc">${chapter.desc}</div>
                        <div class="kanji-action-row">
                            <button type="button" class="kanji-config-btn" onclick="openKanjiModal(event)" title="Mở bảng chọn chi tiết từng trang Kanji">
                                <span>⚙️ Chọn trang học</span>
                                <span class="kanji-selected-badge" id="kanji-badge-count">9/9</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

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
    }).join('');

    if (typeof updateKanjiBadgeOnMenu === 'function') {
        updateKanjiBadgeOnMenu();
    }
}

/**
 * Xử lý click vào thẻ Kanji trên Menu
 */
function handleKanjiCardClick(event) {
    if (event.target.closest('.kanji-config-btn')) {
        return; // Nút chọn trang đã tự xử lý
    }
    const chk = document.getElementById('chk-kanji');
    if (chk && event.target !== chk) {
        chk.checked = !chk.checked;
        if (typeof onKanjiCardCheckboxChange === 'function') {
            onKanjiCardCheckboxChange(chk.checked);
        }
    }
}

/**
 * Render danh sách tùy chọn bài học vào thẻ select của Modal tra cứu (bao gồm cả các trang Kanji con)
 */
function renderChapterSelectOptions() {
    const select = document.getElementById('vocab-chapter-filter');
    if (!select) return;

    let optionsHtml = '<option value="all">📚 Tất cả các bài (Toàn bộ từ vựng)</option>';
    CHAPTERS_CONFIG.forEach(chapter => {
        if (chapter.isKanjiGroup) {
            optionsHtml += `<optgroup label="🈁 Kanji Hán Tự (504 chữ)">`;
            optionsHtml += `<option value="${chapter.id}">🈁 Tất cả 9 trang Kanji (504 chữ)</option>`;
            if (typeof KANJI_PAGES_CONFIG !== 'undefined') {
                KANJI_PAGES_CONFIG.forEach(p => {
                    optionsHtml += `<option value="${p.id}">&nbsp;&nbsp;&nbsp;↳ ${p.shortName}: ${p.title} (${p.count} chữ)</option>`;
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
        if (input && input.checked) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    const productCards = document.querySelectorAll('.product-card');
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
    const container = document.getElementById('chapter-options');
    if (!container) return;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(chk => {
        chk.checked = selectAll;
        if (chk.id === 'chk-kanji' && typeof onKanjiCardCheckboxChange === 'function') {
            onKanjiCardCheckboxChange(selectAll);
        }
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
    // ESC: Đóng modal
    if (event.key === 'Escape') {
        const kanjiModal = document.getElementById('kanji-selector-modal');
        if (kanjiModal && kanjiModal.style.display !== 'none') {
            closeKanjiModal();
            return;
        }

        const modal = document.getElementById('vocab-summary-modal');
        if (modal && modal.style.display !== 'none') {
            closeVocabSummaryModal();
            return;
        }
    }

    // Enter / Mũi tên phải / Mũi tên trái: Điều hướng Flashcard
    const flashcard = document.getElementById('flashcard');
    const endScreen = document.getElementById('end-screen');
    if (flashcard && flashcard.style.display === 'block' && (!endScreen || endScreen.style.display === 'none')) {
        if (event.key === 'Enter' || event.key === 'ArrowRight') {
            handleMainLogic();
        } else if (event.key === 'ArrowLeft') {
            prevQuestion(null);
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
