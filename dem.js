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

// 3. Quy tắc đếm Tiền (Đọc số lớn theo cụm 4 chữ số - Vạn)
// Hàm phụ trợ: Đọc 4 chữ số bất kỳ (từ 1 đến 9999)
function read4Digits(n) {
    if (n === 0) return "";
    const ones = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
    let res = "";
    
    let th = Math.floor(n / 1000); // Hàng ngàn
    let h = Math.floor((n % 1000) / 100); // Hàng trăm
    let t = Math.floor((n % 100) / 10); // Hàng chục
    let u = n % 10; // Hàng đơn vị

    // Xử lý Ngàn
    if (th === 1) res += "せん";
    else if (th === 3) res += "さんぜん";
    else if (th === 8) res += "はっせん";
    else if (th > 0) res += ones[th] + "せん";

    // Xử lý Trăm
    if (h === 1) res += "ひゃく";
    else if (h === 3) res += "さんびゃく";
    else if (h === 6) res += "ろっぴゃく";
    else if (h === 8) res += "はっぴゃく";
    else if (h > 0) res += ones[h] + "ひゃく";

    // Xử lý Chục
    if (t === 1) res += "じゅう";
    else if (t > 0) res += ones[t] + "じゅう";

    // Xử lý Đơn vị
    if (u > 0) res += ones[u];

    return res;
}

// Hàm chính: Đọc tiền Yên tới hàng triệu (Max 9,999,999)
function getJapaneseYen(num) {
    if (num === 0) return "ぜろえん";
    
    let man = Math.floor(num / 10000); // Tách phần Vạn
    let rest = num % 10000;            // Phần lẻ đằng sau
    let res = "";

    if (man > 0) {
        // Nếu phần vạn là 1 (10.000), tiếng Nhật bắt buộc đọc là いちまん
        res += read4Digits(man) + "まん";
    }
    if (rest > 0) {
        res += read4Digits(rest);
    }
    
    return res + "えん";
}

// 4. Data tĩnh cho các Thứ trong tuần
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
// ==========================================
const CounterGenerators = {
    // Sản xuất số tuổi (1 - 100)
    tuoi: function(amount) {
        let result = {};
        let generated = new Set();
        while(generated.size < amount) {
            let r = Math.floor(Math.random() * 100) + 1;
            generated.add(r);
        }
        generated.forEach(num => result[num + " tuổi"] = getJapaneseAge(num));
        return result;
    },

    // Sản xuất số tầng (1 - 30)
    tang: function(amount) {
        let result = {};
        let generated = new Set();
        while(generated.size < amount) {
            let r = Math.floor(Math.random() * 30) + 1;
            generated.add(r);
        }
        generated.forEach(num => result["Tầng " + num] = getJapaneseFloor(num));
        return result;
    },

    // Sản xuất số Tiền (Rải đều từ chục yên đến hàng triệu yên)
    tien: function(amount) {
        let result = {};
        let generated = new Set();
        
        // Cấu hình các dải tiền tệ để máy bốc thăm đều
        const moneyRanges = [
            { min: 10, max: 99 },             // Hàng chục yên
            { min: 100, max: 999 },           // Hàng trăm yên
            { min: 1000, max: 9999 },         // Hàng ngàn yên
            { min: 10000, max: 99999 },       // Hàng vạn yên (Mấy chục triệu VNĐ)
            { min: 100000, max: 999999 },     // Hàng chục vạn yên 
            { min: 1000000, max: 9999999 }    // Hàng triệu yên
        ];

        for (let i = 0; i < amount; i++) {
            // Rải đều mỗi dải lấy 1 số, lặp lại nếu amount lớn hơn 6
            let range = moneyRanges[i % moneyRanges.length];
            let r = 0;
            
            do {
                r = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                
                // Thuật toán làm tròn tiền cho giống giá bán thực tế
                if (r >= 1000000) r = Math.floor(r / 10000) * 10000; // Tròn chục ngàn
                else if (r >= 100000) r = Math.floor(r / 1000) * 1000; // Tròn ngàn
                else if (r >= 1000) r = Math.floor(r / 100) * 100; // Tròn trăm
                else if (r >= 100) r = Math.floor(r / 10) * 10; // Tròn chục
                
            } while (generated.has(r) || r === 0);

            generated.add(r);
        }

        generated.forEach(num => {
            // toLocaleString('vi-VN') tự động thêm dấu chấm cho đẹp (VD: 1.500.000)
            let vnFormat = num.toLocaleString('vi-VN') + " yên";
            result[vnFormat] = getJapaneseYen(num);
        });
        
        return result;
    },

    // Sản xuất thứ trong tuần
    thu: function(amount) {
        let result = {};
        let maxAmount = Math.min(amount, daysOfWeek.length);
        let shuffled = [...daysOfWeek].sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, maxAmount);
        selected.forEach(item => result[item.vn] = item.jp);
        return result;
    }
};

// ==========================================
// PHẦN 3: HÀM TỔNG XUẤT RA CHO HTML GỌI
// ==========================================
function generateMixedCounters(itemsPerCategory = 5) {
    let mixedVocab = {};

    for (let key in CounterGenerators) {
        let vocabData = CounterGenerators[key](itemsPerCategory);
        Object.assign(mixedVocab, vocabData);
    }

    return mixedVocab;
}