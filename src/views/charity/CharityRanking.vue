<template>
  <div class="order-statistics">
    <!-- 数字展示区域 -->
    <el-row :gutter="10" style="margin-bottom: 40px;">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-title">订单总数量</div>
          <div class="stat-number">{{ stats.orderTotal }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-title">线上预约数量</div>
          <div class="stat-number">{{ stats.onlineCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-title">线下投递数量</div>
          <div class="stat-number">{{ stats.offlineCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 饼状图展示区域 -->
    <el-card class="chart-card">
      <div class="chart-title">订单类型分布</div>
      <div ref="pieChart" class="chart-container"></div>
    </el-card>

    <!-- 柱状图展示区域 -->
    <el-card class="chart-card">
      <div class="chart-title">订单类型统计</div>
      <div ref="barChart" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { getOrderStatistics } from '@/api/dataStatistics.js';

// 统计数据
const stats = ref({
  orderTotal: undefined,
  onlineCount: undefined,
  offlineCount: undefined,
});

// 图表实例
let pieChartInstance = null;
let barChartInstance = null;

// 加载统计数据
const loadOrderStatistics = async () => {
  try {
    const response = await getOrderStatistics();
    stats.value = response.data;
    if (pieChartInstance) {
      updatePieChart();
    }
    if (barChartInstance) {
      updateBarChart();
    }
  } catch (error) {
    console.error('获取订单统计数据失败:', error);
  }
};

// 初始化饼状图
const initPieChart = () => {
  pieChartInstance = echarts.init(document.querySelector('.chart-container'));
  loadOrderStatistics();
};

// 初始化柱状图
const initBarChart = () => {
  barChartInstance = echarts.init(document.querySelectorAll('.chart-container')[1]);
  loadOrderStatistics();
};

// 更新饼状图
const updatePieChart = () => {
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '订单类型',
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
        data: [
          { value: stats.value.onlineCount, name: '线上预约' },
          { value: stats.value.offlineCount, name: '线下投递' }
        ]
      }
    ]
  };
  pieChartInstance.setOption(option);
};

// 更新柱状图
const updateBarChart = () => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['线上预约', '线下投递']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数量',
        type: 'bar',
        barWidth: '60%',
        data: [stats.value.onlineCount, stats.value.offlineCount],
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  };
  barChartInstance.setOption(option);
};

// 页面加载
onMounted(() => {
  initPieChart();
  initBarChart();
});
</script>

<style lang="scss" scoped>
.order-statistics {
  padding: 20px;
}

.stat-card {
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.chart-card {
  height: 400px;
  margin-bottom: 40px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.chart-container {
  height: 350px;
  width: 100%;
}
</style>
