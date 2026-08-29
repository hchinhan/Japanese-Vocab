// File: js/data/kata.js
// Tổng hợp tất cả từ viết bằng Katakana (カタカナ) từ Chương 1 ~ 16
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

    // --- Đồ vật & Thiết bị (Bài 2, 7, 8, 13) ---
    "Tivi": "テレビ",
    "Máy chụp hình": "カメラ",
    "Vở, quyển vở": "ノート",
    "Máy lạnh": "クーラー",
    "Cái bút (pen)": "ペン",
    "Bút bi (borupen)": "ボールペン",
    "Bút chì bấm": "シャープペンシル",
    "Điện thoại thông minh (Smartphone)": "スマホ",
    "Máy tính cá nhân (Laptop/PC)": "パソコン",

    // --- Phương tiện (Bài 2, 3, 8, 13) ---
    "Xe máy": "バイク",
    "Xe máy, xe môtô": "オートバイ",
    "Xe buýt": "バス",
    "Xe taxi": "タクシー",
    "Xe Mercedes": "ベンツ",

    // --- Tiền tệ & Đơn vị (Bài 3, 13) ---
    "~ đồng": "～ドン",
    "~ đô la": "～ドル",
    "Xen-ti-mét (cm)": "センチ",
    "Ki-lô-mét (km) / Ki-lô-gam (kg)": "キロ",
    "Mét (m)": "メートル",

    // --- Địa điểm & Cửa hàng (Bài 3, 7, 9, 12, 15) ---
    "Nhà hàng": "レストラン",
    "Siêu thị": "スーパー",
    "Cửa hàng bách hóa": "デパート",
    "Cửa hàng tiện lợi": "コンビニ",
    "Nhà vệ sinh": "トイレ",
    "Đỉnh Everest": "エベレスト",

    // --- Đồ ăn & Đồ uống (Bài 7, 13) ---
    "Cà phê": "コーヒー",
    "Trà sữa": "ミルクティー",
    "Nước ép trái cây": "ジュース",
    "Bia": "ビール",
    "Bánh mì": "パン",
    "Bánh khoai tây rán (Croquette)": "コロッケ",

    // --- Dụng cụ ăn uống (Bài 7, 8) ---
    "Cái muỗng": "スプーン",
    "Cái nĩa": "フォーク",
    "Con dao": "ナイフ",

    // --- Âm nhạc & Phim ảnh (Bài 13) ---
    "Nhạc pop": "ポップ",
    "Nhạc jazz": "ジャズ",
    "Nhạc rock": "ロック",
    "Nhạc rap": "ラップ",
    "Nhạc cổ điển": "クラシック",
    "Phim truyền hình": "ドラマ",
    "Phim kinh dị": "ホラー",
    "Phim hài": "コメディー",
    "Phim hành động": "アクション",
    "Phim hoạt hình": "アニメ",
    "Đàn ghita": "ギター",
    "Đàn piano": "ピアノ",
    "Khiêu vũ, nhảy múa": "ダンス",

    // --- Giải trí & Thể thao (Bài 7, 9, 10, 13, 16) ---
    "Youtube": "ユーチューブ",
    "Bóng đá": "サッカー",
    "Quần vợt, tennis": "テニス",
    "Trượt tuyết": "スキー",
    "Môn đánh gôn (Golf)": "ゴルフ",
    "Chạy bộ (Jogging)": "ジョギング",
    "Cầu lông": "バドミントン",
    "Bóng chuyền": "バレーボール",
    "Chơi (thể thao)": "スポーツをする",
    "Thể thao": "スポーツ",
    "Karaoke": "カラオケ",
    "Phòng tập Gym": "ジム",
    "Đi dã ngoại (Hiking)": "ハイキング",
    "Vé (vé vào cổng, vé tàu xe)": "チケット",

    // --- Màu sắc & Tính từ (Bài 13, 15) ---
    "Màu hồng": "ピンク",
    "Đẹp trai": "ハンサム",

    // --- Sự kiện & Học tập (Bài 4, 7, 9, 10) ---
    "Bài kiểm tra": "テスト",
    "Bữa tiệc": "パーティー",
    "Bài báo cáo": "レポート",
    "Việc làm thêm": "アルバイト",

    // --- Liên lạc & Công nghệ (Bài 11, 13) ---
    "Thư điện tử": "メール",
    "Mạng internet": "インターネット",

    // --- Khác (Bài 10, 12, 16) ---
    "Xe Grab": "グラブ",
    "Áo sơ mi": "シャツ",
    "Thú cưng": "ペット",
    "Kính cửa sổ": "窓ガラス (まどガラス)",

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