<template>
  <div style="font-family: 'Inter', sans-serif">
    <WelcomeVue />
    <AboutUs />
    <Capabilities />
    <ForDevelopers />
    <GettingStarted />
  </div>
</template>

<script setup lang="ts">
import AboutUs from "@/components/landing/AboutUs.vue";
import WelcomeVue from "@/components/landing/Welcome.vue";
import Capabilities from "@/components/landing/Capabilities.vue";
import ForDevelopers from "@/components/landing/ForDevelopers.vue";
import GettingStarted from "@/components/landing/GettingStarted.vue";
</script>

<style scoped></style>
