/**
 * File: js/data/chapters.js
 * Cấu hình danh mục tất cả Session học tập, bài học Từ vựng, Kanji (Theo Bộ, Theo Bài, Theo Trang),
 * Katakana theo chủ đề, Tha động từ theo phần và Đếm số theo chuyên mục.
 */

// ==========================================================================
// 1. CẤU HÌNH CHI TIẾT 10 TRANG KANJI PART 1 - N5 (ĐÔNG DU HT400 & CƠ BẢN)
// ==========================================================================

const KANJI_PAGES_CONFIG = [
    {
        id: 'kanji0',
        page: 0,
        label: 'Trang 0',
        shortName: 'Kanji T.0',
        title: 'Kanji Cơ Bản N5',
        desc: '104 chữ Hán cơ bản thường gặp nhất N5',
        range: '十 (Thập) ➔ 羊 (Dương)',
        samples: ['十', '土', '夫', '走'],
        count: 104,
        getData: () => (typeof vocabKanjiTrang0 !== 'undefined' ? vocabKanjiTrang0 : null)
    },
    {
        id: 'kanji1',
        page: 1,
        label: 'Trang 1',
        shortName: 'Kanji T.1',
        title: 'Đông Du HT400 - Bài 1',
        desc: '50 chữ Hán N5 & Bộ Nhân đứng',
        range: '一 (Nhất) ➔ 円 (Viên)',
        samples: ['一', '七', '下', '円'],
        count: 50,
        getData: () => (typeof vocabKanjiTrang1 !== 'undefined' ? vocabKanjiTrang1 : null)
    },
    {
        id: 'kanji2',
        page: 2,
        label: 'Trang 2',
        shortName: 'Kanji T.2',
        title: 'Đông Du HT400 - Bài 2',
        desc: '50 chữ Hán N5 & Bộ Đao, Chủy, Hựu',
        range: '写 (Tả) ➔ 地 (Địa)',
        samples: ['写', '冷', '出', '地'],
        count: 50,
        getData: () => (typeof vocabKanjiTrang2 !== 'undefined' ? vocabKanjiTrang2 : null)
    },
    {
        id: 'kanji3',
        page: 3,
        label: 'Trang 3',
        shortName: 'Kanji T.3',
        title: 'Đông Du HT400 - Bài 3',
        desc: '50 chữ Hán N5 & Bộ Truy, Miên, Thốn',
        range: '堂 (Đường) ➔ 己 (Kỷ)',
        samples: ['堂', '場', '冬', '己'],
        count: 50,
        getData: () => (typeof vocabKanjiTrang3 !== 'undefined' ? vocabKanjiTrang3 : null)
    },
    {
        id: 'kanji4',
        page: 4,
        label: 'Trang 4',
        shortName: 'Kanji T.4',
        title: 'Đông Du HT400 - Bài 4',
        desc: '50 chữ Hán N5 & Bộ Nghiễm, Dẫn, Cung, Thảo, Sước, Ấp',
        range: '巾 (Cân) ➔ 阝 (Ấp)',
        samples: ['巾', '市', '花', '阝'],
        count: 50,
        getData: () => (typeof vocabKanjiTrang4 !== 'undefined' ? vocabKanjiTrang4 : null)
    },
    {
        id: 'kanji5',
        page: 5,
        label: 'Trang 5',
        shortName: 'Kanji T.5',
        title: 'Đông Du HT400 - Bài 5',
        desc: '50 chữ Hán N5 & Bộ Phụ, Tâm, Hộ, Thủ, Phộc, Cân',
        range: '部 (Bộ) ➔ 暗 (Ám)',
        samples: ['部', '都', '新', '暗'],
        count: 50,
        getData: () => (typeof vocabKanjiTrang5 !== 'undefined' ? vocabKanjiTrang5 : null)
    },
    {
        id: 'kanji6',
        page: 6,
        label: 'Trang 6',
        shortName: 'Kanji T.6',
        title: 'Đông Du HT400 - Bài 6',
        desc: '50 chữ Hán N5 & Bộ Ngạt, 3 chấm Thủy',
        range: '曜 (Diệu) ➔ 漢 (Hán)',
        samples: ['曜', '書', '海', '漢'],
        count: 50,
        getData: () => (typeof vocabKanjiTrang6 !== 'undefined' ? vocabKanjiTrang6 : null)
    },
    {
        id: 'kanji7',
        page: 7,
        label: 'Trang 7',
        shortName: 'Kanji T.7',
        title: 'Đông Du HT400 - Bài 7',
        desc: '50 chữ Hán N5 & Bộ Ngưu, Nạch, Thỉ, Thị, Hòa, Trúc, Tỷ',
        range: '火 (Hỏa) ➔ 約 (Ước)',
        samples: ['火', '生', '町', '約'],
        count: 50,
        getData: () => (typeof vocabKanjiTrang7 !== 'undefined' ? vocabKanjiTrang7 : null)
    },
    {
        id: 'kanji8',
        page: 8,
        label: 'Trang 8',
        shortName: 'Kanji T.8',
        title: 'Đông Du HT400 - Bài 8',
        desc: '50 chữ Hán N5 & Bộ Lão, Dậu',
        range: '紙 (Chỉ) ➔ 酉 (Dậu)',
        samples: ['紙', '話', '車', '酉'],
        count: 50,
        getData: () => (typeof vocabKanjiTrang8 !== 'undefined' ? vocabKanjiTrang8 : null)
    },
    {
        id: 'kanji9',
        page: 9,
        label: 'Trang 9',
        shortName: 'Kanji T.9',
        title: 'Đông Du HT400 - Bài 9',
        desc: '37 chữ Hán N5 & Bộ Chuy, Hiệt, Thực',
        range: '酒 (Tửu) ➔ 黒 (Hắc)',
        samples: ['酒', '銀', '電', '黒'],
        count: 37,
        getData: () => (typeof vocabKanjiTrang9 !== 'undefined' ? vocabKanjiTrang9 : null)
    }
];

/**
 * Gộp dữ liệu từ các trang Kanji đang chọn của một Part bất kỳ
 */
function getSelectedKanjiPartData(pagesConfig, selectedSet) {
    const combined = {};
    pagesConfig.forEach(page => {
        if (selectedSet.has(page.id)) {
            const d = page.getData();
            if (d) Object.assign(combined, d);
        }
    });
    return combined;
}

