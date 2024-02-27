<template>
  <div>
    <h3>{{ msg }}</h3>
    <instance-detail :approve="approve" :close="close"></instance-detail>
  </div>
</template>

<script>
import instanceDetail from '@/components/easyflow/instance-detail'
import {getApproveById} from '@/api/approve'

export default {
  name: "byApproveId",
  components: {
    instanceDetail
  },
  data: () => ({
    msg: '正在加载中...',
    approve: {
      approveState: null,
      message: {
        staff: {name: null},
        startDate: ''
      }
    }
  }),
  props: {
    id: null,
  },
  watch: {
    'this.$route.params': {
      handler() {
        this.loadApprove(this.$route.params.id)
      }
    }
  },
  created() {
    this.loadApprove(this.$route.params.id)
  },
  methods: {
    loadApprove(id) {
      getApproveById(id).then(result => {
        if (result && result.id) {
          if (result.message) {
            this.approve = result
          } else {
            this.msg = '流程被发起人取消'
          }
        } else {
          this.msg = '流程被发起人取消'
        }
      })
    },
    close(close, type) {
      this.approve = {
        approveState: null,
        message: {
          staff: {name: null},
          startDate: ''
        }
      }
      if (type) {
        this.msg = '操作完成'
      } else {
        this.msg = '正在跳转...'
      }
      window.setTimeout(() => {
        this.$router.push({path: '/approve/index'})
      }, 2000)

    }
  }

}
</script>

<style scoped>

</style>