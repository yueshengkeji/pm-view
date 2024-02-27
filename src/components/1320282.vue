<template>
  <v-container>
    <v-row>
      <v-col cols="6" md="3" sm="2" xs="2">
        <v-text-field v-model="subcontract.name" label="合同名称" readonly></v-text-field>
      </v-col>
      <v-col cols="6" md="3" sm="2" xs="2">
        <v-text-field v-model="subcontract.money" label="合同金额" readonly></v-text-field>
      </v-col>
      <v-col cols="12" md="3" sm="2" xs="2">
        <v-text-field v-model="subcontract.project.name" label="项目" readonly></v-text-field>
      </v-col>
      <v-col cols="12" md="3" sm="2" xs="2">
        <v-text-field v-model="subcontract.partyA.name" label="甲方" readonly></v-text-field>
      </v-col>
      <v-col cols="6" md="3" sm="2" xs="2">
        <v-text-field v-model="subcontract.partyB.name" label="乙方" readonly></v-text-field>
      </v-col>
      <v-col cols="6" md="3" sm="2" xs="2">
        <v-text-field v-model="subcontract.signDate" label="签订日期" readonly></v-text-field>
      </v-col>
      <v-col cols="6" sm="3">
        <v-text-field readonly v-model="subcontract.startDate" label="合同开始日期"></v-text-field>
      </v-col>
      <v-col cols="6" sm="3">
        <v-text-field readonly v-model="subcontract.endDate" label="合同截止日期"></v-text-field>
      </v-col>
      <v-col cols="12" sm="12">
        <v-textarea v-model="subcontract.remark" label="备注" readonly></v-textarea>
      </v-col>
    </v-row>

  </v-container>
</template>
<script>
import proSubcontract from "../api/proSubcontract";

export default {
  name: 'frame-1320282',
  props: {
    frameId: String,
  },
  data: () => ({
    subcontract: {
      startDate: null,
      endDate: null,
      id: null,
      name: null,
      project: {
        id: null,
        name: null
      },
      partyA: {
        id: null,
        name: null,
      },
      partyB: {
        id: null,
        name: null,
      },
      signDate: null,
      remark: null,
    }
  }),

  watch: {
    frameId: {
      handler() {
        if (this.frameId != null) {
          this.loadSubcontract()
        }
      },
      deep: true,
    }
  },

  created() {
    this.reset()
    if (this.frameId != null) {
      console.log("1320282" + this.frameId)
      this.loadSubcontract()
    }
  },

  methods: {
    loadSubcontract() {
      proSubcontract.getSubcontractById({id: this.frameId}).then(res => {
        if (!res.partyA) {
          res.partyA = {id: null, name: null}
        }
        if (!res.partyB) {
          res.partyB = {id: null, name: null}
        }
        this.subcontract = res
      })
    },
    reset() {
      this.subcontract = {
        id: null,
        name: null,
        project: {
          id: null,
          name: null
        },
        partyA: {
          id: null,
          name: null,
        },
        partyB: {
          id: null,
          name: null,
        },
        signDate: null,
        remark: null,
      }
    },
  }
}
</script>