// ==========================================================================
// 1B. CẤU HÌNH CHI TIẾT KANJI PART 2 - N4 (ĐÔNG DU HT800 - TÁCH RIÊNG HT400)
// ==========================================================================

const KANJI_800_PAGES_CONFIG = [
    {
        id: 'kanji800_1',
        page: 1,
        label: 'Trang 1',
        shortName: 'K800 T.1',
        title: 'Đông Du HT800 - Trang 1',
        desc: '38 chữ & bộ mới ngoài HT400 (Nhân đứng, Đao, Băng)',
        range: '久 (Cửu) ➔ 加 (Gia)',
        samples: ['久', '代', '優', '加'],
        count: 38,
        getData: () => (typeof vocabKanji800Trang1 !== 'undefined' ? vocabKanji800Trang1 : null)
    },
    {
        id: 'kanji800_2',
        page: 2,
        label: 'Trang 2',
        shortName: 'K800 T.2',
        title: 'Đông Du HT800 - Trang 2',
        desc: '48 chữ & bộ mới ngoài HT400 (Lực, Khẩu, Vi, Thổ)',
        range: '助 (Trợ) ➔ 壁 (Bích)',
        samples: ['助', '団', '和', '壁'],
        count: 48,
        getData: () => (typeof vocabKanji800Trang2 !== 'undefined' ? vocabKanji800Trang2 : null)
    },
    {
        id: 'kanji800_3',
        page: 3,
        label: 'Trang 3',
        shortName: 'K800 T.3',
        title: 'Đông Du HT800 - Trang 3',
        desc: '50 chữ mới ngoài HT400 (Nữ, Tử, Miên, Thi, Sơn, Cân, Nghiễm, Tâm)',
        range: '夢 (Mộng) ➔ 怖 (Bố)',
        samples: ['夢', '定', '島', '常'],
        count: 50,
        getData: () => (typeof vocabKanji800Trang3 !== 'undefined' ? vocabKanji800Trang3 : null)
    },
    {
        id: 'kanji800_4',
        page: 4,
        label: 'Trang 4',
        shortName: 'K800 T.4',
        title: 'Đông Du HT800 - Trang 4',
        desc: '50 chữ & bộ mới ngoài HT400 (Tâm, Qua, Thủ, Phộc, Nhật, Nguyệt)',
        range: '急 (Cấp) ➔ 材 (Tài)',
        samples: ['急', '愛', '戦', '星'],
        count: 50,
        getData: () => (typeof vocabKanji800Trang4 !== 'undefined' ? vocabKanji800Trang4 : null)
    },
    {
        id: 'kanji800_5',
        page: 5,
        label: 'Trang 5',
        shortName: 'K800 T.5',
        title: 'Đông Du HT800 - Trang 5',
        desc: '50 chữ mới ngoài HT400 (Mộc, Chỉ, Ngạt, Thù, Thị, Thủy)',
        range: '杯 (Bôi) ➔ 湯 (Thang)',
        samples: ['板', '橋', '機', '流'],
        count: 50,
        getData: () => (typeof vocabKanji800Trang5 !== 'undefined' ? vocabKanji800Trang5 : null)
    },
    {
        id: 'kanji800_6',
        page: 6,
        label: 'Trang 6',
        shortName: 'K800 T.6',
        title: 'Đông Du HT800 - Trang 6',
        desc: '50 chữ & bộ mới ngoài HT400 (Thủy, Hỏa, Khuyển, Ngọc, Nạch, Mục, Thạch, Thị)',
        range: '湾 (Loan) ➔ 科 (Khoa)',
        samples: ['満', '無', '猫', '神'],
        count: 50,
        getData: () => (typeof vocabKanji800Trang6 !== 'undefined' ? vocabKanji800Trang6 : null)
    },
    {
        id: 'kanji800_7',
        page: 7,
        label: 'Trang 7',
        shortName: 'K800 T.7',
        title: 'Đông Du HT800 - Trang 7',
        desc: '50 chữ & bộ mới ngoài HT400 (Hòa, Huyệt, Trúc, Mễ, Ty, Võng, Nhục)',
        range: '程 (Trình) ➔ 腹 (Phúc)',
        samples: ['究', '算', '絵', '育'],
        count: 50,
        getData: () => (typeof vocabKanji800Trang7 !== 'undefined' ? vocabKanji800Trang7 : null)
    },
    {
        id: 'kanji800_8',
        page: 8,
        label: 'Trang 8',
        shortName: 'K800 T.8',
        title: 'Đông Du HT800 - Trang 8',
        desc: '50 chữ & bộ mới ngoài HT400 (Chu, Thảo, Y, Kiến, Giác, Ngôn, Đậu)',
        range: '船 (Thuyền) ➔ 豚 (Đồn)',
        samples: ['船', '葉', '覚', '調'],
        count: 50,
        getData: () => (typeof vocabKanji800Trang8 !== 'undefined' ? vocabKanji800Trang8 : null)
    },
    {
        id: 'kanji800_9',
        page: 9,
        label: 'Trang 9',
        shortName: 'K800 T.9',
        title: 'Đông Du HT800 - Trang 9',
        desc: '50 chữ mới ngoài HT400 (Bối, Tẩu, Túc, Xa, Sước, Kim, Môn, Phụ)',
        range: '負 (Phụ) ➔ 際 (Tế)',
        samples: ['費', '質', '達', '鉄'],
        count: 50,
        getData: () => (typeof vocabKanji800Trang9 !== 'undefined' ? vocabKanji800Trang9 : null)
    },
    {
        id: 'kanji800_10',
        page: 10,
        label: 'Trang 10',
        shortName: 'K800 T.10',
        title: 'Đông Du HT800 - Trang 10',
        desc: '41 chữ & bộ mới ngoài HT400 (Chuy, Vũ, Cách, Hiệt, Mã, Tỵ, Xỉ & Mở rộng Bộ 1–32)',
        range: '隣 (Lân) ➔ 韓 (Hàn)',
        samples: ['集', '靴', '願', '保'],
        count: 41,
        getData: () => (typeof vocabKanji800Trang10 !== 'undefined' ? vocabKanji800Trang10 : null)
    }
];

// ==========================================================================
// 1C. DANH SÁCH CÁC PART KANJI THEO TRANG (PART 1 N5, PART 2 N4...)
// ==========================================================================

