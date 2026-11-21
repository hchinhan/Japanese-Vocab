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
const kanjiLessonQuestionKeys = new Set();
let customRestartHandler = null;
let cardMouseDownPos = null;
let hadSelectionOnMouseDown = false;
let wordClickTimeout = null;

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
    customRestartHandler = null;
    currentVocab = {};
    kanjiLessonQuestionKeys.clear();
    const selectedNames = [];

    const selectedModeInput = document.querySelector('input[name="studyMode"]:checked');
    if (selectedModeInput) {
        currentMode = selectedModeInput.value;
    }

    // Tự động duyệt qua tất cả bài học & học phần trong cấu hình
    CHAPTERS_CONFIG.forEach(chapter => {
        const chk = document.getElementById(`chk-${chapter.id}`);
        const hasGroupSelection =
            (chapter.isKanjiPageGroup && chapter.selectedPages && chapter.selectedPages.size > 0) ||
            (chapter.isKanjiRadicalGroup && chapter.selectedRadicals && chapter.selectedRadicals.size > 0) ||
            (chapter.isKanjiLessonGroup && typeof selectedKanjiLessons !== 'undefined' && selectedKanjiLessons.size > 0) ||
            (chapter.isKataGroup && chapter.selectedGroups && chapter.selectedGroups.size > 0) ||
            (chapter.isThaDongTuGroup && chapter.selectedGroups && chapter.selectedGroups.size > 0) ||
            (chapter.isCounterGroup && chapter.selectedGroups && chapter.selectedGroups.size > 0);

        if ((chk && chk.checked) || hasGroupSelection) {
            const data = chapter.getData();
            if (data && Object.keys(data).length > 0) {
                Object.assign(currentVocab, data);
                if (chapter.isKanjiLessonGroup) {
                    Object.keys(data).forEach(key => kanjiLessonQuestionKeys.add(key));
                }
                if (chapter.isKanjiPageGroup && Array.isArray(chapter.pagesConfig) && chapter.selectedPages) {
                    if (chapter.selectedPages.size === chapter.pagesConfig.length) {
                        selectedNames.push(`${chapter.shortName} (${chapter.pagesConfig.length} Trang)`);
                    } else {
                        const pageShorts = [];
                        chapter.pagesConfig.forEach(p => {
                            if (chapter.selectedPages.has(p.id)) pageShorts.push(p.label);
                        });
                        selectedNames.push(`${chapter.shortName} (${pageShorts.join(', ')})`);
                    }
                } else if (chapter.isKanjiRadicalGroup && chapter.selectedRadicals) {
                    const radList = Array.from(chapter.selectedRadicals);
                    if (radList.length <= 2) {
                        selectedNames.push(`Bộ Kanji (${radList.join(', ')})`);
                    } else {
                        selectedNames.push(`Bộ Kanji (${radList.length} bộ)`);
                    }
                } else if (chapter.isKanjiLessonGroup && typeof selectedKanjiLessons !== 'undefined') {
                    if (selectedKanjiLessons.size === KANJI_LESSONS_CONFIG.length) {
                        selectedNames.push(`Kanji Bài (${KANJI_LESSONS_CONFIG.length} Bài)`);
                    } else {
                        const lessonShorts = [];
                        KANJI_LESSONS_CONFIG.forEach(l => {
                            if (selectedKanjiLessons.has(l.id)) lessonShorts.push(l.label);
                        });
                        selectedNames.push(`Kanji Bài (${lessonShorts.join(', ')})`);
                    }
                } else if (chapter.isKataGroup && Array.isArray(chapter.groupsConfig) && chapter.selectedGroups) {
                    if (chapter.selectedGroups.size === chapter.groupsConfig.length) {
                        selectedNames.push(`Katakana (Toàn bộ)`);
                    } else {
                        const topicLabels = [];
                        chapter.groupsConfig.forEach(g => {
                            if (chapter.selectedGroups.has(g.id)) topicLabels.push(g.label);
                        });
                        selectedNames.push(`Katakana (${topicLabels.join(', ')})`);
                    }
                } else if (chapter.isThaDongTuGroup && Array.isArray(chapter.groupsConfig) && chapter.selectedGroups) {
                    if (chapter.selectedGroups.size === chapter.groupsConfig.length) {
                        selectedNames.push(`Tha động từ (Toàn bộ)`);
                    } else {
                        const partLabels = [];
                        chapter.groupsConfig.forEach(g => {
                            if (chapter.selectedGroups.has(g.id)) partLabels.push(g.label);
                        });
                        selectedNames.push(`Tha động từ (${partLabels.join(', ')})`);
                    }
                } else if (chapter.isCounterGroup && Array.isArray(chapter.groupsConfig) && chapter.selectedGroups) {
                    if (chapter.selectedGroups.size === chapter.groupsConfig.length) {
                        selectedNames.push(`Đếm số (7 mục)`);
                    } else {
                        const counterLabels = [];
                        chapter.groupsConfig.forEach(g => {
                            if (chapter.selectedGroups.has(g.id)) counterLabels.push(g.shortName);
                        });
                        selectedNames.push(`Đếm (${counterLabels.join(', ')})`);
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
    if (wordClickTimeout) {
        clearTimeout(wordClickTimeout);
        wordClickTimeout = null;
    }
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
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }

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
    hideKanjiRadicalAnswerTags();

    const isKanjiLesson = kanjiLessonQuestionKeys.has(currentVN);
    wordVnEl.classList.toggle('word-vn-japanese', isKanjiLesson);

    const flashcardEl = document.getElementById('flashcard');
    if (flashcardEl) {
        if (currentMode === 'jp_to_vn') {
            flashcardEl.classList.add('card-mode-jp-to-vn');
        } else {
            flashcardEl.classList.remove('card-mode-jp-to-vn');
        }
    }

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
 * Lấy âm Hán Việt của câu hiện tại nếu thuộc bộ Từ vựng Kanji theo bài
 */
function getKanjiLessonHanViet(key) {
    if (!kanjiLessonQuestionKeys.has(key)) return '';
    if (typeof KANJI_LESSON_META !== 'undefined' && KANJI_LESSON_META[key] && KANJI_LESSON_META[key].hanViet) {
        return KANJI_LESSON_META[key].hanViet;
    }
    return '';
}

/**
 * Hiển thị đáp án kèm âm Hán Việt cho Từ vựng Kanji theo bài
 */
function renderAnswerWithHanViet(answerElement, mainText, hanViet) {
    answerElement.textContent = '';

    const mainSpan = document.createElement('span');
    mainSpan.className = 'word-jp-main';
    mainSpan.textContent = mainText;
    answerElement.appendChild(mainSpan);

    const hvSpan = document.createElement('span');
    hvSpan.className = 'word-han-viet';
    hvSpan.textContent = hanViet;
    answerElement.appendChild(hvSpan);
}

/**
 * Lật thẻ hiển thị đáp án
 */
function showAnswer() {
    isShowingAnswer = true;
    const currentVN = questions[currentIndex];
    const correctJP = currentVocab[currentVN];
    const hanViet = getKanjiLessonHanViet(currentVN);

    const vnElement = document.getElementById('word-vn');
    const answerElement = document.getElementById('word-jp');

    if (currentMode === 'flashcard') {
        vnElement.innerText = currentVN;
        vnElement.style.display = 'flex';
        if (hanViet) {
            renderAnswerWithHanViet(answerElement, correctJP, hanViet);
        } else {
            answerElement.innerText = correctJP;
        }
        answerElement.style.display = 'block';
    } else if (currentMode === 'jp_to_vn') {
        vnElement.innerText = correctJP;
        vnElement.style.display = 'flex';
        if (hanViet) {
            renderAnswerWithHanViet(answerElement, currentVN, hanViet);
        } else {
            answerElement.innerText = currentVN;
        }
        answerElement.style.display = 'block';
    } else {
        vnElement.innerText = currentVN;
        vnElement.style.display = 'flex';
        answerElement.innerText = correctJP;
        answerElement.style.display = 'block';
    }

    document.getElementById('listen-prompt').style.display = 'none';
    document.getElementById('speak-btn').style.display = 'flex';
    renderKanjiRadicalAnswerTags(correctJP);

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
    if (wordClickTimeout) {
        clearTimeout(wordClickTimeout);
        wordClickTimeout = null;
    }
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

function hideKanjiRadicalAnswerTags() {
    const el = document.getElementById('kanji-radical-tags');
    if (el) {
        el.style.display = 'none';
        el.innerHTML = '';
    }
}

function renderKanjiRadicalAnswerTags(kanjiChar) {
    if (typeof getKanjiRadicalTagInfo !== 'function') return;
    const info = getKanjiRadicalTagInfo(kanjiChar);
    if (!info || !info.primaryRadical) {
        hideKanjiRadicalAnswerTags();
        return;
    }

    const answerBox = document.querySelector('.answer-box');
    if (!answerBox) return;

    let container = document.getElementById('kanji-radical-tags');
    if (!container) {
        container = document.createElement('div');
        container.id = 'kanji-radical-tags';
        container.className = 'kanji-radical-tags-row';
        const speakBtn = document.getElementById('speak-btn');
        if (speakBtn && speakBtn.parentNode === answerBox) {
            answerBox.insertBefore(container, speakBtn);
        } else {
            answerBox.appendChild(container);
        }
    }

    container.textContent = '';
    const primarySpan = document.createElement('span');
    primarySpan.className = 'krt-pill krt-primary';
    primarySpan.textContent = `📌 Bộ chính: ${info.primaryRadical}`;
    container.appendChild(primarySpan);

    const comps = (info.radicals || []).filter(r => r !== info.primaryRadical);
    comps.forEach(rad => {
        const compSpan = document.createElement('span');
        compSpan.className = 'krt-pill krt-comp';
        compSpan.textContent = `🧩 ${rad}`;
        container.appendChild(compSpan);
    });

    container.style.display = 'flex';
}

/**
 * Khởi chạy phiên học flashcard tùy biến (dùng cho trang Kanji riêng / học theo bộ / học nhanh 1 mục)
 */
function startFlashcardSession(vocabMap, sessionTitle, restartFn = null, opts = {}) {
    const keys = vocabMap ? Object.keys(vocabMap) : [];
    if (keys.length === 0) {
        alert("Không có dữ liệu từ vựng trong lựa chọn hiện tại!");
        return;
    }

    customRestartHandler = typeof restartFn === 'function' ? restartFn : null;
    kanjiLessonQuestionKeys.clear();
    if (opts && opts.isKanjiLesson) {
        keys.forEach(k => kanjiLessonQuestionKeys.add(k));
    }
    currentVocab = Object.assign({}, vocabMap);
    currentChapterName = sessionTitle;
    questions = keys;
    markedQuestions.clear();

    const selectedModeInput = document.querySelector('input[name="studyMode"]:checked');
    if (selectedModeInput) {
        currentMode = selectedModeInput.value;
    }

    const menuEl = document.getElementById('menu');
    const flashcardEl = document.getElementById('flashcard');
    if (menuEl) menuEl.style.display = 'none';
    if (flashcardEl) flashcardEl.style.display = 'block';

    initRound();
}

/**
 * Ôn lại toàn bộ bộ từ hiện tại từ đầu
 */
function restartAll(event) {
    if (event) event.stopPropagation();
    if (typeof customRestartHandler === 'function') {
        customRestartHandler();
    } else if (typeof startReview === 'function') {
        startReview();
    }
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
 * Xử lý mousedown trên thẻ flashcard để ghi nhận tọa độ và trạng thái bôi đen
 */
function handleCardMouseDown(event) {
    cardMouseDownPos = { x: event.clientX, y: event.clientY };
    const sel = window.getSelection();
    hadSelectionOnMouseDown = !!(sel && sel.toString().trim().length > 0);
}

/**
 * Xử lý touchstart trên mobile
 */
function handleCardTouchStart(event) {
    if (event.touches && event.touches.length > 0) {
        cardMouseDownPos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        const sel = window.getSelection();
        hadSelectionOnMouseDown = !!(sel && sel.toString().trim().length > 0);
    }
}

/**
 * Quay về Menu chính
 */
function returnToMenu(event) {
    if (event) event.stopPropagation();
    if (wordClickTimeout) {
        clearTimeout(wordClickTimeout);
        wordClickTimeout = null;
    }
    document.getElementById('flashcard').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    stopAudio();
}

/**
 * Xử lý sự kiện click nút hành động chính
 */
function handleActionClick(event) {
    if (event) event.stopPropagation();
    if (wordClickTimeout) {
        clearTimeout(wordClickTimeout);
        wordClickTimeout = null;
    }
    handleMainLogic();
}

/**
 * Xử lý click trên thẻ flashcard (cho phép bôi đen từ mà không vô tình lật thẻ)
 */
function handleCardClick(event) {
    if (typeof isVocabSearchModalOpen === 'function' && isVocabSearchModalOpen()) return;
    if (document.getElementById('end-screen').style.display === 'block') return;
    if (event.target.closest('button') || event.target.closest('input') || event.target.closest('.listen-prompt')) return;

    // 1. Nếu lúc bấm chuột xuống đang có đoạn text được bôi đen -> click này là để giải phóng vùng chọn, không lật thẻ
    if (hadSelectionOnMouseDown) {
        hadSelectionOnMouseDown = false;
        cardMouseDownPos = null;
        if (wordClickTimeout) {
            clearTimeout(wordClickTimeout);
            wordClickTimeout = null;
        }
        return;
    }

    // 2. Nếu thao tác là kéo chuột (drag) để bôi đen chữ -> không lật thẻ
    if (cardMouseDownPos && event.clientX !== undefined && event.clientX !== 0) {
        const dx = Math.abs(event.clientX - cardMouseDownPos.x);
        const dy = Math.abs(event.clientY - cardMouseDownPos.y);
        cardMouseDownPos = null;
        if (dx > 6 || dy > 6) {
            if (wordClickTimeout) {
                clearTimeout(wordClickTimeout);
                wordClickTimeout = null;
            }
            return;
        }
    }
    cardMouseDownPos = null;

    // 3. Nếu hiện tại đang có đoạn chữ được bôi đen/chọn -> không lật thẻ
    const currentSel = window.getSelection();
    if (currentSel && currentSel.toString().trim().length > 0) {
        if (wordClickTimeout) {
            clearTimeout(wordClickTimeout);
            wordClickTimeout = null;
        }
        return;
    }

    // 4. Nếu click trúng vùng hiển thị từ vựng (#word-vn hoặc #word-jp)
    const isWordTarget = event.target.closest('#word-vn, #word-jp, .word-vn, .word-jp');
    if (isWordTarget) {
        // Double-click / triple-click để bôi đen từ nhanh
        if (event.detail > 1) {
            if (wordClickTimeout) {
                clearTimeout(wordClickTimeout);
                wordClickTimeout = null;
            }
            return;
        }

        // Chờ khoảng thời gian ngắn để phân biệt click lật thẻ hay double-click bôi đen
        if (wordClickTimeout) {
            clearTimeout(wordClickTimeout);
        }
        wordClickTimeout = setTimeout(() => {
            wordClickTimeout = null;
            const selAfter = window.getSelection();
            if (selAfter && selAfter.toString().trim().length > 0) {
                return;
            }
            handleMainLogic();
        }, 220);
        return;
    }

    // 5. Click vào nền thẻ hoặc khoảng trống -> lật thẻ ngay lập tức
    if (wordClickTimeout) {
        clearTimeout(wordClickTimeout);
        wordClickTimeout = null;
    }
    handleMainLogic();
}

/**
 * Luồng logic chính: Chưa hiện đáp án -> Hiện đáp án; Đã hiện đáp án -> Câu tiếp theo
 */
function handleMainLogic() {
    if (wordClickTimeout) {
        clearTimeout(wordClickTimeout);
        wordClickTimeout = null;
    }
    if (!isShowingAnswer) {
        showAnswer();
    } else {
        nextQuestion();
    }
}
