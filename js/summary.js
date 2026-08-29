/**
 * File: js/summary.js
 * Quản lý tra cứu toàn bộ từ vựng, lọc bài học, tìm kiếm và xuất file Markdown (.md)
 */

let allVocabList = [];
let currentFilteredList = [];

/**
 * Gộp toàn bộ từ vựng từ các bài học vào một danh sách phẳng
 */
function getAggregateVocabData() {
    const list = [];

    CHAPTERS_CONFIG.forEach(chapter => {
        if (chapter.id === 'kanji') {
            const raw = chapter.getRawData ? chapter.getRawData() : null;
            if (raw) {
                for (let key in raw) {
                    list.push({
                        chapterId: 'kanji',
                        chapterLabel: 'Kanji',
                        chapterTitle: 'Kanji cơ bản',
                        vn: key,
                        jp: raw[key]
                    });
                }
            }
        } else if (chapter.id === 'dem') {
            if (typeof generateMixedCounters === 'function') {
                const counters = generateMixedCounters(10);
                for (let vnKey in counters) {
                    list.push({
                        chapterId: 'dem',
                        chapterLabel: 'Đếm số',
                        chapterTitle: 'Luyện đếm số',
                        vn: vnKey,
                        jp: counters[vnKey]
                    });
                }
            }
        } else {
            const data = chapter.getData();
            if (data) {
                for (let vnKey in data) {
                    list.push({
                        chapterId: chapter.id,
                        chapterLabel: chapter.label,
                        chapterTitle: `${chapter.label} - ${chapter.title}`,
                        vn: vnKey,
                        jp: data[vnKey]
                    });
                }
            }
        }
    });

    return list;
}

/**
 * Mở modal tra cứu từ vựng
 */
function openVocabSummaryModal() {
    if (allVocabList.length === 0) {
        allVocabList = getAggregateVocabData();
    }
    const modal = document.getElementById('vocab-summary-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        filterVocabTable();
        setTimeout(() => {
            const searchInput = document.getElementById('vocab-search-input');
            if (searchInput) searchInput.focus();
        }, 100);
    }
}

/**
 * Đóng modal tra cứu từ vựng
 */
