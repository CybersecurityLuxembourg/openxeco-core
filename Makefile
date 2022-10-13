api:
	cd oxe-api && .\venv\Scripts\activate && python app.py

admin:
	cd oxe-web-admin && npm start

community:
	cd oxe-web-community && npm start

smtp:
	cd oxe-api && docker run -d \
	--network openxeco \
	--network-alias smtp \
	-p 1025:1025 \
	-p 1080:1080 \
	reachfive/fake-smtp-server
