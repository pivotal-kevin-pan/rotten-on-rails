var selectedMovie = null;
var blockbusterMovies = null;
var inTheatreMovies = null;
var openingMovies = null;
var searchMovies = null;
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
	var page = $('.pageInfo').data('temp');

	$(window).on("popstate", function(e) {
	    if (e.originalEvent.state !== null) {
	    	searchString = e.originalEvent.state.searchString;
      		searchPage = e.originalEvent.state.searchPage;
      		changePage(e.originalEvent.state.page, transitionMappings.GENERAL, true);
    	}
	} );

	getPageData(page); // sets searchString and searchPage

	window.history.replaceState({page:page, searchString:searchString, searchPage:searchPage}, '', getUrlPathAfterDomain());

	pageSetup(page, transitionMappings.GENERAL);
});

function ajaxNavigate(page, transition, browserBackButtonPress) {
	var publicParams = '';
	var hiddenParams = '';
	var request = null;
	var getPageDataFlag = false;
	if (page === pageMappings.HOME) {
		hiddenParams = 'ajax=true';
		if (blockbusterMovies == null) {
			getPageDataFlag = true;
			hiddenParams += '&load=true';
		}
		request = $.ajax({
			url: '/',
			type: "get",
			data: publicParams + hiddenParams
		});	
	} else if (page === pageMappings.MOVIEINFO) {
		publicParams = "id=" + selectedMovie.id;
		hiddenParams = "&ajax=true";
		request = $.ajax({
			url: "/" + page,
			type: "get",
			data: publicParams + hiddenParams
		});
	} else if (page === pageMappings.SEARCH) {
		getPageDataFlag = true;
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

			if (getPageDataFlag) getPageData(page);
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
		displayMovieList('blockbusters');
		displayMovieList('inTheatres');
		displayMovieList('opening');
		$( '#searchForm' ).submit(function () {
			searchString = $( this ).find( 'input' ).val();
			searchPage = 1;
			changePage(pageMappings.SEARCH, transitionMappings.GENERAL, false);
			return false;
		});
		document.onkeydown = function (e) {};
	} else if (page === pageMappings.MOVIEINFO){
		header = $( 'h1' ).html( selectedMovie.title );
		document.getElementById('image').src = selectedMovie.posters.profile;
		document.getElementById('runtime').innerHTML = selectedMovie.runtime;
		document.getElementById('score').innerHTML = selectedMovie.ratings.critics_score;
		document.getElementById('critics_consensus').innerHTML = selectedMovie.critics_consensus;
		document.getElementById('synopsis').innerHTML = selectedMovie.synopsis;
		$( '#backButton' ).click( function () {
			changePage(pageMappings.HOME, transitionMappings.GENERAL, false);
		});

		var cast = document.getElementById('cast');
		for (var i = 0; i < selectedMovie.abridged_cast.length; i++) {
			var div = document.createElement('div');
			div.innerHTML = selectedMovie.abridged_cast[i].name;
			cast.appendChild(div);
		}
		$(document).keydown(function (e) {});
	} else if (page === pageMappings.SEARCH) {
		if (searchString) {
			displayMovieList('search');
			if (transition == transitionMappings.GENERAL) setupPagingButtonsAndSetupKeys();
		} else {
			$(document).keydown(function (e) {});
		}
		$( '#searchForm' ).find('input').val(searchString);
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

function displayMovieList(type) {
	var selectedList;
	if (type === 'blockbusters') selectedList = blockbusterMovies;
	else if (type === 'inTheatres') selectedList = inTheatreMovies;
	else if (type === 'opening') selectedList = openingMovies;
	else if (type === 'search') selectedList = searchMovies;
	for (var i = 0; i < selectedList.length; i++) {
		tbody = document.getElementById(type);
		tr = document.createElement('tr');
		div = document.createElement('div');
		thumbnail = document.createElement('img');

		if (type === 'search') thumbnail.src = selectedList[i].posters.thumbnail;
		else setThumbnailFreshOrRotten(selectedList[i].ratings.critics_rating, thumbnail);

		divArray = createDivArray(5);

		div.id = i;

		$( div ).click(function() {
			selectedMovie = selectedList[this.id];
			changePage(pageMappings.MOVIEINFO, transitionMappings.GENERAL, false);
		});

		var count = 0;
		divArray[count].appendChild(thumbnail);
		divArray[count++].className = 'thumbnail';
		divArray[count].innerHTML = formatTitleEllipsis(type, selectedList[i].title);
		divArray[count++].className = 'title';

		if (type === 'search') {
			divArray[count].innerHTML = selectedList[i].year;
			divArray[count++].className = 'year';
		}

		if (selectedList[i].ratings.critics_score != '-1') {
			divArray[count].innerHTML = selectedList[i].ratings.critics_score + '%';
		}
		divArray[count++].className = 'score';
		divArray[count].innerHTML = selectedList[i].mpaa_rating;
		divArray[count++].className = 'rating';

		for (var y = 0; y < divArray.length; y++) {
			div.appendChild(divArray[y]);
		}
		tr.appendChild(div);
		tbody.appendChild(tr);
	}
}

function getPageData (page) {
	if (page === pageMappings.HOME) {
		var blockbusterData = jQuery.parseJSON( $('.blockbusterInfo').data('temp') );
		var inTheatreData = jQuery.parseJSON( $('.inTheatreInfo').data('temp') );
		var openingData = jQuery.parseJSON( $('.openingInfo').data('temp') );
		blockbusterMovies = blockbusterData.movies;
		inTheatreMovies = inTheatreData.movies;
		openingMovies = openingData.movies;
	} else if (page === pageMappings.MOVIEINFO){
		var selectedMovieData = jQuery.parseJSON( $('.selectedMovieInfo').data('temp') );
		selectedMovie = selectedMovieData;
	} else if (page === pageMappings.SEARCH) {
		// data element lowercases data variable names
		if (searchString === '') {
			searchString = $('.searchInfo').data('searchstring');
			searchPage = $('.searchInfo').data('pagenumber');
		}
		// Javascript automatically converts data value to a Javascript object when data value is "{ "movie":[] }"
		var searchData = $('.searchInfo').data('temp');
		if ( typeof searchData != 'object' ) searchData = jQuery.parseJSON( $('.searchInfo').data('temp') );
		searchMovies = searchData.movies;
		searchTotalItems = searchData.total;
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

function formatTitleEllipsis(type, title) {
	var TITLE_LENGTH = 0;
	if (type === 'search') TITLE_LENGTH = 31;
	else TITLE_LENGTH = 23;
	if (title.length > TITLE_LENGTH) {
		title = title.substr(0, TITLE_LENGTH - 1).trim() + '...';
	}
	return title;
}

function setThumbnailFreshOrRotten (rating, thumbnail) {
	if (rating == "Certified Fresh") {
		thumbnail.src = '/assets/fresh.png';
	} else {
		thumbnail.src = '/assets/rotten.png';
	}
}

function setupPagingButtonsAndSetupKeys () {
	var ul = document.getElementById('paging');
	var numberOfListElements = $(ul).children('li').size();
	var numberOfListElementsBeforeCenter = numberOfListElements/2 - 0.5;
	var totalPages = Math.ceil(searchTotalItems / SEARCH_ITEMS_PER_PAGE);
	if (totalPages > 25) totalPages = 25;
	var pageCounter = 1;
	if (searchPage - numberOfListElementsBeforeCenter > 0 
		&& searchPage + numberOfListElementsBeforeCenter <= totalPages) {
		pageCounter = searchPage - numberOfListElementsBeforeCenter;
	} else if (searchPage - numberOfListElementsBeforeCenter > 0) {
		pageCounter = totalPages - numberOfListElements + 1;
		if (pageCounter <= 0) pageCounter = 1;
		// pageCounter = numberOfListElements - totalPages + 1;
	} else {
		pageCounter = 1;
	}
	$( '#paging' ).children().each(function() {
		if (pageCounter <= totalPages) {
			if (pageCounter == searchPage) this.id = 'selectedPage';
			else {
				this.className = 'selectablePage';
				this.id = ''; 
				var transferInfo_pageCounter = pageCounter;
				this.onclick = function () {
					searchPage = transferInfo_pageCounter;
					setupPagingButtonsAndSetupKeys();
					changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false);
				};
			}
			this.innerHTML = pageCounter++;
		}
	});
	var keyDownFunction;
	if (searchPage < totalPages && searchPage > 1) {
		keyDownFunction = bothKeysEnable;
	} else if (searchPage > 1) {
		keyDownFunction = leftKeyEnable;
	} else if (searchPage < totalPages) {
		keyDownFunction = rightKeyEnable;
	} else {
		keyDownFunction = function (e) {};
	}
	document.onkeydown = keyDownFunction;
}

function leftKeyEnable (e) {
    if (e.keyCode == 37) {
    	searchPage -= 1;
    	setupPagingButtonsAndSetupKeys();
		changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false);
    }
}

function rightKeyEnable(e) {
    if (e.keyCode == 39) {
        searchPage += 1;
        setupPagingButtonsAndSetupKeys();
		changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false);  
    }	
}

function bothKeysEnable(e) {
    if (e.keyCode == 37) { 
       	searchPage -= 1;
       	setupPagingButtonsAndSetupKeys();
		changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false);
    }
    if (e.keyCode == 39) {
        searchPage += 1;
        setupPagingButtonsAndSetupKeys();
		changePage(pageMappings.SEARCH, transitionMappings.SEARCH2SEARCH, false); 
    }
}

function changePage (page, transition, browserBackButtonPress) {
	var ajaxContentDivId = '#ajaxContent';
	if (transition == transitionMappings.SEARCH2SEARCH) ajaxContentDivId = '#ajaxContent_2';
	$( ajaxContentDivId ).fadeOut( 120, function() {
		ajaxNavigate(page, transition, browserBackButtonPress);
	} );	
}