# Documentation to set up an openXeco instance

## Some links

https://docs.docker.com/engine/install/ubuntu/
https://ubuntu.com/tutorials/install-and-configure-apache#1-overview
https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-ubuntu-18-04
https://ubiq.co/tech-blog/enable-cors-apache-web-server/

https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=674857#25
https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=932458
https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=931899

## Prerequisite

The DNS should be configured to direct to the target machine. This is necessary to set up SSL configuration on Apache with 'Let's encrypt'. In our example:

```
XXX.XXX.XXX.XXX A  api.MYDOMAIN.XXX
XXX.XXX.XXX.XXX A  admin.MYDOMAIN.XXX
XXX.XXX.XXX.XXX A  community.MYDOMAIN.XXX
```

## Initialization of the setup

This procedure has been done on the following OS version:

```
> lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 20.04.1 LTS
Release:        20.04
Codename:       focal
```

Update the package index

```
> sudo apt update
```

## Installation of Docker




## Install MySQL Version 8.0.22

Previously, you will need to gather the different SQl script from the bo-api project in the bo-api/db/structure directory.
If you have an up-to-date backup of the database, you can also use this backup.

Let's install and configure with those 2 following commands

```
> sudo apt install mysql-server=8.0.22-0ubuntu0.20.04.3
> sudo mysql_secure_installation

Securing the MySQL server deployment.

Connecting to MySQL using a blank password.

VALIDATE PASSWORD COMPONENT can be used to test passwords
and improve security. It checks the strength of password
and allows the users to set only those passwords which are
secure enough. Would you like to setup VALIDATE PASSWORD component?

Press y|Y for Yes, any other key for No: y

There are three levels of password validation policy:

LOW    Length >= 8
MEDIUM Length >= 8, numeric, mixed case, and special characters
STRONG Length >= 8, numeric, mixed case, special characters and dictionary                  file

Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG: 1
Please set the password for root here.

New password:

Re-enter new password:

Estimated strength of the password: 100
Do you wish to continue with the password provided?(Press y|Y for Yes, any other key for No) : y
By default, a MySQL installation has an anonymous user,
allowing anyone to log into MySQL without having to have
a user account created for them. This is intended only for
testing, and to make the installation go a bit smoother.
You should remove them before moving into a production
environment.

Remove anonymous users? (Press y|Y for Yes, any other key for No) : y
Success.


Normally, root should only be allowed to connect from
'localhost'. This ensures that someone cannot guess at
the root password from the network.

Disallow root login remotely? (Press y|Y for Yes, any other key for No) : y
Success.

By default, MySQL comes with a database named 'test' that
anyone can access. This is also intended only for testing,
and should be removed before moving into a production
environment.


Remove test database and access to it? (Press y|Y for Yes, any other key for No) : y
 - Dropping test database...
Success.

 - Removing privileges on test database...
Success.

Reloading the privilege tables will ensure that all changes
made so far will take effect immediately.

Reload privilege tables now? (Press y|Y for Yes, any other key for No) : y
Success.

All done!
```

Now, we can initiate the database with the imported SQL scripts.

To use the import command, make sure that the script contains the DATABASE creation and the 'USE' SQL script such as:

```
CREATE DATABASE CYBERLUX character set utf8mb4 collate utf8mb4_unicode_ci;
USE CYBERLUX;
```

Here is the import command:

```
> mysql -h localhost -u root -p < ~/backup.sql
```

The last step of this part is to create a dedicated user named 'cyberlux' with the according permissions on this CYBERLUX database.

```
> sudo mysql -u root -p
mysql>CREATE USER 'cyberlux'@'localhost' IDENTIFIED BY 'examplepassword';
mysql>GRANT DELETE, INSERT, SELECT, UPDATE ON CYBERLUX.* TO 'cyberlux'@'localhost';
mysql>FLUSH PRIVILEGES;
```

## Install and setup apache server

