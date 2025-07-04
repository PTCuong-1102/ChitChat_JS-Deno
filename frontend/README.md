
# ChitChat App - Frontend

Đây là dự án frontend cho ứng dụng ChitChat, được xây dựng bằng React, TypeScript, và Tailwind CSS. Giao diện người dùng được thiết kế để có hiệu suất cao, đáp ứng nhanh và sẵn sàng để tích hợp với một backend mạnh mẽ.

## ✨ Tính năng

- **Xác thực người dùng**: Giao diện đăng nhập và đăng ký.
- **Nhắn tin thời gian thực**: Giao diện cho cuộc trò chuyện trực tiếp (1-1) và nhóm.
- **Trợ lý AI Gemini**: Tích hợp trò chuyện với Gemini AI và khả năng tạo các bot tùy chỉnh.
- **Quản lý bạn bè**: Tìm kiếm người dùng, gửi lời mời kết bạn (giao diện), hủy kết bạn và chặn người dùng.
- **Quản lý hồ sơ**: Xem và chỉnh sửa hồ sơ người dùng, bao gồm cả việc thay đổi mật khẩu.
- **Tổ chức cuộc trò chuyện**: Gắn thẻ (tag) và lọc các cuộc trò chuyện theo danh mục tùy chỉnh (ví dụ: Công việc, Gia đình).
- **Tìm kiếm đa chức năng**: Tìm kiếm người dùng toàn cục và tìm kiếm tin nhắn trong từng cuộc trò chuyện.
- **Thông báo**: Giao diện cho các thông báo và lời mời kết bạn.
- **Thiết kế đáp ứng (Responsive)**: Giao diện được tối ưu hóa cho trải nghiệm mượt mà trên nhiều kích thước màn hình.

## 🚀 Công nghệ sử dụng

- **React 18**: Sử dụng các tính năng hiện đại của React.
- **TypeScript**: Đảm bảo an toàn kiểu dữ liệu và mã nguồn dễ bảo trì.
- **Tailwind CSS**: Được nhúng qua CDN để tạo kiểu nhanh chóng và nhất quán.
- **Không có bước build**: Dự án được thiết lập để chạy trực tiếp trong trình duyệt bằng cách sử dụng ES Modules và Import Maps, giúp đơn giản hóa quá trình phát triển.

## ⚙️ Hướng dẫn Cài đặt và Chạy dự án

Vì dự án này không sử dụng các công cụ build như Vite hay Webpack, bạn không cần cài đặt các gói `npm`. Bạn chỉ cần một máy chủ cục bộ đơn giản để phục vụ các tệp tĩnh.

### Yêu cầu

- Một trình duyệt web hiện đại (ví dụ: Google Chrome, Firefox, Microsoft Edge).
- **Node.js** (chỉ để sử dụng `npx`, không cần cài đặt gói).

### Các bước chạy dự án

1.  **Clone repository về máy của bạn:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Chạy một máy chủ cục bộ:**
    Bạn không thể mở tệp `index.html` trực tiếp từ hệ thống tệp do các hạn chế về bảo mật của trình duyệt (CORS) đối với các module JavaScript. Bạn cần chạy một máy chủ cục bộ.

    Cách dễ nhất là sử dụng `npx serve`:
    ```bash
    npx serve
    ```
    Lệnh này sẽ khởi động một máy chủ web trong thư mục dự án của bạn.

3.  **Mở ứng dụng trên trình duyệt:**
    Sau khi chạy lệnh trên, terminal sẽ hiển thị một địa chỉ URL, thường là:
    ```
    Serving!

    - Local:            http://localhost:3000
    ```
    Mở trình duyệt của bạn và truy cập `http://localhost:3000`. Ứng dụng ChitChat sẽ được tải và sẵn sàng để sử dụng.
