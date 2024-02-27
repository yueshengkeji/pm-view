<template>
    <v-card>
        <apply-for-car-check :frame-id="this.$route.params.id" :if-driver="true" :if-need-driver="false"></apply-for-car-check>
    </v-card>
</template>

<script>
    import applyForCarCheck from "../../components/1320277";

    export default {
        name:'driverTaskDetail',
        components:{applyForCarCheck},
    }
</script>