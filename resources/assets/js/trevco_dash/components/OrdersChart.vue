<script>
import { Bar } from 'vue-chartjs'

export default Bar.extend({
  mounted () {
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [
        {
          label: 'Fulfilled By Amazon',
          backgroundColor: '#7F0A1B',
          data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
        },
        {
          label: 'Fulfilled By Trevco',
          backgroundColor: '#CC102C',
          data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
        }
      ]
    }, {
      scales: {
        xAxes: [{
          stacked: true,
          barThickness: 100
        }],
        yAxes: [{
          stacked: true
        }]
      },
      responsive: true})
  }
})
</script>