```
> sudo apt install apache2
> sudo a2enmod ssl
> sudo a2emod headers
> sudo mkdir /var/www/bo-api
> sudo mkdir /var/www/bo-front
```

Let's configure the Apache server with:

```
cd /etc/apache2/sites-available/
sudo cp 000-default.conf bo-api.conf
sudo cp 000-default.conf bo-front.conf
```

You can edit bo-api.conf as follow:

```
<VirtualHost *:80>
    ServerAdmin adminあcybersecurity.lu
    ServerName api.test-db.cy.lu
    DocumentRoot /var/www/bo-api/
</VirtualHost>
```

and bo-front as follow:

```
<VirtualHost *:80>
    ServerAdmin adminあcybersecurity.lu
    ServerName test-db.cy.lu
    DocumentRoot /var/www/bo-front/
</VirtualHost>
```

To take in count the new configuration, we need to run the following:

```
> sudo a2ensite bo-front.conf
> sudo a2ensite bo-api.conf
> service apache2 reload
```

## Install 'Let's encrypt' and setup HTTPS virtual hosts

```
> #sudo add-apt-repository ppa:certbot/certbot # Not needed on recent versions of Ubuntu
> sudo apt install python3-certbot-apache
> sudo certbot --apache -d test-db.cy.lu
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator apache, Installer apache
Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): cyberluxあsecuritymadein.lu

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must
agree in order to register with the ACME server at
https://acme-v02.api.letsencrypt.org/directory
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(A)gree/(C)ancel: A

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing to share your email address with the Electronic Frontier
Foundation, a founding partner of the Let's Encrypt project and the non-profit
organization that develops Certbot? We'd like to send you email about our work
encrypting the web, EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: N
Obtaining a new certificate
Performing the following challenges:
http-01 challenge for test-db.cy.lu
Enabled Apache rewrite module
Deploying Certificate to VirtualHost /etc/apache2/sites-available/bo-front-le-ssl.conf
Enabling available site: /etc/apache2/sites-available/bo-front-le-ssl.conf

Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
new sites, or if you're confident your site works on HTTPS. You can undo this
change by editing your web server's configuration.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 2
Enabled Apache rewrite module
Redirecting vhost in /etc/apache2/sites-enabled/bo-front.conf to ssl vhost in /etc/apache2/sites-available/bo-front-le-ssl.conf

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations! You have successfully enabled https://test-db.cy.lu

You should test your configuration at:
https://www.ssllabs.com/ssltest/analyze.html?d=test-db.cy.lu
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/test-db.cy.lu/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/test-db.cy.lu/privkey.pem
   Your cert will expire on 2021-03-02. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot again
   with the "certonly" option. To non-interactively renew *all* of
   your certificates, run "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

Let's do this again for the api virtual host

```
> sudo certbot --apache -d api.test-db.cy.lu
```

## In case Apache is not starting

Here are a set a command that can be useful to track the error when Apache doesn't start properly

```
sudo apache2 -t -D DUMP_VHOSTS
sudo apache2ctl configtest
sudo journalctl | tail
sudo cat /var/log/apache2/error.log
```

## Install Python and WSGI mode

```
> sudo apt-get install python3.8
> sudo apt-get install python3-pip
> sudo apt-get install libapache2-mod-wsgi-py3
```

We now need to add the configuration for the API to use the WSGI mode. In out case, we should modify this file "bo-api-le-ssl.conf"

```
WSGIDaemonProcess bo-api threads=5 python-home=/var/www/bo-api/venv
WSGIScriptAlias / /var/www/bo-api/application.wsgi
WSGIApplicationGroup %{GLOBAL}
<Directory bo-api>
     WSGIProcessGroup bo-api
     WSGIApplicationGroup %{GLOBAL}
     Header set Access-Control-Allow-Origin "*"
     Order deny,allow
     Allow from all 
</Directory>
```

## All set !

The server is configured, we can finish with:

```
> sudo service apache2 restart
```
