class MainController < ApplicationController
	@@key = '6m25urpddbdyh3d4yxzmgpk7';
	@@blockBusterMovies = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json?limit=7&country=ca&apikey=';
	@@inTheatreMovies = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?page_limit=7&page=1&country=ca&apikey='
	@@openingMovies = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json?limit=7&country=ca&apikey='
	@@idSearchMovies = ['http://api.rottentomatoes.com/api/public/v1.0/movies/', '.json?apikey=']
	@@stringSearchMovies = ['http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=', '&page_limit=7&page=', '&apikey=']

	before_filter :requireNetHttp, :only => [:home, :movieInfo]

	def requireNetHttp
		require 'net/http'
	end

	def home
		if params[:ajax] != 'true' or params[:load] == 'true'
			uri = URI(@@blockBusterMovies + @@key)
			@block = Net::HTTP.get(uri)
			uri = URI(@@inTheatreMovies + @@key)
			@theatre = Net::HTTP.get(uri)
			uri = URI(@@openingMovies + @@key)
			@opening = Net::HTTP.get(uri)
			@page = ''
		end

		if params[:ajax] == 'true'
			render :layout => false
		end
	end

	def movieInfo
		if params[:ajax] != 'true'
			uri = URI.parse(@@idSearchMovies[0] + params[:id] + @@idSearchMovies[1] + @@key)
			@req = Net::HTTP.get_response(uri)

			if (@req["content-encoding"] == 'gzip')
				@req = Zlib::GzipReader.new(StringIO.new(@req.body)).read
			else
				@req = @req.body
			end
			@page = 'movieInfo'
		else
			render :layout => false
		end
	end

	def search
		if (params.has_key?(:page))
			pageNumber = params[:page]
		else
			pageNumber = '1'
		end
		if (params.has_key?(:search))
			uri = URI(@@stringSearchMovies[0] + URI.escape(params[:search]) + @@stringSearchMovies[1] + pageNumber + @@stringSearchMovies[2] + @@key)
			@search = Net::HTTP.get(uri)
			@searchString = params[:search]
			@page = 'search'
			@pageNumber = pageNumber
			@sendData = false;

			if params[:ajax] == 'true'
				if (params.has_key?(:partial))
					@sendData = true;
					render partial: "shared/searchTable"
				else
					render :layout => false
				end
			end
		else
			@search = '{ "movies":[] }'
			@searchString = ''
			@page = 'search'
			@pageNumber = '-1'
			render 'searchCenter'
		end
	end
end