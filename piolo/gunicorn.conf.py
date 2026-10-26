# -*- coding: utf-8 -*-
import multiprocessing

bind = 'unix:/var/www/piolo/piolo.sock'
backlog = 2048
workers = 3
worker_class = 'sync'
worker_connections = 1000
timeout = 600
keepalive = 5
graceful_timeout = 30
limit_request_line = 8190
limit_request_fields = 100
limit_request_field_size = 16384
loglevel = 'info'
capture_output = True
enable_stdio_inheritance = True
proc_name = 'piolo_gunicorn'
preload_app = False
