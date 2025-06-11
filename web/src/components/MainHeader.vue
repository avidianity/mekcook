<script lang="ts" setup>
import MekCook from '@/assets/icons/MekCook.vue';
import UserIcon from '@/components/UserIcon.vue';
import { ROOT_ROUTE } from '@/constants/routes';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user } = useUserStore();

const goToHome = () => router.push({ name: ROOT_ROUTE });
</script>

<template>
  <div class="flex items-center h-18 px-8 border-b-2 border-zinc-400">
    <div class="flex items-center cursor-pointer" @click="goToHome">
      <MekCook @click="goToHome" />
      <span class="font-bold text-lg pl-4 select-none">MekCook</span>
    </div>
    <UserIcon v-if="user" class="ml-auto" />
  </div>
</template>
