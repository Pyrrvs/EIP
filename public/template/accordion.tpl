<div class="accordion-group">
  <div class="accordion-heading">
    <a class="accordion-toggle" data-toggle="collapse" data-parent="#<%= g.parent %>" href="#collapse-<%= g.id %>-<%= g.n %>"><%= g.name %></a>
    <div class="pull-right btn-accordion">
      <button id="create" class="btn btn-success btn-tiny label">new</button>
      <button id="delete" class="btn btn-danger btn-tiny label">delete</button>
    </div>
    </div>
    <div id="collapse-<%= g.id %>-<%= g.n %>" class="accordion-body collapse">
      <div class="accordion-inner">
        <ul class="nav nav-list"></ul>
      </div>
    </div>
  </div>
</div>
