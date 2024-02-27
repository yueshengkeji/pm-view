<template>
    <v-card>
        <apply-for-car-check :frame-id="this.$route.params.id" ></apply-for-car-check>
    </v-card>
</template>

<script>
    import applyForCarCheck from "../../components/1320277";

    export default {
        name:'driverTaskReview',
        components:{applyForCarCheck},
    }
</script>