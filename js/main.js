$(document).ready(function(){
	//initialize datepicker
    $('.filter-date').datepicker({
		format: 'dd-M-yy',
        todayHighlight: true,
		autoclose : true
	});
	
	//initialize accordion
	$("#accordion").find('.panel-collapse:first').addClass("in");
   
   // show button to delete row when date, amount or group is selected
   $(document).on('changeDate','.filter-date', function () {
		toggleDeleteButton(this,'date');
	});
	$(document).on('change','select.filter-amount', function () {
		toggleDeleteButton(this);
	});
	$(document).on('change','select.filter-group', function () {
		toggleDeleteButtonForMultiselect(this);
	});
	$(document).on('click','.tag', function () {
		deleteByTag(this);
	});
	
	//customize links in multiselect box
	$('.bs-select-all').text('Check all').addClass('text-link');
	$('.bs-deselect-all').text('Uncheck all').addClass('text-link');
	
	// display dependent dropdowns based on first dropdown selected
	 $(document).on('change','select.first-filter',function(){
		 toggleOptions(this);
	 });
	  
});
/* Display dependent dropdown based on first dropdown */
function toggleOptions(e){
	
	//hide possibly shown error msg
	$('.error_message').addClass('hide');
	
	//hide button to delete row incase dislayed
	$('.delete-row').addClass('hide');
	
	var value = $(e).val();
	var parent_el = $(e).parent().parent();

	if($(parent_el).hasClass('form-group')) {
		parent_el = parent_el.parent();
	} else {
		parent_el = $(parent_el).parent().parent();
	}

	if(!value) {
		//in case this is triggered on the selectpickers as well.
		return false;
	}
		
	if(value == 'comments') {
		if($(parent_el).parent().find('.filter-two').hasClass('hide')){
			$(parent_el).parent().find('.filter-two').removeClass('hide');
			$(parent_el).parent().find('.filter-period').addClass('hide');
			$(parent_el).parent().find('.filter-datepicker').addClass('hide');
			$(parent_el).parent().find('.filter-multiselect').addClass('hide');
		}
		//only enable selectpicker when the event is triggered
		$(parent_el).parent().find('.filter-two').find('.selectpicker').prop('disabled', false );
		$(parent_el).parent().find('.filter-two').find('.selectpicker').selectpicker('refresh'); 
	} else if(value == 'registration_date') {
		$(parent_el).parent().find('.filter-two').addClass('hide');
		$(parent_el).parent().find('.filter-multiselect').addClass('hide');
		$(parent_el).parent().find('.filter-period').removeClass('hide');
		$(parent_el).parent().find('.filter-datepicker').removeClass('hide');
	} else if(value == "usergroup") {
		$(parent_el).parent().find('.filter-two').addClass('hide');
		$(parent_el).parent().find('.filter-period').addClass('hide');
		$(parent_el).parent().find('.filter-datepicker').addClass('hide');
		$(parent_el).parent().find('.filter-multiselect').removeClass('hide');
	}
}

function checkUser(e) {
	
	//hide possibly shown error msg
	$('.error_message').addClass('hide');
	//check if all users need to be selected
	if($(e).attr('data-select') == 'all'){ 
		selectAllUsers(e)
	} else {
		selectUser(e);
	}
}

function selectAllUsers(e) {
	//check if clicked element is checked or unchecked
    if ($(e).prop('checked')) {
        //if true, check all boxes
        $('.select_users').each(function () {
            $(this).prop('checked', true);
			toggleRowHighlight($(this).parent().parent(), true);
			toggleAdditionalFilters(e, true)
        });
    } else {
        // if false, uncheck all boxes
        $('.select_users').each(function () {
            $(this).prop('checked', false);
			toggleRowHighlight($(this).parent().parent(), false);
			toggleAdditionalFilters(e, false)
        });
    }
}

function selectUser(e) {
	var is_checked =  $(e).prop('checked')? true : false;
	toggleAdditionalFilters(e ,is_checked);
 	toggleRowHighlight($(e).parent().parent(), is_checked);

}

function toggleRowHighlight(e, is_checked) {
	//hide possibly shown error msg
	$('.error_message').addClass('hide');
	if(is_checked) {
		$(e).addClass('row-selected');
	} else {
		$(e).removeClass('row-selected');	
	}
}

function toggleAdditionalFilters(e, is_checked) {
	//hide possibly shown error msg
	$('.error_message').addClass('hide');
	var show_filter = $(e).attr('data-show');
	var checked_users_length = $(".users-overview > tbody > tr.row-selected").length;
	//even  if there is one selected row in the table do not hide the additional filters.
	if(checked_users_length > 1) {
		is_checked = true;
	}
	if(is_checked) {
		$('.'+show_filter).removeClass('hide');
	} else {
		$('.'+show_filter).addClass('hide');
	}
}

