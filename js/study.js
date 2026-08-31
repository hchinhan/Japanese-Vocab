/**
 * File: js/study.js
 * Quản lý phiên học FlashCard, Luyện Nghe, Đánh dấu sao & Điều hướng câu hỏi
 */

let currentVocab = {};
let questions = [];
let currentIndex = 0;
let isShowingAnswer = false;
let currentChapterName = "";
let currentMode = "flashcard";
const markedQuestions = new Set();

/**
 * Trộn ngẫu nhiên danh sách câu hỏi
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Bắt đầu phiên ôn tập với các bài học đã chọn
 */
function startReview() {
    currentVocab = {};
    const selectedNames = [];

    const selectedModeInput = document.querySelector('input[name="studyMode"]:checked');
    if (selectedModeInput) {
        currentMode = selectedModeInput.value;
    }

    // Tự động duyệt qua tất cả bài học trong cấu hình
    CHAPTERS_CONFIG.forEach(chapter => {
        const chk = document.getElementById(`chk-${chapter.id}`);
        if (chk && chk.checked) {
            const data = chapter.getData();
            if (data) {
                Object.assign(currentVocab, data);
                if (chapter.isKanjiGroup && typeof selectedKanjiPages !== 'undefined') {
                    if (selectedKanjiPages.size === KANJI_PAGES_CONFIG.length) {
                        selectedNames.push(`Kanji (9 Trang)`);
                    } else {
                        const pageShorts = [];
                        KANJI_PAGES_CONFIG.forEach(p => {
                            if (selectedKanjiPages.has(p.id)) pageShorts.push(p.label);
                        });
                        selectedNames.push(`Kanji (${pageShorts.join(', ')})`);
                    }
                } else {
                    selectedNames.push(chapter.shortName);
                }
            }
        }
    });

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

/**
 * Khởi tạo vòng học mới
 */
function initRound() {
    document.getElementById('flashcard-content').style.display = 'block';
    document.getElementById('flashcard-header').style.display = 'flex';
    document.getElementById('end-screen').style.display = 'none';

    shuffleArray(questions);
    currentIndex = 0;
    showQuestion();
}

/**
 * Hiển thị câu hỏi hiện tại theo chế độ học
 */
function showQuestion() {
    isShowingAnswer = false;

    document.getElementById('progress').innerText = `${currentChapterName} | Câu ${currentIndex + 1}/${questions.length}`;
    updateStarUI();

    const currentVN = questions[currentIndex];
    const correctJP = currentVocab[currentVN];

    const wordVnEl = document.getElementById('word-vn');
    const wordJpEl = document.getElementById('word-jp');
    const listenPromptEl = document.getElementById('listen-prompt');
    const speakBtnEl = document.getElementById('speak-btn');
    const actionBtnEl = document.getElementById('action-btn');
    const prevBtnEl = document.getElementById('prev-btn');

    wordJpEl.style.display = 'none';
    speakBtnEl.style.display = 'none';

    if (currentMode === 'flashcard') {
        // Chế độ Việt -> Nhật
        wordVnEl.innerText = currentVN;
        wordVnEl.style.display = 'flex';
        listenPromptEl.style.display = 'none';
    } else if (currentMode === 'jp_to_vn') {
        // Chế độ Nhật -> Việt
        wordVnEl.innerText = correctJP;
        wordVnEl.style.display = 'flex';
        listenPromptEl.style.display = 'none';
        playAudio(null);
    } else {
        // Chế độ Luyện Nghe
        wordVnEl.style.display = 'none';
        listenPromptEl.style.display = 'flex';
        setTimeout(() => playAudio(null), 150);
    }

    actionBtnEl.innerText = 'Xem đáp án (Enter)';
    actionBtnEl.classList.remove('btn-finish');

    prevBtnEl.style.display = (currentIndex === 0) ? 'none' : 'block';
}

/**
 * Phát âm câu hiện tại
 */
function playAudio(event) {
    if (event) event.stopPropagation();
    const currentVN = questions[currentIndex];
    const correctJP = currentVocab[currentVN];
    speakJapanese(correctJP);
}

/**
 * Lật thẻ hiển thị đáp án
 */
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

/**
 * Chuyển sang câu tiếp theo
 */
function nextQuestion() {
    currentIndex++;
    if (currentIndex >= questions.length) {
        showEndScreen();
    } else {
        showQuestion();
    }
}

/**
 * Quay lại câu trước đó
 */
function prevQuestion(event) {
    if (event) event.stopPropagation();
    if (currentIndex > 0) {
        currentIndex--;
        showQuestion();
    }
}

/**
 * Hiển thị màn hình kết thúc phiên học
 */
function showEndScreen() {
    document.getElementById('flashcard-content').style.display = 'none';
    document.getElementById('flashcard-header').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block';

    const btnMarked = document.getElementById('btn-review-marked');
    if (markedQuestions.size > 0) {
        btnMarked.innerText = `⭐ Ôn lại câu đã đánh dấu (${markedQuestions.size})`;
        btnMarked.style.display = 'block';
    } else {
        btnMarked.style.display = 'none';
    }
}

/**
 * Đánh dấu hoặc bỏ đánh dấu sao câu hiện tại
 */
function toggleMark(event) {
    if (event) event.stopPropagation();
    const currentWord = questions[currentIndex];

    if (markedQuestions.has(currentWord)) {
        markedQuestions.delete(currentWord);
    } else {
        markedQuestions.add(currentWord);
    }
    updateStarUI();
}

/**
 * Cập nhật giao diện nút sao
 */
function updateStarUI() {
    const currentWord = questions[currentIndex];
    const starBtn = document.getElementById('star-btn');
    if (!starBtn) return;

    if (markedQuestions.has(currentWord)) {
        starBtn.innerText = '★';
        starBtn.classList.add('marked');
    } else {
        starBtn.innerText = '☆';
        starBtn.classList.remove('marked');
    }
}

/**
 * Ôn lại toàn bộ bộ từ hiện tại từ đầu
 */
function restartAll(event) {
    if (event) event.stopPropagation();
    startReview();
}

/**
 * Ôn lại riêng các câu đã đánh dấu sao
 */
function reviewMarked(event) {
    if (event) event.stopPropagation();
    if (markedQuestions.size === 0) return;

    questions = Array.from(markedQuestions);
    currentChapterName = "⭐ Đã đánh dấu";
    initRound();
}

/**
 * Quay về Menu chính
 */
function returnToMenu(event) {
    if (event) event.stopPropagation();
    document.getElementById('flashcard').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    stopAudio();
}

/**
 * Xử lý sự kiện click nút hành động chính
 */
function handleActionClick(event) {
    if (event) event.stopPropagation();
    handleMainLogic();
}

/**
 * Xử lý click trên thẻ flashcard
 */
function handleCardClick(event) {
    if (document.getElementById('end-screen').style.display === 'block') return;
    if (event.target.closest('button') || event.target.closest('input') || event.target.closest('.listen-prompt')) return;
    handleMainLogic();
}

/**
 * Luồng logic chính: Chưa hiện đáp án -> Hiện đáp án; Đã hiện đáp án -> Câu tiếp theo
 */
function handleMainLogic() {
    if (!isShowingAnswer) {
        showAnswer();
    } else {
        nextQuestion();
    }
}
