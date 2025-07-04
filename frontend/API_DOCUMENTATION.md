
# ChitChat Frontend - Đặc tả API cho Backend

## Giới thiệu

Tài liệu này định nghĩa hợp đồng API giữa frontend của ChitChat và backend. Nó mô tả các mô hình dữ liệu, các điểm cuối REST API, và giao thức WebSocket mà backend cần cung cấp để frontend có thể hoạt động đúng như thiết kế.

## 1. Mô hình Dữ liệu (Data Models)

Đây là các cấu trúc dữ liệu chính mà frontend mong đợi nhận được từ API.

### User
Đại diện cho một người dùng trong hệ thống.

| Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| `id` | string | Có | ID định danh duy nhất (UUID). | |
| `name` | string | Có | Tên đầy đủ của người dùng. | |
| `username` | string | Có | Tên người dùng duy nhất. | |
| `email` | string | Có | Địa chỉ email duy nhất. | Chỉ hiển thị cho người dùng hiện tại. |
| `avatar` | string | Có | URL đến ảnh đại diện. | |
| `status` | 'online' \| 'offline' | Không | Trạng thái trực tuyến. | Sẽ được quản lý qua WebSocket. |
| `activity` | string | Không | Hoạt động hiện tại của người dùng. | Ví dụ: "Đang nghe Spotify". |

### Chat
Đại diện cho một cuộc trò chuyện, có thể là 1-1 (DM) hoặc nhóm.

| Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| `id` | string | Có | ID định danh duy nhất. | |
| `isGroup` | boolean | Có | `true` nếu là chat nhóm, `false` nếu là DM. | |
| `name` | string | Không | Tên của nhóm chat. | Chỉ bắt buộc khi `isGroup` là `true`. |
| `participants` | string[] | Có | Mảng các `id` của người dùng tham gia. | |
| `lastMessage` | string | Không | Nội dung xem trước của tin nhắn cuối cùng. | |
| `lastMessageTimestamp` | string | Không | Dấu thời gian của tin nhắn cuối cùng. | |
| `tag` | string | Không | Thẻ tùy chỉnh do người dùng gán. | Ví dụ: "Công việc", "Gia đình". |

### Message
Đại diện cho một tin nhắn trong một cuộc trò chuyện.

| Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | string | Có | ID định danh duy nhất. |
| `senderId` | string | Có | ID của người dùng đã gửi tin nhắn. |
| `content` | string | Có | Nội dung của tin nhắn. |
| `timestamp` | string | Có | Dấu thời gian khi tin nhắn được gửi. |

### Bot
Đại diện cho một AI chatbot do người dùng cấu hình.

| Thuộc tính | Kiểu dữ liệu | Bắt buộc | Mô tả | Ghi chú quan trọng |
| :--- | :--- | :--- | :--- | :--- |
| `id` | string | Có | ID định danh duy nhất. | |
| `name` | string | Có | Tên do người dùng đặt cho bot. | |
| `model` | string | Có | Model AI được sử dụng. | Ví dụ: 'gemini-2.5-flash-preview-04-17'. |
| `description` | string | Có | Mô tả hoặc chỉ dẫn hệ thống cho bot. | |
| `avatar` | string | Có | URL đến ảnh đại diện của bot. | |
| `apiKey` | string | **Không** | **KHÔNG BAO GIỜ gửi trường này về frontend.** | Backend phải lưu trữ key này một cách an toàn. |

## 2. Luồng Xác thực (Authentication Flow)

Frontend sử dụng JSON Web Tokens (JWT) để quản lý phiên đăng nhập.

1.  **Đăng ký / Đăng nhập**: Người dùng gửi thông tin đến endpoint `/register` hoặc `/login`.
2.  **Nhận Token**: Backend xác thực thông tin, tạo một `User` mới (nếu đăng ký) và trả về một JWT cùng với đối tượng `User` của người dùng đã đăng nhập.
3.  **Lưu trữ Token**: Frontend lưu JWT vào `localStorage` hoặc một nơi an toàn khác.
4.  **Gửi Token**: Đối với tất cả các yêu cầu API cần xác thực sau đó, frontend sẽ gửi token trong header `Authorization`.
    ```
    Authorization: Bearer <your_jwt_token>
    ```
5.  **Xác thực phía Backend**: Backend phải có một middleware để xác thực JWT trên mỗi yêu cầu được bảo vệ.

## 3. REST API Endpoints

### Auth
| Method | Endpoint | Mô tả | Body (Request) | Response (Success 2xx) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký người dùng mới. | `{ fullName, userName, email, password }` | `{ user: User, token: string }` |
| `POST` | `/api/auth/login` | Đăng nhập người dùng. | `{ email, password }` | `{ user: User, token: string }` |

