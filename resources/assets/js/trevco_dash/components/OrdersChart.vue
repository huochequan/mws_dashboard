<script>
import { Bar } from 'vue-chartjs'
import dateArray from 'moment-array-dates';
import Chart from 'chart.js'

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

Chart.defaults.global.defaultFontFamily = '"Signika",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';


export default Bar.extend({
  props: {
    'salesData': {
      type: Array,
      default: []
    }
  },
  data: function() {
    return {
      popfunkDailyFBASalesArray: [],
      popfunkDailyFBMSalesArray: [],
      trevcoFBASalesArray: [],
      trevcoFBMSalesArray: []
    }
  },
  watch: {
    salesData: function(newOrders) {
      this.popfunkDailyFBASalesArray = newOrders.map(function(elem) {
        return elem.sales.filter(function(saleData) {
          return saleData.seller == "popfunk";
        }).reduce(function (sum, value) {
          console.log(value.dayFBASales);
          return sum + value.dayFBASales
        }, 0);
      })
      this.popfunkDailyFBMSalesArray = newOrders.map(function(elem) {
        return elem.sales.filter(function(saleData) {
          return saleData.seller == "popfunk";
        }).reduce(function (sum, value) {
          return sum + value.dayFBMSales
        }, 0);
      })
      // Trevco
      this.trevcoDailyFBASalesArray = newOrders.map(function(elem) {
        return elem.sales.filter(function(saleData) {
          return saleData.seller == "trevco";
        }).reduce(function (sum, value) {
          console.log(value.dayFBASales);
          return sum + value.dayFBASales
        }, 0);
      })
      this.trevcoDailyFBMSalesArray = newOrders.map(function(elem) {
        return elem.sales.filter(function(saleData) {
          return saleData.seller == "trevco";
        }).reduce(function (sum, value) {
          return sum + value.dayFBMSales
        }, 0);
      })

      this.rerenderChart();
    }
  },
  methods: {
    rerenderChart () {
    this.renderChart({
      labels: this.salesData.map(x => x.purchaseDate),
      datasets: [
        {
          label: 'Trevco - FBA',
          backgroundColor: '#7F0A1B',
          data: this.trevcoDailyFBASalesArray,
        },
        {
          label: 'Trevco - FBM',
          backgroundColor: '#CC102C',
          data: this.trevcoDailyFBMSalesArray
        },
        {
          label: 'Popfunk - FBA',
          backgroundColor: '#003B91',
          data: this.popfunkDailyFBASalesArray,
        },
        {
          label: 'Popfunk - FBM',
          backgroundColor: '#0072BB',
          data: this.popfunkDailyFBMSalesArray
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
          gridLines: {
            display: true,
            offsetGridLines: true,
            color: 'rgba(255, 255, 255, 0.3)',
            lineWidth: 0.5
          },
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
          barThickness: 40,
          gridLines: {
            color: "rgba(255, 255, 255, 0.5)",
            lineWidth: 1
          }
        }],
        yAxes: [{
          stacked: true,
          gridLines: {
            color: "rgba(255, 255, 255, 0.5)",
            lineWidth: 1
          }
        }]
      },
      responsive: true})
  }
})
</script>
