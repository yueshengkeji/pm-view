import Vue from 'vue'
import Vuetify from 'vuetify/lib'
// import v from 'vuetify/lib'
// 由Vuetify（javascript）提供的翻译
import zhHans from 'vuetify/es5/locale/zh-Hans'

Vue.use(Vuetify)

export default new Vuetify({
    lang: {
        locales: { zhHans },
        current: 'zhHans',
    },
    config: {
        silent: false,
    },
    theme: {
        dark: false,
        light: {
            // primary: '#3f51b5',
            // secondary: '#b0bec5',
            // accent: '#8c9eff',
            // error: '#b71c1c',
            // vListItemTitle:"3rem"
        },
        // blockquoteFontSize:"24px",
        // fontSizeRoot:"22px"
    },
});
