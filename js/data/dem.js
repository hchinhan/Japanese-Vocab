// File: data/logic_demso.js

// ==========================================
// PHẦN 1: CÁC HÀM QUY TẮC ĐẾM (LOGIC GỐC & MỞ RỘNG)
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
function read4Digits(n) {
    if (n === 0) return "";
    const ones = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
    let res = "";
    
    let th = Math.floor(n / 1000); 
    let h = Math.floor((n % 1000) / 100); 
    let t = Math.floor((n % 100) / 10); 
    let u = n % 10; 

    if (th === 1) res += "せん";
    else if (th === 3) res += "さんぜん";
    else if (th === 8) res += "はっせん";
    else if (th > 0) res += ones[th] + "せん";

    if (h === 1) res += "ひゃく";
    else if (h === 3) res += "さんびゃく";
    else if (h === 6) res += "ろっぴゃく";
    else if (h === 8) res += "はっぴゃく";
    else if (h > 0) res += ones[h] + "ひゃく";

    if (t === 1) res += "じゅう";
    else if (t > 0) res += ones[t] + "じゅう";

    if (u > 0) res += ones[u];

    return res;
}

function getJapaneseYen(num) {
    if (num === 0) return "ぜろえん";
    
    let man = Math.floor(num / 10000); 
    let rest = num % 10000;            
    let res = "";

    if (man > 0) {
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

// 5. Quy tắc đếm Ngày (1-31)
function getJapaneseDay(day) {
    const dayMap = {
        1: "ついたち", 2: "ふつか", 3: "みっか", 4: "よっか", 5: "いつか", 6: "むいか", 7: "なのか", 8: "ようか", 9: "ここのか", 10: "とおか",
        14: "じゅうよっか", 17: "じゅうしちにち", 19: "じゅうくにち", 20: "はつか", 24: "にじゅうよっか", 27: "にじゅうしちにち", 29: "にじゅうくにち"
    };
    if (dayMap[day]) return dayMap[day];
    
    const tens = ["", "じゅう", "にじゅう", "さんじゅう"];
    const ones = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
    let t = Math.floor(day / 10);
    let u = day % 10;
    return (tens[t] || "") + (ones[u] || "") + "にち";
}

// 6. Quy tắc đếm Giờ
function getJapaneseTime(h, m, period) {
    const hours = ["", "いちじ", "にじ", "さんじ", "よじ", "ごじ", "ろくじ", "しちじ", "はちじ", "くじ", "じゅうじ", "じゅういちじ", "じゅうにじ"];
    const minutes = ["", "いっぷん", "にふん", "さんぷん", "よんぷん", "ごふん", "ろっぷん", "ななふん", "はっぷん", "きゅうふん", "じゅっぷん"];
    
    let jpPeriod = (period === "AM") ? "ごぜん" : "ごご";
    let resH = hours[h % 12 === 0 ? 12 : h % 12];
    
    let resM = "";
    if (m === 0) {
        resM = "ちょうど";
    } else if (m % 10 === 0) {
        const tenMins = ["", "じゅっぷん", "にじゅっぷん", "さんじゅっぷん", "よんじゅっぷん", "ごじゅっぷん"];
        resM = tenMins[m / 10];
    } else {
        let t = Math.floor(m / 10);
        let u = m % 10;
        let mPrefix = (t === 1 ? "じゅう" : (t === 2 ? "にじゅう" : (t === 3 ? "さんじゅう" : (t === 4 ? "よんじゅう" : (t === 5 ? "ごじゅう" : "")))));
        resM = mPrefix + minutes[u];
    }
    
    return `${jpPeriod}\n${resH}\n${resM}`;
}

// ==========================================
// BẢNG DỮ LIỆU ĐẾM ĐỒ VẬT / CON VẬT (12 課)
// ==========================================
const counterTables = {
    tsu: {
        label: "Cái (đồ vật chung)",
        question: "Mấy cái? (Đồ vật chung)",
        qJp: "いくつ",
        items: ["ひとつ", "ふたつ", "みっつ", "よっつ", "いつつ", "むっつ", "ななつ", "やっつ", "ここのつ", "とお"]
    },
    nin: {
        label: "Người",
        question: "Mấy người?",
        qJp: "なんにん",
        items: ["ひとり", "ふたり", "さんにん", "よにん", "ごにん", "ろくにん", "ななにん", "はちにん", "きゅうにん", "じゅうにん"]
    },
    satsu: {
        label: "Quyển / Cuốn (Sách, tập)",
        question: "Mấy quyển / cuốn? (Sách, tập)",
        qJp: "なんさつ",
        items: ["いっさつ", "にさつ", "さんさつ", "よんさつ", "ごさつ", "ろくさつ", "ななさつ", "はっさつ", "きゅうさつ", "じゅっさつ"]
    },
    mai: {
        label: "Tờ / Tấm (Vật mỏng)",
        question: "Mấy tờ / tấm? (Giấy, áo)",
        qJp: "なんまい",
        items: ["いちまい", "にまい", "さんまい", "よんまい", "ごまい", "ろくまい", "ななまい", "はちまい", "きゅうまい", "じゅうまい"]
    },
    dai: {
        label: "Chiếc / Cái (Thiết bị, xe)",
        question: "Mấy chiếc / cái? (Máy móc, xe)",
        qJp: "なんだい",
        items: ["いちだい", "にだい", "さんだい", "よんだい", "ごだい", "ろくだい", "ななだい", "はちだい", "きゅうだい", "じゅうだい"]
    },
    ko: {
        label: "Cái / Hòn (Vật nhỏ)",
        question: "Mấy cái / hòn? (Vật nhỏ)",
        qJp: "なんこ",
        items: ["いっこ", "にこ", "さんこ", "よんこ", "ごこ", "ろっこ", "ななこ", "はっこ", "きゅうこ", "じゅっこ"]
    },
    hiki: {
        label: "Con (Động vật nhỏ)",
        question: "Mấy con? (Chó, mèo, cá)",
        qJp: "なんびき",
        items: ["いっぴき", "にひき", "さんびき", "よんひき", "ごひき", "ろっぴき", "ななひき", "はっぴき", "きゅうひき", "じゅっぴき"]
    },
    hai: {
        label: "Ly / Cốc / Bát",
        question: "Mấy ly / cốc / bát?",
        qJp: "なんぱい",
        items: ["いっぱい", "にはい", "さんばい", "よんはい", "ごはい", "ろっぱい", "ななはい", "はっぱい", "きゅうはい", "じゅっぱい"]
    },
    zoku: {
        label: "Đôi (Giày, tất)",
        question: "Mấy đôi? (Giày, tất)",
        qJp: "なんぞく",
        items: ["いっそく", "にそく", "さんぞく", "よんそく", "ごそく", "ろくそく", "ななそく", "はっそく", "きゅうそく", "じゅっそく"]
    },
    hon: {
        label: "Cây / Chai (Vật thon dài)",
        question: "Mấy cây / chai? (Bút, dù, chai)",
        qJp: "なんぼん",
        items: ["いっぽん", "にほん", "さんぼん", "よんほん", "ごほん", "ろっぽん", "ななほん", "はっぽん", "きゅうほん", "じゅっぽん"]
    }
};

// ==========================================
// PHẦN 2: BỘ MÁY SẢN XUẤT TỪ VỰNG NGẪU NHIÊN
// ==========================================
const CounterGenerators = {
    // 1. Sản xuất đếm các vật loại (Tất cả cách đếm ở Bài 12: 10 loại đếm x amount câu mỗi loại)
    demvat: function(amountPerCategory) {
        let result = {};
        const keys = Object.keys(counterTables);
        
        keys.forEach(key => {
            let group = counterTables[key];
            let generated = new Set();
            let attempts = 0;
            let targetCount = Math.min(amountPerCategory, 10);

            while (generated.size < targetCount && attempts < 100) {
                attempts++;
                // Tỷ lệ 20% ra câu hỏi tổng quát, 80% ra số đếm cụ thể (1-10)
                if (Math.random() < 0.2 && !generated.has("question")) {
                    result[group.question] = group.qJp;
                    generated.add("question");
                } else {
                    let num = Math.floor(Math.random() * 10) + 1; // 1 đến 10
                    if (!generated.has(num)) {
                        let unitName = group.label.split(' ')[0].toLowerCase();
                        let vnLabel = `${num} ${unitName}`;
                        
                        if (key === "tsu") {
                            vnLabel = `${num} cái (đồ vật chung)`;
                        }
                        
                        result[vnLabel] = group.items[num - 1];
                        generated.add(num);
                    }
                }
            }
        });
        return result;
    },

    // 2. Sản xuất số tuổi (1 - 100)
    tuoi: function(amount) {
        let result = {};
        let maxAmount = Math.min(amount, 100);
        let generated = new Set();
        let attempts = 0;
        while(generated.size < maxAmount && attempts < 500) {
            attempts++;
            let r = Math.floor(Math.random() * 100) + 1;
            generated.add(r);
        }
        generated.forEach(num => result[num + " tuổi"] = getJapaneseAge(num));
        return result;
    },

    // 3. Sản xuất số tầng (1 - 30)
    tang: function(amount) {
        let result = {};
        let maxAmount = Math.min(amount, 30);
        let generated = new Set();
        let attempts = 0;
        while(generated.size < maxAmount && attempts < 500) {
            attempts++;
            let r = Math.floor(Math.random() * 30) + 1;
            generated.add(r);
        }
        generated.forEach(num => result["Tầng " + num] = getJapaneseFloor(num));
        return result;
    },

    // 4. Sản xuất số Tiền
    tien: function(amount) {
        let result = {};
        let generated = new Set();
        
        const moneyRanges = [
            { min: 10, max: 99 },             
            { min: 100, max: 999 },           
            { min: 1000, max: 9999 },         
            { min: 10000, max: 99999 },       
            { min: 100000, max: 999999 },     
            { min: 1000000, max: 9999999 }    
        ];

        for (let i = 0; i < amount; i++) {
            let range = moneyRanges[i % moneyRanges.length];
            let r = 0;
            let attempts = 0;
            
            do {
                attempts++;
                r = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                
                if (r >= 1000000) r = Math.floor(r / 10000) * 10000; 
                else if (r >= 100000) r = Math.floor(r / 1000) * 1000; 
                else if (r >= 1000) r = Math.floor(r / 100) * 100; 
                else if (r >= 100) r = Math.floor(r / 10) * 10; 
                
            } while ((generated.has(r) || r === 0) && attempts < 100);

            if (r > 0 && !generated.has(r)) {
                generated.add(r);
            }
        }

        generated.forEach(num => {
            let vnFormat = num.toLocaleString('vi-VN') + " yên";
            result[vnFormat] = getJapaneseYen(num);
        });
        
        return result;
    },

    // 5. Sản xuất thứ trong tuần
    thu: function(amount) {
        let result = {};
        let maxAmount = Math.min(amount, daysOfWeek.length);
        let shuffled = [...daysOfWeek].sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, maxAmount);
        selected.forEach(item => result[item.vn] = item.jp);
        return result;
    },

    // 6. Sản xuất ngày tháng
    ngaythang: function(amount) {
        let result = {};
        for(let i = 0; i < amount; i++) {
            let m = Math.floor(Math.random() * 12) + 1;
            let d = Math.floor(Math.random() * 28) + 1;
            let y = 2024 + Math.floor(Math.random() * 3);
            
            let vn = `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
            
            let jpYear = y + "ねん";
            let jpMonth = m + "がつ";
            let jpDay = getJapaneseDay(d);
            
            result[vn] = `${jpYear}\n${jpMonth}\n${jpDay}`;
        }
        return result;
    },

    // 7. Sản xuất Giờ/Phút
    gio: function(amount) {
        let result = {};
        for(let i = 0; i < amount; i++) {
            let h = Math.floor(Math.random() * 12) + 1;
            let m = Math.floor(Math.random() * 60);
            let period = Math.random() > 0.5 ? "AM" : "PM";
            let vn = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
            
            result[vn] = getJapaneseTime(h, m, period);
        }
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