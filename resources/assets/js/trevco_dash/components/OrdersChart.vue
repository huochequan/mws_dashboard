<script>
import { Bar } from 'vue-chartjs'
import dateArray from 'moment-array-dates';
// import * as moment from 'moment';

export default Bar.extend({
  mounted () {
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: dateArray.lastNDays(30, 'MMM DD', true),
      datasets: [
        {
          label: 'Fulfilled By Amazon',
          backgroundColor: '#7F0A1B',
          data: [4000, 2000, 1200, 3900, 1000, 4000, 3900, 8000, 4000, 2000, 4000, 2000, 1200, 3900, 1000, 4000, 3900, 8000, 4000, 2000, 4000, 2000, 1200, 3900, 1000, 4000, 3900, 8000, 4000, 14000]
        },
        {
          label: 'Fulfilled By Trevco',
          backgroundColor: '#CC102C',
          data: [4000, 2000, 1200, 3900, 1000, 4000, 3900, 8000, 4000, 2000, 4000, 2000, 1200, 3900, 1000, 4000, 3900, 8000, 4000, 2000, 4000, 2000, 1200, 3900, 1000, 4000, 3900, 8000, 4000, 3000]
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
