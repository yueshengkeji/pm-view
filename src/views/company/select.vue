<template>
  <v-autocomplete dense hide-details
                  auto-select-first
                  @change="$emit('change',company)"
                  v-model="company"
                  :items="companyList"
                  :return-object="type == 'Object'"
                  :search-input.sync="searchCompany"
                  item-value="id"
                  item-text="name"
                  label="单位名称"></v-autocomplete>
</template>

<script>
import {list as companyList} from "@/api/company";

export default {
  name: "select-company",
  data: () => ({
    companyList: [],
    searchCompany: null,
    company: null
  }),
  watch: {
    searchCompany(val) {
      if (val) {
        companyList(val).then(result => {
          this.companyList = result
        })
      }
    },
    data: {
      handler() {
        this.company = Object.assign({}, this.data)
      },
      deep: true
    },
    search: {
      handler() {
        this.searchCompany = this.search
      }
    }
  },
  created() {
    if (this.data) {
      this.company = Object.assign({}, this.data)
    }
    this.searchCompany = this.search
    if (this.searchCompany) {
      companyList(this.searchCompany).then(result => {
        this.companyList = result
        if(this.companyList.length > 0){
          if(this.type == "Object"){
            this.company = this.companyList[0]
          }else{
            this.company = this.companyList[0].id
          }
        }
      })
    }
  },
  model: {
    prop: "data",
    event: "change"
  },
  props: {
    type: {
      type: String,
      default: 'Object'
    },
    data: null,
    search: null
  }

}
</script>

<style scoped>

</style>