<script setup lang="ts">
import { ref, computed } from 'vue';

const amountEtb = ref<number>(1000);
const month = ref<number>(1);
const year = ref<number>(2020);

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1912 }, (_, i) => currentYear - i);

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
  <div class="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
    <h1 class="text-2xl font-bold text-gray-900">Inflation-Adjusted ETB Converter</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700">Amount (ETB)</label>
        <input 
          v-model.number="amountEtb" 
          type="number" 
          step="0.01"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700">Month</label>
        <select v-model="month" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
      
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700">Year</label>
        <select v-model="year" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <button 
      @click="handleCalculate" 
      :disabled="isLoading"
      class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {{ isLoading ? 'Calculating...' : 'Calculate' }}
    </button>

    <div v-if="error" class="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
      <p>{{ error.data?.statusMessage || 'An error occurred' }}</p>
    </div>

    <div v-if="data" class="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-100">
      <h2 class="text-xl font-semibold text-blue-900 mb-4">Summary</h2>
      <p class="text-blue-800 leading-relaxed">
        In {{ months.find(m => m.value === month)?.label }} {{ year }}, your 
        <span class="font-bold">{{ data.originalEtb.toFixed(2) }} ETB</span> was worth 
        <span class="font-bold">${{ data.historicalUsd.toFixed(2) }}</span>; 
        adjusted for inflation that is <span class="font-bold">${{ data.todayUsd.toFixed(2) }}</span>; 
        which is <span class="font-bold">{{ data.finalEtb.toFixed(2) }} ETB</span> today.
      </p>
      <div class="mt-4 text-sm text-blue-600">
        Inflation Multiplier: {{ data.inflationMultiplier.toFixed(4) }}x
      </div>
    </div>
  </div>
</template>
