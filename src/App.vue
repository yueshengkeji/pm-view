<template>
    <v-app id="app">
        <!--        系统全局提示框,没有取消按钮-->
        <v-dialog v-model="$store.state.showTooltip.show"
                  width="30%"
                  persistent>
            <v-card class="pa-5">
                <div>{{$store.state.showTooltip.msg}}</div>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" @click="$store.state.showTooltip.back">确定</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!--        系统全局提示语-->
        <v-snackbar :timeout="$store.state.showTooltip.snackbarTimeout"
                    centered
                    color="error"
                    v-model="$store.state.showTooltip.snackbar">
            {{$store.state.showTooltip.snackbarMsg}}
        </v-snackbar>
        <!--        系统全局提示框，有取消和确定两种机制-->
        <v-dialog v-model="$store.state.showTooltip.confirm"
                  width="30%" :fullscreen="$vuetify.breakpoint.xs">
            <v-card class="pa-5">
                <div v-html="$store.state.showTooltip.confirmMsg"></div>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="$store.state.showTooltip.confirmCancel">取消</v-btn>
                    <v-btn color="primary" @click="$store.state.showTooltip.confirmBack">确定</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <router-view/>
    </v-app>
</template>

<style lang="scss">
.table-title{
  color: black !important;
  font-weight: 600 !important;
}
.v-dialog{
  overflow-x: hidden;
}
@media print {
  thead { display: table-header-group !important; }
}
</style>
