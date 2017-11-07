<template>
  <div class="animated fadeIn">
<!--     <b-jumbotron header="Trevco<strong>DASH</strong>" header-tag="h1" lead="Order dashboard" class="bd-pageheader">
    </b-jumbotron>     -->
    <div class="row bd-pageheader">
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-warning" :no-block="true">
          <div class="card-body font-weight-bold pb-0">
            <h2 class="order-data-value text-center mb-0">$5,000</h2>
            <p class="h5 order-data-caption text-center font-weight-bold">Sales today</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-warning" :no-block="true">
          <div class="card-body pb-0">
            <h2 class="order-data-value text-center mb-0">30</h2>
            <p class="h5 order-data-caption text-center font-weight-bold">Units today</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-warning" :no-block="true">
          <div class="card-body pb-0">
            <h2 class="order-data-value text-center mb-0">+ 70%</h2>
            <p class="h5 order-data-caption text-center font-weight-bold">Previous 30 days</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-warning" :no-block="true">
          <div class="card-body font-weight-bold pb-0">
            <h2 class="order-data-value text-center mb-0">$500k</h2>
            <p class="h5 order-data-caption text-center font-weight-bold">Sales last 30 days</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-warning" :no-block="true">
          <div class="card-body pb-0">
            <h2 class="order-data-value text-center mb-0">300</h2>
            <p class="h5 order-data-caption text-center font-weight-bold">FBM Orders to ship</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-2">
        <b-card class="order-detail-card bg-warning" :no-block="true">
          <div class="card-body pb-0">
            <h3 class="order-data-value text-center mb-0">+ 20%</h3>
            <p class="h5 order-data-caption text-center font-weight-bold">Yesterday</p>
          </div>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->
<!--     <div class="row">
      <div class="col-sm-6 col-lg-3">
        <h2><strong>Lists</strong></h2>
        <br>
      </div>
    </div> -->
    <b-card header="Sales ($)" class="borderless order-card">
        <orders-chart :width="1100"/>
    </b-card>

    <div class="row">
      <div class="col-md-12">
        <b-card title="<h5><strong>Upcoming tasks</strong></h5>" border-variant="light" class="borderless">
          <b-table class="table-task-list mb-0" hover responsive 
            :items="tableItems"
            :fields="tableFields"
            head-variant="light"
            >
            <template slot="action" scope="item">
              <div class="avatar">
              <i class="fa fa-check-circle-o fa-lg light-faded"></i>
              </div>
            </template>
            <template slot="tasklist" scope="item">
              <div class="task-entry bolder">
                {{item.value.name}}
                <b-button size="sm" variant="outline-primary" class="btn-edit borderless">
                  <i class="fa fa-pencil"></i>
                </b-button>
              </div>
              <div class="small text-muted">
               <span class="bolder faded">{{item.value.detail}}</span> |
                <span>
                  <template v-if="item.value.new"><strong>Once</strong></template>
                  <template v-else><strong>Recurring</strong></template>
                </span>
              </div>
            </template>
            <template slot="due" scope="item">
              <strong>{{ item.value.date }}</strong>
            </template>
            <template slot="state" scope="item">
              <div class="clearfix">
                <div class="float-left">
                  <b-form-radio id="btnradios2"
                    class="mb-4"
                    buttons
                    button-variant="outline-primary borderless"
                    size="sm"
                    v-model="item.value"
                    :options="statusOptions" />
                </div>
              </div>
            </template>
          </b-table>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->
  </div>
</template>

<script>
import OrdersChart from '../components/OrdersChart';
export default {
  name: 'dashboard',
  components: {
    OrdersChart
  },
  data: function () {
    return {
      tableItems: [
        {
          action: {},
          tasklist: { name: 'Create Slack Account', new: true, detail: 'Onboarding List for Jason' },
          due: { date: 'Today'},
          notification_settings: { value: 50, period: 'Jun 11, 2015 - Jul 10, 2015' },
          activity: '10 sec ago',
          state: 1
        },
        {
          action: {},
          tasklist: { name: 'Submit Timesheets', new: false, detail: 'Timesheets' },
          due: { date: 'Today'},
          notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
          activity: '5 minutes ago',
          state: 2
        },
        {
          action: {},
          tasklist: { name: 'Complete IT Audit', new: false, detail: 'IT Audit List' },
          due: { date: 'Today'},
          notification_settings: { value: 74, period: 'Jun 11, 2015 - Jul 10, 2015' },
          activity: '1 hour ago',
          state: 2
        },
        {
          action: {},
          tasklist: { name: 'Assign Recurrent Tasks', new: true, detail: 'Redelegate Tasks From Other Users' },
          due: { date: 'Tomorrow'},
          notification_settings: { value: 98, period: 'Jun 11, 2015 - Jul 10, 2015' },
          activity: 'Last month',
          state: 4
        },
        {
          action: {},
          tasklist: { name: 'Enable Bot Notifications', new: true, detail: 'Task Bot Sync' },
          due: { date: '3 days from now'},
          notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
          activity: 'Last week',
          state: 1
        }
      ],
      tableFields: {
        action: {
          label: '<i class="fa fa-gear"></i>',
          class: 'text-center'
        },
        tasklist: {
          label: 'Task List'
        },
        due: {
          label: 'Due',
          class: ''
        },
        state: {
          label: 'Notification Settings',
        },
      },
      statusOptions: [
        {text: "Off", value: 1},
        {text: "Once", value: 2},
        {text: "Daily", value: 3},
        {text: "Escalating", value: 4},
      ],       
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
  }
}
</script>
