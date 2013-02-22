@ECHO off

:INSTALLRAILS
ECHO Installing Rails...
CALL gem install rails -v 3.2.11

if "%errorlevel%" == "1" (
	ECHO Rails installation failed
	goto END
)
ECHO Rails installed succesfully

PAUSE

:INSTALLNODE
ECHO Installing Node...
node-v0.8.20-x64.msi

if "%errorlevel%" == "1" (
	ECHO Node installation failed
	goto END
)
ECHO Node installed succesfully

PAUSE

:INSTALLDEVKIT
ECHO Installing Devkit...
DevKit-tdm-32-4.5.2-20111229-1559-sfx.exe

cd C:\Ruby193\DevKit
CALL ruby dk.rb init
CALL ruby dk.rb review
CALL ruby dk.rb install

PAUSE

:SETUPSERVER
cd %~dp0
ECHO Moving to rails directory
cd ../../Rails/AGB

CALL bundle install
PAUSE

ECHO DB:MIGRATE
CALL rake db:migrate

:END
PAUSE