#!/bin/bash


##  wget https://www.dropbox.com/s/5jef71giovzdzts/eip.tar && tar -xvf eip.tar && chmod +x Install/linux/install_linux_x64.sh && time ./Install/linux/install_linux_x64.sh && source ~/.bash_profile

## su or sudo ?
su -c 'apt-get update && apt-get  install -y build-essential openssl libreadline6 libreadline6-dev curl git-core zlib1g zlib1g-dev libssl-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt-dev autoconf libc6-dev libgdbm-dev ncurses-dev automake libtool bison subversion pkg-config libffi-dev gcc make python g++ curl' || { echo 'apt failed' ; exit 1; }

curl -L get.rvm.io | bash -s stable --auto || { echo 'curl failed' ; exit 1; }
source ~/.bash_profile || { echo 'cannot source' ; exit 1; }

##
## install ruby
##
rvm requirements  || { echo 'Error rvm' ; exit 1; }
rvm install 1.9.3 || { echo 'Error rvm' ; exit 1; }
source ~/.bash_profile

##
## install rails
##
rvm use 1.9.3
ruby -v
rvm --default use 1.9.3

gem install rdoc || { echo 'Error install rdoc' ; exit 1; }
gem install rails -v 3.2.11 || { echo 'Error install rails' ; exit 1; }
source ~/.bash_profile

## 20mins
## install node npn
##
mkdir ~/nodejs
cd $_ 
wget https://www.dropbox.com/s/hjutf63wzv32ryx/node-v0.8.20.tar.bz2
tar xjf node-v0.8.20.tar.bz2 
cd node-v0.8.20
./configure
make
su -c 'make install'
cd ../..

source ~/.bash_profile
cd Rails/AGB
bundle install
rake db:migrate

