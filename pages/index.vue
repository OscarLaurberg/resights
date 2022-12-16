<template lang="pug">
v-container
  v-row
    v-col(cols)
      DataTable(
        :headers="headers"
        :items="filteredItems"
        :isLoading="isLoading"
        :genderList="genderList"
        :pagination="pagination"
        :server-items-length="serverItemsLength"
        @filter-gender="getSearchData"
        @clear-filter="clearFilter"
        @page-change="getDataFromApi"
        @search="getSearchData"
        @go-first-page="goFirstPage"
      )
</template>

<script>
import DataTable from "~/components/DataTable.vue";
import sales from "~/api/sales.js";

export default {
  components: {
    DataTable,
  },
  data() {
    return {
      isLoading: false,
      sales,
      items: [],
      genderList: [],
      filteredItems: [],
      totalSales: 0,
      loading: true,
      options: {},
      serverItemsLength: 10,
      lastPageNumber: 0,
      pagination: { current: 1 },
      headers: [
        {
          text: "Full Name",
          value: "full_name",
          align: "start",
          class: "my-header-style",
          width: "25%",
        },
        { text: "Email", value: "email", width: "25%" },
        { text: "Gender", value: "gender", width: "10%" },
        { text: "Year", value: "year", width: "10%" },
        { text: "Sales", value: "sales", width: "15%" },
        { text: "Country", value: "country", width: "15%" },
      ],
    };
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi(options, search, genderFilter);
      },
      deep: true,
    },
  },
  async created() {
    this.isLoading = true;
    const result = await this.$axios("/api/sales?limit=10&offset=0");
    const genders = await this.$axios("/api/sales/genders");
    const serverItems = await this.$axios("/api/sales/totalRecords");
    this.items = await result.data.sales;
    this.genderList = await genders.data.genders;
    this.serverItemsLength = await serverItems.data.serverItemsLength;
    this.filteredItems = this.items;
    this.isLoading = false;
  },
  methods: {
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    goFirstPage() {
      this.pagination.current = 1;
    },
    async clearFilter() {
      this.isLoading = true;
      this.getSearchData("", "");
      this.pagination.current = 1;
      this.isLoading = false;
    },
    async getDataFromApi(options, search, gender) {
      this.isLoading = true;
      const sortBy = options.sortBy[0];
      const sortDesc = options.sortDesc[0];
      let { itemsPerPage, page } = options;
      page > 1 && this.lastPageNumber > page ? (page = page) : (page = page - 1);
      this.lastPageNumber = page;
      const offset = page * itemsPerPage;
      let result;
      result = await this.$axios(
        `/api/sales?limit=${itemsPerPage}&offset=${offset}&search=${search}&genderFilter=${gender}&sortBy=${sortBy}&sortDesc=${sortDesc}`
      );
      this.items = await result.data.sales;
      this.serverItemsLength = result.data.serverItemsLength || 0;
      this.filteredItems = this.items;
      this.isLoading = false;
    },
    async getSearchData(search, gender) {
      this.isLoading = true;
      this.pagination.current = 1;
      const itemsPerPage = 10;
      const page = 0;
      this.lastPageNumber = page;
      const offset = page * itemsPerPage;
      let result;
      result = await this.$axios(
        `/api/sales?limit=${itemsPerPage}&offset=${offset}&search=${search}&genderFilter=${gender}`
      );
      this.serverItemsLength = await result.data.serverItemsLength;
      this.items = await result.data.sales;
      this.filteredItems = this.items;
      this.isLoading = false;
    },
  },
};
</script>

<style lang="sass" scoped>
.v-progress-circular
  position: absolute
  top: 50%
  left: 50%
.my-header-style
  color: #6f8fb9 !important
</style>
