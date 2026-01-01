<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <div class="py-12">
        <NuxtRouteAnnouncer />
        <v-container>
          <InflationConverter />
        </v-container>
        
        <footer class="text-center text-caption text-grey-darken-1 mt-12">
          <p>&copy; {{ new Date().getFullYear() }} ETB Inflation Converter</p>
        </footer>
      </div>
    </v-main>
  </v-app>
</template>
