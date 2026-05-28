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
					background: '#FCFCFC',        // White
					surface: '#FFFFFF',
					primary: '#307351',           // Turf Green
					secondary: '#F3BA0A',         // Amber Gold
					accent: '#786452',            // Olive Wood
					error: '#b00020',
					info: '#307351',              // Turf Green
					success: '#307351',           // Turf Green
					warning: '#F3BA0A',           // Amber Gold
				},
			},
			dark: {
				dark: true,
				colors: {
					background: '#443730',        // Deep Mocha
					surface: '#554840',           // Slightly lighter mocha
					primary: '#307351',           // Turf Green
					secondary: '#F3BA0A',         // Amber Gold
					accent: '#786452',            // Olive Wood
					error: '#ff5252',
					info: '#307351',
					success: '#307351',
					warning: '#F3BA0A',
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
