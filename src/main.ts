import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Pinia
import { createPinia } from 'pinia'

// Vuetify 3
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import { useUserStore } from './stores/user'

const app = createApp(App)

const pinia = createPinia()

const vuetify = createVuetify({
	components,
	directives,
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: { mdi },
	},
	theme: {
		defaultTheme: 'light',
		themes: {
			light: {
				dark: false,
				colors: {
					background: '#FFFFFF',
					surface: '#FFFFFF',
					primary: '#1a1a1a',
					secondary: '#646cff',
					error: '#b00020',
					info: '#2196F3',
					success: '#4CAF50',
					warning: '#FB8C00',
				},
			},
			dark: {
				dark: true,
				colors: {
					background: '#121212',
					surface: '#1e1e1e',
					primary: '#FFFFFF',
					secondary: '#646cff',
				},
			},
		},
	},
})

app.use(pinia)
app.use(vuetify)
app.use(router)

const userStore = useUserStore()
await userStore.fetchSession()

app.mount('#app')
