<template>
  <div class="animated fadeIn">
    <b-jumbotron header="DeesonAgency <strong>Lists</strong>" header-tag="h1" lead="Teamtask project tasks" class="bd-pageheader">
    </b-jumbotron>    
    <div class="row">
      <div class="col-md-12">
        <b-card border-variant="light" class="borderless">
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
            <template slot="task" scope="item">
              <div class="task-entry bolder">{{item.value.name}}</div>
              <div class="small text-muted">
               <span class="bolder faded">{{item.value.detail}}</span> |
                <span>
                  <template v-if="item.value.new">Once</template>
                  <template v-else>Recurring</template>
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

export default {
  name: 'tasklists',
  components: {
  },
  data: function () {
    return {
      tableItems: [
        {
          action: { url: 'static/img/avatars/1.jpg', status: 'success' },
          task: { name: 'Create Slack Account', new: true, detail: 'Onboarding List for Jason' },
          due: { date: 'Today'},
          notification_settings: { value: 50, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'Mastercard', icon: 'fa fa-cc-mastercard' },
          activity: '10 sec ago',
          state: 1
        },
        {
          action: { url: 'static/img/avatars/2.jpg', status: 'danger' },
          task: { name: 'Submit Timesheets', new: false, detail: 'Timesheets' },
          due: { date: 'Today'},
          notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'Visa', icon: 'fa fa-cc-visa' },
          activity: '5 minutes ago',
          state: 2
        },
        {
          action: { url: 'static/img/avatars/3.jpg', status: 'warning' },
          task: { name: 'Complete IT Audit', new: false, detail: 'IT Audit List' },
          due: { date: 'Today'},
          notification_settings: { value: 74, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'Stripe', icon: 'fa fa-cc-stripe' },
          activity: '1 hour ago',
          state: 2
        },
        {
          action: { url: 'static/img/avatars/4.jpg', status: '' },
          task: { name: 'Assign Recurrent Tasks', new: true, detail: 'Redelegate Tasks From Other Users' },
          due: { date: 'Tomorrow'},
          notification_settings: { value: 98, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'PayPal', icon: 'fa fa-paypal' },
          activity: 'Last month',
          state: 4
        },
        {
          action: { url: 'static/img/avatars/5.jpg', status: 'success' },
          task: { name: 'Enable Bot Notifications', new: true, detail: 'Task Bot Sync' },
          due: { date: '3 days from now'},
          notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'Google Wallet', icon: 'fa fa-google-wallet' },
          activity: 'Last week',
          state: 1
        }
      ],
      tableFields: {
        action: {
          label: '<i class="fa fa-gear"></i>',
          class: 'text-center'
        },
        task: {
          label: 'Task'
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
