<div class="accordion-group fixture circle">
  <div class="accordion-heading">
    <a class="accordion-toggle inline-top" data-toggle="collapse" href="#collapse-fixture-<%= g.n %>">circle</a>
    <div class="pull-right btn-accordion inline-top">
      <button class="btn btn-icon-tiny icon-delete label-input"></button>
      <span class="caret"></span>
    </div>
  </div>
  <div id="collapse-fixture-<%= g.n %>" class="accordion-body collapse">
    <div class="accordion-inner">
      <div class="fixture-body" data-type="0">
        <div class="line-top top">
          <span class="label-input">x : </span>
          <input id="position-x" class="entity-member" type="number" step="5"></input>
          <input id="radius" class="entity-member pull-right" type="number" step="1"></input>
          <span class="pull-right label-input">radius : </span>
        </div>
        <div class="line-top bot">
          <span class="label-input">y : </span>
          <input id="position-y" class="entity-member" type="number" step="5"></input>
        </div>
      </div>
    </div>
  </div>
</div>

