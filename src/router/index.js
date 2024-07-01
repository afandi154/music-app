import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    name: 'home',
    path: '/',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'home',
      guard: false
    }
  },
  {
    name: 'about',
    path: '/about',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: 'about',
      guard: false
    }
  },
  {
    name: 'manage',
    path: '/manage',
    component: () => import('@/views/ManageView.vue'),
    meta: {
      title: 'manage',
      guard: true
    }
  },
  {
    name: 'song',
    path: '/song/:id',
    component: () => import('@/views/SongView.vue'),
    meta: {
      title: 'song',
      guard: true
    }
  },
  {
    name: '404',
    path: '/:catchAll(.*)',
    component: () => import('@/views/404View.vue'),
    meta: {
      title: '404',
      guard: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
  linkExactActiveClass: 'text-amber-500'
})

router.beforeEach((to, from, next) => {
  document.title = String(to.meta.title).toUpperCase()
  const userStore = useUserStore()

  if (!to.meta.guard) next()

  if (userStore.isLoggedIn) {
    next()
  } else {
    next({
      name: 'home'
    })
  }
})

export default router
