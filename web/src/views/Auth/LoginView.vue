<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { AUTH_ROUTE, HOME_ROUTE } from '@/constants/routes';
import BaseButton from '@/components/BaseButton.vue';
import BaseContainer from '@/components/containers/BaseContainer.vue';
import BaseInput from '@/components/inputs/BaseInput.vue';
import BaseLink from '@/components/BaseLink.vue';
import MainHeader from '@/components/MainHeader.vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const { setUser, setToken } = useUserStore();

const onSubmit = () => {
  setUser('1');
  setToken('1');
  router.push({ name: HOME_ROUTE });
};
</script>

<template>
  <MainHeader />
  <BaseContainer tag="form">
    <h3 class="text-3xl">Sign In</h3>
    <BaseInput type="email" placeholder="Email" name="email" />
    <BaseInput type="password" placeholder="Password" name="password" />
    <div class="flex items-center max-w-xs w-full">
      <BaseLink :href="AUTH_ROUTE.FORGOT_PASSWORD">Forgot password?</BaseLink>
    </div>
    <BaseButton variant="blue" class="max-w-xs w-full" @click="onSubmit">Sign In</BaseButton>
    <BaseLink :href="AUTH_ROUTE.REGISTER">Don't have an account? Sign Up</BaseLink>
  </BaseContainer>
</template>
