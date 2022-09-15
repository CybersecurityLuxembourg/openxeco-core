# Documentation to set up an openXeco instance for production

## Prerequisite

### Ubuntu Server 20.04 LTS

This procedure has been done on the following OS version:

```
$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 20.04.1 LTS
Release:        20.04
Codename:       focal
```

### DNS configuration

The DNS should be configured to direct to the target machine. This is necessary to set up SSL configuration on Apache with 'Let's encrypt'. In our example:

```
192.0.2.42 A  api.example.org
192.0.2.42 A  admin.example.org
192.0.2.42 A  community.example.org
```

[example.org] represents the domain you own for this instance.

If [example.org] is not explicit enough, prefixing the domain names might be an idea, e.g: oxe-api.example.org or api.oxe.example.org

### Version selection

This documentation will target the latest version. Please see the [other versions here.](https://github.com/CybersecurityLuxembourg/openxeco-core/releases)

### Update the package index

```
$ sudo apt update
```

### Create directories for documents and images

```
$ sudo mkdir -p /var/lib/oxe-api/image_folder
$ sudo mkdir -p /var/lib/oxe-api/document_folder
```

## Docker

### Installation of Docker

```
$ sudo mkdir -p /etc/apt/keyrings/
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
$ echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
$ sudo apt update && sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
$ sudo adduser <your-oxe-user> docker
$ newgrp docker
# If you want to verify your docker install run: docker run hello-world
```

For more information, see the [official docker site.](https://docs.docker.com/get-docker/)

### Create a docker network

```
$ docker network create openxeco
```

### Create and run a docker mariadb 10.7.3 container

```
$ docker run -d \
    --network openxeco \
    --network-alias mariadb \
    -p 3306:3306 \
    -e MARIADB_ROOT_PASSWORD=E4syPass \
    mariadb:10.7.3
```

The database and it structure will be created when the API will be correcly launched.

### Run the API image

You have to adapt the arguments of this command to set the right configuration:

```
$ docker run -d -p 5000:5000 \
    --network openxeco \
    -e ENVIRONMENT=prod \
    -e JWT_SECRET_KEY=my_secret_developer_key \
    -e DB_HOSTNAME=mariadb \
    -e DB_PORT=3306 \
    -e DB_NAME=OPENXECO \
    -e DB_USERNAME=root \
    -e DB_PASSWORD=E4syPass \
    -e MAIL_SERVER=127.0.0.1 \
    -e MAIL_PORT=1025 \
    -e MAIL_USE_TLS=False \
    -e MAIL_USE_SSL=False \
    -e MAIL_DEFAULT_SENDER=my-default-sender@example.org \
    -e IMAGE_FOLDER=/image_folder \
    -e DOCUMENT_FOLDER=/document_folder \
    -e INITIAL_ADMIN_EMAIL=my-default-admin@example.org \
    -e CORS_DOMAINS=example.org
    ghcr.io/cybersecurityluxembourg/openxeco-core-oxe-api:latest
```

With this CORS_DOMAIN set as "example.org", all its subdomains will be allowed by the browser. If it has to be limited to the two webapps of this project, you can set it as follows:

```
    ...
    -e CORS_DOMAINS=admin.example.org,community.example.org
    ...
```

### Build and run the webapps images

For the admin webapp:

```
$ docker build \
    -f openxeco-core-oxe-web-admin/Dockerfile \
    -t oxe-web-admin \
    --build-arg TARGET_DIR=openxeco-core-oxe-web-admin \
    https://github.com/CybersecurityLuxembourg/openxeco-core/releases/latest/download/openxeco-core-oxe-web-admin.tar.gz
$ docker run -d -p 3000:80 oxe-web-admin
```

For the community webapp:

```
$ docker build \
    -f openxeco-core-oxe-web-community/Dockerfile \
    -t oxe-web-community \
    --build-arg TARGET_DIR=openxeco-core-oxe-web-community \
    https://github.com/CybersecurityLuxembourg/openxeco-core/releases/latest/download/openxeco-core-oxe-web-community.tar.gz
$ docker run -d -p 3001:80 oxe-web-community
```

## Apache server

### Install apache server

```
$ sudo apt install apache2
$ sudo a2enmod ssl
$ sudo a2enmod headers
$ sudo a2enmod proxy_http
$ sudo mkdir -p /var/www/oxe-api
$ sudo mkdir -p /var/www/oxe-web-admin
$ sudo mkdir -p /var/www/oxe-web-community
```

### Create and init the configuration files

Let's configure the Apache server with:

```
cd /etc/apache2/sites-available/
sudo cp 000-default.conf oxe-api.conf
sudo cp 000-default.conf oxe-web-admin.conf
sudo cp 000-default.conf oxe-web-community.conf
```

You can edit oxe-api.conf as follow:

```
<VirtualHost *:80>
    ServerAdmin admin@example.org
    ServerName api.example.org

    DocumentRoot /var/www/oxe-api/

    ErrorLog ${APACHE_LOG_DIR}/api.example.org_p80_error.log
    CustomLog ${APACHE_LOG_DIR}/api.example.org_p80_access.log combined
</VirtualHost>
```

You can edit oxe-web-admin.conf as follow:

```
<VirtualHost *:80>
    ServerAdmin admin@example.org
    ServerName admin.example.org

    DocumentRoot /var/www/oxe-web-admin/

    ErrorLog ${APACHE_LOG_DIR}/admin.example.org_p443_error.log
    CustomLog ${APACHE_LOG_DIR}/admin.example.org_p443_access.log combined
</VirtualHost>
```

You can edit oxe-web-community.conf as follow:

```
<VirtualHost *:80>
    ServerAdmin admin@example.org
    ServerName community.example.org

    DocumentRoot /var/www/oxe-web-community/

    ErrorLog ${APACHE_LOG_DIR}/community.example.org_p443_error.log
    CustomLog ${APACHE_LOG_DIR}/community.example.org_p443_access.log combined
</VirtualHost>
```

To take in count the new configuration, we need to run the following:

```
$ sudo a2ensite oxe-api.conf
$ sudo a2ensite oxe-web-admin.conf
$ sudo a2ensite oxe-web-community.conf
$ sudo systemctl restart apache2
```

### Install Let's encrypt

```
$ sudo apt install python3-certbot-apache
```

### Setup HTTPS virtual hosts

```
$ sudo certbot --apache -d api.example.org -d admin.example.org -d community.example.org
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator apache, Installer apache
Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): ssl-admin@example.org

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
http-01 challenge for api.example.org
http-01 challenge for admin.example.org
http-01 challenge for community.example.org
Enabled Apache rewrite module
Deploying Certificate to VirtualHost /etc/apache2/sites-available/oxe-api-le-ssl.conf
Enabling available site: /etc/apache2/sites-available/oxe-api-le-ssl.conf

Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
new sites, or if you're confident your site works on HTTPS. You can undo this
change by editing your web server's configuration.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 2
Enabled Apache rewrite module
Redirecting vhost in /etc/apache2/sites-enabled/oxe-api.conf to ssl vhost in /etc/apache2/sites-available/oxe-api-le-ssl.conf

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations! You have successfully enabled https://api.example.org

You should test your configuration at:
https://www.ssllabs.com/ssltest/analyze.html?d=api.example.org
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/api.example.org/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/api.example.org/privkey.pem
   Your cert will expire on 2021-03-02. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot again
   with the "certonly" option. To non-interactively renew *all* of
   your certificates, run "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```


### Let's encrypt issues

#### Challenge failed

In case you get the following error:

```
Challenge failed for domain admin.example.org
Challenge failed for domain community.example.org
```

Double check the *ServerName/ServerAlias* in the apache config.

#### Cannot connect

Check if the firewall is active:

```
$ sudo ufw status
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), deny (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22                         ALLOW IN    Anywhere                  
22 (v6)                    ALLOW IN    Anywhere (v6)             
```

The above has only SSH access allowed. Add port 80/443:

```
$ sudo ufw allow 80/tcp
Rule added
Rule added (v6)
$ sudo ufw allow 443/tcp
Rule added
Rule added (v6)
```

#### Automatically renew the certificates

Add the following to the root users' crontab.

```
15 3 * * * /usr/bin/certbot renew --quiet
```

### In case Apache is not starting

Below are some commands that can be useful to track the error when Apache doesn't start properly.

```
$ sudo apache2 -t -D DUMP_VHOSTS
$ sudo apache2ctl configtest
$ sudo journalctl | tail
$ sudo cat /var/log/apache2/error.log
```

### Configure the Apache virtual hosts

Configure reverse proxy and specify seperate Apache Log for port 443.

Add proxy configuration in "/etc/apache2/sites-available/oxe-api-le-ssl.conf" for oxe-api:

```
<VirtualHost *:443>
    ...

    ErrorLog ${APACHE_LOG_DIR}/api.example.org_p443_error.log
    CustomLog ${APACHE_LOG_DIR}/api.example.org_p443_access.log combined

    ProxyPass / http://127.0.0.1:5000/ retry=0
    ProxyPassReverse / http://127.0.0.1:5000/
</VirtualHost>
```

In "/etc/apache2/sites-available/oxe-web-admin-le-ssl.conf" For oxe-web-admin:

```
<VirtualHost *:443>
    ...

    ErrorLog ${APACHE_LOG_DIR}/admin.example.org_p443_error.log
    CustomLog ${APACHE_LOG_DIR}/admin.example.org_p443_access.log combined

    ProxyPass / http://127.0.0.1:3000/ retry=0
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

And in "/etc/apache2/sites-available/oxe-web-community-le-ssl.conf" for oxe-web-community:

```
<VirtualHost *:443>
    ...

    ErrorLog ${APACHE_LOG_DIR}/community.example.org_p443_error.log
    CustomLog ${APACHE_LOG_DIR}/community.example.org_p443_access.log combined

    ProxyPass / http://127.0.0.1:3001/ retry=0
    ProxyPassReverse / http://127.0.0.1:3001/
</VirtualHost>
```

## All set !

The server is configured, we can finish with:

```
$ sudo service apache2 restart
```

## Interesting links

[Official Docker Install Docs on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
[Install and Configure Apache](https://ubuntu.com/tutorials/install-and-configure-apache#1-overview)
[Secure Apache with Let's Encrypt](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-ubuntu-18-04)
[Enable CORS on Apache](https://ubiq.co/tech-blog/enable-cors-apache-web-server/)
