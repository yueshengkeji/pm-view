<template>
  <v-card>
    <v-card-text>
      <v-container>
        <v-form ref="travelApplicationForm">
          <v-row dense>
            <v-col lg="4" md="4" sm="4">
              <v-text-field dense label="申请人" v-model="editedItem.traveller"
              ></v-text-field>
            </v-col>
            <!--                            <v-col lg="4" md="4" sm="4">-->
            <!--                                <v-text-field dense label="职务" v-model="$store.state.user.roles" disabled></v-text-field>-->
            <!--                            </v-col>-->
            <v-col lg="4" md="4" sm="4">
              <v-text-field dense label="部门" v-model="editedItem.department"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col lg="4" md="4" sm="6" cols="6" style="margin-top: -18px;">
              <v-menu
                  ref="menu1"
                  v-model="menu1"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                      v-model="editedItem.startTime"
                      label="出差开始时间"
                      required
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"

                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model="editedItem.startTime"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col lg="4" md="4" sm="6" cols="6" style="margin-top: -18px;">
              <v-menu
                  ref="menu2"
                  v-model="menu2"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                      v-model="editedItem.endTime"
                      label="出差结束时间"
                      required
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"

                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model="editedItem.endTime"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col lg="2" md="2" sm="6" cols="6">
              <v-text-field dense label="合计时长(天)" v-model="editedItem.totalTime"
              ></v-text-field>
            </v-col>
            <v-col lg="2" sm="6" cols="6">
              <v-radio-group
                  style="margin-top: -20px"
                  v-model="editedItem.travelType"
                  mandatory>
                <v-radio
                    label="市内公务"
                    value="0"
                ></v-radio>
                <v-radio
                    label="外地出差"
                    value="1"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="12">
              <v-text-field
                  label="出差地点"
                  v-model="editedItem.place" placeholder="从   （经）   到"
                  required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                  rows="3"
                  label="事由"
                  v-model="editedItem.remark"
                  required
              ></v-textarea>
            </v-col>

            <v-col cols="12">
              <v-text-field label="交通工具" v-model="editedItem.transportation"></v-text-field>
              <!--                        <v-radio-group-->
              <!--                            class="mt-0"-->
              <!--                            v-model="editedItem.transportation"-->
              <!--                            mandatory-->
              <!--                            row>-->
              <!--                          <v-radio-->
              <!--                              label="飞机"-->
              <!--                              value="飞机"-->
              <!--                          ></v-radio>-->
              <!--                          <v-radio-->
              <!--                              label="火车"-->
              <!--                              value="火车"-->
              <!--                          ></v-radio>-->
              <!--                          <v-radio-->
              <!--                              label="长途汽车"-->
              <!--                              value="长途汽车"-->
              <!--                          ></v-radio>-->
              <!--                          <v-radio-->
              <!--                              label="公司公务车"-->
              <!--                              value="公司公务车"-->
              <!--                          ></v-radio>-->
              <!--                          <v-radio-->
              <!--                              label="自驾"-->
              <!--                              value="自驾"-->
              <!--                          ></v-radio>-->
              <!--                          <v-radio-->
              <!--                              label="其他"-->
              <!--                              value="其他"-->
              <!--                          ></v-radio>-->
              <!--                          <v-text-field-->
              <!--                              ref="focus"-->
              <!--                              v-model="editedItem.otherTransport"-->
              <!--                              required-->
              <!--                          ></v-text-field>-->
              <!--                        </v-radio-group>-->
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="6" md="2" sm="2">
              <v-text-field v-model="editedItem.travelFee" label="交通费(元)"
                            onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field v-model="editedItem.stayFee" label="住宿费(元)"
                            onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field v-model="editedItem.otherFee" label="其他(元)"
                            onkeypress="return (/[\d.]/.test(String.fromCharCode(event.keyCode)))"></v-text-field>
            </v-col>
            <v-col cols="6" md="1">
              <v-text-field v-model="editedItem.totalFee" label="费用总计(元)" readonly></v-text-field>
            </v-col>
          </v-row>

        </v-form>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import travelApplicationApi from "@/api/travelApplication";

export default {
  name: "1320274",
  data: () => ({
    menu1: false,
    menu2: false,
    editedItem: {
      id: null,
      traveller: null,
      position: null,
      department: null,
      startTime: null,
      endTime: null,
      totalTime: null,
      travelType: null,
      transportation: null,
      place: null,
      remark: null,
      travellerId: null,
      departmentId: null,
      otherTransport: null,
    },
  }),
  props: {
    frameId: null,
  },
  watch: {
    frameId: {
      handler() {
        if (this.frameId != null) {
          this.reset();
          this.loadData()
        }
      },
    }
  },
  created() {
    if (this.frameId != null) {
      this.loadData();
    }
  },
  methods: {
    loadData() {
      travelApplicationApi.getById(this.frameId).then(result => {
        result.startTime = this.formatTimer(result.startTime)
        result.endTime = this.formatTimer(result.endTime)
        this.editedItem = result
      })
    },
    reset() {
      this.editedItem = {
        id: null,
        traveller: null,
        position: null,
        department: null,
        startTime: null,
        endTime: null,
        totalTime: null,
        travelType: null,
        transportation: null,
        place: null,
        remark: null,
        travellerId: null,
        departmentId: null,
        otherTransport: null,
      }
    }
  }
}
</script>

<style scoped>

</style>
