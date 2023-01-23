#!/bin/bash

exec gunicorn --preload --chdir /app --workers 1 --bind 0.0.0.0:5000 app:app