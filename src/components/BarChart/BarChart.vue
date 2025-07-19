<template>
  <div ref="chart" style="width: 600px; height: 400px;"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'BarChart',
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      const chart = echarts.init(this.$refs.chart);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.chartData.labels
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '数量',
          type: 'bar',
          data: this.chartData.values
        }]
      });
    }
  }
};
</script>
