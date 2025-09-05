# Shopify Email + 6-Digit Code Login Setup

## Tổng quan
Hướng dẫn này giúp bạn thiết lập đăng nhập Shopify với email và mã 6 số thay vì sử dụng OAuth flow phức tạp.

## Ưu điểm của phương pháp này
- ✅ Đơn giản hơn cho người dùng
- ✅ Không cần tạo trang login riêng
- ✅ Sử dụng UI chính thức của Shopify
- ✅ Hỗ trợ email + mã 6 số hiện đại
- ✅ Bảo mật cao với Shopify

## Bước 1: Cấu hình Shopify Admin

### 1.1 Bật Customer Account API
1. Vào **Shopify Admin** → **Settings** → **Customer accounts**
2. Chọn **"New customer accounts"**
3. Bật **Customer Account API**
4. Copy các giá trị sau:
   - **Client ID** (bắt đầu với `shp_`)
   - **Shop ID** (số ID của shop hoặc tên shop)

### 1.2 Thiết lập Callback URL
Thêm callback URL trong Shopify Admin:
- **Development**: `http://localhost:3000/account/authorize`
- **Production**: `https://yourdomain.com/account/authorize`

## Bước 2: Environment Variables

Cập nhật file `.env`:

```env
# Required cho Shopify Email Login
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=shp_your_client_id_here
SHOP_ID=your-shop-name
# hoặc SHOP_ID=123456789 (nếu dùng numeric ID)

# Standard Shopify variables
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_ID=gid://shopify/Shop/your_shop_id
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_token
PRIVATE_STOREFRONT_API_TOKEN=your_private_token
SESSION_SECRET=your_session_secret
```

## Bước 3: Cách hoạt động

### Flow đăng nhập mới:
```
User truy cập /login
    ↓
Redirect đến: https://shopify.com/authentication/{shop_id}/login?client_id={client_id}&return_to={callback_url}
    ↓
Shopify hiển thị form email
    ↓
User nhập email → Shopify gửi mã 6 số
    ↓
User nhập mã 6 số
    ↓
Shopify redirect về /account/authorize
    ↓
App xử lý authorization và redirect đến /account
```

### URL được tạo:
```
https://shopify.com/authentication/your-shop-name/login?client_id=shp_xxxxx&return_to=https://yourdomain.com/account/authorize
```

## Bước 4: Testing

### Development:
```bash
npm run dev
```

### Test flow:
1. Truy cập `http://localhost:3000/login`
2. Sẽ tự động redirect đến Shopify
3. Nhập email → nhận mã 6 số
4. Nhập mã → redirect về app

## Bước 5: Các routes đã được cập nhật

- ✅ `/login` - Redirect đến Shopify email login
- ✅ `/account/login` - Redirect đến Shopify email login  
- ✅ `/account/authorize` - Xử lý callback từ Shopify
- ✅ `/account` - Trang account được bảo vệ

## Troubleshooting

### Lỗi thường gặp:

**"Missing SHOP_ID"**
- Kiểm tra `SHOP_ID` trong file `.env`
- Có thể dùng tên shop (không có .myshopify.com) hoặc numeric ID

**"Invalid client_id"**
- Kiểm tra `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`
- Đảm bảo Customer Account API đã được bật

**"Invalid redirect_uri"**
- Kiểm tra callback URL trong Shopify Admin
- Đảm bảo URL khớp chính xác (không có trailing slash)

### Debug:
```bash
# Kiểm tra environment variables
echo $SHOP_ID
echo $PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID
```

## So sánh với phương pháp cũ

| Phương pháp cũ (OAuth) | Phương pháp mới (Email + Code) |
|------------------------|--------------------------------|
| Phức tạp, nhiều bước | Đơn giản, trực tiếp |
| Cần tạo UI login riêng | Dùng UI chính thức Shopify |
| OAuth flow | Email + mã 6 số |
| Có thể confuse user | User experience tốt hơn |

## Kết luận

Phương pháp mới này đơn giản hơn và cung cấp trải nghiệm người dùng tốt hơn với:
- Đăng nhập bằng email
- Mã xác thực 6 số
- UI chính thức của Shopify
- Bảo mật cao
