The old but much nicer packaged project: https://github.com/gorbiz/thought-logger-original ...it even has a YouTube video!

## nginx config example
```
server {
    server_name my-domain.com;

    root /home/ubuntu/app/public; # Define root for static files

    # Try to serve static files directly, then proxy if not found
    location / {
        try_files $uri $uri/ @proxy;
        auth_basic off;
        add_header Access-Control-Allow-Origin *;
    }

    # Proxy location
    location @proxy {
        auth_basic "Restricted Content";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_pass http://localhost:31337;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/my-domain.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/my-domain.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```
