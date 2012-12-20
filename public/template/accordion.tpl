<div class="accordion-group">
  <div class="accordion-heading">
    <a class="accordion-toggle" data-toggle="collapse" data-parent="#<%= g.parent %>" href="#collapse-<%= g.id %>-<%= g.n %>"><%= g.name %></a>
    <div class="pull-right btn-accordion">
      <button id="create" class="btn btn-icon-tiny icon-add"></button>
      <button id="delete" class="btn btn-icon-tiny icon-delete label-input"></button>
      <span class="caret"></span>
    </div>
  </div>
  <div id="collapse-<%= g.id %>-<%= g.n %>" class="accordion-body collapse">
    <div class="accordion-inner">
      <ul class="nav nav-list"></ul>
    </div>
  </div>
</div>
