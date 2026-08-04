let currentVocab = {}; 
let questions = [];
let currentIndex = 0;
let isShowingAnswer = false;
let currentChapterName = "";
let currentMode = "flashcard"; 
let markedQuestions = new Set(); 

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

function toggleSelectAll(selectAll) {
    const container = document.getElementById('chapter-options');
    if (!container) return;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(chk => chk.checked = selectAll);
    updateSelectedCount();
}

function startReview() {
    currentVocab = {};
    let selectedNames = [];

    const selectedModeInput = document.querySelector('input[name="studyMode"]:checked');
    if (selectedModeInput) {
        currentMode = selectedModeInput.value;
    }

    if (document.getElementById('chk-chuong1').checked && typeof vocabChuong1 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong1);
        selectedNames.push("Ch.1");
    }
    if (document.getElementById('chk-chuong2').checked && typeof vocabChuong2 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong2);
        selectedNames.push("Ch.2");
    }
    if (document.getElementById('chk-chuong3').checked && typeof vocabChuong3 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong3);
        selectedNames.push("Ch.3");
    }
    if (document.getElementById('chk-chuong4').checked && typeof vocabChuong4 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong4);
        selectedNames.push("Ch.4");
    }
    if (document.getElementById('chk-chuong5').checked && typeof vocabChuong5 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong5);
        selectedNames.push("Ch.5");
    }
    if (document.getElementById('chk-chuong6').checked && typeof vocabChuong6 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong6);
        selectedNames.push("Ch.6");
    }
    if (document.getElementById('chk-chuong7').checked && typeof vocabChuong7 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong7);
        selectedNames.push("Ch.7");
    }
    if (document.getElementById('chk-chuong8').checked && typeof vocabChuong8 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong8);
        selectedNames.push("Ch.8");
    }
    if (document.getElementById('chk-chuong9').checked && typeof vocabChuong9 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong9);
        selectedNames.push("Ch.9");
    }
    if (document.getElementById('chk-chuong10').checked && typeof vocabChuong10 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong10);
        selectedNames.push("Ch.10");
    }
    if (document.getElementById('chk-chuong11').checked && typeof vocabChuong11 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong11);
        selectedNames.push("Ch.11");
    }
    if (document.getElementById('chk-chuong12').checked && typeof vocabChuong12 !== 'undefined') {
        Object.assign(currentVocab, vocabChuong12);
        selectedNames.push("Ch.12");
    }

    if (document.getElementById('chk-dem').checked && typeof generateMixedCounters === 'function') {
        Object.assign(currentVocab, generateMixedCounters(5)); 
        selectedNames.push("Đếm số");
    }
    if (document.getElementById('chk-kanji').checked && typeof vocabKanjiCoBan !== 'undefined') {
        let reversedKanji = {};
        for (let key in vocabKanjiCoBan) {
            let kanjiChar = vocabKanjiCoBan[key];
            reversedKanji[kanjiChar] = key; 
        }
        Object.assign(currentVocab, reversedKanji);
        selectedNames.push("Kanji CB");
    }
    if (document.getElementById('chk-kata').checked && typeof vocabKata !== 'undefined') {
        Object.assign(currentVocab, vocabKata);
        selectedNames.push("Katakana");
    }
    
    if (selectedNames.length === 0) {
        alert("Vui lòng chọn ít nhất 1 bài học để ôn tập!");
        return;
    }

    currentChapterName = selectedNames.join(" + ");
    questions = Object.keys(currentVocab);
    
    markedQuestions.clear();

    document.getElementById('menu').style.display = 'none';
    document.getElementById('flashcard').style.display = 'block';
    
    initRound();
}

function toggleMark(event) {
    if (event) event.stopPropagation(); 
    let currentWord = questions[currentIndex];
    
    if (markedQuestions.has(currentWord)) {
        markedQuestions.delete(currentWord);
    } else {
        markedQuestions.add(currentWord);
    }
    updateStarUI();
}

