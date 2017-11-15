<template>
  <div class="animated fadeIn">
<!--     <b-jumbotron header="Trevco<strong>DASH</strong>" header-tag="h1" lead="Order dashboard" class="bd-pageheader">
    </b-jumbotron>     -->
    <div class="row bd-pageheader">
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body font-weight-bold pb-0">
            <h1 class="order-data-value text-center mb-0">${{ dashboardFormatted(salesToday) }}</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">Sales today</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body pb-0">
            <h1 class="order-data-value text-center mb-0">{{ ordersToday }}</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">Units today</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body pb-0">
            <h1 class="order-data-value text-center mb-0" :class="[monthlySalesLower ? 'negative':'positive']">{{ percentageDiffSalesPrevious30DaysSign }} {{ percentageDiffSalesPrevious30Days }}</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">Previous 30 days</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body font-weight-bold pb-0">
            <h1 class="order-data-value text-center mb-0">${{ dashboardFormatted(salesLast30Days) }}</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">Sales last 30 days</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body pb-0">
            <h1 class="order-data-value text-center mb-0">{{ unshippedCount }}</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">FBM Orders to ship</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body pb-0">
            <h1 class="order-data-value text-center mb-0" :class="[dailySalesLower ? 'negative':'positive']">{{ percentageDiffSalesYesterdaySign }} {{ percentageDiffSalesYesterday }}</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">Yesterday</p>
          </div>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->
    <img class="amazon-logo"
    src="/img/amazon-logo.svg" 
    alt="triangle with all three sides equal"
    height="30px"
    />
    <b-card header="Sales($)" class="borderless order-card">
        <orders-chart :width="1100" :salesData="salesData"/>
    </b-card>
  </div>
</template>

<script>
import OrdersChart from '../components/OrdersChart';
import axios from 'axios';
var arraySum = (x, y) =>{
  return x+y;
}

var kFormatter = num => (num > 999999) ? floorFigure((num/1000000)) + 'm' : (num > 99999) ? floorFigure((num/1000), 0) + 'k' : (num > 9999) ? floorFigure((num/1000), 1) + 'k' : num;
var floorFigure = (figure, decimals) => {
    if (decimals == undefined) decimals = 2;
    var d = Math.pow(10,decimals);
    return (parseInt(figure*d)/d).toFixed(decimals);
}
var round2Fixed = (value) => {
  value = +value;

  if (isNaN(value))
    return NaN;

  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + 2) : 2)));

  // Shift back
  value = value.toString().split('e');
  return kFormatter((+(value[0] + 'e' + (value[1] ? (+value[1] - 2) : -2))).toFixed(2));
}

export default {
  name: 'dashboard',
  components: {
    OrdersChart
  },
  data: function () {
    return {
      salesToday: 0,
      salesYesterday: 0,
      salesLast30Days: 0,
      salesPrevious30Days: 0,
      ordersToday: 0,
      unshippedCount: 0,
      salesData: []
    }
  },
  methods: {
    variant (value) {
      let $variant
      if (value <= 25) {
        $variant = 'info'
      } else if (value > 25 && value <= 50) {
        $variant = 'success'
      } else if (value > 50 && value <= 75) {
        $variant = 'warning'
      } else if (value > 75 && value <= 100) {
        $variant = 'danger'
      }
      return $variant
    },
    dashboardFormatted (value) {
      return round2Fixed(value);
    },
    loadOrders () {
      axios
        .get('/order')
        .then((response) => {
          this.salesToday = response.data.data.salesToday,
          this.salesYesterday = response.data.data.salesYesterday,
          this.salesLast30Days = response.data.data.salesLast30Days,
          this.salesPrevious30Days = response.data.data.salesPrevious30Days,
          this.ordersToday = response.data.data.ordersToday,
          this.unshippedCount = response.data.data.unshippedCount,
          this.salesData = response.data.data.saleDaysData
        });
    }
  },
  mounted () {
    this.loadOrders();
    setInterval(this.loadOrders.bind(this), 120000)
  },
  computed: {
     percentageDiffSalesYesterday() {
      if (this.salesYesterday == 0) {
        return "--";
      }
      return parseInt(Math.abs(this.salesToday - this.salesYesterday) / this.salesYesterday * 100) + "%" || "--";
    },
    percentageDiffSalesYesterdaySign() {
      if (this.salesYesterday == 0) {
        return "";
      }
      return parseFloat(this.salesToday) > parseFloat(this.salesYesterday) ? "+" : parseFloat(this.salesToday) == parseFloat(this.salesYesterday) ? "" : "-";
    },

     percentageDiffSalesPrevious30Days() {
      if (this.salesPrevious30Days == 0 ) {
        return "--";
      }
      return parseInt(Math.abs(this.salesLast30Days - this.salesPrevious30Days) / this.salesPrevious30Days * 100) + "%" || "--";
    },
    percentageDiffSalesPrevious30DaysSign() {
      if (this.salesPrevious30Days == 0) {
        return "";
      }
      return parseFloat(this.salesLast30Days) > parseFloat(this.salesPrevious30Days) ? "+" : parseFloat(this.salesLast30Days) == parseFloat(this.salesPrevious30Days) ? "" : "-";
    },
    dailySalesLower() {
      return this.salesYesterday > this.salesToday;
    },
    monthlySalesLower() {
      return this.salesPrevious30Days > this.salesLast30Days;
    }    
 }
}
</script>
