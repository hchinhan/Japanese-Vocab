# Japanese-Vocab
# Hướng dẫn thêm data từ vựng (Japanese-Vocab)

Để thêm một chương từ vựng tĩnh mới (ví dụ: Chương 3, Chương 4...), bạn chỉ cần thực hiện 4 bước sau (thay dấu `_` bằng số chương tương ứng):

### Bước 1: Tạo file data `.js` mới
Tạo file mới có tên `chuong_.js` (Ví dụ: `chuong3.js`) và khai báo biến chứa từ vựng:
```js
const vocabChuong_ = {
    "Từ vựng 1": "Tiếng Nhật 1",
    "Từ vựng 2": "Tiếng Nhật 2"
    // Thêm bao nhiêu từ tùy thích...
};
```

### Bước 2: Khai báo file vào index.html
Mở file index.html, tìm đến khu vực thẻ `<head>` và thêm dòng này vào phần gọi file data:

```HTML
<script src="chuong_.js"></script>
```

### Bước 3: Thêm Checkbox hiển thị ở Menu
Kéo xuống phần giao diện html, tìm đến khu vực thẻ ```<div class="chapter-selection">``` và chèn thêm khối này:

```HTML
<label class="checkbox-label">
    <input type="checkbox" id="chk-chuong_"> 
    Chương _: [Tên bài học]
</label>
```

### Bước 4: Cập nhật logic gộp data vào hệ thống
Kéo xuống thẻ `<script>` ở cuối file, tìm hàm `function startReview()` và thêm đoạn logic này vào (ngay bên dưới code của các chương trước):

```JavaScript
if (document.getElementById('chk-chuong_').checked && typeof vocabChuong_ !== 'undefined') {
    Object.assign(currentVocab, vocabChuong_);
    selectedNames.push("Ch._");
}
```
🎉 Xong! Lưu file lại. Mọi thứ sẽ tự động chạy mượt mà, xáo trộn chung với các chương khác mà không cần đụng vào core logic của ứng dụng.


> Đây là AI gen