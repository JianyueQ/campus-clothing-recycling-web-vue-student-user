<template>
  <div ref="chart" style="width: 400px; height: 300px;"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'PieChart',
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
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [{
          name: '比例',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: this.chartData.items
        }]
      });
    }
  }
};
</script>
