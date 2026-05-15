import { createI18n } from 'vue-i18n'
import vi from './vi.json'

const i18n = createI18n({
  legacy: false,        // dùng Composition API
  locale: 'vi',         // locale mặc định
  fallbackLocale: 'vi',
  messages: {
    vi,
  },
})

export default i18n