const KANJI_PARTS_CONFIG = [
    {
        id: 'kanji',
        partNumber: 1,
        partBadge: 'PART 1 • N5',
        label: 'Kanji P1 (N5)',
        shortName: 'Kanji P1',
        title: 'Part 1 • N5 — Cơ Bản & Đông Du HT400',
        modalTitle: 'Kanji Part 1 — N5 (Cơ Bản & Đông Du HT400)',
        desc: '541 chữ Hán N5 & Cơ bản (10 trang: Trang 0 ➔ 9)',
        allSelectedLabel: '541 chữ Hán N5 & Cơ bản',
        icon: '🈁',
        tagClass: 'tag-emerald',
        isSpecial: true,
        isKanjiPageGroup: true,
        isKanjiSection: true,
        pagesConfig: KANJI_PAGES_CONFIG,
        selectedPages: new Set(),
        getData() {
            return getSelectedKanjiPartData(this.pagesConfig, this.selectedPages);
        }
    },
    {
        id: 'kanji800',
        partNumber: 2,
        partBadge: 'PART 2 • N4',
        label: 'Kanji P2 (N4)',
        shortName: 'Kanji P2',
        title: 'Part 2 • N4 — Đông Du HT800 Mở Rộng',
        modalTitle: 'Kanji Part 2 — N4 (Đông Du HT800)',
        desc: '477 chữ & bộ mới ngoài HT400 (10 trang: Trang 1 ➔ 10)',
        allSelectedLabel: '477 chữ & bộ mới N4 (HT800)',
        icon: '🈯',
        tagClass: 'tag-emerald',
        isSpecial: true,
        isKanjiPageGroup: true,
        isKanjiSection: true,
        pagesConfig: KANJI_800_PAGES_CONFIG,
        selectedPages: new Set(),
        getData() {
            return getSelectedKanjiPartData(this.pagesConfig, this.selectedPages);
        }
    }
];

const selectedKanjiPages = KANJI_PARTS_CONFIG[0].selectedPages;
const selectedKanji800Pages = KANJI_PARTS_CONFIG[1].selectedPages;

function getSelectedKanjiVocabData() {
    return KANJI_PARTS_CONFIG[0].getData();
}

function getSelectedKanji800VocabData() {
    return KANJI_PARTS_CONFIG[1].getData();
}

// ==========================================================================
// 1D. CẤU HÌNH KANJI THEO BỘ THỦ TRÊN TRANG CHỦ (178 BỘ ĐÔNG DU)
// ==========================================================================

const selectedHomeRadicals = new Set();
let homeRadicalIncludeComponents = true;
let homeRadicalLevelFilter = 'all';

function getSelectedHomeRadicalsVocabData() {
    if (selectedHomeRadicals.size === 0 || typeof getKanjiByRadical !== 'function') {
        return {};
    }
    const vocabMap = {};
    const usedKeys = new Set();
    const seenChars = new Set();

    selectedHomeRadicals.forEach(radName => {
        const items = getKanjiByRadical(radName, {
            includeComponents: homeRadicalIncludeComponents,
            level: homeRadicalLevelFilter,
            includeRadicalEntry: true
        });
        items.forEach(item => {
            if (seenChars.has(item.char)) return;
            seenChars.add(item.char);
            let key = item.label || item.hanViet || item.char;
            if (usedKeys.has(key) && vocabMap[key] !== item.char) {
                key = `${key} [${item.char}]`;
            }
            usedKeys.add(key);
            vocabMap[key] = item.char;
        });
    });

    return vocabMap;
}

// ==========================================================================
// 1E. CẤU HÌNH KATAKANA TÁCH THEO 7 CHỦ ĐỀ / TRANG NHỎ (109 TỪ)
// ==========================================================================

