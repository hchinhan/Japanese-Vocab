# 🇯🇵 Japanese-Vocab | Ứng Dụng Khảo & Tra Cứu Từ Vựng Tiếng Nhật N5

Ứng dụng web ôn tập từ vựng tiếng Nhật N5 dạng Flashcard tương tác, luyện nghe phát âm chuẩn và tra cứu/xuất dữ liệu Markdown.

---

## 📁 Cấu trúc thư mục dự án

```text
Japanese-Vocab/
├── index.html                  # Giao diện chính tinh gọn & semantic
├── README.md                   # Hướng dẫn dự án & tài liệu thêm bài học
├── css/
│   └── style.css               # Toàn bộ CSS được tổ chức theo module & section rõ ràng
└── js/
    ├── app.js                  # Entry point, render UI động, quản lý chọn bài & phím tắt
    ├── audio.js                # Quản lý phát âm tiếng Nhật (Web Speech API)
    ├── study.js                # Quản lý luồng Flashcard, Luyện nghe, Đánh dấu sao
    ├── summary.js              # Quản lý tra cứu từ vựng, tìm kiếm & xuất Markdown (.md)
    └── data/
        ├── chapters.js         # Danh mục metadata cấu hình bài học (tự động đồng bộ UI)
        ├── chuong1.js -> chuong12.js  # Dữ liệu từ vựng theo từng bài học
        ├── dem.js              # Logic & dữ liệu đếm số tiếng Nhật
        ├── kanji.js            # Dữ liệu Hán tự N5 cơ bản
        └── kata.js             # Dữ liệu từ ngoại lai Katakana tổng hợp
```

---

## 🚀 Hướng dẫn thêm bài học từ vựng mới

Nhờ hệ thống cấu hình tập trung trong `js/data/chapters.js`, việc thêm một bài học mới (ví dụ: `Bài 13`) trở nên cực kỳ đơn giản:

### Bước 1: Tạo file dữ liệu mới trong `js/data/`
Tạo file `js/data/chuong13.js`:
```javascript
const vocabChuong13 = {
    "Từ vựng tiếng Việt 1": "Tiếng Nhật 1",
    "Từ vựng tiếng Việt 2": "Tiếng Nhật 2"
};
```

### Bước 2: Khai báo file trong `index.html`
Mở `index.html`, thêm thẻ script vào trong phần `<head>` (trước `chapters.js`):
```html
<script src="js/data/chuong13.js"></script>
```

### Bước 3: Đăng ký bài học vào `js/data/chapters.js`
Mở `js/data/chapters.js` và thêm cấu hình bài học vào mảng `CHAPTERS_CONFIG`:
```javascript
{
    id: 'chuong13',
    label: 'Bài 13',
    shortName: 'Ch.13',
    title: 'Tên bài học',
    desc: 'Mô tả ngắn gọn nội dung bài học',
    icon: '🎯',
    tag: 'Bài 13',
    tagClass: '',
    getData: () => (typeof vocabChuong13 !== 'undefined' ? vocabChuong13 : null)
}
```

🎉 **Xong!** Giao diện thẻ bài học ở Menu, danh sách lọc trong bảng Tra cứu, logic trộn đề và chức năng xuất file Markdown sẽ **tự động cập nhật** mà không cần viết thêm HTML hay code logic!