function updateStarUI() {
    let currentWord = questions[currentIndex];
    let starBtn = document.getElementById('star-btn');
    if (markedQuestions.has(currentWord)) {
        starBtn.innerText = '★';
        starBtn.classList.add('marked');
    } else {
        starBtn.innerText = '☆';
        starBtn.classList.remove('marked');
    }
}

function returnToMenu(event) {
    if(event) event.stopPropagation();
    document.getElementById('flashcard').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initRound() {
    document.getElementById('flashcard-content').style.display = 'block';
    document.getElementById('flashcard-header').style.display = 'flex';
    document.getElementById('end-screen').style.display = 'none';
    
    shuffleArray(questions);
    currentIndex = 0;
    showQuestion();
}

function showQuestion() {
    isShowingAnswer = false;
    
    document.getElementById('progress').innerText = `${currentChapterName} | Câu ${currentIndex + 1}/${questions.length}`;
    updateStarUI(); 
    
    const currentVN = questions[currentIndex];
    const correctJP = currentVocab[currentVN];

    if (currentMode === 'flashcard') {
        // Việt -> Nhật
        document.getElementById('word-vn').innerText = currentVN;
        document.getElementById('word-vn').style.display = 'flex';
        document.getElementById('listen-prompt').style.display = 'none';
        document.getElementById('word-jp').style.display = 'none';
        document.getElementById('speak-btn').style.display = 'none'; 
    } else if (currentMode === 'jp_to_vn') {
        // Nhật -> Việt
        document.getElementById('word-vn').innerText = correctJP; 
        document.getElementById('word-vn').style.display = 'flex';
        document.getElementById('listen-prompt').style.display = 'none';
        document.getElementById('word-jp').style.display = 'none';
        document.getElementById('speak-btn').style.display = 'none'; 
        playAudio(null);
    } else {
        // Luyện Nghe
        document.getElementById('word-vn').style.display = 'none';
        document.getElementById('listen-prompt').style.display = 'flex';
        document.getElementById('word-jp').style.display = 'none';
        document.getElementById('speak-btn').style.display = 'none'; 
        setTimeout(() => playAudio(null), 150); 
    }

    const actionBtn = document.getElementById('action-btn');
    actionBtn.innerText = 'Xem đáp án (Enter)';
    actionBtn.classList.remove('btn-finish');

    const prevBtn = document.getElementById('prev-btn');
    if (currentIndex === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
}

function speakJapanese(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        if (!text) return;

        // Clean text so TTS reads ONCE (strips parens like "(にほん)" so it doesn't read Kanji AND Hiragana in parens)
        let cleanText = text;
        if (cleanText.includes('(') || cleanText.includes('（')) {
            cleanText = cleanText.split(/[\(（]/)[0].trim();
        } else if (cleanText.includes('【')) {
            cleanText = cleanText.split('【')[0].trim();
        }

        if (!cleanText) cleanText = text;
        cleanText = cleanText.replace(/[～~]/g, '').trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ja-JP'; 
        utterance.rate = 0.85; 
        window.speechSynthesis.speak(utterance);
    }
}

function playAudio(event) {
    if(event) event.stopPropagation(); 
    const currentVN = questions[currentIndex];
    const correctJP = currentVocab[currentVN];
    speakJapanese(correctJP);
}

function showAnswer() {
    isShowingAnswer = true;
    const currentVN = questions[currentIndex];
    const correctJP = currentVocab[currentVN];
    
    const vnElement = document.getElementById('word-vn');
    const answerElement = document.getElementById('word-jp');
    
    if (currentMode === 'flashcard') {
        vnElement.innerText = currentVN;
        vnElement.style.display = 'flex';
        answerElement.innerText = correctJP;
        answerElement.style.display = 'block';
        playAudio(null);
    } else if (currentMode === 'jp_to_vn') {
        vnElement.innerText = correctJP; 
        vnElement.style.display = 'flex';
        answerElement.innerText = currentVN; 
        answerElement.style.display = 'block';
    } else {
        vnElement.innerText = currentVN;
        vnElement.style.display = 'flex';
        answerElement.innerText = correctJP;
        answerElement.style.display = 'block';
    }

    document.getElementById('listen-prompt').style.display = 'none'; 
    document.getElementById('speak-btn').style.display = 'flex'; 

    const actionBtn = document.getElementById('action-btn');
    if (currentIndex === questions.length - 1) {
        actionBtn.innerText = 'Kết thúc';
        actionBtn.classList.add('btn-finish');
    } else {
        actionBtn.innerText = 'Tiếp theo';
    }
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex >= questions.length) {
        showEndScreen();
    } else {
        showQuestion();
    }
}

function showEndScreen() {
    document.getElementById('flashcard-content').style.display = 'none';
    document.getElementById('flashcard-header').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block';

    let btnMarked = document.getElementById('btn-review-marked');
    if (markedQuestions.size > 0) {
        btnMarked.innerText = `⭐ Ôn lại câu đã đánh dấu (${markedQuestions.size})`;
        btnMarked.style.display = 'block';
    } else {
        btnMarked.style.display = 'none';
    }
}

function restartAll(event) {
    if(event) event.stopPropagation();
    startReview(); 
}

function reviewMarked(event) {
    if(event) event.stopPropagation();
    questions = Array.from(markedQuestions);
    currentChapterName = "⭐ Đã đánh dấu";
    initRound();
}

function prevQuestion(event) {
    if(event) event.stopPropagation();
    if (currentIndex > 0) {
        currentIndex--;
        showQuestion();
    }
}

function handleActionClick(event) {
    if(event) event.stopPropagation();
    handleMainLogic();
}

function handleCardClick(event) {
    if (document.getElementById('end-screen').style.display === 'block') return;
    if (event.target.closest('button') || event.target.closest('input') || event.target.closest('.listen-prompt')) return;
    handleMainLogic();
}

function handleMainLogic() {
    if (!isShowingAnswer) {
        showAnswer();
    } else {
        nextQuestion();
    }
}

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('vocab-summary-modal');
        if (modal && modal.style.display !== 'none') {
            closeVocabSummaryModal();
            return;
        }
    }
    if (document.getElementById('flashcard').style.display === 'block' && document.getElementById('end-screen').style.display === 'none') {
        if (event.key === 'Enter' || event.key === 'ArrowRight') {
            handleMainLogic();
        } else if (event.key === 'ArrowLeft') {
            prevQuestion(null);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateSelectedCount();
});

