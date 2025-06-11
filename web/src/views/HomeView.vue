<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/16/solid';
import chickenStir from '@/assets/images/chicken-stir.png';
import RecipeCard from '@/components/RecipeCard.vue';
import BaseButton from '@/components/BaseButton.vue';
import HomeContainer from '@/components/containers/HomeContainer.vue';
import IconedInput from '@/components/inputs/IconedInput.vue';
import MainHeader from '@/components/MainHeader.vue';
</script>

<template>
  <MainHeader />
  <HomeContainer>
    <div class="flex items-center py-1 mb-4">
      <h2 class="font-bold md:text-3xl">My Recipes</h2>
      <BaseButton size="sm" class="ml-auto">New Recipe</BaseButton>
    </div>
    <IconedInput type="search" :full-width="false" placeholder="Search" name="search">
      <template #icon>
        <MagnifyingGlassIcon class="h-5" />
      </template>
    </IconedInput>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8 pb-10">
      <RecipeCard :url="chickenStir" title="Spicy Chicken Stir-Fry" />
      <RecipeCard :url="chickenStir" title="Spicy Chicken Stir-Fry" />
      <RecipeCard :url="chickenStir" title="Spicy Chicken Stir-Fry" />
      <RecipeCard :url="chickenStir" title="Spicy Chicken Stir-Fry" />
      <RecipeCard :url="chickenStir" title="Spicy Chicken Stir-Fry" />
      <RecipeCard :url="chickenStir" title="Spicy Chicken Stir-Fry" />
      <RecipeCard :url="chickenStir" title="Spicy Chicken Stir-Fry" />
      <RecipeCard :url="chickenStir" title="Spicy Chicken Stir-Fry" />
    </div>
  </HomeContainer>
</template>
