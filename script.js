let currentVocab = {}; 
let questions = [];
let currentIndex = 0;
let isShowingAnswer = false;
let currentChapterName = "";
let currentMode = "flashcard"; 
let markedQuestions = new Set(); 

function startReview() {
    currentVocab = {};
    let selectedNames = [];

    currentMode = document.querySelector('input[name="studyMode"]:checked').value;

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
    // --- BỔ SUNG CÁC CHƯƠNG MỚI ---
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
    // -----------------------------

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
    
    if (selectedNames.length === 0) {
        alert("Vui lòng chọn ít nhất 1 chương để ôn tập!");
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

// Cập nhật giao diện của nút Sao
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
    // Đảm bảo hiển thị giao diện flashcard, ẩn màn hình kết thúc
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
    updateStarUI(); // Cập nhật trạng thái sao cho từ hiện tại
    
    if (currentMode === 'flashcard') {
        document.getElementById('word-vn').innerText = questions[currentIndex];
        document.getElementById('word-vn').style.display = 'flex';
        document.getElementById('listen-prompt').style.display = 'none';
    } else {
        document.getElementById('word-vn').style.display = 'none';
        document.getElementById('listen-prompt').style.display = 'flex';
        setTimeout(() => playAudio(null), 150); 
    }

    document.getElementById('word-jp').style.display = 'none';
    document.getElementById('speak-btn').style.display = 'none'; 
    
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
        const utterance = new SpeechSynthesisUtterance(text);
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
    vnElement.innerText = currentVN;
    vnElement.style.display = 'flex';
    
    document.getElementById('listen-prompt').style.display = 'none'; 
    
    const answerElement = document.getElementById('word-jp');
    answerElement.innerText = correctJP;
    answerElement.style.display = 'block';
    
    document.getElementById('speak-btn').style.display = 'flex'; 
    
    if (currentMode === 'flashcard') {
        playAudio(null);
    }

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

// Hiển thị màn hình tổng kết
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

// Ôn lại từ đầu bộ hiện tại
function restartAll(event) {
    if(event) event.stopPropagation();
    startReview(); // Gọi lại startReview để bốc ngẫu nhiên lại từ đầu
}

// Chỉ ôn lại các câu đã đánh dấu sao
function reviewMarked(event) {
    if(event) event.stopPropagation();
    // Lấy danh sách các câu đã đánh dấu làm bộ câu hỏi mới
    questions = Array.from(markedQuestions);
    currentChapterName = "⭐ Đã đánh dấu";
    
    // Không clear markedQuestions để người học có thể bỏ đánh dấu từ từ khi đã thuộc
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
    // Ngăn chặn click khi đang ở màn hình End Screen hoặc bấm vào các nút điều khiển
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
    if (document.getElementById('flashcard').style.display === 'block' && document.getElementById('end-screen').style.display === 'none') {
        if (event.key === 'Enter' || event.key === 'ArrowRight') {
            handleMainLogic();
        } else if (event.key === 'ArrowLeft') {
            prevQuestion(null);
        }
    }
});

function toggleSelectAll(selectAll) {
    const container = document.getElementById('chapter-options');
    if (!container) return;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(chk => chk.checked = selectAll);
}