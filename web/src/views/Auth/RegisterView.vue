<script lang="ts" setup>
import BaseButton from '@/components/BaseButton.vue';
import BaseContainer from '@/components/containers/BaseContainer.vue';
import BaseInput from '@/components/inputs/BaseInput.vue';
import BaseLink from '@/components/BaseLink.vue';
import MainHeader from '@/components/MainHeader.vue';
import { AUTH_ROUTE, HOME_ROUTE } from '@/constants/routes';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { isException } from '@avidian/http';
import api from '@/api';
import ErrorBag from '@/lib/error-bag';
import { parseValidationError } from '@/utils/http';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const { setUser, setToken } = useUserStore();
const loading = ref(false);
const form = reactive({
  name: '',
  email: '',
  password: '',
  errors: new ErrorBag(),
});

const onSubmit = async () => {
  loading.value = true;

  try {
    const { data } = await api.auth.register(form);

    setUser(data.user);
    setToken(data.token);

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
    <h3 class="text-3xl">Sign Up</h3>
    <BaseInput
      v-model="form.name"
      type="text"
      placeholder="Name"
      name="name"
      autocomplete="name"
      :disabled="loading"
    />
    <ErrorMessage v-if="form.errors.has('name')" class="-my-3">
      {{ form.errors.get('name') }}
    </ErrorMessage>
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
    <BaseButton
      type="submit"
      variant="blue"
      class="max-w-xs w-full"
      :disabled="loading"
      @click="onSubmit"
    >
      Sign Up
    </BaseButton>
    <BaseLink :href="AUTH_ROUTE.LOGIN" :disabled="loading">
      Already have an account? Sign In
    </BaseLink>
  </BaseContainer>
</template>
