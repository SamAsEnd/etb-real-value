<template>
  <v-app>
    <v-main class="bg-grey-lighten-4 d-flex align-center justify-center" style="min-height: 100vh;">
      <div class="py-12 w-100">
        <NuxtRouteAnnouncer />
        <v-container>
          <InflationConverter />
        </v-container>
        
        <footer class="text-center text-caption text-grey-darken-1 mt-12">
          <p>&copy; {{ new Date().getFullYear() }} ETB Inflation Converter &bull; Transparent Finance</p>
        </footer>
      </div>
    </v-main>
  </v-app>
</template>
