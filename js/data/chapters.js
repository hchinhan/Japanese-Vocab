/**
 * File: js/data/chapters.js
 * Danh sách cấu hình metadata cho tất cả các bài học & chuyên đề từ vựng.
 * Tự động đồng bộ với giao diện chọn bài và bộ lọc tra cứu từ vựng.
 */
const CHAPTERS_CONFIG = [
    {
        id: 'chuong1',
        label: 'Bài 01',
        shortName: 'Ch.1',
        title: 'Chào hỏi & Nghề nghiệp',
        desc: 'Giao tiếp cơ bản, quốc tịch & xưng hô',
        icon: '🙋‍♂️',
        tag: 'Bài 01',
        tagClass: '',
        getData: () => (typeof vocabChuong1 !== 'undefined' ? vocabChuong1 : null)
    },
    {
        id: 'chuong2',
        label: 'Bài 02',
        shortName: 'Ch.2',
        title: 'Đồ vật & Sở hữu',
        desc: 'Vật dụng hàng ngày, đồ dùng cá nhân',
        icon: '📦',
        tag: 'Bài 02',
        tagClass: '',
        getData: () => (typeof vocabChuong2 !== 'undefined' ? vocabChuong2 : null)
    },
    {
        id: 'chuong3',
        label: 'Bài 03',
        shortName: 'Ch.3',
        title: 'Nơi chốn & Phương hướng',
        desc: 'Địa điểm, phòng học & vị trí xung quanh',
        icon: '🗺️',
        tag: 'Bài 03',
        tagClass: '',
        getData: () => (typeof vocabChuong3 !== 'undefined' ? vocabChuong3 : null)
    },
    {
        id: 'chuong4',
        label: 'Bài 04',
        shortName: 'Ch.4',
        title: 'Thời gian & Sự kiện',
        desc: 'Giờ giấc, ngày tháng, lịch làm việc',
        icon: '⏰',
        tag: 'Bài 04',
        tagClass: '',
        getData: () => (typeof vocabChuong4 !== 'undefined' ? vocabChuong4 : null)
    },
    {
        id: 'chuong5',
        label: 'Bài 05',
        shortName: 'Ch.5',
        title: 'Các tính từ',
        desc: 'Tính từ đuôi い và đuôi な miêu tả',
        icon: '🎨',
        tag: 'Bài 05',
        tagClass: '',
        getData: () => (typeof vocabChuong5 !== 'undefined' ? vocabChuong5 : null)
    },
    {
        id: 'chuong6',
        label: 'Bài 06',
        shortName: 'Ch.6',
        title: 'Các động từ P1',
        desc: 'Hành động sinh hoạt, ăn uống, di chuyển',
        icon: '🏃',
        tag: 'Bài 06',
        tagClass: '',
        getData: () => (typeof vocabChuong6 !== 'undefined' ? vocabChuong6 : null)
    },
    {
        id: 'chuong7',
        label: 'Bài 07',
        shortName: 'Ch.7',
        title: 'Động từ P2 & Danh từ',
        desc: 'Công cụ, quà tặng & từ vựng đi kèm',
        icon: '🍽️',
        tag: 'Bài 07',
        tagClass: '',
        getData: () => (typeof vocabChuong7 !== 'undefined' ? vocabChuong7 : null)
    },
    {
        id: 'chuong8',
        label: 'Bài 08',
        shortName: 'Ch.8',
        title: 'Phương tiện & Đồ dùng',
        desc: 'Xe cộ, phương tiện giao thông & thiết bị',
        icon: '🚗',
        tag: 'Bài 08',
        tagClass: '',
        getData: () => (typeof vocabChuong8 !== 'undefined' ? vocabChuong8 : null)
    },
    {
        id: 'chuong9',
        label: 'Bài 09',
        shortName: 'Ch.9',
        title: 'Thời tiết & Trạng thái',
        desc: 'Nắng mưa, cảm xúc & khả năng sở thích',
        icon: '🌤️',
        tag: 'Bài 09',
        tagClass: '',
        getData: () => (typeof vocabChuong9 !== 'undefined' ? vocabChuong9 : null)
    },
    {
        id: 'chuong10',
        label: 'Bài 10',
        shortName: 'Ch.10',
        title: 'Tần suất & Gia đình',
        desc: 'Thời lượng, xưng hô gia đình & mức độ',
        icon: '👨‍👩‍👧‍👦',
        tag: 'Bài 10',
        tagClass: '',
        getData: () => (typeof vocabChuong10 !== 'undefined' ? vocabChuong10 : null)
    },
    {
        id: 'chuong11',
        label: 'Bài 11',
        shortName: 'Ch.11',
        title: 'Động từ chuyển động',
        desc: 'Động từ di chuyển & từ vựng mở rộng',
        icon: '🚀',
        tag: 'Bài 11',
        tagClass: '',
        getData: () => (typeof vocabChuong11 !== 'undefined' ? vocabChuong11 : null)
    },
    {
        id: 'chuong12',
        label: 'Bài 12',
        shortName: 'Ch.12',
        title: 'Tồn tại, Vị trí & Động thực vật',
        desc: 'Vị trí ở/có, động vật & trái cây',
        icon: '🌸',
        tag: 'Bài 12',
        tagClass: '',
        getData: () => (typeof vocabChuong12 !== 'undefined' ? vocabChuong12 : null)
    },
    {
        id: 'chuong13',
        label: 'Bài 13',
        shortName: 'Ch.13',
        title: 'Cơ thể, Sở thích & Đồ ăn',
        desc: 'Bộ phận cơ thể, môn học, màu sắc & món ăn',
        icon: '🍱',
        tag: 'Bài 13',
        tagClass: '',
        getData: () => (typeof vocabChuong13 !== 'undefined' ? vocabChuong13 : null)
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
        shortName: 'Kanji CB',
        title: 'Kanji cơ bản',
        desc: 'Hán tự N5 cơ bản & Hiragana',
        icon: '🈁',
        tag: 'Đặc biệt',
        tagClass: 'tag-emerald',
        isSpecial: true,
        getData: () => {
            if (typeof vocabKanjiCoBan === 'undefined') return null;
            const reversed = {};
            for (let key in vocabKanjiCoBan) {
                reversed[vocabKanjiCoBan[key]] = key;
            }
            return reversed;
        },
        getRawData: () => (typeof vocabKanjiCoBan !== 'undefined' ? vocabKanjiCoBan : null)
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
