// File: chuong3_tuoi.js

// Hàm chuyển đổi con số thành cách đọc tuổi trong tiếng Nhật
function getJapaneseAge(age) {
    if (age === 20) return "はたち";
    if (age === 100) return "ひゃくさい";

    const units = ["", "いっさい", "にさい", "さんさい", "よんさい", "ごさい", "ろくさい", "ななさい", "はっさい", "きゅうさい"];
    const baseTens = ["", "", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];

    let t = Math.floor(age / 10); // Hàng chục
    let u = age % 10; // Hàng đơn vị
    let result = "";

    // Xử lý hàng chục
    if (t === 1) {
        if (u === 0) return "じゅっさい";
        result = "じゅう";
    } else if (t > 1) {
        if (u === 0) return baseTens[t] + "じゅっさい";
        result = baseTens[t] + "じゅう";
    }

    // Xử lý hàng đơn vị
    result += units[u];
    return result;
}

// Hàm sinh ra ngẫu nhiên N câu hỏi đếm tuổi
function generateTuoiVocab(amount = 10) {
    let vocabTuoi = {};
    let generatedAges = new Set();
    
    // Lấy ngẫu nhiên các số không trùng lặp từ 1 đến 100
    while(generatedAges.size < amount) {
        let randomAge = Math.floor(Math.random() * 100) + 1; 
        generatedAges.add(randomAge);
    }

    // Tạo từ vựng
    generatedAges.forEach(age => {
        let vn = age + " tuổi";
        let jp = getJapaneseAge(age);
        vocabTuoi[vn] = jp;
    });

    return vocabTuoi;
}