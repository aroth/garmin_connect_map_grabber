require 'rubygems'
require 'sinatra'
get '/:activity_id' do 
  `snapurl http://connect.garmin.com/activity/#{ params[:activity_id] } -f #{ params[:activity_id] }`
  `convert -crop 640x420+370+225 #{ params[:activity_id] }-fullsize.png #{ params[:activity_id] }-map.png`
  send_file "#{ params[:activity_id] }-map.png", :type => 'image/png', :disposition => 'inline'
end