<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/16/solid';
import RecipeCard from '@/components/RecipeCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import HomeContainer from '@/components/containers/HomeContainer.vue';
import IconedInput from '@/components/inputs/IconedInput.vue';
import MainHeader from '@/components/MainHeader.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import type { Recipe } from '@/types/recipe';
import api from '@/api';
import { imageUrl } from '@/utils/http';
import { useRouter } from 'vue-router';
import { CREATE_RECIPE } from '@/constants/routes';

const recipes = reactive<Recipe[]>([]);
const query = ref('');
const router = useRouter();

const fetchRecipes = async () => {
  try {
    const response = await api.recipes.all();

    recipes.push(...response.data.data);
  } catch {
    //
  }
};

const filteredRecipes = computed(() => {
  if (query.value.length > 0) {
    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query.value.toLowerCase()),
    );
  }

  return recipes;
});

const onCreateRecipe = () => {
  router.push({ name: CREATE_RECIPE });
};

onMounted(() => {
  fetchRecipes();
});
</script>

<template>
  <MainHeader />
  <HomeContainer>
    <div class="flex items-center py-1 mb-4">
      <h2 class="font-bold md:text-3xl">My Recipes</h2>
      <BaseButton size="sm" class="ml-auto" @click="onCreateRecipe">New Recipe</BaseButton>
    </div>
    <IconedInput type="search" :full-width="false" placeholder="Search" name="search">
      <template #icon>
        <MagnifyingGlassIcon class="h-5" />
      </template>
    </IconedInput>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8 pb-10">
      <RecipeCard
        v-for="(recipe, index) in filteredRecipes"
        :key="index"
        :url="imageUrl(recipe.imageId)"
        :title="recipe.name"
      />
    </div>
  </HomeContainer>
</template>
