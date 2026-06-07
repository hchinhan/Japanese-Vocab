// File: data/logic_demso.js

// ==========================================
// PHẦN 1: CÁC HÀM QUY TẮC ĐẾM (LOGIC GỐC)
// ==========================================

// 1. Quy tắc đếm Tuổi
function getJapaneseAge(age) {
    if (age === 20) return "はたち";
    if (age === 100) return "ひゃくさい";

    const units = ["", "いっさい", "にさい", "さんさい", "よんさい", "ごさい", "ろくさい", "ななさい", "はっさい", "きゅうさい"];
    const baseTens = ["", "", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];

    let t = Math.floor(age / 10);
    let u = age % 10;
    let result = "";

    if (t === 1) {
        if (u === 0) return "じゅっさい";
        result = "じゅう";
    } else if (t > 1) {
        if (u === 0) return baseTens[t] + "じゅっさい";
        result = baseTens[t] + "じゅう";
    }
    result += units[u];
    return result;
}

// 2. Quy tắc đếm Tầng (Lưu ý tầng 3 là さんがい)
function getJapaneseFloor(floor) {
    const units = ["", "いっかい", "にかい", "さんがい", "よんかい", "ごかい", "ろっかい", "ななかい", "はっかい", "きゅうかい"];
    const baseTens = ["", "", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];

    let t = Math.floor(floor / 10);
    let u = floor % 10;
    let result = "";

    if (t === 1) {
        if (u === 0) return "じゅっかい";
        result = "じゅう";
    } else if (t > 1) {
        if (u === 0) return baseTens[t] + "じゅっかい";
        result = baseTens[t] + "じゅう";
    }
    result += units[u];
    return result;
}

// 3. Data tĩnh cho các Thứ trong tuần
const daysOfWeek = [
    { vn: "Thứ 2", jp: "げつようび" },
    { vn: "Thứ 3", jp: "かようび" },
    { vn: "Thứ 4", jp: "すいようび" },
    { vn: "Thứ 5", jp: "もくようび" },
    { vn: "Thứ 6", jp: "きんようび" },
    { vn: "Thứ 7", jp: "どようび" },
    { vn: "Chủ nhật", jp: "にちようび" }
];


// ==========================================
// PHẦN 2: BỘ MÁY SẢN XUẤT TỪ VỰNG NGẪU NHIÊN
// Thiết kế mở: Sau này muốn thêm đếm Vật, đếm Người... chỉ cần thêm 1 khối ở đây.
// ==========================================
const CounterGenerators = {
    // Sản xuất số tuổi
    tuoi: function(amount) {
        let result = {};
        let generated = new Set();
        while(generated.size < amount) {
            let r = Math.floor(Math.random() * 100) + 1; // Tuổi từ 1-100
            generated.add(r);
        }
        generated.forEach(num => result[num + " tuổi"] = getJapaneseAge(num));
        return result;
    },

    // Sản xuất số tầng
    tang: function(amount) {
        let result = {};
        let generated = new Set();
        while(generated.size < amount) {
            let r = Math.floor(Math.random() * 30) + 1; // Tầng từ 1-30
            generated.add(r);
        }
        generated.forEach(num => result["Tầng " + num] = getJapaneseFloor(num));
        return result;
    },

    // Sản xuất thứ trong tuần
    thu: function(amount) {
        let result = {};
        // Vì tuần chỉ có 7 ngày, nếu user yêu cầu > 7 thì ta chỉ lấy max là 7
        let maxAmount = Math.min(amount, daysOfWeek.length);
        
        // Xáo trộn array gốc và cắt lấy đúng số lượng yêu cầu
        let shuffled = [...daysOfWeek].sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, maxAmount);
        
        selected.forEach(item => result[item.vn] = item.jp);
        return result;
    }

    // SAU NÀY BẠN MUỐN THÊM ĐẾM VẬT, ĐẾM NGƯỜI THÌ VIẾT VÀO ĐÂY...
    // nguoi: function(amount) { ... }
};

// ==========================================
// PHẦN 3: HÀM TỔNG XUẤT RA CHO HTML GỌI
// Hàm này sẽ gom ngẫu nhiên n từ vựng của MỖI thể loại
// ==========================================
function generateMixedCounters(itemsPerCategory = 5) {
    let mixedVocab = {};

    // Tự động lặp qua tất cả các thể loại (tuoi, tang, thu...) trong CounterGenerators
    for (let key in CounterGenerators) {
        let vocabData = CounterGenerators[key](itemsPerCategory);
        Object.assign(mixedVocab, vocabData);
    }

    return mixedVocab;
}