# AI Capsule

**Developer: Lemuel Amadeus Tanaja**

AI Capsule is a private web application for saving, organising, reviewing and improving AI prompts. Users can sign in with GitHub and manage their own prompt records.

## Live Application

- Website: https://ai-capsule-lemuel-amg6gbheedbbagge.japanwest-01.azurewebsites.net
- Repository: https://github.com/Lemuel2110/AI-Capsule
- Hosting: Microsoft Azure App Service
- Region: Japan West
- Pricing plan: Free F1
- Runtime: Node.js 24 LTS

## Technologies

- React and CSS
- Node.js and Express
- SQLite
- GitHub OAuth
- JSON Web Token (JWT)
- Git and GitHub
- Microsoft Azure

## Local Setup

Requirements: Node.js 24 and npm.

```sh
npm install
cp .env.example .env
npm run build
npm start
```

Open http://localhost:3000.

Configure the environment variables and register the localhost OAuth callback before testing the login functionality.

## Environment Variables

| Variable | Purpose |
|---|---|
| PORT | Server port |
| APP_URL | Application URL |
| GITHUB_CLIENT_ID | GitHub OAuth client ID |
| GITHUB_CLIENT_SECRET | GitHub OAuth client secret |
| JWT_SECRET | JWT signing secret |
| DB_PATH | SQLite database location |

Sensitive values are excluded from the GitHub repository using `.gitignore`.

## Authentication and Security

Users sign in through GitHub OAuth. After successful authentication, the backend creates a signed JWT and stores it in a Secure, HttpOnly and SameSite=Lax cookie named `token`.

Protected API routes verify the JWT before processing requests. Each capsule belongs to the authenticated user. Users cannot access other users' records through normal authenticated API requests.

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/health | Public |
| GET | /api/me | Protected |
| GET | /api/capsules | Protected |
| POST | /api/capsules | Protected |
| PUT | /api/capsules/:id | Protected |
| DELETE | /api/capsules/:id | Protected |
| GET | /auth/github | OAuth login |
| GET | /auth/github/callback | OAuth callback |
| POST | /auth/logout | Logout |

## Cloud Deployment

The application was deployed to Microsoft Azure App Service using manual ZIP deployment.

Deployment steps:

1. Created an Azure Web App using the Azure for Students subscription.
2. Selected Node.js 24 LTS, Linux and the Free F1 plan.
3. Selected Japan West as the deployment region.
4. Configured the environment variables in Azure.
5. Enabled server-side building using SCM_DO_BUILD_DURING_DEPLOYMENT=true.
6. Created a ZIP archive from the Git repository.
7. Uploaded the ZIP through Azure Deployment Center.
8. Updated the GitHub OAuth homepage and callback URLs.
9. Tested the deployed application.

The upload, build and deployment stages completed successfully.

## Database and Storage

SQLite was selected because it is lightweight, easy to configure and suitable for a small application. The database is automatically initialised when the server starts.

The deployed database is stored at `/home/capsules.sqlite`.

Compared with SQLite, PostgreSQL provides better support for concurrent users and larger applications. However, it requires additional database infrastructure and configuration.

SQLite is suitable for this assignment, but a managed database would be preferable for a larger production application requiring reliable backups and scalability.

## Testing Results

| Test | Local | Azure |
|---|---|---|
| Health endpoint | Pass | Pass |
| GitHub OAuth login | Pass | Pass |
| Create capsule | Pass | Pass |
| Read capsule | Pass | Pass |
| Update capsule | Pass | Pass |
| Delete capsule | Pass | Pass |
| Missing authentication | Pass | Pass |
| Invalid JWT | Pass | Pass |
| Logout | — | Pass |
| User record visibility | — | Pass |

## Deployed Security Tests

### Health Check

```sh
curl -i https://ai-capsule-lemuel-amg6gbheedbbagge.japanwest-01.azurewebsites.net/api/health
```

Result:

```text
HTTP 200 OK
{"status":"ok"}
```

### Test 1: Missing Authentication

```sh
curl -i https://ai-capsule-lemuel-amg6gbheedbbagge.japanwest-01.azurewebsites.net/api/capsules
```

Result:

```text
HTTP 401 Unauthorized
{"error":"Unauthorized"}
```

### Test 2: Invalid JWT

```sh
curl -i -H "Cookie: token=fake-token-123" https://ai-capsule-lemuel-amg6gbheedbbagge.japanwest-01.azurewebsites.net/api/capsules
```

Result:

```text
HTTP 401 Unauthorized
{"error":"Unauthorized"}
```

Both unauthorised requests were rejected by the backend.

## Problems Encountered

I initially attempted to deploy the application using Render. However, Render required payment card verification even when the free plan was selected.

I switched to Azure for Students. The first deployment attempt failed because Southeast Asia was not an allowed region for my subscription. I checked the Azure policy settings and selected Japan West instead.

The GitHub Actions deployment setup also encountered a role assignment error. I resolved this deployment issue by using manual ZIP deployment through Azure Deployment Center.

## Limitations

The Azure Free F1 plan has limited computing resources and may experience slower response times after inactivity.

SQLite is suitable for this small application but has limitations when handling large numbers of concurrent users. A managed database would be more appropriate for a larger production system.

## AI Collaboration Statement

I used ChatGPT to assist with source code generation, UI development, backend implementation, authentication, deployment troubleshooting and documentation.

I personally configured GitHub OAuth, installed dependencies, ran the application, tested CRUD functionality, performed security checks, uploaded the project to GitHub and deployed the application to Azure.

One issue I solved was the Azure region restriction. I checked the allowed deployment regions and changed the region to Japan West. I also used manual ZIP deployment after encountering a GitHub Actions configuration error.

One limitation of the application is that SQLite and the Azure Free F1 plan are better suited to small applications than large production systems.