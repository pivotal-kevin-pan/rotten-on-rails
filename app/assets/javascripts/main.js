var selectedMovie;
var blockbusterMovies;
var inTheatreMovies;
var openingMovies;
var searchMovies;

pageMappings = {
	HOME : '',
	MOVIEINFO : 'movieInfo',
	SEARCH: 'search'
}

$(function() {
	// var request = $.ajax({
	// 	url: "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json?limit=3&country=ca&apikey=6m25urpddbdyh3d4yxzmgpk7",
	// 	dataType: "jsonp",
	// });
	// request.done(function (dataWeGotViaJsonp) {
	// 	alert(dataWeGotViaJsonp.movies.length);
	// });

	var page = $('.pageInfo').data('temp');
	var searchString = '';
	if (page === pageMappings.SEARCH) {
		searchString = $('.searchInfo').data('searchstring');
		// data element lowercases data variable names
	}

	$(window).on("popstate", function(e) {
	    if (e.originalEvent.state !== null) {
      		$( 'body' ).fadeOut( 120, function () { 
      			ajaxNavigate(e.originalEvent.state.page, {searchString:e.originalEvent.state.searchString, back:true}); 
      		} );
    	}
	} );

	getPageData(page);

	window.history.replaceState({page:page, searchString:searchString}, '', getUrlPathAfterDomain());

	pageSetup(page, {searchString:searchString, dataCollected:true});
});

function ajaxNavigate(page, data) {
	var publicParams = '';
	var hiddenParams = '';
	var searchString = '';
	var request = null;
	if (page === pageMappings.HOME) {
		hiddenParams = 'ajax=true';
		if (typeof blockbusterMovies === 'undefined') hiddenParams += '&load=true';
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
		searchString = data.searchString;
		publicParams = "search=" + searchString;
		hiddenParams = '&ajax=true';
		request = $.ajax({
			url: "/" + page,
			type: "get",
			data: publicParams + hiddenParams
		});
	}
 
	if (request) {
		request.done(function (response, textStatus, jqXHR) {
			document.body.style.display = 'block';
			document.body.innerHTML = response;
			pageSetup(page, {searchString:searchString});
			if (publicParams !== '') publicParams = '?' + publicParams;
			if (typeof data === 'undefined' || !data.back)
				window.history.pushState({page:page, searchString:searchString}, '', '/' + page + publicParams);
		});
	}
}

function pageSetup(page, data) {
	if (page === pageMappings.HOME) {
		if (typeof blockbusterMovies === 'undefined') {
			// Case: Enter movie info page directly and then ajax redirects to full movie list page
			// Data for full movie list page is only gathered when directly entering, not when entering via ajax
			getPageData(page);
		}
		displayMovieList('blockbusters');
		displayMovieList('inTheatres');
		displayMovieList('opening');
		$( '#searchForm' ).submit(function () {
			$( 'body' ).fadeOut( 120, function() {
				ajaxNavigate(pageMappings.SEARCH, {searchString:$( this ).find( 'input' ).val()});
			} );
			return false;
		});
	} else if (page === pageMappings.MOVIEINFO){
		header = $( 'h1' ).html( selectedMovie.title );
		document.getElementById('image').src = selectedMovie.posters.profile;
		document.getElementById('runtime').innerHTML = selectedMovie.runtime;
		document.getElementById('score').innerHTML = selectedMovie.ratings.critics_score;
		document.getElementById('critics_consensus').innerHTML = selectedMovie.critics_consensus;
		document.getElementById('synopsis').innerHTML = selectedMovie.synopsis;
		$( '#backButton' ).click( function () {
			$( 'body' ).fadeOut( 120, function() {
				ajaxNavigate( pageMappings.HOME );
			} );
		});

		var cast = document.getElementById('cast');
		for (var i = 0; i < selectedMovie.abridged_cast.length; i++) {
			var div = document.createElement('div');
			div.innerHTML = selectedMovie.abridged_cast[i].name;
			cast.appendChild(div);
		}
	} else if (page === pageMappings.SEARCH) {
		if (!(data && data.dataCollected)) getPageData(page);
		displayMovieList('search');
		if (data) {
			if (data.searchString) $( '#searchForm' ).find('input').val(data.searchString);
		}
		$( '#searchForm' ).submit(function () {
			$( 'body' ).fadeOut( 120, function() {
				ajaxNavigate(pageMappings.SEARCH, {searchString:$( this ).find( 'input' ).val()});
			} );
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

		if (type === 'search') {
			thumbnail.src = selectedList[i].posters.thumbnail;
		} else {
			if (selectedList[i].ratings.critics_rating == "Certified Fresh") {
				thumbnail.src = '/assets/fresh.png';
			} else {
				thumbnail.src = '/assets/rotten.png';
			}			
		}

		divArray = createDivArray(5);

		div.id = i;

		$( div ).click(function() {
			selectedMovie = selectedList[this.id];
			$( 'body' ).fadeOut( 120, function () {
				ajaxNavigate( 'movieInfo' );
			} );
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

function formatTitleEllipsis(type, title) {
	var TITLE_LENGTH = 0;
	if (type === 'search') TITLE_LENGTH = 31;
	else TITLE_LENGTH = 23;
	if (title.length > TITLE_LENGTH) {
		title = title.substr(0, TITLE_LENGTH - 1).trim() + '...';
	}
	return title;
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
		// Javascript automatically converts data value to a Javascript object when data value is "{ "movie":[] }"
		var searchData = $('.searchInfo').data('temp');
		if ( typeof searchData != 'object' ) searchData = jQuery.parseJSON( $('.searchInfo').data('temp') );
		searchMovies = searchData.movies;
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