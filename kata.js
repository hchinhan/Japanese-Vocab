// File: kata.js
// Tổng hợp tất cả từ viết bằng Katakana (カタカナ) từ Chương 1 ~ 12
const vocabKata = {
    // --- Quốc gia (Bài 1) ---
    "Việt Nam": "ベトナム",
    "Người Việt Nam": "ベトナム人 (ベトナムじん)",
    "Thái Lan": "タイ",
    "Ấn Độ": "インド",
    "Anh (nước)": "イギリス",
    "Pháp": "フランス",
    "Mỹ": "アメリカ",
    "Đức": "ドイツ",
    "Ý": "イタリア",

    // --- Nghề nghiệp (Bài 1) ---
    "Kỹ sư": "エンジニア",

    // --- Đồ vật & Thiết bị (Bài 2, 7, 8) ---
    "Tivi": "テレビ",
    "Máy chụp hình": "カメラ",
    "Vở, quyển vở": "ノート",
    "Máy lạnh": "エアコン",
    "Cái bút (pen)": "ペン",
    "Bút bi (borupen)": "ボールペン",
    "Bút chì bấm": "シャープペンシル",

    // --- Phương tiện (Bài 2, 3, 8) ---
    "Xe máy": "バイク",
    "Xe máy, xe môtô": "オートバイ",
    "Xe buýt": "バス",
    "Xe taxi": "タクシー",

    // --- Tiền tệ (Bài 3) ---
    "~ đồng": "～ドン",
    "~ đô la": "～ドル",

    // --- Địa điểm & Cửa hàng (Bài 3, 7, 9, 12) ---
    "Nhà hàng": "レストラン",
    "Siêu thị": "スーパー",
    "Cửa hàng bách hóa": "デパート",
    "Cửa hàng tiện lợi": "コンビニ",
    "Nhà vệ sinh": "トイレ",

    // --- Đồ ăn & Đồ uống (Bài 7) ---
    "Cà phê": "コーヒー",
    "Trà sữa": "ミルクティー",
    "Nước ép trái cây": "ジュース",
    "Bia": "ビール",
    "Bánh mì": "パン",

    // --- Dụng cụ ăn uống (Bài 7, 8) ---
    "Cái muỗng": "スプーン",
    "Cái nĩa": "フォーク",
    "Con dao": "ナイフ",

    // --- Giải trí & Thể thao (Bài 7, 9, 10) ---
    "Phim hoạt hình": "アニメ",
    "Youtube": "ユーチューブ",
    "Bóng đá": "サッカー",
    "Quần vợt, tennis": "テニス",
    "Cầu lông": "バドミントン",
    "Chơi (thể thao)": "スポーツをする",
    "Karaoke": "カラオケ",
    "Phòng tập Gym": "ジム",

    // --- Sự kiện & Học tập (Bài 4, 7, 9, 10) ---
    "Bài kiểm tra": "テスト",
    "Bữa tiệc": "パーティー",
    "Bài báo cáo": "レポート",
    "Việc làm thêm": "アルバイト",

    // --- Liên lạc (Bài 11) ---
    "Thư điện tử": "メール",

    // --- Khác (Bài 10, 12) ---
    "Xe Grab": "グラブ",
    "Áo sơ mi": "シャツ",
    "Thú cưng": "ペット",
    "Thể thao": "スポーツ",

    // --- Động vật viết bằng Katakana (Bài 12) ---
    "Gà": "ニワトリ",
    "Chuột": "ネズミ",
    "Cua": "カニ",
    "Thỏ": "ウサギ",
    "Rùa": "カメ",
    "Hươu cao cổ": "キリン",
    "Sư tử": "ライオン",
    "Gấu trúc": "パンダ",

    // --- Trái cây viết bằng Katakana (Bài 12) ---
    "Chuối": "バナナ",
    "Xoài": "マンゴー",
    "Dưa lưới": "メロン",
    "Cam": "オレンジ",
    "Sầu riêng": "ドリアン",
    "Dừa": "ココナッツ",
    "Dứa, thơm": "パイナップル",
    "Đu đủ": "パパイヤ"
};