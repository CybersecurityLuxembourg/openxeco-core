FROM httpd:2.4

ARG TARGET_DIR
COPY $TARGET_DIR/ /usr/local/apache2/htdocs/

RUN echo "LoadModule rewrite_module modules/mod_rewrite.so" >> /usr/local/apache2/conf/httpd.conf
RUN echo "<Directory '/usr/local/apache2/htdocs'>" >> /usr/local/apache2/conf/httpd.conf
RUN echo "RewriteEngine On" >> /usr/local/apache2/conf/httpd.conf
RUN echo "RewriteCond %{REQUEST_FILENAME} -f [OR]" >> /usr/local/apache2/conf/httpd.conf
RUN echo "RewriteCond %{REQUEST_FILENAME} -d" >> /usr/local/apache2/conf/httpd.conf
RUN echo "RewriteRule ^ - [L]" >> /usr/local/apache2/conf/httpd.conf
RUN echo "RewriteRule ^ index.html [L]" >> /usr/local/apache2/conf/httpd.conf
RUN echo "</Directory>" >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80