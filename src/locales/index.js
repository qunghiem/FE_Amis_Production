import { createI18n } from 'vue-i18n'
import vi from './vi.json'

const i18n = createI18n({
  // tắt chế độ legacy để dùng đc Composition API
  legacy: false,
  locale: 'vi',         // locale mặc định: tiếng việt
  fallbackLocale: 'vi', // ngôn ngữ dự phòng
  messages: {
    vi, // đăng kí bản dịch từ vi.json
  },
})

export default i18n
