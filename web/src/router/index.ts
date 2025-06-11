import { AUTH_ROUTE, HOME_ROUTE, NOT_FOUND_ROUTE, ROOT_ROUTE } from '@/constants/routes';
import ForgotPasswordView from '@/views/Auth/ForgotPasswordView.vue';
import LoginView from '@/views/Auth/LoginView.vue';
import RegisterView from '@/views/Auth/RegisterView.vue';
import HomeView from '@/views/HomeView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import RootView from '@/views/RootView.vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROOT_ROUTE,
      component: RootView,
    },
    {
      path: '/home',
      name: HOME_ROUTE,
      component: HomeView,
    },
    {
      path: '/auth',
      component: RouterView,
      name: AUTH_ROUTE.ROOT,
      children: [
        {
          path: 'login',
          name: AUTH_ROUTE.LOGIN,
          component: LoginView,
        },
        {
          path: 'forgot-password',
          name: AUTH_ROUTE.FORGOT_PASSWORD,
          component: ForgotPasswordView,
        },
        {
          path: 'register',
          name: AUTH_ROUTE.REGISTER,
          component: RegisterView,
        },
      ],
    },
    {
      path: '/404',
      name: NOT_FOUND_ROUTE,
      component: NotFoundView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
});

export default router;
