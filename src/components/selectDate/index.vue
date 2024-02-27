<template>
  <div>
    <v-select hide-details
              @focus="dateMenu.showMenu = false"
              v-model="date"
              @change="dateChange($event)"
              dense
              label="日期范围筛选"
              :items="dateItems"
              class="float-right mr-1"
              style="width:120px">

      <template v-slot:append-item>
        <v-menu v-model="dateMenu.showMenu"
                :close-on-content-click="false"
                :close-on-click="false"
                offset-y>

          <template v-slot:activator="{on,attrs}">
            <v-list-item link v-bind="attrs" v-on="on">
              <v-list-item-title>自定义</v-list-item-title>
            </v-list-item>
          </template>

          <v-date-picker v-model="dateMenu.date" @change="datePickerChange" range>

          </v-date-picker>

        </v-menu>
      </template>

    </v-select>
  </div>
</template>

<script>
export default {
  name: "selectDateIndex",
  data: () => ({
    dateMenu: {
      showMenu: false,
      date: []
    },
    date: "所有",
    dateItems: ["本月", "上月", "半年", "本年", "去年", "所有"],
    dateValue: null,
  }),
  props: {
    value: null
  },
  watch: {
    value: {
      handler() {
        this.dateValue = this.value
      },
      deep: true
    }
  },
  model: {
    prop: "value",
    event: "change"
  },
  methods: {
    datePickerChange() {
      if (this.dateMenu.date) {
        this.date = this.dateMenu.date.join("到")
        this.dateItems.push(this.date)
        this.dateMenu.showMenu = false
        let sd = this.date.split("到")
        this.dateValue = {start: sd[0], end: sd[1]}
      } else {
        this.dateValue = null
      }
      this.$emit("change", this.dateValue)
    },
    dateChange() {
      let date
      date = this.getDateByStr(this.date)
      if ((date == null || date.start == null) && this.date != null) {
        let sd = this.date.split("到")
        if (sd != null && sd.length > 1) {
          this.dateValue = {
            start: sd[0],
            end: sd[1]
          }
        } else {
          this.dateValue = null
        }
      } else {
        this.dateValue = date
      }
      console.log(this.dateValue)
      this.$emit("change", this.dateValue)
    },
  }
}
</script>

<style scoped>

</style>