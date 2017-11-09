<template>
  <div class="animated fadeIn">
<!--     <b-jumbotron header="Trevco<strong>DASH</strong>" header-tag="h1" lead="Order dashboard" class="bd-pageheader">
    </b-jumbotron>     -->
    <div class="row bd-pageheader">
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body font-weight-bold pb-0">
            <h1 class="order-data-value text-center mb-0">${{ salesToday }}</h1>
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
            <h1 class="order-data-value text-center mb-0">+ 70%</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">Previous 30 days</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body font-weight-bold pb-0">
            <h1 class="order-data-value text-center mb-0">${{ salesLast30Days }}</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">Sales last 30 days</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body pb-0">
            <h1 class="order-data-value text-center mb-0">300</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">FBM Orders to ship</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-darken" :no-block="true">
          <div class="card-body pb-0">
            <h1 class="order-data-value text-center mb-0">+ 20%</h1>
            <p class="h5 order-data-caption text-center font-weight-bold">Yesterday</p>
          </div>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->
    <b-card header="Sales ($)" class="borderless order-card">
        <orders-chart :width="1100" :orders="orders"/>
    </b-card>
  </div>
</template>

<script>
import OrdersChart from '../components/OrdersChart';
import axios from 'axios';
import * as moment from 'moment';
var arraySum = (x, y) =>{
  return x+y;
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
  return (+(value[0] + 'e' + (value[1] ? (+value[1] - 2) : -2))).toFixed(2);
}

var last30Days = (order) => { return moment(order.purchaseDate).isBetween(moment().startOf('day').subtract(30, 'day'), moment().endOf('day'))};
var sameDay = (order) => { return moment().isSame(order.purchaseDate, 'day')};

export default {
  name: 'dashboard',
  components: {
    OrdersChart
  },
  data: function () {
    return {
      orders: []
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
    }
  },
  mounted () {
    axios
      .get('/order')
      .then((response) => {
        // console.log(response.data);
        this.orders = response.data.data;
      });
  },
  computed: {
    salesTotal() {
      var sT = this.orders.map((order) => {
        var order_items_total = order.order_item.map((item) => {
          return [].concat(item.itemPrice.component).reduce((x,y)=>{
            return parseFloat(x)+parseFloat(y.amount);
          }, 0);
        });
        return order_items_total.reduce(arraySum, 0);
      });
      return round2Fixed(sT.reduce(arraySum, 0));
    },
    salesToday() {
      var sT = this.orders.filter(sameDay).map((order) => {
        var order_items_total = order.order_item.map((item) => {
          return [].concat(item.itemPrice.component).reduce((x,y)=>{
            return parseFloat(x)+parseFloat(y.amount);
          }, 0);
        });
        return order_items_total.reduce(arraySum, 0);
      });
      return round2Fixed(sT.reduce(arraySum, 0));
    },
    salesLast30Days() {
      var sT = this.orders.filter(last30Days).map((order) => {
        var order_items_total = order.order_item.map((item) => {
          return [].concat(item.itemPrice.component).reduce((x,y)=>{
            return parseFloat(x)+parseFloat(y.amount);
          }, 0);
        });
        return order_items_total.reduce(arraySum, 0);
      });
      return round2Fixed(sT.reduce(arraySum, 0));
    },
    orderCountLast30Days() {
      return this.orders.filter(last30Days).length;
    },
    ordersToday() {
      return this.orders.filter(sameDay).length;
    }
  }
}
</script>
