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
    
    // Nếu trong ngoặc chứa chữ Kana (Hiragana/Katakana), đó là furigana phát âm
    const parenMatch = cleanText.match(/[(\（]([^)\）]+)[)\）]/);
    if (parenMatch && /[\u3040-\u30ff]/.test(parenMatch[1])) {
        cleanText = parenMatch[1].trim();
    } else {
        // Nếu trong ngoặc là tiếng Việt chú thích, loại bỏ phần ngoặc để đọc phần tiếng Nhật
        cleanText = cleanText.replace(/[(\（][^)\）]+[)\）]/g, '').trim();
    }

    if (cleanText.includes('【')) {
        cleanText = cleanText.split('【')[0].trim();
    }

    if (!cleanText) cleanText = text;
    cleanText = cleanText.replace(/[～~]/g, '').replace(/・/g, '、').trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;

    // Chọn giọng ja-JP chuẩn nếu trình duyệt đã nạp voices
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
        const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
        if (jaVoice) utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
}

function stopAudio() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}
