<script lang="ts" setup>
import BaseButton from '@/components/BaseButton.vue';
import BaseContainer from '@/components/containers/BaseContainer.vue';
import BaseInput from '@/components/inputs/BaseInput.vue';
import BaseLink from '@/components/BaseLink.vue';
import MainHeader from '@/components/MainHeader.vue';
import { AUTH_ROUTE } from '@/constants/routes';
</script>

<template>
  <MainHeader />
  <BaseContainer>
    <h3 class="text-3xl">Sign Up</h3>
    <BaseInput type="text" placeholder="Name" name="name" />
    <BaseInput type="email" placeholder="Email" name="email" />
    <BaseInput type="password" placeholder="Password" name="password" />
    <BaseButton variant="blue" class="max-w-xs w-full">Sign Up</BaseButton>
    <BaseLink :href="AUTH_ROUTE.LOGIN">Already have an account? Sign In</BaseLink>
  </BaseContainer>
</template>
