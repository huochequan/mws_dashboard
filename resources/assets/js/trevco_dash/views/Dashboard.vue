<template>
  <div class="animated fadeIn">
    <b-jumbotron header="Trevco<strong>DASH</strong>" header-tag="h1" lead="Order dashboard" class="bd-pageheader">
    </b-jumbotron>    
    <div class="row">
      <div class="col-sm-6 col-lg-3">
        <h2><strong>Lists</strong></h2>
        <br>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12 col-lg-4">
        <b-card class="bg-primary" :no-block="true">
          <div class="card-body font-weight-bold pb-0">
            <b-dropdown class="float-right" variant="transparent p-0" right>
              <template slot="button-content">
                <i class="icon-settings"></i>
              </template>
              <b-dropdown-item>Action</b-dropdown-item>
              <b-dropdown-item>Another action</b-dropdown-item>
              <b-dropdown-item>Something else here...</b-dropdown-item>
              <b-dropdown-item disabled>Disabled action</b-dropdown-item>
            </b-dropdown>
            <div class="h1 text-right mb-4"><i class="icon-pie-chart"></i></div>
            <h4 class="mb-0">15</h4>
            <p class="h2 font-weight-bold">Active</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-4">
        <b-card class="bg-info" :no-block="true">
          <div class="card-body pb-0">
            <b-dropdown class="float-right" variant="transparent p-0" right>
              <template slot="button-content">
                <i class="icon-settings"></i>
              </template>
              <b-dropdown-item>Action</b-dropdown-item>
              <b-dropdown-item>Another action</b-dropdown-item>
              <b-dropdown-item>Something else here...</b-dropdown-item>
              <b-dropdown-item disabled>Disabled action</b-dropdown-item>
            </b-dropdown>
            <div class="h1 text-right mb-4"><i class="icon-pie-chart"></i></div>
            <h4 class="mb-0">5</h4>
            <p class="h2 font-weight-bold">Paused</p>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-12 col-lg-4">
        <b-card class="bg-warning" :no-block="true">
          <div class="card-body pb-0">
            <b-dropdown class="float-right" variant="transparent p-0" right>
              <template slot="button-content">
                <i class="icon-settings"></i>
              </template>
              <b-dropdown-item>Action</b-dropdown-item>
              <b-dropdown-item>Another action</b-dropdown-item>
              <b-dropdown-item>Something else here...</b-dropdown-item>
              <b-dropdown-item disabled>Disabled action</b-dropdown-item>
            </b-dropdown>
            <div class="h1 text-right mb-4"><i class="icon-pie-chart"></i></div>
            <h4 class="mb-0">6</h4>
            <p class="h2 font-weight-bold">Templates</p>
          </div>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->

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

export default {
  name: 'dashboard',
  components: {
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