const KATA_TOPIC_DEFINITIONS = [
    {
        id: 'kata_1',
        page: 1,
        label: 'Chủ đề 1',
        shortName: 'Kata CĐ.1',
        title: 'Quốc gia, Địa điểm & Cửa hàng',
        desc: 'Tên các nước, nhà hàng, siêu thị, cửa hàng tiện lợi & địa danh',
        icon: '🌍',
        samples: ['ベトナム', 'アメリカ', 'スーパー', 'コンビニ'],
        keys: [
            "Việt Nam", "Người Việt Nam", "Thái Lan", "Ấn Độ", "Anh (nước)", "Pháp", "Mỹ", "Đức", "Ý",
            "Nước Indonesia", "Nước Úc (Australia)", "Đức Mẹ Teresa", "Nhà hàng", "Siêu thị",
            "Cửa hàng bách hóa", "Cửa hàng tiện lợi", "Nhà vệ sinh", "Đỉnh Everest"
        ]
    },
    {
        id: 'kata_2',
        page: 2,
        label: 'Chủ đề 2',
        shortName: 'Kata CĐ.2',
        title: 'Đồ vật, Thiết bị & Công nghệ',
        desc: 'Tivi, máy ảnh, laptop, smartphone, văn phòng phẩm, email & internet',
        icon: '💻',
        samples: ['テレビ', 'カメラ', 'パソコン', 'スマホ'],
        keys: [
            "Kỹ sư", "Tivi", "Máy chụp hình", "Vở, quyển vở", "Máy lạnh", "Cái bút (pen)",
            "Bút bi (borupen)", "Bút chì bấm", "Điện thoại thông minh (Smartphone)",
            "Máy tính cá nhân (Laptop/PC)", "Thư điện tử", "Mạng internet", "Kính cửa sổ"
        ]
    },
    {
        id: 'kata_3',
        page: 3,
        label: 'Chủ đề 3',
        shortName: 'Kata CĐ.3',
        title: 'Phương tiện, Tiền tệ & Đơn vị đo',
        desc: 'Xe máy, xe buýt, taxi, Grab, tiền tệ (đồng, đô la) & đơn vị (cm, m, kg, %)',
        icon: '🚗',
        samples: ['バイク', 'バス', 'タクシー', 'メートル'],
        keys: [
            "Xe máy", "Xe máy, xe môtô", "Xe buýt", "Xe taxi", "Xe Mercedes", "Xe Grab",
            "~ đồng", "~ đô la", "Xen-ti-mét (cm)", "Ki-lô-mét (km) / Ki-lô-gam (kg)",
            "Mét (m)", "Kilôgam (kg)", "Phần trăm (%)"
        ]
    },
    {
        id: 'kata_4',
        page: 4,
        label: 'Chủ đề 4',
        shortName: 'Kata CĐ.4',
        title: 'Ẩm thực, Đồ uống & Dụng cụ ăn',
        desc: 'Cà phê, trà sữa, nước ép, bia, bánh mì, phở, bánh ngọt & muỗng, nĩa, dao',
        icon: '☕',
        samples: ['コーヒー', 'ビール', 'パン', 'スプーン'],
        keys: [
            "Cà phê", "Trà sữa", "Nước ép trái cây", "Bia", "Bánh mì",
            "Bánh khoai tây rán (Croquette)", "Cái muỗng", "Cái nĩa", "Con dao",
            "Bánh kem, bánh ngọt", "Kẹo sô-cô-la", "Phở ăn liền", "Bánh mì (Việt Nam)"
        ]
    },
    {
        id: 'kata_5',
        page: 5,
        label: 'Chủ đề 5',
        shortName: 'Kata CĐ.5',
        title: 'Âm nhạc, Phim ảnh & Thể thao',
        desc: 'Các dòng nhạc, thể loại phim, nhạc cụ, bóng đá, tennis, bơi lội, gym & giải trí',
        icon: '🎸',
        samples: ['アニメ', 'ギター', 'サッカー', 'テニス'],
        keys: [
            "Nhạc pop", "Nhạc jazz", "Nhạc rock", "Nhạc rap", "Nhạc cổ điển",
            "Phim truyền hình", "Phim kinh dị", "Phim hài", "Phim hành động", "Phim hoạt hình",
            "Đàn ghita", "Đàn piano", "Khiêu vũ, nhảy múa", "Youtube", "Bóng đá",
            "Quần vợt, tennis", "Trượt tuyết", "Môn đánh gôn (Golf)", "Chạy bộ (Jogging)",
            "Cầu lông", "Bóng chuyền", "Chơi (thể thao)", "Thể thao", "Karaoke",
            "Phòng tập Gym", "Đi dã ngoại (Hiking)", "Vé (vé vào cổng, vé tàu xe)",
            "Trò chơi (Game)", "Cắm trại (Camp)"
        ]
    },
    {
        id: 'kata_6',
        page: 6,
        label: 'Chủ đề 6',
        shortName: 'Kata CĐ.6',
        title: 'Động vật & Trái cây Katakana',
        desc: 'Tên các loài động vật và trái cây nhiệt đới viết bằng chữ Katakana',
        icon: '🐼',
        samples: ['ウサギ', 'パンダ', 'バナナ', 'マンゴー'],
        keys: [
            "Thú cưng", "Gà", "Chuột", "Cua", "Thỏ", "Rùa", "Hươu cao cổ", "Sư tử", "Gấu trúc",
            "Chuối", "Xoài", "Dưa lưới", "Cam", "Sầu riêng", "Dừa", "Dứa, thơm", "Đu đủ"
        ]
    },
    {
        id: 'kata_7',
        page: 7,
        label: 'Chủ đề 7',
        shortName: 'Kata CĐ.7',
        title: 'Trang phục, Quà tặng & Sự kiện',
        desc: 'Quần áo, phụ kiện thời trang, lễ hội, bài kiểm tra, làm thêm & đời sống',
        icon: '🎁',
        samples: ['シャツ', 'プレゼント', 'テスト', 'パーティー'],
        isFallbackGroup: true,
        keys: [
            "Màu hồng", "Đẹp trai", "Bài kiểm tra", "Bữa tiệc", "Bài báo cáo", "Việc làm thêm",
            "Áo sơ mi", "Quà tặng", "Lễ Giáng sinh (Noel)", "Hộ chiếu (Passport)",
            "Ngày lễ tình nhân (Valentine)", "Áo len", "Khăn tay", "Khăn quàng cổ, khăn choàng",
            "Chân váy (Skirt)", "Trang sức, nữ trang", "Khuyên tai, bông tai", "Giày cao gót",
            "Sự kiện (Event)", "Dấu tròn, ○ (đúng)"
        ]
    }
];

const selectedKataGroups = new Set();

function buildKataGroupData(groupDef) {
    if (typeof vocabKata === 'undefined' || !vocabKata) return {};
    const res = {};
    if (!groupDef.isFallbackGroup) {
        groupDef.keys.forEach(k => {
            if (Object.prototype.hasOwnProperty.call(vocabKata, k)) {
                res[k] = vocabKata[k];
            }
        });
        return res;
    }

    // Nhóm cuối gom cả các key khai báo và mọi key mới phát sinh trong vocabKata chưa thuộc nhóm 1..6
    const claimed = new Set();
    KATA_TOPIC_DEFINITIONS.forEach(g => {
        if (!g.isFallbackGroup) {
            g.keys.forEach(k => claimed.add(k));
        }
    });
    Object.keys(vocabKata).forEach(k => {
        if (!claimed.has(k)) {
            res[k] = vocabKata[k];
        }
    });
    return res;
}

const KATA_GROUPS_CONFIG = KATA_TOPIC_DEFINITIONS.map(def => ({
    ...def,
    get count() {
        return Object.keys(buildKataGroupData(def)).length;
    },
    getData() {
        return buildKataGroupData(def);
    }
}));

function getSelectedKataVocabData() {
    const combined = {};
    KATA_GROUPS_CONFIG.forEach(g => {
        if (selectedKataGroups.has(g.id)) {
            Object.assign(combined, g.getData());
        }
    });
    return combined;
}

// ==========================================================================
// 1F. CẤU HÌNH THA ĐỘNG TỪ TÁCH THEO PHẦN / TRANG NHỎ (34 CỤM TỪ)
// ==========================================================================

const selectedThaDongTuGroups = new Set();