function closeVocabSummaryModal() {
    const modal = document.getElementById('vocab-summary-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * Đóng modal khi click ra ngoài overlay
 */
function closeVocabSummaryOnOverlay(e) {
    if (e.target && e.target.id === 'vocab-summary-modal') {
        closeVocabSummaryModal();
    }
}

/**
 * Lọc bảng từ vựng theo từ khóa và bài học
 */
function filterVocabTable() {
    const searchInput = document.getElementById('vocab-search-input');
    const chapterFilter = document.getElementById('vocab-chapter-filter');
    const clearBtn = document.getElementById('search-clear-btn');

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedChapter = chapterFilter ? chapterFilter.value : 'all';

    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

    currentFilteredList = allVocabList.filter(item => {
        const matchesChapter = (selectedChapter === 'all' || item.chapterId === selectedChapter);
        const matchesSearch = !query ||
            item.vn.toLowerCase().includes(query) ||
            item.jp.toLowerCase().includes(query) ||
            item.chapterLabel.toLowerCase().includes(query) ||
            item.chapterTitle.toLowerCase().includes(query);
        return matchesChapter && matchesSearch;
    });

    renderVocabTable(currentFilteredList);
}

/**
 * Xóa nội dung tìm kiếm
 */
function clearVocabSearch() {
    const searchInput = document.getElementById('vocab-search-input');
    if (searchInput) {
        searchInput.value = '';
        filterVocabTable();
        searchInput.focus();
    }
}

/**
 * Render dữ liệu ra bảng HTML
 */
function renderVocabTable(list) {
    const tbody = document.getElementById('vocab-table-body');
    const emptyState = document.getElementById('vocab-empty-state');
    const countInfo = document.getElementById('vocab-count-info');

    if (countInfo) {
        countInfo.innerText = `Hiển thị ${list.length} / ${allVocabList.length} từ vựng`;
    }

    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        return;
    } else {
        if (emptyState) emptyState.style.display = 'none';
    }

    const fragment = document.createDocumentFragment();
    list.forEach((item, index) => {
        const tr = document.createElement('tr');

        // STT
        const tdIndex = document.createElement('td');
        tdIndex.className = 'td-index';
        tdIndex.textContent = index + 1;
        tr.appendChild(tdIndex);

        // Chapter Tag
        const tdChapter = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `table-chapter-tag tag-${item.chapterId}`;
        badge.textContent = item.chapterLabel;
        tdChapter.appendChild(badge);
        tr.appendChild(tdChapter);

        // Tiếng Nhật
        const tdJp = document.createElement('td');
        tdJp.className = 'td-jp';
        tdJp.textContent = item.jp;
        tr.appendChild(tdJp);

        // Nghĩa Tiếng Việt
        const tdVn = document.createElement('td');
        tdVn.className = 'td-vn';
        tdVn.textContent = item.vn;
        tr.appendChild(tdVn);

        // Nút phát âm
        const tdAudio = document.createElement('td');
        tdAudio.className = 'td-audio';
        const audioBtn = document.createElement('button');
        audioBtn.className = 'table-speak-btn';
        audioBtn.title = 'Nghe phát âm';
        audioBtn.innerHTML = '🔊';
        audioBtn.onclick = () => speakJapanese(item.jp);
        tdAudio.appendChild(audioBtn);
        tr.appendChild(tdAudio);

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

/**
 * Sinh chuỗi Markdown (.md) từ danh sách đang lọc
 */
function generateMarkdownContent() {
    const selectedFilter = document.getElementById('vocab-chapter-filter');
    const filterText = selectedFilter ? selectedFilter.options[selectedFilter.selectedIndex].text : 'Tất cả các bài';
    const query = document.getElementById('vocab-search-input') ? document.getElementById('vocab-search-input').value.trim() : '';

    let mdText = `# 🇯🇵 BẢNG TỔNG HỢP TỪ VỰNG TIẾNG NHẬT N5\n\n`;
    mdText += `> 📅 **Ngày xuất:** ${new Date().toLocaleDateString('vi-VN')}\n`;
    mdText += `> 📂 **Bộ lọc bài học:** ${filterText}\n`;
    if (query) {
        mdText += `> 🔍 **Từ khóa tìm kiếm:** "${query}"\n`;
    }
    mdText += `> 🔢 **Tổng số từ:** ${currentFilteredList.length} từ\n\n`;

    mdText += `| STT | Bài học | Tiếng Nhật | Nghĩa Tiếng Việt |\n`;
    mdText += `| :---: | :--- | :--- | :--- |\n`;

    currentFilteredList.forEach((item, idx) => {
        const cleanJp = item.jp.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const cleanVn = item.vn.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const cleanChapter = item.chapterTitle.replace(/\|/g, '\\|');

        mdText += `| ${idx + 1} | ${cleanChapter} | ${cleanJp} | ${cleanVn} |\n`;
    });

    mdText += `\n---\n*Tài liệu được xuất tự động từ website Japanese-Vocab*\n`;
    return mdText;
}

/**
 * Xuất và tải file Markdown (.md) về máy
 */
function exportVocabToMarkdown() {
    if (!currentFilteredList || currentFilteredList.length === 0) {
        alert("Không có từ vựng nào để xuất file!");
        return;
    }

    const mdContent = generateMarkdownContent();
    const filterVal = document.getElementById('vocab-chapter-filter').value;
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Tu_Vung_Tieng_Nhat_${filterVal}_${dateStr}.md`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`✅ Đã xuất file Markdown ${fileName} thành công!`);
}

/**
 * Sao chép bảng Markdown vào Clipboard
 */
function copyVocabMarkdown() {
    if (!currentFilteredList || currentFilteredList.length === 0) {
        alert("Không có từ vựng nào để sao chép!");
        return;
    }

    const mdContent = generateMarkdownContent();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mdContent).then(() => {
            showToast("📋 Đã sao chép nội dung Markdown vào bộ nhớ tạm!");
        }).catch(() => {
            fallbackCopy(mdContent);
        });
    } else {
        fallbackCopy(mdContent);
    }
}

/**
 * Phương thức fallback sao chép cho trình duyệt cũ
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast("📋 Đã sao chép nội dung Markdown!");
}
