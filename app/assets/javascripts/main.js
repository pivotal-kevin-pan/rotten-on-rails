var selectedMovieId;
var searchString = '';
var searchPage = -1;
var searchTotalItems = -1;
var SEARCH_ITEMS_PER_PAGE = 7;

pageMappings = {
	HOME : '',
	MOVIEINFO : 'movieInfo',
	SEARCH: 'search'
}

transitionMappings = {
	GENERAL : 'general',
	SEARCH2SEARCH : 'search2search'
}

$(function() {
	$(window).on("popstate", function(e) {
	    if (e.originalEvent.state !== null) {
	    	searchString = e.originalEvent.state.searchString;
      		searchPage = e.originalEvent.state.searchPage;
      		changePage(e.originalEvent.state.page, transitionMappings.GENERAL, true);
    	}
	} );

	getPageData();

	window.history.replaceState({page:page, searchString:searchString, searchPage:searchPage}, '', getUrlPathAfterDomain());

	pageSetup(page, transitionMappings.GENERAL);
});

function ajaxNavigate(page, transition, browserBackButtonPress) {
	var publicParams = '';
	var hiddenParams = '';
	var request = null;
	if (page === pageMappings.HOME) {
		hiddenParams = 'ajax=true';
		request = $.ajax({
			url: '/',
			type: "get",
			data: publicParams + hiddenParams
		});	
	} else if (page === pageMappings.MOVIEINFO) {
		publicParams = "id=" + selectedMovieId;
		hiddenParams = "&ajax=true";
		request = $.ajax({
			url: "/" + page,
			type: "get",
			data: publicParams + hiddenParams
		});
	} else if (page === pageMappings.SEARCH) {
		if (searchString) {
			publicParams = "search=" + searchString + "&page=" + searchPage;
		}
		hiddenParams = '&ajax=true';
		if (transition == transitionMappings.SEARCH2SEARCH) {
			hiddenParams += "&partial=true";
		}
		request = $.ajax({
			url: "/" + page,
			type: "get",
			data: publicParams + hiddenParams
		});
	}
 
	if (request) {
		request.done(function (response, textStatus, jqXHR) {
			var ajaxContent;
			if (transition == transitionMappings.GENERAL) ajaxContent = document.getElementById('ajaxContent');
			else ajaxContent = document.getElementById('ajaxContent_2');
			ajaxContent.style.display = 'block';
			ajaxContent.innerHTML = response;
			$('#spinner').remove();

			pageSetup(page, transition);
			if (publicParams !== '') publicParams = '?' + publicParams;
			if (!browserBackButtonPress)
				window.history.pushState({
					page:page, 
					searchString:searchString, 
					searchPage:searchPage}, '', '/' + page + publicParams);
		});
	}
}

function pageSetup(page, transition) {
	if (page === pageMappings.HOME) {
		$( '.movieLink' ).click(function() {
			selectedMovieId = this.id;
			changePage(pageMappings.MOVIEINFO, transitionMappings.GENERAL, false);
		});
		$( '#searchForm' ).submit(function () {
			searchString = $( this ).find( 'input' ).val();
			searchPage = 1;
			changePage(pageMappings.SEARCH, transitionMappings.GENERAL, false);
			return false;
		});
		document.onkeydown = function (e) {};
	} else if (page === pageMappings.MOVIEINFO){
		$( '#backButton' ).click( function () {
			changePage(pageMappings.HOME, transitionMappings.GENERAL, false);
		});

		document.onkeydown = function (e) {};
	} else if (page === pageMappings.SEARCH) {
		if (searchString) {
			setupPagingButtonsAndSetupKeys();
		} else {
			$(document).keydown(function (e) {});
		}
		$( '#searchForm' ).find('input').val(searchString);
		$( '.movieLink' ).click(function() {
			selectedMovieId = this.id;
			changePage(pageMappings.MOVIEINFO, transitionMappings.GENERAL, false);
		});
		$( '#searchForm' ).submit(function () {
			searchString = $( this ).find( 'input' ).val();
			searchPage = 1;
			changePage(pageMappings.SEARCH, transitionMappings.GENERAL, false);
			return false;
		});
	}
}

function getUrlPathAfterDomain () {
	var a = document.createElement('a');
	a.href = document.URL;
	return a.pathname + a.search;
}

function getPageData () {
	page = $('.pageInfo').data('temp');
	if (page == 'search') {
		searchString = $('.searchInfo').data('searchstring');
		searchPage = $('.searchInfo').data('pagenumber');
	}
	$( '.infoContainer' ).remove();
}

function createDivArray (size) {
	array = new Array();
	for (var i = 0; i < size; i++) {
		array[i] = document.createElement('div');
	}
	return array;
}

function setupPagingButtonsAndSetupKeys () {
	$( '#paging' ).children().each(function() {
		if (this.className == 'selectablePage') {
			this.onclick = function () {
				searchPage = this.innerHTML.trim();
				changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false);
			};
		}
	});
	var keyDownFunction;
	positionOfSelectedPageButton = $('#selectedPage').index();
	if (0 < positionOfSelectedPageButton && $('.selectablePage').size() > positionOfSelectedPageButton) {
		keyDownFunction = bothKeysEnable;
	} else if (0 < positionOfSelectedPageButton) {
		keyDownFunction = leftKeyEnable;
	} else if ($('.selectablePage').size() > positionOfSelectedPageButton) {
		keyDownFunction = rightKeyEnable;
	} else {
		keyDownFunction = function (e) {};
	}
	document.onkeydown = keyDownFunction;
}

function leftKeyEnable (e) {
    if (e.keyCode == 37) {
    	searchPage -= 1;
		changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false);
    }
}

function rightKeyEnable(e) {
    if (e.keyCode == 39) {
        searchPage += 1;
		changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false);  
    }	
}

function bothKeysEnable(e) {
    if (e.keyCode == 37) { 
       	searchPage -= 1;
		changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false);
    }
    if (e.keyCode == 39) {
        searchPage += 1;
		changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false); 
    }
}

function changePage (page, transition, browserBackButtonPress) {
	var ajaxContentDivId = '#ajaxContent';
	if (transition == transitionMappings.SEARCH2SEARCH) ajaxContentDivId = '#ajaxContent_2';
	$( ajaxContentDivId ).fadeOut( 120, function() {
		spinner = document.createElement('img');
		spinner.id = 'spinner';
		spinner.src = '/assets/ajax-loader.gif';
		document.body.appendChild(spinner);
		ajaxNavigate(page, transition, browserBackButtonPress);
	} );
}