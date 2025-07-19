<template>
  <div class="ranking-table">
    <h3>{{ title }}</h3>
    <table>
      <thead>
      <tr>
        <th>排名</th>
        <th>名称</th>
        <th>捐赠数量</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, index) in rankingList" :key="item.name">
        <td>{{ index + 1 }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.count }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  rankingList: {
    type: Array,
    required: true
  }
});
</script>

<style lang="scss" scoped>
.ranking-table {
  margin-bottom: 30px;

  h3 {
    margin-bottom: 10px;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }

    th {
      background-color: #f2f2f2;
    }
  }
}
</style>