// =========================================================================
// PHẦN TỔNG HỢP, TRA CỨU TỪ VỰNG & XUẤT FILE MARKDOWN (.MD)
// =========================================================================

let allVocabList = [];
let currentFilteredList = [];

/**
 * Gộp toàn bộ từ vựng từ tất cả các chương data vào 1 mảng danh sách chuẩn
 */
function getAggregateVocabData() {
    let list = [];
    
    const chaptersConfig = [
        { id: 'chuong1', label: 'Bài 01', title: 'Bài 01 - Chào hỏi & Nghề nghiệp', data: typeof vocabChuong1 !== 'undefined' ? vocabChuong1 : null },
        { id: 'chuong2', label: 'Bài 02', title: 'Bài 02 - Đồ vật & Sở hữu', data: typeof vocabChuong2 !== 'undefined' ? vocabChuong2 : null },
        { id: 'chuong3', label: 'Bài 03', title: 'Bài 03 - Nơi chốn & Phương hướng', data: typeof vocabChuong3 !== 'undefined' ? vocabChuong3 : null },
        { id: 'chuong4', label: 'Bài 04', title: 'Bài 04 - Thời gian & Sự kiện', data: typeof vocabChuong4 !== 'undefined' ? vocabChuong4 : null },
        { id: 'chuong5', label: 'Bài 05', title: 'Bài 05 - Các tính từ', data: typeof vocabChuong5 !== 'undefined' ? vocabChuong5 : null },
        { id: 'chuong6', label: 'Bài 06', title: 'Bài 06 - Các động từ P1', data: typeof vocabChuong6 !== 'undefined' ? vocabChuong6 : null },
        { id: 'chuong7', label: 'Bài 07', title: 'Bài 07 - Động từ P2 & Danh từ', data: typeof vocabChuong7 !== 'undefined' ? vocabChuong7 : null },
        { id: 'chuong8', label: 'Bài 08', title: 'Bài 08 - Phương tiện & Đồ dùng', data: typeof vocabChuong8 !== 'undefined' ? vocabChuong8 : null },
        { id: 'chuong9', label: 'Bài 09', title: 'Bài 09 - Thời tiết & Trạng thái', data: typeof vocabChuong9 !== 'undefined' ? vocabChuong9 : null },
        { id: 'chuong10', label: 'Bài 10', title: 'Bài 10 - Tần suất & Gia đình', data: typeof vocabChuong10 !== 'undefined' ? vocabChuong10 : null },
        { id: 'chuong11', label: 'Bài 11', title: 'Bài 11 - Động từ chuyển động', data: typeof vocabChuong11 !== 'undefined' ? vocabChuong11 : null },
        { id: 'chuong12', label: 'Bài 12', title: 'Bài 12 - Tồn tại, Vị trí & Động thực vật', data: typeof vocabChuong12 !== 'undefined' ? vocabChuong12 : null }
    ];

    chaptersConfig.forEach(ch => {
        if (ch.data) {
            for (let vnKey in ch.data) {
                list.push({
                    chapterId: ch.id,
                    chapterLabel: ch.label,
                    chapterTitle: ch.title,
                    vn: vnKey,
                    jp: ch.data[vnKey]
                });
            }
        }
    });

    // Kanji
    if (typeof vocabKanjiCoBan !== 'undefined') {
        for (let key in vocabKanjiCoBan) {
            list.push({
                chapterId: 'kanji',
                chapterLabel: 'Kanji',
                chapterTitle: 'Kanji cơ bản',
                vn: key,
                jp: vocabKanjiCoBan[key]
            });
        }
    }

    // Luyện đếm số
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

    // Katakana tổng hợp
    if (typeof vocabKata !== 'undefined') {
        for (let vnKey in vocabKata) {
            list.push({
                chapterId: 'kata',
                chapterLabel: 'Katakana',
                chapterTitle: 'Katakana tổng hợp',
                vn: vnKey,
                jp: vocabKata[vnKey]
            });
        }
    }

    return list;
}

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

