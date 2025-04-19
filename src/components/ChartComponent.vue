<template>
  <div class="chart-container">
    <Bar
      v-if="chartType === 'bar'"
      :data="chartData"
      :options="chartOptions"
    />
    <Line
      v-else-if="chartType === 'line'"
      :data="chartData"
      :options="chartOptions"
    />
    <Pie
      v-else-if="chartType === 'pie'"
      :data="chartData"
      :options="chartOptions"
    />
    <Doughnut
      v-else-if="chartType === 'doughnut'"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { Bar, Line, Pie, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement } from 'chart.js'

// Register ChartJS components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
)

// Props
const props = defineProps({
  chartType: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'line', 'pie', 'doughnut'].includes(value)
  },
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({
      responsive: true,
      maintainAspectRatio: false
    })
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>
