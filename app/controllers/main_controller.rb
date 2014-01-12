class MainController < ApplicationController
	@@key = '6m25urpddbdyh3d4yxzmgpk7';
	@@blockBusterMovies = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json?limit=7&country=ca&apikey=';
	@@inTheatreMovies = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?page_limit=7&page=1&country=ca&apikey='
	@@openingMovies = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json?limit=7&country=ca&apikey='
	@@idSearchMovies = ['http://api.rottentomatoes.com/api/public/v1.0/movies/', '.json?apikey=']
	@@stringSearchMovies = ['http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=', '&page_limit=', '&page=', '&apikey=']

	before_filter :requireNetHttp, :only => [:home, :movieInfo]

	def requireNetHttp
		require 'net/http'
	end

	def home
		@TITLE_LENGTH = 22

		jsonTemp = getResponseAndJSONDecode(@@blockBusterMovies + @@key)
		@blockJSON = jsonTemp['movies']

		jsonTemp = getResponseAndJSONDecode(@@inTheatreMovies + @@key)
		@theatreJSON = jsonTemp['movies']

		jsonTemp = getResponseAndJSONDecode(@@openingMovies + @@key)
		@openingJSON = jsonTemp['movies']

		@page = ''

		if params[:ajax] == 'true'
			render :layout => false
		end
	end

	def movieInfo
		@movieInfo = getResponseAndJSONDecode(
			@@idSearchMovies[0] + 
			params[:id] + 
			@@idSearchMovies[1] + 
			@@key)

		@invalidMovieId = determineInvalidMovieId

		if @invalidMovieId
			@movieInfo['title'] = 'Invalid Movie Id'
		end

		@page = 'movieInfo'

		if params[:ajax] == 'true'
			render :layout => false
		end
	end

	def search
		@ITEMS_PER_PAGE = 7
		@TITLE_LENGTH = 31
		@NUMBER_OF_PAGE_BUTTONS = 11
		@totalPages = 0
		@pageNumber = determinePageNumber

		if (params.has_key?(:search))
			@searchString = params[:search]
			jsonTemp = getResponseAndJSONDecode(
				@@stringSearchMovies[0] + 
				URI.escape(@searchString) + 
				@@stringSearchMovies[1] + 
				@ITEMS_PER_PAGE.to_s + 
				@@stringSearchMovies[2] +
				@pageNumber + 
				@@stringSearchMovies[3] + 
				@@key)
			if jsonTemp.has_key?('movies')
				@searchJSON = jsonTemp['movies']
				@totalPages = determineTotalPages(jsonTemp['total'].to_f)
			else
				@searchJSON = Array.new
				@totalPages = 0
				@pageNumber = -1
			end
			@startingPageToDisplaySearchPageLinks = determineStartingPageToDisplaySearchPageLinks
			@page = 'search'
			if params[:ajax] == 'true'
				if (params.has_key?(:partial))
					render partial: 'shared/searchTable'
				else
					render :layout => false
				end
			end
		else
			@searchString = ''
			@page = 'search'
			render 'searchCenter'
		end
	end

	def determineStartingPageToDisplaySearchPageLinks
		numberOfListElementsBeforeCenter = (@NUMBER_OF_PAGE_BUTTONS / 2).floor
		currentPage = @pageNumber.to_i
		if currentPage - numberOfListElementsBeforeCenter > 0 and currentPage + numberOfListElementsBeforeCenter <= @totalPages 
			start = currentPage - numberOfListElementsBeforeCenter
		elsif currentPage - numberOfListElementsBeforeCenter > 0
			start = @totalPages - @NUMBER_OF_PAGE_BUTTONS + 1;
			if start <= 0 
				start = 1
			end
		else
			start = 1
		end

		return start
	end

	def getResponseAndJSONDecode (uriString)
		uri = URI.parse(uriString)
		response = Net::HTTP.get_response(uri)

		if (response["content-encoding"] == 'gzip')
			response = Zlib::GzipReader.new(StringIO.new(response.body)).read
		else
			response = response.body
		end
		return ActiveSupport::JSON.decode(response)
	end

	def determinePageNumber
		if (params.has_key?(:page))
			return pageNumber = params[:page]
		else
			return pageNumber = '1'
		end		
	end

	def determineTotalPages(totalItems)
		totalPages = (totalItems / @ITEMS_PER_PAGE).ceil
		if totalPages > 25
			totalPages = 25
		end
		return totalPages
	end

	def determineInvalidMovieId
		if @movieInfo.has_key?('id')
			return false
		else
			return true
		end
	end
end