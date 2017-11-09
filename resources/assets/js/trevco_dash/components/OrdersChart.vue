<script>
import { Bar } from 'vue-chartjs'
import dateArray from 'moment-array-dates';
import Chart from 'chart.js'

import * as moment from 'moment';
var sameDay = (order) => { return moment().isSame(order.purchaseDate, 'day')};
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
Chart.defaults.global.defaultFontFamily = '"Signika",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
export default Bar.extend({
  props: {
    'orders': {
      type: Array,
      default: []
    }
  },
  data: function() {
    return {
      dailyFBASalesArray: [],
      dailyFBMSalesArray: []
    }
  },
  watch: {
    orders: function(newOrders) {
      this.dailyFBASalesArray = dateArray.range(moment().subtract(30,'days'),moment(), '', true).map(function(day) {
        var dayOrders = newOrders.filter((order) => {
              return moment(day).isSame(order.purchaseDate, 'day') && (order.fulfillmentData.fulfillmentChannel == "Amazon");
            })
        var dayOrdersSales = dayOrders.map((order) => {
        var order_items_total = order.order_item.map((item) => {
          return [].concat(item.itemPrice.component).reduce((x,y)=>{

            return parseFloat(x) + parseFloat(y.amount);
          }, 0.00);
        });
        return order_items_total.reduce(arraySum, 0);
      });
        return round2Fixed(dayOrdersSales.reduce(arraySum, 0))
      })

      this.dailyFBMSalesArray = dateArray.range(moment().subtract(30,'days'),moment(), '', true).map(function(day) {
        var dayOrders = newOrders.filter((order) => {
              return moment(day).isSame(order.purchaseDate, 'day') && (order.fulfillmentData.fulfillmentChannel == "Merchant");
            })
        var dayOrdersSales = dayOrders.map((order) => {
        var order_items_total = order.order_item.map((item) => {
          return [].concat(item.itemPrice.component).reduce((x,y)=>{
            return parseFloat(x) + parseFloat(y.amount);
          }, 0.00);
        });
        return order_items_total.reduce(arraySum, 0);
      });
        return round2Fixed(dayOrdersSales.reduce(arraySum, 0))
      })
      this.rerenderChart();
    }
  },
  methods: {
    rerenderChart () {
    this.renderChart({
      labels: dateArray.range(moment().subtract(30,'days'),moment(), 'MMM DD', true),
      datasets: [
        {
          label: 'FBA',
          backgroundColor: '#7F0A1B',
          data: this.dailyFBASalesArray,
        },
        {
          label: 'FBM',
          backgroundColor: '#CC102C',
          data: this.dailyFBMSalesArray
        }
      ]
    }, {
      legend: {
        display: true,
        labels: {
          fontColor: '#fff',
          fontSize: 20
        }
      },
      scales: {
        xAxes: [{
          stacked: true,
          barThickness: 40,
          ticks:{
            fontSize: 12,
            fontColor: '#fff'
          }
        }],
        yAxes: [{
          stacked: true,
          ticks:{
            fontSize: 18,
            fontColor: '#fff'
          }
        }]
      },
      responsive: true})
    }
  },
  mounted () {
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: dateArray.range(moment().subtract(30,'days'),moment(), 'MMM DD', true),
      datasets: [
        {
          label: 'FBA',
          backgroundColor: '#7F0A1B',
          data: [],
        },
        {
          label: 'FBM',
          backgroundColor: '#CC102C',
          data: []
        }
      ]
    }, {
      scales: {
        xAxes: [{
          stacked: true,
          barThickness: 40
        }],
        yAxes: [{
          stacked: true
        }]
      },
      responsive: true})
  }
})
</script>