const THA_DONG_TU_GROUPS_CONFIG = [
    {
        id: 'tdt_1',
        page: 1,
        label: 'Phần 1',
        shortName: 'Tha ĐT P.1',
        title: 'Sinh hoạt, Điện nước & Đồ dùng',
        desc: '12 cụm tha động từ về bật/tắt điện, mở cửa, đun nước & bảo quản đồ vật',
        range: '水を出す ➔ 電気を点ける',
        samples: ['水を出す', '電気を消す', 'ドアを開ける'],
        sliceStart: 0,
        sliceEnd: 12,
        get count() {
            return Object.keys(this.getData()).length;
        },
        getData() {
            if (typeof vocabThaDongTu === 'undefined' || !vocabThaDongTu) return {};
            return Object.fromEntries(Object.entries(vocabThaDongTu).slice(this.sliceStart, this.sliceEnd));
        }
    },
    {
        id: 'tdt_2',
        page: 2,
        label: 'Phần 2',
        shortName: 'Tha ĐT P.2',
        title: 'Sắp xếp, Đóng mở & Di chuyển',
        desc: '11 cụm tha động từ về dọn phòng, gửi đồ, khóa cửa, dừng xe & thay đổi kế hoạch',
        range: '気を付ける ➔ 猫を家の中に入れる',
        samples: ['部屋を片付ける', 'ドアを閉める', '車を止める'],
        sliceStart: 12,
        sliceEnd: 23,
        get count() {
            return Object.keys(this.getData()).length;
        },
        getData() {
            if (typeof vocabThaDongTu === 'undefined' || !vocabThaDongTu) return {};
            return Object.fromEntries(Object.entries(vocabThaDongTu).slice(this.sliceStart, this.sliceEnd));
        }
    },
    {
        id: 'tdt_3',
        page: 3,
        label: 'Phần 3',
        shortName: 'Tha ĐT P.3',
        title: 'Ăn uống, Liên lạc & Trạng thái',
        desc: '11 cụm tha động từ về nấu nướng, bày đĩa, gọi điện, xem tin tức & âm thanh',
        range: 'お皿を並べる ➔ 音を大きくする',
        samples: ['お皿を並べる', '電話を切る', 'ご飯を作る'],
        sliceStart: 23,
        sliceEnd: undefined,
        get count() {
            return Object.keys(this.getData()).length;
        },
        getData() {
            if (typeof vocabThaDongTu === 'undefined' || !vocabThaDongTu) return {};
            return Object.fromEntries(Object.entries(vocabThaDongTu).slice(this.sliceStart));
        }
    }
];

function getSelectedThaDongTuVocabData() {
    const combined = {};
    THA_DONG_TU_GROUPS_CONFIG.forEach(g => {
        if (selectedThaDongTuGroups.has(g.id)) {
            Object.assign(combined, g.getData());
        }
    });
    return combined;
}

// ==========================================================================
// 1G. CẤU HÌNH ĐẾM SỐ TÁCH THEO 7 CHUYÊN MỤC ĐẾM
// ==========================================================================

const selectedCounterGroups = new Set();

const COUNTER_GROUPS_CONFIG = [
    {
        id: 'dem_vat',
        generatorKey: 'demvat',
        label: 'Đếm đồ vật',
        shortName: 'Đếm Vật',
        title: 'Đếm Đồ vật, Người & Con vật (10 loại)',
        desc: '10 trợ số từ Bài 12: ～つ, ～人, ～冊, ～枚, ～台, ～個, ～匹, ～杯, ～足, ～本',
        icon: '📦',
        samples: ['ひとつ', 'ひとり', 'いっさつ', 'いっぴき'],
        defaultAmount: 5,
        getData(amount = 5) {
            if (typeof CounterGenerators !== 'undefined' && typeof CounterGenerators.demvat === 'function') {
                return CounterGenerators.demvat(amount);
            }
            return {};
        }
    },
    {
        id: 'dem_tuoi',
        generatorKey: 'tuoi',
        label: 'Đếm tuổi',
        shortName: 'Đếm Tuổi',
        title: 'Đếm Tuổi Tác (～才)',
        desc: 'Luyện đọc tuổi từ 1 ➔ 100 tuổi & các âm biến đặc biệt (1, 8, 10, 20 tuổi)',
        icon: '🎂',
        samples: ['いっさい', 'はっさい', 'じゅっさい', 'はたち'],
        defaultAmount: 8,
        getData(amount = 8) {
            if (typeof CounterGenerators !== 'undefined' && typeof CounterGenerators.tuoi === 'function') {
                return CounterGenerators.tuoi(amount);
            }
            return {};
        }
    },
    {
        id: 'dem_tang',
        generatorKey: 'tang',
        label: 'Đếm tầng',
        shortName: 'Đếm Tầng',
        title: 'Đếm Tầng Tòa Nhà (～階)',
        desc: 'Luyện đếm tầng 1 ➔ tầng 30 (Lưu ý biến âm tầng 1, 3, 6, 8, 10)',
        icon: '🏢',
        samples: ['いっかい', 'さんがい', 'ろっかい', 'じゅっかい'],
        defaultAmount: 8,
        getData(amount = 8) {
            if (typeof CounterGenerators !== 'undefined' && typeof CounterGenerators.tang === 'function') {
                return CounterGenerators.tang(amount);
            }
            return {};
        }
    },
    {
        id: 'dem_tien',
        generatorKey: 'tien',
        label: 'Đếm tiền',
        shortName: 'Đếm Tiền',
        title: 'Đếm Tiền Yên Nhật (～円)',
        desc: 'Đọc số tiền từ hàng chục Yên đến hàng triệu Yên theo đơn vị Vạn (～まん)',
        icon: '💴',
        samples: ['さんびゃくえん', 'はっせんえん', 'いちまんえん'],
        defaultAmount: 8,
        getData(amount = 8) {
            if (typeof CounterGenerators !== 'undefined' && typeof CounterGenerators.tien === 'function') {
                return CounterGenerators.tien(amount);
            }
            return {};
        }
    },
    {
        id: 'dem_thu',
        generatorKey: 'thu',
        label: 'Thứ ngày',
        shortName: 'Đếm Thứ',
        title: 'Thứ Trong Tuần (～曜日)',
        desc: '7 thứ trong tuần từ Thứ Hai (月曜日) đến Chủ Nhật (日曜日)',
        icon: '📅',
        samples: ['げつようび', 'すいようび', 'きんようび', 'にちようび'],
        defaultAmount: 7,
        getData(amount = 7) {
            if (typeof CounterGenerators !== 'undefined' && typeof CounterGenerators.thu === 'function') {
                return CounterGenerators.thu(amount);
            }
            return {};
        }
    },
    {
        id: 'dem_ngay',
        generatorKey: 'ngaythang',
        label: 'Ngày tháng',
        shortName: 'Ngày Tháng',
        title: 'Ngày, Tháng & Năm (～年～月～日)',
        desc: 'Luyện ngày đặc biệt mùng 1 ➔ 10, ngày 14, 20, 24 và kết hợp Năm - Tháng - Ngày',
        icon: '🗓️',
        samples: ['ついたち', 'ふつか', 'みっか', 'はつか'],
        defaultAmount: 8,
        getData(amount = 8) {
            if (typeof CounterGenerators !== 'undefined' && typeof CounterGenerators.ngaythang === 'function') {
                return CounterGenerators.ngaythang(amount);
            }
            return {};
        }
    },
    {
        id: 'dem_gio',
        generatorKey: 'gio',
        label: 'Giờ phút',
        shortName: 'Giờ Phút',
        title: 'Giờ & Phút (午前 / 午後 ～時～分)',
        desc: 'Đọc giờ sáng (ごぜん), giờ chiều (ごご) & quy tắc biến âm phút (～ぷん / ～ふん)',
        icon: '⏰',
        samples: ['ごぜん', 'よじ', 'くぷん', 'じゅっぷん'],
        defaultAmount: 8,
        getData(amount = 8) {
            if (typeof CounterGenerators !== 'undefined' && typeof CounterGenerators.gio === 'function') {
                return CounterGenerators.gio(amount);
            }
            return {};
        }
    }
];

