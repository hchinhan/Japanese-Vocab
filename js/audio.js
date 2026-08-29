/**
 * File: js/audio.js
 * Quản lý phát âm giọng đọc tiếng Nhật (Web Speech Synthesis API)
 */

function speakJapanese(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (!text) return;

    // Làm sạch chuỗi văn bản để phát âm chuẩn xác
    let cleanText = text;
    
    // Nếu có phiên âm Hiragana trong ngoặc (VD: "日本 (にほん)"), đọc phần trong ngoặc
    const parenMatch = cleanText.match(/[(\（]([^)\）]+)[)\）]/);
    if (parenMatch) {
        cleanText = parenMatch[1].trim();
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

function stopAudio() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}
