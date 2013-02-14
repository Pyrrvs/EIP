<div class="accordion-group">
  <div class="accordion-heading">
    <a class="accordion-toggle inline-top" data-toggle="collapse" data-parent="#<%= g.parent %>" href="#collapse-<%= g.id_group %>-<%= g.n %>"><%= g.id %></a>
    <div class="pull-right btn-accordion inline-top">
      <button class="btn btn-icon-tiny icon-add"></button>
      <button class="btn btn-icon-tiny icon-delete label-input"></button>
      <span class="caret"></span>
    </div>
  </div>
  <div id="collapse-<%= g.id_group %>-<%= g.n %>" class="accordion-body collapse">
    <div class="accordion-inner">
      <ul class="nav nav-list"></ul>
    </div>
  </div>
</div>
