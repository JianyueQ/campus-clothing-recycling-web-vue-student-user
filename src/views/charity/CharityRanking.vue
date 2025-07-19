<template>
  <div class="user-statistics">
    <div class="statistics-cards">
      <el-row :gutter="10" style="margin-bottom: 40px;">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="card-content">
              <p>订单总量</p>
              <h3>{{ statistics.totalOrders }}</h3>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="card-content">
              <p>线上预约数量</p>
              <h3>{{ statistics.onlineAppointments }}</h3>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="card-content">
              <p>线下投递数量</p>
              <h3>{{ statistics.offlineDeliveries }}</h3>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="chart-container">
      <PieChart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
import PieChart from '@/components/PieChart/index.vue';
import {checkIn, getCheckInHistory, getUserStatistics} from '@/api/dataStatistics';
import {Calendar} from "@element-plus/icons-vue";

export default {
  name: 'UserStatistics',
  components: {
    Calendar,
    PieChart
  },
  data() {
    return {
      statistics: {
        totalOrders: 0,
        onlineAppointments: 0,
        offlineDeliveries: 0
      },
      chartData: {
        items: []
      },
      checkInStatus: '',
      calendarData: [] // 日历数据
    };
  },
  mounted() {
    this.fetchUserStatistics();
    this.fetchCheckInHistory(); // 获取签到历史
  },
  methods: {
    async fetchUserStatistics() {
      try {
        const response = await getUserStatistics(); // 调用 API 获取数据
        this.statistics = response.data;
        this.chartData.items = [
          {value: this.statistics.onlineAppointments, name: '线上预约'},
          {value: this.statistics.offlineDeliveries, name: '线下投递'}
        ];
      } catch (error) {
        console.error('获取用户统计数据失败:', error);
      }
    },
    async checkIn() {
      try {
        const response = await checkIn(); // 调用签到 API
        this.checkInStatus = response.message;
      } catch (error) {
        console.error('签到失败:', error);
        this.checkInStatus = '签到失败，请重试';
      }
    },
    async fetchCheckInHistory() {
      try {
        const response = await getCheckInHistory(); // 调用 API 获取签到历史
        this.calendarData = response.data;
      } catch (error) {
        console.error('获取签到历史失败:', error);
      }
    }
  }
};
</script>

<style scoped>

</style>
