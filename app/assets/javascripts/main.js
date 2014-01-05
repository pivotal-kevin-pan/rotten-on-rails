var selectedMovie;
var movies;

$(function() {
	// var request = $.ajax({
	// 	url: "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json?limit=3&country=ca&apikey=6m25urpddbdyh3d4yxzmgpk7",
	// 	dataType: "jsonp",
	// });
	// request.done(function (dataWeGotViaJsonp) {
	// 	alert(dataWeGotViaJsonp.movies.length);
	// });

	var data = jQuery.parseJSON( $('.temp_information').data('temp') );
	var page = $('.temp_information').data('page');
	var urlParams = '';
	var movies;

	$(window).on("popstate", function(e) {
	    if (e.originalEvent.state !== null) {
      		$( 'body' ).fadeOut( 120, function () { ajaxNavigate(e.originalEvent.state.page); } );
    	}
	} );

	if (page === 'home') {
		movies = data.movies;
	} else {
		selectedMovie = data;
	}

	window.history.replaceState({page:page}, '', getUrlPathAfterDomain());

	pageSetup(page);
});

function createDivArray (size) {
	array = new Array();
	for (var i = 0; i < size; i++) {
		array[i] = document.createElement('div');
	}
	return array;
}

function ajaxNavigate(page) {
	var publicParams = '';
	var hiddenParams = '';
	if (page === 'home') {
		hiddenParams = 'ajax=true';
		if (typeof movies === 'undefined') hiddenParams += '&load=true';
		var request = $.ajax({
			url: "/main/" + page,
			type: "get",
			data: publicParams + hiddenParams
		});	
	} else {
		publicParams = "?id=" + selectedMovie.id;
		hiddenParams = "&ajax=true";
		var request = $.ajax({
			url: "/main/" + page,
			type: "get",
			data: publicParams + hiddenParams
		});
	}
	request.done(function (response, textStatus, jqXHR) {
		document.body.style.display = 'block';
		document.body.innerHTML = response;
		pageSetup(page);
		window.history.pushState({page:page}, '', '/main/' + page + publicParams);
	});
}

function pageSetup(page) {
	if (page === 'home') {
		if (typeof movies === 'undefined') {
			var data = jQuery.parseJSON( $('.temp_information').data('temp') );
			movies = data.movies;
		}
		for (var i = 0; i < movies.length; i++) {
			tbody = document.getElementById('blockbusters');
			tr = document.createElement('tr');
			div = document.createElement('div');
			thumbnail = document.createElement('img');
			thumbnail.src = movies[i].posters.thumbnail;
			divArray = createDivArray(5);

			div.id = i;

			$( div ).click(function() {
				selectedMovie = movies[this.id];
				$( 'body' ).fadeOut( 120, function () {
					ajaxNavigate( 'movieInfo' );
				} );
			});

			divArray[0].appendChild(thumbnail);
			divArray[0].id = 'thumbnail';
			divArray[1].innerHTML = movies[i].title;
			divArray[1].id = 'title';
			divArray[2].innerHTML = movies[i].year;
			divArray[2].id = 'year';
			divArray[3].innerHTML = movies[i].ratings.critics_score + '%';
			divArray[3].id = 'score';
			divArray[4].innerHTML = movies[i].mpaa_rating;
			divArray[4].id = 'rating';

			for (var y = 0; y < divArray.length; y++) {
				div.appendChild(divArray[y]);
			}
			tr.appendChild(div);
			tbody.appendChild(tr);
		}
	} else {
		header = $( 'h1' ).html( selectedMovie.title );
		document.getElementById('image').src = selectedMovie.posters.profile;
		document.getElementById('runtime').innerHTML = selectedMovie.runtime;
		document.getElementById('score').innerHTML = selectedMovie.ratings.critics_score;
		document.getElementById('critics_consensus').innerHTML = selectedMovie.critics_consensus;
		document.getElementById('synopsis').innerHTML = selectedMovie.synopsis;
		$( '#backButton' ).click( function () {
			$( 'body' ).fadeOut( 120, function() {
				ajaxNavigate( 'home' );
			} );
		});

		var cast = document.getElementById('cast');
		for (var i = 0; i < selectedMovie.abridged_cast.length; i++) {
			var div = document.createElement('div');
			div.innerHTML = selectedMovie.abridged_cast[i].name;
			cast.appendChild(div);
		}
	}
}

function getUrlPathAfterDomain () {
	var a = document.createElement('a');
	a.href = document.URL;
	return a.pathname + a.search;
}