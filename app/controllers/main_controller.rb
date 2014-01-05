class MainController < ApplicationController
	@@key = '6m25urpddbdyh3d4yxzmgpk7';
	@@blockBusterMovies = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json?limit=10&country=ca&apikey=';
	@@idSearchMovies = 'http://api.rottentomatoes.com/api/public/v1.0/movies/'

	before_filter :requireNetHttp, :only => [:home]

	def requireNetHttp
		require 'net/http'
	end

	def home
		if params[:ajax] != 'true' or params[:load] == 'true'
			uri = URI(@@blockBusterMovies + @@key)
			@req = Net::HTTP.get(uri)
			@page = 'home'
		end

		if params[:ajax] == 'true'
			render :layout => false
		end
	end

	def movieInfo
		if params[:ajax] != 'true'
			uri = URI(@@idSearchMovies + params[:id] + '.json?apikey=' + @@key)
			@req = Net::HTTP.get(uri)
			@page = 'movieInfo'
		else
			render :layout => false
		end
	end
end