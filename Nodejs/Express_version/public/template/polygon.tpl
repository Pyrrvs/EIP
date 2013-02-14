<div class="accordion-group fixture polygon">
  <div class="accordion-heading">
    <a class="accordion-toggle inline-top" data-toggle="collapse" href="#collapse-fixture-<%= g.n %>">polygon</a>
    <div class="pull-right btn-accordion inline-top">
      <button id="create" class="btn btn-icon-tiny icon-add"></button>
      <button id="delete" class="btn btn-icon-tiny icon-delete label-input"></button>
      <span class="caret"></span>
    </div>
  </div>
  <div id="collapse-fixture-<%= g.n %>" class="accordion-body collapse">
    <div class="accordion-inner">
		<div class="fixture" data-type="1">
			<div class="line-top top">
				<span class="label-input">x : </span>
				<input id="position-x" class="entity-member" type="number" step="5"></input>
				<input id="position-y" class="entity-member pull-right" type="number" step="5"></input>
				<span class="label-input pull-right">y : </span>
			</div>
 				<div class="line-separator"></div>
 			</div>
	</div>
</div>