function getSelectedCountersVocabData(amount = 5) {
    const combined = {};
    COUNTER_GROUPS_CONFIG.forEach(g => {
        if (selectedCounterGroups.has(g.id)) {
            Object.assign(combined, g.getData(g.defaultAmount || amount));
        }
    });
    return combined;
}

// ==========================================================================
// 2. CẤU HÌNH 3 CHẶNG TỪ VỰNG MINNA N5 (BÀI 01 -> BÀI 26)
// ==========================================================================

const VOCAB_STAGES_CONFIG = [
    {
        id: 'stage_1',
        badge: 'CHẶNG 1 • BÀI 01–10',
        title: 'Giao Tiếp & Từ Vựng Nền Tảng',
        desc: '10 bài đầu: Chào hỏi, Đồ vật, Nơi chốn, Thời gian, Tính từ, Động từ & Gia đình',
        icon: '🌱',
        chapterIds: ['chuong1', 'chuong2', 'chuong3', 'chuong4', 'chuong5', 'chuong6', 'chuong7', 'chuong8', 'chuong9', 'chuong10']
    },
    {
        id: 'stage_2',
        badge: 'CHẶNG 2 • BÀI 11–19',
        title: 'Mở Rộng Ngữ Cảnh & Đời Sống',
        desc: '9 bài giữa: Chuyển động, Vị trí, Cơ thể, Đô thị, Thiên nhiên, Trải nghiệm & Sức khỏe',
        icon: '🌿',
        chapterIds: ['chuong11', 'chuong12', 'chuong13a', 'chuong13b', 'chuong15', 'chuong16', 'chuong17', 'chuong18', 'chuong19']
    },
    {
        id: 'stage_3',
        badge: 'CHẶNG 3 • BÀI 21–26',
        title: 'Tổng Hợp & Giao Tiếp Nâng Cao N5',
        desc: '6 bài cuối: Quy cách, Công sở, Quà tặng, Mời mọc, Thử thách & Hoạt động',
        icon: '🌳',
        chapterIds: ['chuong21', 'chuong22', 'chuong23', 'chuong24', 'chuong25', 'chuong26']
    }
];

// ==========================================================================
// 3. CẤU HÌNH DANH MỤC CÁC BÀI HỌC TRÊN HỆ THỐNG
// ==========================================================================

