/**
 * File: js/data/chapters.js
 * Cấu hình danh mục tất cả bài học và các trang Kanji trong ứng dụng
 */

// ==========================================================================
// 1. CẤU HÌNH CHI TIẾT 9 TRANG KANJI (ĐÔNG DU HT400 & CƠ BẢN)
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
    }
];

/**
 * Trạng thái các trang Kanji đang được kích hoạt (mặc định chọn cả 9 trang)
 */
let selectedKanjiPages = new Set(['kanji0', 'kanji1', 'kanji2', 'kanji3', 'kanji4', 'kanji5', 'kanji6', 'kanji7', 'kanji8']);

/**
 * Lấy dữ liệu từ các trang Kanji đã chọn
 */
function getSelectedKanjiVocabData() {
    const combined = {};
    KANJI_PAGES_CONFIG.forEach(page => {
        if (selectedKanjiPages.has(page.id)) {
            const d = page.getData();
            if (d) Object.assign(combined, d);
        }
    });
    return combined;
}

// ==========================================================================
// 2. CẤU HÌNH DANH MỤC CÁC BÀI HỌC TRÊN MENU CHÍNH
// ==========================================================================

const CHAPTERS_CONFIG = [
    {
        id: 'chuong1',
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
        id: 'dem',
        label: 'Đếm số',
        shortName: 'Đếm số',
        title: 'Luyện đếm các loại',
        desc: 'Tuổi, tầng, tiền, thứ, ngày, giờ & vật đếm',
        icon: '🔢',
        tag: 'Đặc biệt',
        tagClass: 'tag-emerald',
        isSpecial: true,
        getData: (count = 5) => (typeof generateMixedCounters === 'function' ? generateMixedCounters(count) : null)
    },
    {
        id: 'kanji',
        label: 'Kanji',
        shortName: 'Kanji',
        title: 'Kanji Hán Tự (9 Trang)',
        desc: '504 chữ Hán từ Trang 0 ➔ Trang 8 (Bấm để chọn trang)',
        icon: '🈁',
        tag: '9 Trang (504 chữ)',
        tagClass: 'tag-emerald',
        isSpecial: true,
        isKanjiGroup: true,
        getData: () => getSelectedKanjiVocabData()
    },
    {
        id: 'kata',
        label: 'Katakana',
        shortName: 'Katakana',
        title: 'Katakana tổng hợp',
        desc: 'Tất cả từ ngoại lai Katakana từ Bài 1~16',
        icon: '🅰️',
        tag: 'Đặc biệt',
        tagClass: 'tag-emerald',
        isSpecial: true,
        getData: () => (typeof vocabKata !== 'undefined' ? vocabKata : null)
    }
];
