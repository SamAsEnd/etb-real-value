<script setup lang="ts">
import { ref, computed } from 'vue';

const amountEtb = ref<number>(1000);
const month = ref<number>(1);
const year = ref<string>('2020');

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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1912 }, (_, i) => String(currentYear - i));

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
    year: Number(year.value),
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
  <v-container class="max-w-2xl py-6">
    <v-card>
      <v-card-item>
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" variant="tonal" rounded="lg">
            <v-icon icon="mdi-banknotes" />
          </v-avatar>
          <div>
            <v-card-title class="text-h5 font-weight-bold">ETB Inflation Converter</v-card-title>
            <v-card-subtitle>Calculate historical value of Ethiopian Birr adjusted for USD inflation</v-card-subtitle>
          </div>
        </div>
      </v-card-item>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model.number="amountEtb"
              label="Amount (ETB)"
              type="number"
              step="0.01"
              prepend-inner-icon="mdi-banknotes"
              placeholder="1000.00"
              hide-details="auto"
            />
          </v-col>
          
          <v-col cols="12" sm="4">
            <v-select
              v-model="month"
              label="Month"
              :items="months"
              prepend-inner-icon="mdi-calendar"
              hide-details="auto"
            />
          </v-col>
          
          <v-col cols="12" sm="4">
            <v-select
              v-model="year"
              label="Year"
              :items="years"
              prepend-inner-icon="mdi-calendar-range"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <v-btn
          @click="handleCalculate"
          :loading="isLoading"
          block
          size="large"
          color="primary"
          class="mt-4"
        >
          Calculate
        </v-btn>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          icon="mdi-alert-triangle"
          class="mt-4"
          :title="error.data?.statusMessage || 'An error occurred'"
        />

        <v-card v-if="data" variant="tonal" color="primary" class="mt-6">
          <v-card-item>
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-presentation-play" />
              <v-card-title class="text-h6 font-weight-semibold">Conversion Result</v-card-title>
            </div>
          </v-card-item>
          
          <v-card-text>
            <div class="text-body-1">
              <p class="mb-4">
                In {{ months.find(m => m.value === month)?.title }} {{ year }}, your 
                <v-chip size="small" label>{{ data.originalEtb.toFixed(2) }} ETB</v-chip> was worth 
                <span class="font-weight-bold text-primary">${{ data.historicalUsd.toFixed(2) }}</span>.
              </p>
              
              <v-divider class="my-4">
                <v-chip size="x-small" variant="text" class="text-uppercase">Inflation Adjustment</v-chip>
              </v-divider>
              
              <p>
                Adjusted for inflation, that is <span class="font-weight-bold text-primary">${{ data.todayUsd.toFixed(2) }}</span>; 
                which is equivalent to <span class="font-weight-bold text-primary text-h6">{{ data.finalEtb.toLocaleString() }} ETB</span> today.
              </p>
            </div>
          </v-card-text>
          
          <v-divider />

          <v-card-actions class="px-4 py-2">
            <span class="text-caption font-italic opacity-80">Data based on US CPI and historical ETB/USD rates</span>
            <v-spacer />
            <v-chip color="primary" size="small" variant="flat">
              Multiplier: {{ data.inflationMultiplier.toFixed(4) }}x
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>
