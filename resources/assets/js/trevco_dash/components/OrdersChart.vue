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
      dailyFBASalesArray: [],
      dailyFBMSalesArray: []
    }
  },
  watch: {
    salesData: function(newOrders) {
      this.dailyFBASalesArray = newOrders.map(function(elem) {
        return elem.dayFBASales;
      })
      this.dailyFBMSalesArray = newOrders.map(function(elem) {
        return elem.dayFBMSales;
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
