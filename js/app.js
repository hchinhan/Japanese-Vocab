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

    container.innerHTML = CHAPTERS_CONFIG.map(chapter => `
        <label class="product-card ${chapter.isSpecial ? 'special-card' : ''}">
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
    `).join('');
}

/**
 * Render danh sách tùy chọn bài học vào thẻ select của Modal tra cứu
 */
function renderChapterSelectOptions() {
    const select = document.getElementById('vocab-chapter-filter');
    if (!select) return;

    let optionsHtml = '<option value="all">📚 Tất cả các bài (Toàn bộ từ vựng)</option>';
    CHAPTERS_CONFIG.forEach(chapter => {
        const prefix = chapter.isSpecial ? `${chapter.icon} ` : `${chapter.label} - `;
        optionsHtml += `<option value="${chapter.id}">${prefix}${chapter.title}</option>`;
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
    checkboxes.forEach(chk => chk.checked = selectAll);
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