function closeVocabSummaryModal() {
    const modal = document.getElementById('vocab-summary-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closeVocabSummaryOnOverlay(e) {
    if (e.target && e.target.id === 'vocab-summary-modal') {
        closeVocabSummaryModal();
    }
}

function filterVocabTable() {
    const query = document.getElementById('vocab-search-input').value.trim().toLowerCase();
    const selectedChapter = document.getElementById('vocab-chapter-filter').value;
    const clearBtn = document.getElementById('search-clear-btn');
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

function clearVocabSearch() {
    const searchInput = document.getElementById('vocab-search-input');
    if (searchInput) {
        searchInput.value = '';
        filterVocabTable();
        searchInput.focus();
    }
}

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
        emptyState.style.display = 'flex';
        return;
    } else {
        emptyState.style.display = 'none';
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

        // Japanese
        const tdJp = document.createElement('td');
        tdJp.className = 'td-jp';
        tdJp.textContent = item.jp;
        tr.appendChild(tdJp);

        // Vietnamese
        const tdVn = document.createElement('td');
        tdVn.className = 'td-vn';
        tdVn.textContent = item.vn;
        tr.appendChild(tdVn);

        // Speak button
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
 * Xuất file Markdown (.md)
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

function copyVocabMarkdown() {
    if (!currentFilteredList || currentFilteredList.length === 0) {
        alert("Không có từ vựng nào để sao chép!");
        return;
    }

    const mdContent = generateMarkdownContent();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mdContent).then(() => {
            showToast("📋 Đã sao chép nội dung Markdown vào bộ nhớ tạm!");
        }).catch(err => {
            fallbackCopy(mdContent);
        });
    } else {
        fallbackCopy(mdContent);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast("📋 Đã sao chép nội dung Markdown!");
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
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}