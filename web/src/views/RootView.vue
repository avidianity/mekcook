<script lang="ts" setup>
import { AUTH_ROUTE } from '@/constants/routes';
import { useUserStore } from '@/stores/user';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const { user, token } = useUserStore();
const router = useRouter();

onMounted(() => {
  if (!user && !token) {
    router.push({ name: AUTH_ROUTE.LOGIN });
  }
});
</script>

<template>
  <div>Root: {{ user === null ? 'null' : 'idk' }}</div>
</template>