const CHAPTERS_CONFIG = [
    {
        id: 'chuong1',
        stageId: 'stage_1',
        label: 'Bài 01',
        shortName: 'Ch.01',
        title: 'Chào hỏi & Nghề nghiệp',
        desc: 'Từ vựng giao tiếp cơ bản, tuổi tác, quốc gia & nghề nghiệp',
        icon: '👋',
        tag: 'Bài 01',
        tagClass: '',
        getData: () => (typeof vocabChuong1 !== 'undefined' ? vocabChuong1 : null)
    },
    {
        id: 'chuong2',
        stageId: 'stage_1',
        label: 'Bài 02',
        shortName: 'Ch.02',
        title: 'Đồ vật & Sở hữu',
        desc: 'Đồ dùng học tập, vật dụng văn phòng & đại từ chỉ định',
        icon: '💼',
        tag: 'Bài 02',
        tagClass: '',
        getData: () => (typeof vocabChuong2 !== 'undefined' ? vocabChuong2 : null)
    },
    {
        id: 'chuong3',
        stageId: 'stage_1',
        label: 'Bài 03',
        shortName: 'Ch.03',
        title: 'Nơi chốn & Phương hướng',
        desc: 'Địa điểm, vị trí, giá tiền & phòng ban trong công ty',
        icon: '🏢',
        tag: 'Bài 03',
        tagClass: '',
        getData: () => (typeof vocabChuong3 !== 'undefined' ? vocabChuong3 : null)
    },
    {
        id: 'chuong4',
        stageId: 'stage_1',
        label: 'Bài 04',
        shortName: 'Ch.04',
        title: 'Thời gian & Sự kiện',
        desc: 'Giờ giấc, thứ trong tuần, ngày tháng & mốc thời gian',
        icon: '⏰',
        tag: 'Bài 04',
        tagClass: '',
        getData: () => (typeof vocabChuong4 !== 'undefined' ? vocabChuong4 : null)
    },
    {
        id: 'chuong5',
        stageId: 'stage_1',
        label: 'Bài 05',
        shortName: 'Ch.05',
        title: 'Các tính từ',
        desc: 'Tính từ đuôi い và đuôi な thông dụng trong đời sống',
        icon: '⭐',
        tag: 'Bài 05',
        tagClass: '',
        getData: () => (typeof vocabChuong5 !== 'undefined' ? vocabChuong5 : null)
    },
    {
        id: 'chuong6',
        stageId: 'stage_1',
        label: 'Bài 06',
        shortName: 'Ch.06',
        title: 'Các động từ P1',
        desc: 'Động từ hành động thường ngày, ăn uống, xem đọc & giải trí',
        icon: '🏃',
        tag: 'Bài 06',
        tagClass: '',
        getData: () => (typeof vocabChuong6 !== 'undefined' ? vocabChuong6 : null)
    },
    {
        id: 'chuong7',
        stageId: 'stage_1',
        label: 'Bài 07',
        shortName: 'Ch.07',
        title: 'Động từ P2 & Danh từ',
        desc: 'Công cụ, phương tiện trao đổi, tặng nhận & gia đình',
        icon: '🎁',
        tag: 'Bài 07',
        tagClass: '',
        getData: () => (typeof vocabChuong7 !== 'undefined' ? vocabChuong7 : null)
    },
    {
        id: 'chuong8',
        stageId: 'stage_1',
        label: 'Bài 08',
        shortName: 'Ch.08',
        title: 'Phương tiện & Đồ dùng',
        desc: 'Phương tiện đi lại, bưu điện & dụng cụ thường nhật',
        icon: '🚗',
        tag: 'Bài 08',
        tagClass: '',
        getData: () => (typeof vocabChuong8 !== 'undefined' ? vocabChuong8 : null)
    },
    {
        id: 'chuong9',
        stageId: 'stage_1',
        label: 'Bài 09',
        shortName: 'Ch.09',
        title: 'Thời tiết & Trạng thái',
        desc: 'Khí hậu bốn mùa, trạng thái cơ thể & cảm xúc',
        icon: '☀️',
        tag: 'Bài 09',
        tagClass: '',
        getData: () => (typeof vocabChuong9 !== 'undefined' ? vocabChuong9 : null)
    },
    {
        id: 'chuong10',
        stageId: 'stage_1',
        label: 'Bài 10',
        shortName: 'Ch.10',
        title: 'Tần suất & Gia đình',
        desc: 'Phó từ chỉ mức độ, tần suất & cách xưng hô gia đình',
        icon: '👨‍👩‍👧',
        tag: 'Bài 10',
        tagClass: '',
        getData: () => (typeof vocabChuong10 !== 'undefined' ? vocabChuong10 : null)
    },
    {
        id: 'chuong11',
        stageId: 'stage_2',
        label: 'Bài 11',
        shortName: 'Ch.11',
        title: 'Động từ chuyển động',
        desc: 'Đi, đến, về, chuyển động không gian & phương hướng',
        icon: '🚶',
        tag: 'Bài 11',
        tagClass: '',
        getData: () => (typeof vocabChuong11 !== 'undefined' ? vocabChuong11 : null)
    },
    {
        id: 'chuong12',
        stageId: 'stage_2',
        label: 'Bài 12',
        shortName: 'Ch.12',
        title: 'Tồn tại, Vị trí & Động thực vật',
        desc: 'Có ở đâu (います/あります), vị trí không gian & thế giới tự nhiên',
        icon: '🌲',
        tag: 'Bài 12',
        tagClass: '',
        getData: () => (typeof vocabChuong12 !== 'undefined' ? vocabChuong12 : null)
    },
    {
        id: 'chuong13a',
        stageId: 'stage_2',
        label: 'Bài 13A',
        shortName: 'Ch.13A',
        title: 'Cơ thể, Môn học & Đồ ăn',
        desc: 'Bộ phận cơ thể, thể thao, môn học, màu sắc & món ăn',
        icon: '🍱',
        tag: 'Bài 13A',
        tagClass: '',
        getData: () => (typeof vocabChuong13a !== 'undefined' ? vocabChuong13a : null)
    },
    {
        id: 'chuong13b',
        stageId: 'stage_2',
        label: 'Bài 13B',
        shortName: 'Ch.13B',
        title: 'Động từ, Tính từ & Mở rộng',
        desc: 'Động từ, tính từ sở thích & từ vựng mở rộng',
        icon: '🎨',
        tag: 'Bài 13B',
        tagClass: '',
        getData: () => (typeof vocabChuong13b !== 'undefined' ? vocabChuong13b : null)
    },
    {
        id: 'chuong15',
        stageId: 'stage_2',
        label: 'Bài 15',
        shortName: 'Ch.15',
        title: 'Đô thị, Xã hội & So sánh',
        desc: 'Dân số, kinh tế, dinh dưỡng & nơi chốn',
        icon: '🏙️',
        tag: 'Bài 15',
        tagClass: '',
        getData: () => (typeof vocabChuong15 !== 'undefined' ? vocabChuong15 : null)
    },
    {
        id: 'chuong16',
        stageId: 'stage_2',
        label: 'Bài 16',
        shortName: 'Ch.16',
        title: 'Thiên nhiên & Cách làm (~方)',
        desc: 'Biến đổi trạng thái, thời tiết & cách thức',
        icon: '🌦️',
        tag: 'Bài 16',
        tagClass: '',
        getData: () => (typeof vocabChuong16 !== 'undefined' ? vocabChuong16 : null)
    },
    {
        id: 'chuong17',
        stageId: 'stage_2',
        label: 'Bài 17',
        shortName: 'Ch.17',
        title: 'Hành động, Đời sống & Mở rộng (~始める, ~終わる, ~続ける)',
        desc: 'Động từ sinh hoạt, du lịch, trải nghiệm & động từ ghép',
        icon: '✈️',
        tag: 'Bài 17',
        tagClass: '',
        getData: () => (typeof vocabChuong17 !== 'undefined' ? vocabChuong17 : null)
    },
    {
        id: 'chuong18',
        stageId: 'stage_2',
        label: 'Bài 18',
        shortName: 'Ch.18',
        title: 'Trạng thái tiếp diễn & Hiện tượng tự nhiên',
        desc: 'Hiện tượng tự nhiên & trạng thái tiếp diễn (~ています)',
        icon: '🌧️',
        tag: 'Bài 18',
        tagClass: '',
        getData: () => (typeof vocabChuong18 !== 'undefined' ? vocabChuong18 : null)
    },
    {
        id: 'chuong19',
        stageId: 'stage_2',
        label: 'Bài 19',
        shortName: 'Ch.19',
        title: 'Hành động, Sức khỏe & Mở rộng',
        desc: 'Động từ sinh hoạt, sức khỏe, Katakana & mở rộng',
        icon: '💼',
        tag: 'Bài 19',
        tagClass: '',
        getData: () => (typeof vocabChuong19 !== 'undefined' ? vocabChuong19 : null)
    },
    {
        id: 'chuong21',
        stageId: 'stage_3',
        label: 'Bài 21',
        shortName: 'Ch.21',
        title: 'Đời sống, Trải nghiệm & Quy cách',
        desc: 'Động từ trải nghiệm, đo lường, quy cách, trà đạo & đời sống',
        icon: '🗻',
        tag: 'Bài 21',
        tagClass: '',
        getData: () => (typeof vocabChuong21 !== 'undefined' ? vocabChuong21 : null)
    },
    {
        id: 'chuong22',
        stageId: 'stage_3',
        label: 'Bài 22',
        shortName: 'Ch.22',
        title: 'Hành động, Công sở & Đời sống hàng ngày',
        desc: 'Tự/tha động từ, công sở, liên lạc, du học & gia đình',
        icon: '🏢',
        tag: 'Bài 22',
        tagClass: '',
        getData: () => (typeof vocabChuong22 !== 'undefined' ? vocabChuong22 : null)
    },
    {
        id: 'chuong23',
        stageId: 'stage_3',
        label: 'Bài 23',
        shortName: 'Ch.23',
        title: 'Quà tặng, Đồ vật & Hành động cho nhận',
        desc: 'Quà tặng, kỷ niệm, đồ dùng, trang phục & phụ kiện',
        icon: '🎁',
        tag: 'Bài 23',
        tagClass: '',
        getData: () => (typeof vocabChuong23 !== 'undefined' ? vocabChuong23 : null)
    },
    {
        id: 'chuong24',
        stageId: 'stage_3',
        label: 'Bài 24',
        shortName: 'Ch.24',
        title: 'Mời mọc, Trang phục & Giao tiếp xã hội',
        desc: 'Động từ mời rủ, mặc trang phục, tương lai & phó từ',
        icon: '🤝',
        tag: 'Bài 24',
        tagClass: '',
        getData: () => (typeof vocabChuong24 !== 'undefined' ? vocabChuong24 : null)
    },
    {
        id: 'chuong25',
        stageId: 'stage_3',
        label: 'Bài 25',
        shortName: 'Ch.25',
        title: 'Thử thách, Sức khỏe & Đời sống',
        desc: 'Động từ cố gắng, thi cử, bỏ/chuyển đổi, cảm giác & sức khỏe',
        icon: '💪',
        tag: 'Bài 25',
        tagClass: '',
        getData: () => (typeof vocabChuong25 !== 'undefined' ? vocabChuong25 : null)
    },
    {
        id: 'chuong26',
        stageId: 'stage_3',
        label: 'Bài 26',
        shortName: 'Ch.26',
        title: 'Di chuyển, Thắng thua & Hoạt động',
        desc: 'Động từ đi lại, kịp giờ, thắng thua, tính từ cảm xúc & sự kiện',
        icon: '🏕️',
        tag: 'Bài 26',
        tagClass: '',
        getData: () => (typeof vocabChuong26 !== 'undefined' ? vocabChuong26 : null)
    },
    ...KANJI_PARTS_CONFIG,
    {
        id: 'kanji_radicals_group',
        partBadge: '178 BỘ THỦ ĐÔNG DU',
        label: 'Bộ Kanji',
        shortName: 'Bộ Kanji',
        title: 'Kanji Theo Bộ Thủ',
        desc: '178 Bộ thủ Đông Du (Bộ chính & Bộ cấu thành • N5 & N4)',
        icon: '🧩',
        tag: '178 Bộ thủ',
        tagClass: 'tag-emerald',
        isSpecial: true,
        isKanjiRadicalGroup: true,
        isKanjiSection: true,
        skipInSummary: true,
        selectedRadicals: selectedHomeRadicals,
        getData: () => getSelectedHomeRadicalsVocabData()
    },
    {
        id: 'kanji_lessons',
        partBadge: 'TỪ VỰNG • BÀI 1–25',
        label: 'Kanji Bài',
        shortName: 'Kanji Bài',
        title: 'Từ Vựng Kanji Theo Bài',
        desc: '574 từ vựng Hán tự từ Bài 1 ➔ Bài 25 (17 bài chuyên đề)',
        icon: '📗',
        tag: '17 Bài (574 từ)',
        tagClass: 'tag-emerald',
        isSpecial: true,
        isKanjiLessonGroup: true,
        isKanjiSection: true,
        getData: () => (typeof getSelectedKanjiLessonVocabData === 'function' ? getSelectedKanjiLessonVocabData() : null)
    },
    {
        id: 'kata',
        label: 'Katakana',
        shortName: 'Katakana',
        title: 'Katakana Ngoại Lai Tổng Hợp',
        desc: 'Tất cả từ ngoại lai Katakana từ Bài 1~26 chia theo 7 chủ đề',
        icon: '🅰️',
        tag: '7 Chủ đề',
        tagClass: 'tag-emerald',
        isSpecial: true,
        isKataGroup: true,
        groupsConfig: KATA_GROUPS_CONFIG,
        selectedGroups: selectedKataGroups,
        getData: () => getSelectedKataVocabData(),
        getAllData: () => (typeof vocabKata !== 'undefined' ? vocabKata : null)
    },
    {
        id: 'tha_dong_tu',
        label: 'Tha động từ',
        shortName: 'Tha động từ',
        title: 'Tha Động Từ (他動詞)',
        desc: '34 cụm tha động từ thông dụng chia theo 3 phần (Trang 1)',
        icon: '🔄',
        tag: '3 Phần (34 cụm)',
        tagClass: 'tag-emerald',
        isSpecial: true,
        isThaDongTuSection: true,
        isThaDongTuGroup: true,
        groupsConfig: THA_DONG_TU_GROUPS_CONFIG,
        selectedGroups: selectedThaDongTuGroups,
        getData: () => getSelectedThaDongTuVocabData(),
        getAllData: () => (typeof vocabThaDongTu !== 'undefined' ? vocabThaDongTu : null)
    },
    {
        id: 'dem',
        label: 'Đếm số',
        shortName: 'Đếm số',
        title: 'Luyện Đếm Số & Thời Gian',
        desc: '7 chuyên mục đếm: Đồ vật, Tuổi, Tầng, Tiền, Thứ, Ngày tháng & Giờ phút',
        icon: '🔢',
        tag: '7 Mục đếm',
        tagClass: 'tag-emerald',
        isSpecial: true,
        isCounterGroup: true,
        groupsConfig: COUNTER_GROUPS_CONFIG,
        selectedGroups: selectedCounterGroups,
        getData: (count = 5) => getSelectedCountersVocabData(count),
        getAllData: (count = 5) => (typeof generateMixedCounters === 'function' ? generateMixedCounters(count) : null)
    }
];
