# AWS EC2 deployment

This setup serves the user app at `http://EC2_PUBLIC_IP/`, the admin app at `http://EC2_PUBLIC_IP:8081/`, and keeps the Node API private on `127.0.0.1:5000` behind Nginx.

## AWS prerequisites

1. Launch an Ubuntu EC2 instance and allocate an Elastic IP so the address does not change after a stop/start.
2. In its security group, allow inbound TCP 80 from users. Allow TCP 8081 only from trusted administrator IP addresses. Allow SSH (22) only from your own IP. Do not open port 5000 to the internet.
3. Use MongoDB Atlas or another managed MongoDB service. Add the EC2 Elastic IP to the database network allowlist and create a database user with a strong password.
4. Install Node.js LTS, npm, and Nginx on the instance.

## Build the apps

Copy/clone the three project directories to the matching paths below, and place the top-level `deploy` directory at `/opt/deploy`. Then run:

```bash
cd /opt/upang-safety-system
npm ci
npm run build

cd /opt/Upang_Safety_Admin-main/frontend
npm ci
npm run build

sudo mkdir -p /var/www/upang/user /var/www/upang/admin
sudo cp -a /opt/upang-safety-system/build/. /var/www/upang/user/
sudo cp -a /opt/Upang_Safety_Admin-main/frontend/dist/. /var/www/upang/admin/
```

The API uses same-origin URLs by default. Keep `REACT_APP_API_URL` and `VITE_API_URL` unset for this Nginx setup. For a different API host, set those variables before building and configure HTTPS and CORS for that host.

## Configure the API

Create `/etc/upang-safety.env` on the instance. Do not commit this file or put real credentials in frontend environment variables.

```dotenv
PORT=5000
HOST=127.0.0.1
MONGO_URI=mongodb+srv://DB_USER:URL_ENCODED_PASSWORD@YOUR_CLUSTER/IncidentReporting_db
JWT_SECRET=replace-with-a-long-random-secret
ALLOW_ADMIN_SIGNUP=false
CLIENT_URL=http://EC2_PUBLIC_IP
CORS_ORIGINS=http://EC2_PUBLIC_IP,http://EC2_PUBLIC_IP:8081
EMAIL_USER=your-sending-account@example.com
EMAIL_PASS=your-email-provider-app-password
```

Replace `EC2_PUBLIC_IP` with the instance Elastic IP. URL-encode special characters in the MongoDB username/password. Generate a unique `JWT_SECRET`; use a mail-provider app password rather than an account password. Restrict the environment file and allow the service user to write uploaded evidence:

```bash
sudo chmod 600 /etc/upang-safety.env
sudo mkdir -p /opt/Upang-safety-and-report-system-backend-api/uploads
sudo chown -R www-data:www-data /opt/Upang-safety-and-report-system-backend-api/uploads
```

For the first admin only, temporarily set `ALLOW_ADMIN_SIGNUP=true`, restart `upang-api`, create the admin through the admin page, then set it back to `false` and restart the service. The API rejects signup when an admin already exists. Never leave admin signup enabled for normal operation.

Install and start the API service:

```bash
sudo cp /opt/deploy/upang-api.service /etc/systemd/system/upang-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now upang-api
sudo systemctl status upang-api
```

If your repository is not at `/opt/Upang-safety-and-report-system-backend-api`, update the paths in the service file before installing it.

## Configure Nginx

```bash
sudo cp /opt/deploy/nginx.conf /etc/nginx/sites-available/upang
sudo ln -s /etc/nginx/sites-available/upang /etc/nginx/sites-enabled/upang
sudo nginx -t
sudo systemctl reload nginx
```

Disable the default Nginx site if it conflicts with the port 80 default server. Check `http://EC2_PUBLIC_IP/` and `http://EC2_PUBLIC_IP:8081/`. The API health check is `http://EC2_PUBLIC_IP/health`.

Direct IP access over HTTP is suitable for a smoke test, not a production system handling accounts or passwords. Add a domain and HTTPS before real use. Also rotate any credentials that have ever been committed or shared, and back up MongoDB and uploaded files.