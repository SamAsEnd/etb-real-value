<script setup lang="ts">
import { ref, computed } from 'vue';

const amountEtb = ref<number>(5400);
const selectedDate = ref<string>('2016-09');

const month = computed(() => Number(selectedDate.value.split('-')[1]));
const year = computed(() => Number(selectedDate.value.split('-')[0]));

const months = [
  { title: 'January', value: 1 },
  { title: 'February', value: 2 },
  { title: 'March', value: 3 },
  { title: 'April', value: 4 },
  { title: 'May', value: 5 },
  { title: 'June', value: 6 },
  { title: 'July', value: 7 },
  { title: 'August', value: 8 },
  { title: 'September', value: 9 },
  { title: 'October', value: 10 },
  { title: 'November', value: 11 },
  { title: 'December', value: 12 },
];

interface ResultData {
  originalEtb: number;
  historicalUsd: number;
  todayUsd: number;
  finalEtb: number;
  inflationMultiplier: number;
}

const { data, error, status, execute } = useFetch<ResultData>('/api/inflate', {
  method: 'POST',
  body: computed(() => ({
    amountEtb: amountEtb.value,
    month: month.value,
    year: year.value,
  })),
  immediate: false,
  watch: false,
});

const isLoading = computed(() => status.value === 'pending');

const handleCalculate = async () => {
  await execute();
};
</script>

<template>
  <v-container class="max-w-2xl py-6 px-4">
    <v-card elevation="3" rounded="xl" border>
      <v-card-item class="bg-primary text-white py-6">
        <template v-slot:prepend>
          <v-avatar color="white" variant="flat" rounded="lg" size="56">
            <v-icon icon="mdi-finance" color="primary" size="32" />
          </v-avatar>
        </template>
        <v-card-title class="text-h4 font-weight-black">ETB Inflation</v-card-title>
        <v-card-subtitle class="text-white opacity-90 text-body-1">
          Historical value adjusted for USD inflation
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" sm="6">
            <v-label class="mb-2 font-weight-bold">Amount to Convert</v-label>
            <v-text-field
              v-model.number="amountEtb"
              prefix="ETB"
              variant="outlined"
              type="number"
              step="0.01"
              placeholder="1,000.00"
              hide-details="auto"
              density="comfortable"
            />
          </v-col>
          
          <v-col cols="12" sm="6">
            <v-label class="mb-2 font-weight-bold">Historical Date</v-label>
            <v-text-field
              v-model="selectedDate"
              type="month"
              min="1996-01"
              max="2026-12"
              variant="outlined"
              prepend-inner-icon="mdi-calendar"
              hide-details="auto"
              density="comfortable"
            />
          </v-col>
        </v-row>

        <v-btn
          @click="handleCalculate"
          :loading="isLoading"
          block
          size="x-large"
          color="primary"
          class="mt-6 text-none font-weight-bold"
          rounded="lg"
          elevation="2"
        >
          Calculate Value
          <template v-slot:append>
            <v-icon icon="mdi-chevron-right" />
          </template>
        </v-btn>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          icon="mdi-alert-circle"
          class="mt-6"
          rounded="lg"
          :title="error.data?.statusMessage || 'Calculation Failed'"
          text="We couldn't retrieve the inflation data. Please try again later."
        />

        <v-expand-transition>
          <div v-if="data" class="mt-8">
            <div class="d-flex align-center ga-2 mb-4">
              <v-icon icon="mdi-chart-line" color="primary" />
              <h3 class="text-h6 font-weight-bold">Analysis Results</h3>
            </div>

            <v-row>
              <!-- Historical Value Card -->
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4 h-100 border-opacity-25" rounded="lg">
                  <div class="text-overline mb-1">Value in {{ months.find(m => m.value === month)?.title }} {{ year }}</div>
                  <div class="d-flex align-baseline ga-2">
                    <span class="text-h5 font-weight-bold">{{ data.originalEtb.toLocaleString() }}</span>
                    <span class="text-caption font-weight-medium">ETB</span>
                  </div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    Equivalent to <span class="text-primary font-weight-bold">${{ data.historicalUsd.toFixed(2) }}</span>
                  </div>
                </v-card>
              </v-col>

              <!-- Current Value Card -->
              <v-col cols="12" md="6">
                <v-card color="primary" variant="tonal" class="pa-4 h-100" rounded="lg">
                  <div class="text-overline mb-1 text-primary">Equivalent Today</div>
                  <div class="d-flex align-baseline ga-2">
                    <span class="text-h5 font-weight-bold">{{ data.finalEtb.toLocaleString() }}</span>
                    <span class="text-caption font-weight-medium">ETB</span>
                  </div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    Value adjusted for inflation: <span class="text-primary font-weight-bold">${{ data.todayUsd.toFixed(2) }}</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-card variant="flat" color="grey-lighten-4" class="mt-4 pa-4" rounded="lg">
              <div class="d-flex justify-space-between align-center">
                <div class="text-body-2">
                  <v-icon icon="mdi-information-outline" size="small" class="me-1" />
                  Inflation Multiplier:
                </div>
                <v-chip size="small" color="primary" font-weight-bold>
                  {{ data.inflationMultiplier.toFixed(4) }}x
                </v-chip>
              </div>
              <div class="text-caption text-medium-emphasis mt-2">
                Based on US CPI and historical ETB/USD exchange rates.
              </div>
            </v-card>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>
  </v-container>
</template>
