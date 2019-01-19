# Server setup

## install pm2
	npm i pm2 -g

## install mysql
	sudo apt update
    sudo apt install mysql-server
    sudo mysql_secure_installation

# add repo
	git clone https://github.com/bealbrown/abstract.git

# to update from git repo
	ssh root@198.199.91.241
	cd abstract
	git pull
	pm2 restart app (if app.js is updated) 

# to restart app, if changed code
	pm2 restart app

# to reload environment variables
	pm2 reload app --update-env