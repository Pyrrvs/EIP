<div class="accordion-group">
  <div class="accordion-heading">
    <a class="accordion-toggle" data-toggle="collapse" data-parent="#<%= rc.parent %>" href="#collapse-<%= rc.id %>-<%= rc.n %>"><%= rc.name %></a>
    <div class="pull-right btn-accordion">
      <button class="btn btn-success btn-tiny label">new</button>
      <button class="btn btn-danger btn-tiny label">delete</button>
    </div>
    </div>
    <div id="collapse-<%= rc.id %>-<%= rc.n %>" class="accordion-body collapse">
      <div class="accordion-inner">
        <ul class="nav nav-list"></ul>
      </div>
    </div>
  </div>
</div>
