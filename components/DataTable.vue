<template>
  <div>
    <v-data-table
      id="mytable"
      :headers="headers"
      :items="items"
      item-key="email"
      class="elevation-2 mt-10 mb-5"
      @page-count="pageCount = $event"
      @update:options="updatePage"
      loading="isLoading"
      loading-text="No data, try changing search queries"
      :search="search"
      :page.sync="pagination.current"
      :items-per-page="itemsPerPage"
      :server-items-length="serverItemsLength"
      :footer-props="{
        'items-per-page-options': [10, 20, 50],
      }"
      show-select
      :options="options"
    >
      <v-progress-linear
        v-show="isLoading"
        slot="progress"
        color="blue"
        indeterminate
      ></v-progress-linear>
      <template #item.full_name="{ item }"
        >{{ item.user.title }} {{ item.user.first_name }}
        {{ item.user.last_name }}</template
      >
      <template v-slot:top>
        <v-row align="center" :style="{ marginLeft: '5px' }">
          <v-select
            :items="genderList"
            v-model="genderFilterValue"
            label="Filter gender"
            @change="handleChange(genderFilterValue)"
            outlined
            append-icon="mdi-gender-transgender"
            :style="{ maxWidth: '250px', paddingTop: '15px', paddingLeft: '10px' }"
          />
          <v-text-field
            :style="{ maxWidth: '250px', paddingTop: '15px', paddingLeft: '10px' }"
            v-model="search"
            append-icon="mdi-magnify"
            label="Search name"
            outlined
          />

          <v-btn
            :disabled="!btnDisabled"
            color="primary"
            @click="clearFilter()"
            :style="{ marginLeft: '10px' }"
            >Clear Filters!</v-btn
          >
          <v-btn
            :disabled="!goTo1stPageDisabled"
            color="primary"
            @click="clearFilter()"
            :style="{ marginLeft: '10px' }"
            >Go to first page</v-btn
          >
        </v-row>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: [
    "headers",
    "items",
    "genderList",
    "pagination",
    "serverItemsLength",
    "isLoading",
  ],
  data() {
    return {
      search: "",
      genderFilterValue: "",
      options: {},
      pageCount: 0,
      itemsPerPage: 10,
    };
  },
  watch: {
    search: async function () {
      this.$emit("search", this.search, this.genderFilterValue);
    },
  },
  methods: {
    updatePage(options) {
      const search = this.search;
      const genderFilterValue = this.genderFilterValue;
      this.$emit("page-change", options, search, genderFilterValue);
    },
    handleChange(gender, options) {
      const search = this.search;
      this.$emit("filter-gender", search, gender);
    },
    async clearFilter() {
      this.genderFilterValue = "";
      this.search = "";
      this.$emit("clear-filter");
    },
    goToFirstPage() {
      this.$emit("go-first-page");
    },
  },
  computed: {
    btnDisabled() {
      return this.search || this.genderFilterValue;
    },
    goTo1stPageDisabled() {
      return this.pagination.current !== 1;
    },
  },
};
</script>

<style scoped>
::v-deep .v-data-table-header {
  background-color: #1266f1;
}
</style>
