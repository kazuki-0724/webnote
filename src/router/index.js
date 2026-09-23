import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AuthGate from '../components/AuthGate.vue'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import WhiteboardPage from '../components/WhiteboardPage.vue'
import SharedViewer from '../components/SharedViewer.vue'

const routes = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthGate
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/whiteboard',
    name: 'whiteboard',
    component: WhiteboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/shared-viewer',
    name: 'sharedviewer',
    component: SharedViewer
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const { user, authReady } = useAuth()

  if(to.name === 'sharedviewer') {
    return next()
  }

  if (to.name === 'auth' || to.name === 'login') {
    if (authReady.value && user.value) {
      return next({ name: 'home' })
    }
    return next()
  }

  if (!authReady.value) {
    return next({ name: 'auth' })
  }

  if (!user.value) {
    return next({ name: 'login' })
  }

  next()
})

export default router