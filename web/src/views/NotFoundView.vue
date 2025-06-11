<script lang="ts" setup>
import chef from '@/assets/images/chef.png';
import { useRouter } from 'vue-router';
import { ROOT_ROUTE } from '@/constants/routes';
import MainHeader from '@/components/MainHeader.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseContainer from '@/components/containers/BaseContainer.vue';

const router = useRouter();
</script>

<template>
  <MainHeader />
  <BaseContainer>
    <img :src="chef" />
    <h4 class="text-xl font-bold">Oops! Page Not Found</h4>
    <p class="max-w-[520px] text-center">
      We couldn't find the page you were looking for. It might have been removed or the link is
      incorrect. Please check the URL and try again.
    </p>
    <BaseButton @click="router.push({ name: ROOT_ROUTE })">Back to Home</BaseButton>
  </BaseContainer>
</template>
