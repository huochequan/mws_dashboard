<template>
  <div class="animated fadeIn">
    <b-jumbotron header="Active List" header-tag="h4" class="bd-pageheader">
      <h1 class="bolder">Onboarding List</h1>
    </b-jumbotron>    
    <div class="row">
      <div class="container">
        <div class="row">
          <div class="col-sm-6 col-lg-3">
            <p class="bolder">Recurring Rules</p>
            <br>
          </div>
        </div>
      </div>
    </div>
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
              <h4 class="task-entry bolder">{{item.value.name}}</h4>
              <div class="small text-muted">
               <span class="bolder faded">{{item.value.detail}}</span> |
                <span>
                  <template v-if="item.value.new">Once</template>
                  <template v-else>Recurring</template>
                </span>
              </div>
            </template>
            <template slot="assignees" scope="item">
              <div class="clearfix">
                <div class="float-left">
                  <img v-for="assignee in item.value" :src="getRandomImageFromRange(1,8)" class="img-fluid img-thumbnail rounded-circle img-assignee-list" :alt="assignee.name">
                  <b-button size="circle" variant="outline-primary" class="light-faded">
                    <span class="bolder">+</span>
                  </b-button>                  
                </div>
              </div>
            </template>
            <template slot="due" scope="item">
              <strong>{{ item.value.date }}</strong>
            </template>
          </b-table>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->
  </div>
</template>

<script>

export default {
  name: 'tasklist',
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
          assignees:[
            {
              name: "John Doe",
              email: "john@example.com",
              image_url: "static/img/avatars/1.jpg"
            },
            {
              name: "Jane Doe",
              email: "john@example.com",
              image_url: "static/img/avatars/1.jpg"
            },
            {
              name: "Beth Doe",
              email: "john@example.com",
              image_url: "static/img/avatars/1.jpg"
            },

          ]
        },
        {
          action: { url: 'static/img/avatars/2.jpg', status: 'danger' },
          task: { name: 'Submit Timesheets', new: false, detail: 'Timesheets' },
          due: { date: 'Today'},
          notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'Visa', icon: 'fa fa-cc-visa' },
          activity: '5 minutes ago',
          assignees: [
            {
              name: "John Doe",
              email: "john@example.com",
              image_url: "static/img/avatars/1.jpg"
            },
            {
              name: "John Doe",
              email: "john@example.com",
              image_url: "static/img/avatars/1.jpg"
            }
          ]
        },
        {
          action: { url: 'static/img/avatars/3.jpg', status: 'warning' },
          task: { name: 'Complete IT Audit', new: false, detail: 'IT Audit List' },
          due: { date: 'Today'},
          notification_settings: { value: 74, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'Stripe', icon: 'fa fa-cc-stripe' },
          activity: '1 hour ago',
          assignees: [{
            name: "John Doe",
            email: "john@example.com",
            image_url: "static/img/avatars/1.jpg"
          }]
        },
        {
          action: { url: 'static/img/avatars/4.jpg', status: '' },
          task: { name: 'Assign Recurrent Tasks', new: true, detail: 'Redelegate Tasks From Other Users' },
          due: { date: 'Tomorrow'},
          notification_settings: { value: 98, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'PayPal', icon: 'fa fa-paypal' },
          activity: 'Last month',
          assignees: [{
            name: "John Doe",
            email: "john@example.com",
            image_url: "static/img/avatars/1.jpg"
          }]
        },
        {
          action: { url: 'static/img/avatars/5.jpg', status: 'success' },
          task: { name: 'Enable Bot Notifications', new: true, detail: 'Task Bot Sync' },
          due: { date: '3 days from now'},
          notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
          payment: { name: 'Google Wallet', icon: 'fa fa-google-wallet' },
          activity: 'Last week',
          assignees: [{
            name: "John Doe",
            email: "john@example.com",
            image_url: "static/img/avatars/1.jpg"
          }]
        }
      ],
      tableFields: {
        action: {
          label: '<i class="fa fa-gear"></i>',
          class: 'text-center'
        },
        task: {
          label: ''
        },
        assignees: {
          label: 'Members',
        },
        due: {
          label: 'Due',
          class: ''
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
    },
    getRandomImageFromRange(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return `static/img/avatars/${Math.floor(Math.random() * (max - min)) + min}.jpg`; //The maximum is exclusive and the minimum is inclusive
    }
  }
}
</script>
