# FixItNow 🔧

Premium Home Services platform for Bangladesh — Node.js backend + single-page frontend, containerised with Docker and automated via GitHub Actions.

---

## Project Structure

```
fixitnow/
├── app.js                          ← Express backend + REST API
├── package.json
├── Dockerfile                      ← Multi-stage production image
├── docker-compose.yml              ← Local dev with one command
├── .dockerignore
├── .gitignore
├── public/
│   └── index.html                  ← Full frontend (all pages + CSS + JS)
└── .github/
    └── workflows/
        └── docker-publish.yml      ← GitHub Actions CI/CD pipeline
```

---

## Running Locally (Node.js)

```bash
npm install
npm start
# → http://localhost:3000
```

---

## Running with Docker

### Option A — Docker Compose (recommended)
```bash
docker compose up --build
# → http://localhost:3000
```

### Option B — Docker CLI
```bash
# Build
docker build -t fixitnow .

# Run
docker run -p 3000:3000 fixitnow
# → http://localhost:3000
```

### Option C — Pull from Docker Hub
```bash
docker pull YOUR_DOCKERHUB_USERNAME/fixitnow:latest
docker run -p 3000:3000 YOUR_DOCKERHUB_USERNAME/fixitnow:latest
```

---

## GitHub Actions — CI/CD Setup

The workflow in `.github/workflows/docker-publish.yml` automatically:
1. Checks Node.js syntax on every push & pull request
2. Builds a multi-platform Docker image (linux/amd64 + linux/arm64)
3. Pushes it to Docker Hub with three tags: latest, branch name, and git SHA
4. Verifies the pushed image starts and serves traffic

### Step-by-step setup

#### 1. Create a Docker Hub Access Token
1. Log in at https://hub.docker.com
2. Go to Account Settings → Security → New Access Token
3. Name it "github-actions", set permission to Read & Write
4. Copy the token — you won't see it again

#### 2. Add Secrets to your GitHub repository
1. Go to your repo → Settings → Secrets and variables → Actions
2. Click "New repository secret" and add both:

| Secret name          | Value                        |
|----------------------|------------------------------|
| DOCKERHUB_USERNAME   | Docker Hub username          |
| DOCKERHUB_TOKEN      | The access token from step 1 |

#### 3. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fixitnow.git
git push -u origin main
```

The workflow triggers automatically. Watch it under the Actions tab in GitHub.

---

## CI/CD Pipeline Flow

```
git push to main
       |
       v
[ Job 1: test ]      node --check app.js
(syntax check)       npm ci
       |
       | pass
       v
[ Job 2: docker ]    docker buildx build (amd64 + arm64)
(build & push)    -> DockerHub :latest
                  -> DockerHub :main
                  -> DockerHub :sha-abc1234
       |
       | pass
       v
[ Job 3: verify ]    docker pull + run
(health check)       curl http://localhost:3000
```
docker run -p 3000:3000 touhid552/fixitnow:latest
open http://localhost:3000 and app runs
---

## Demo Logins

| Role     | Email                | Password |
|----------|----------------------|----------|
| Customer | user@demo.com        | pass123  |
| Provider | provider@demo.com    | pass123  |
| Admin    | admin@demo.com       | pass123  |

---

## API Endpoints

| Method | Path                       | Description                |
|--------|----------------------------|----------------------------|
| POST   | /api/auth/login            | Login                      |
| POST   | /api/auth/register         | Register new user          |
| GET    | /api/bookings              | List bookings              |
| POST   | /api/bookings              | Create booking             |
| PATCH  | /api/bookings/:id          | Update booking status      |
| DELETE | /api/bookings/:id          | Cancel booking             |
| GET    | /api/services              | List services              |
| PATCH  | /api/services/:id          | Toggle service on/off      |
| GET    | /api/providers             | List providers             |
| GET    | /api/providers/pending     | List pending applicants    |
| PATCH  | /api/providers/pending/:id | Approve / reject applicant |
| GET    | /api/admin/stats           | Platform stats             |
