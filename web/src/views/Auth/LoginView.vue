<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AUTH_ROUTE, HOME_ROUTE } from '@/constants/routes';
import BaseButton from '@/components/BaseButton.vue';
import BaseContainer from '@/components/containers/BaseContainer.vue';
import BaseInput from '@/components/inputs/BaseInput.vue';
import BaseLink from '@/components/BaseLink.vue';
import MainHeader from '@/components/MainHeader.vue';
import { useUserStore } from '@/stores/user';
import api from '@/api';
import { isException } from '@avidian/http';
import ErrorBag from '@/lib/error-bag';
import { parseValidationError } from '@/utils/http';
import { toast } from 'vue3-toastify';
import ErrorMessage from '@/components/ErrorMessage.vue';

const router = useRouter();
const { setUser, setToken, token } = useUserStore();
const form = reactive({
  email: '',
  password: '',
  errors: new ErrorBag(),
});

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;

  try {
    const { data } = await api.auth.login(form.email, form.password);

    console.log({ data });

    setToken(data.token);
    setUser(data.user);

    console.log('after', token);

    router.push({
      name: HOME_ROUTE,
    });
  } catch (error) {
    if (isException(error)) {
      const errors = parseValidationError(error);

      if (error.response.statusCode === 400) {
        toast.error(error.response.data.message);
      }

      errors.forEach(({ key, message }) => form.errors.set(key, message));

      setTimeout(() => {
        form.errors.clear();
      }, 3000);
    } else {
      console.error(error);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <MainHeader />
  <BaseContainer tag="form" @submit.prevent.stop="onSubmit">
    <h3 class="text-3xl">Sign In</h3>
    <BaseInput
      v-model="form.email"
      type="email"
      placeholder="Email"
      name="email"
      autocomplete="email"
      :disabled="loading"
    />
    <ErrorMessage v-if="form.errors.has('email')" class="-my-3">
      {{ form.errors.get('email') }}
    </ErrorMessage>
    <BaseInput
      v-model="form.password"
      type="password"
      placeholder="Password"
      name="password"
      :disabled="loading"
    />
    <ErrorMessage v-if="form.errors.has('password')" class="-my-3">
      {{ form.errors.get('password') }}
    </ErrorMessage>
    <div class="flex items-center max-w-xs w-full">
      <BaseLink :href="AUTH_ROUTE.FORGOT_PASSWORD" :disabled="loading">Forgot password?</BaseLink>
    </div>
    <BaseButton
      type="submit"
      variant="blue"
      class="max-w-xs w-full"
      :disabled="loading"
      @click="onSubmit"
    >
      Sign In
    </BaseButton>
    <BaseLink :href="AUTH_ROUTE.REGISTER" :disabled="loading">
      Don't have an account? Sign Up
    </BaseLink>
  </BaseContainer>
</template>