function cloneFilters(e) {
	//hide possibly shown error msg
	$('.error_message').addClass('hide');
	
	var row_to_clone = $(e).attr('data-clone');
	var last_filter_row = $('div[id^="filter"]:last');
	// Read the Number from that DIV's ID (i.e: 1 from "filter1")
	// And increment that number by 1
	var num = parseInt( last_filter_row.prop("id").match(/\d+/g), 10 ) +1;
	// Clone it and assign the new ID (i.e: from num 2 to ID "filter2")
	var cloned_filters = $('#'+row_to_clone).clone();
	//change id of the cloned filter
	cloned_filters.prop('id', 'filter'+num );
	//delete the existing bootstrap select boxes
	cloned_filters.find('.selectpicker').siblings().remove();
	cloned_filters.find('.filter-two').find('select').attr('disabled', true);
	
	//regenerate the select boxes
	cloned_filters.find('.selectpicker').selectpicker();
	cloned_filters.find('.selectpicker').selectpicker('refresh');
	// customize to links in multiselect boxes
	cloned_filters.find('.bs-select-all').text('Check all').addClass('text-link');
	cloned_filters.find('.bs-deselect-all').text('Uncheck all').addClass('text-link');
	
	cloned_filters.children().addClass('hide');
	cloned_filters.find('.filter-one, .filter-two').removeClass('hide');
	
	//datrpickers
	cloned_filters.find('.filter-date').datepicker('destroy');
    cloned_filters.find('.filter-date').datepicker({
		format: 'dd-M-yy',
        todayHighlight: true,
		autoclose : true
	});
	cloned_filters.insertAfter('#'+last_filter_row.prop("id"));
	//add a tag per filter row 
	createTagButton();
}

/* Delete filter row */
function toggleDeleteButton(e, option_type){
	
	//hide possibly shown error msg
	$('.error_message').addClass('hide');
	
	/* hack to work with cloned selectpicker */
	var parent_el = $(e).parent().parent().parent();
	// for initial row of filters never allow delete
	if($(parent_el).attr('id') != undefined && option_type != 'date') {
		$('.error_message').removeClass('hide');
		return false;
	}
	
	if($(parent_el).hasClass('delete-row')) {
		parent_el = parent_el;
	} else {
		if(option_type != 'date'){
			parent_el = $(parent_el).parent().parent();
		}
	}

	var delete_row = $(parent_el).find('.delete-row');

	if(delete_row.hasClass('hide')){
		delete_row.removeClass('hide');
	} else {
		delete_row.addClass('hide');
	}
}

/* Delete filter when last filter is multiselect */
function toggleDeleteButtonForMultiselect(e) {
	
	var parent_el = $(e).parent().parent().parent();
	
	// for initial row of filters never allow delete
	if($(parent_el).attr('id') != undefined) {
		$('.error_message').removeClass('hide');
		return false;
	}
	
	/*hack to make it work with cloned selectpicker */
	if($(parent_el).hasClass('delete-row')) {
		parent_el = parent_el;
	} else {
		parent_el = $(parent_el).parent().parent();
	}
	
     var selected_array = [];
	 var delete_row = $(parent_el).find('.delete-row');

	 $(e).find("option:selected").each(function(key,value){
        selected_array.push(value.innerHTML); //push the text to array
    });
	//display button to delete row only when no options are selected
	if(selected_array.length == 0) {
		delete_row.addClass('hide');
	} else {
		delete_row.removeClass('hide');
	}
}

/* HTML Hardcoded for ease of use could be done using templates */
function createTagButton(){
	if($('.tag-container').children().length == 0 ) {
		$('.tag-container').append('<div class="col-lg-3 col-xs-2 tag btn btn-grey first-tag"><span class="glyphicon glyphicon-remove"></span>tag A</div>');
	} else {
		$('.tag-container').append('<div class="col-lg-3 col-xs-2 tag btn btn-grey margin-1"><span class="glyphicon glyphicon-remove"></span>tag A</div>');
	}
	$('.clear-all-tags').text('Clear selection');
}

function deleteByTag(e){
	$(e).remove();
	//remove filters in reverse order of addition
	$('.search-filter div.filter-options:last').remove();
}

function deleteRowFilters(e){
	var permanent_row_id = $(e).parent().parent().attr('id');
	if(permanent_row_id == 'filter1'){
		//hide button to delete as its the original row
		$(e).parent().addClass('hide');
		$('.error_message').removeClass('hide');
		return false;
	} else {
		$(e).parent().parent().remove();
	}
	$('.tag-container div.tag:last').remove();
}

function clearAllFilters(e){
	$('.tag').remove();
	$('.search-filter div.filter-options').not(':first').remove();
	$('.clear-all-tags').html('&nbsp;');
}