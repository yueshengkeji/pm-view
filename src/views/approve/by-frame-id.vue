<template>
  <div>
    <h3>{{ msg }}</h3>
    <instance-detail ref="detail"
                     :approve="approve"
                     :frame="frame"
                     :close="close"
                     @loadSteps="loadStepsHandler"></instance-detail>
  </div>
</template>

<script>
import instanceDetail from '@/components/easyflow/instance-detail'

export default {
  name: "byApproveId",
  components: {
    instanceDetail
  },
  data: () => ({
    msg: '正在加载中...',
    frame: null,
    approve: {
      approveState: null,
      staff: {name: null},
      message: {staff: {name: null}, startDate: ''}
    },
    flowMessage: null
  }),
  props: {
    id: null,
  },
  watch: {
    'this.$route.params': {
      handler() {
        this.frame = this.$route.params.id
      }
    }
  },
  created() {
    this.$nextTick(() => {
      if (this.id) {
        this.frame = this.id
      } else if (this.$route.params.id) {
        this.frame = this.$route.params.id
      }
      this.$refs.detail.init().finally((flowMessage) => {
        this.msg = ''
        this.flowMessage = flowMessage
      })
    })
  },
  methods: {
    loadStepsHandler(flowApproveList) {
      flowApproveList.forEach(item => {
        if (item.approveState <= 1 && item.acceptStaffId === this.$store.state.user.id) {
          item.message = this.flowMessage
          this.approve = item
        }
      })
    },
    close() {
      if (this.frame) {
        this.frame = null
      }
    }
  }

}
</script>

<style scoped>

</style>