### Data Fetching
| Method | Endpoint | Mô tả | Response (Success 2xx) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/data/bootstrap` | Lấy dữ liệu khởi tạo sau khi đăng nhập. | `{ users: User[], chats: Chat[], bots: Bot[], tags: string[] }` |
| `GET` | `/api/chats/{chatId}/messages` | Lấy lịch sử tin nhắn của một cuộc trò chuyện. | `Message[]` |
| `GET` | `/api/users` | Lấy danh sách người dùng để tìm kiếm. | `User[]` |

### Chat & Message
| Method | Endpoint | Mô tả | Body (Request) | Response (Success 2xx) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/chats/{chatId}/messages` | Gửi một tin nhắn mới. | `{ content: string }` | `Message` (tin nhắn đã được tạo) |

### User & Profile
| Method | Endpoint | Mô tả | Body (Request) | Response (Success 2xx) |
| :--- | :--- | :--- | :--- | :--- |
| `PUT` | `/api/users/me` | Cập nhật hồ sơ người dùng hiện tại. | `{ name?: string, username?: string }` | `User` (hồ sơ đã cập nhật) |
| `POST` | `/api/users/me/password` | Thay đổi mật khẩu. | `{ currentPassword, newPassword }` | `{ message: 'Success' }` |

### Friends & Blocking
| Method | Endpoint | Mô tả | Body (Request) | Response (Success 2xx) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/friends` | Gửi lời mời kết bạn. | `{ userId: string }` | `{ status: 'pending' }` |
| `PUT` | `/api/friends/{userId}` | Chấp nhận/Từ chối lời mời. | `{ action: 'accept' \| 'decline' }` | `{ message: 'Success' }` |
| `DELETE` | `/api/friends/{userId}` | Hủy kết bạn. | | `{ message: 'Success' }` |
| `POST` | `/api/users/block` | Chặn một người dùng. | `{ userId: string }` | `{ message: 'Success' }` |
| `POST` | `/api/users/unblock`| Bỏ chặn một người dùng. | `{ userId: string }` | `{ message: 'Success' }` |

### Bots & Tags
| Method | Endpoint | Mô tả | Body (Request) | Response (Success 2xx) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bots` | Tạo một AI bot mới. | `{ name, model, apiKey, description }` | `Bot` (bot mới đã tạo) |
| `POST` | `/api/tags` | Tạo một thẻ (tag) mới. | `{ name: string }` | `Tag` (thẻ mới) |
| `PUT` | `/api/chats/{chatId}/tag` | Gán hoặc gỡ thẻ cho một cuộc trò chuyện. | `{ tag: string \| null }` | `Chat` (chat đã cập nhật) |

## 4. Giao thức WebSocket

Frontend sẽ mở một kết nối WebSocket sau khi đăng nhập để nhận các cập nhật thời gian thực.

-   **URL Kết nối**: `wss://your-api.domain/ws?token=<jwt_token>`
-   Backend phải xác thực người dùng qua `token` trong URL query.

### Sự kiện từ Client gửi đến Server

| Tên sự kiện | Payload | Mô tả |
| :--- | :--- | :--- |
| `join_room` | `{ "chatId": string }` | Thông báo cho server rằng client đã vào một phòng chat. |
| `leave_room`| `{ "chatId": string }` | Thông báo cho server rằng client đã rời một phòng chat. |
| `typing` | `{ "chatId": string, "isTyping": boolean }`| Gửi trạng thái đang gõ phím. |

### Sự kiện từ Server gửi đến Client

| Tên sự kiện | Payload | Mô tả |
| :--- | :--- | :--- |
| `new_message`| `Message` | Có tin nhắn mới trong một cuộc trò chuyện client đang tham gia. |
| `user_status_update` | `{ userId: string, status: 'online' \| 'offline' }` | Cập nhật trạng thái của một người dùng. |
| `typing_indicator` | `{ chatId: string, user: {id, name} }` | Một người dùng khác đang gõ trong phòng chat. |
| `notification`| `{ id, message, avatar }` | Gửi một thông báo mới (ví dụ: có lời mời kết bạn). |
| `chat_updated` | `Chat` | Gửi thông tin chat đã được cập nhật (ví dụ: ai đó đổi tag). |

## 5. Tương tác với AI Bot

**Luồng bảo mật:** Để bảo vệ API key, frontend **sẽ không bao giờ** gọi trực tiếp đến API của Google Gemini.

1.  Frontend gửi yêu cầu đến backend.
2.  Backend lấy `apiKey` và `description` đã được lưu trữ an toàn của bot.
3.  Backend thực hiện cuộc gọi đến API Gemini.
4.  Backend trả kết quả về cho frontend.

| Method | Endpoint | Mô tả | Body (Request) | Response (Success 2xx) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bots/{botId}/query` | Gửi một câu hỏi đến một bot cụ thể. | `{ prompt: string }` | `{ response: string }` |
