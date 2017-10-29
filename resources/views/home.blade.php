@extends('spark::layouts.core')

@section('content')
<home :user="user" inline-template>
    <div class="container">
        <!-- Application Dashboard -->
        <div class="row">
            <div class="col-md-8 col-md-offset-2">
                <div class="panel panel-default">
                    <div class="panel-heading">Dashboard</div>

                    <div class="panel-body">
                        <li><a href="">Add TeamTaskBot to your Slack Team</a></li>
                        <li><a href="">Create a TeamTask</a></li>

                    </div>
                </div>
            </div>
        </div>
    </div>
</home>
@endsection
