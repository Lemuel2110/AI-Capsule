# AI Capsule

**Developer: Lemuel Amadeus Tanaja**

AI Capsule is a full-stack web application that allows users to save, organise, review and improve their AI prompts in a private workspace. It uses React, Node.js, Express, SQLite, GitHub OAuth and JWT authentication.

## Technologies

- Frontend: React and CSS
- Backend: Node.js and Express
- Database: SQLite
- Authentication: GitHub OAuth and JWT
- Version control: Git and GitHub
- Cloud platform: Render (deployment attempted)

## Local Installation

Requirements: Node.js 24 and npm.

Run the following commands:

```
npm install
cp .env.example .env
npm run build
npm start
```

Open http://localhost:3000 in a web browser.

Configure the required environment variables before attempting GitHub login. Rebuild the frontend after making changes to React components.

## Environment Variables

The application uses the following environment variables:

| Variable | Purpose |
|---|---|
| PORT | Server port |
| APP_URL | Application base URL |
| GITHUB_CLIENT_ID | GitHub OAuth client identifier |
| GITHUB_CLIENT_SECRET | GitHub OAuth client secret |
| JWT_SECRET | Secret used to sign and verify JWTs |
| DB_PATH | SQLite database location |

Secret values are stored in the local `.env` file or cloud environment settings and are excluded from the GitHub repository.

## Authentication and Security

Users authenticate through GitHub OAuth. After successful authentication, the Express backend obtains the GitHub user identifier and generates an application JWT.

The JWT is stored in a cookie named `token` with Secure, HttpOnly and SameSite=Lax attributes.

Protected API routes verify the JWT before allowing access to capsule records. The authenticated user identifier determines record ownership rather than accepting a user ID supplied by the frontend.

## API Routes

| Method | Route | Access |
|---|---|---|
| GET | / | Public |
| GET | /login | Public |
| GET | /dashboard | Protected |
| GET | /api/health | Public |
| GET | /api/capsules | Protected |
| POST | /api/capsules | Protected |
| PUT | /api/capsules/:id | Protected |
| DELETE | /api/capsules/:id | Protected |
| GET | /auth/github | OAuth login |
| GET | /auth/github/callback | OAuth callback |
| GET | /api/me | Protected |
| POST | /auth/logout | Logout |

React communicates with the Express backend through same-origin HTTP requests. Express serves both the frontend and backend API.

## Database and Storage

SQLite is automatically initialised when the server starts. Each capsule contains prompt information, project details, version, category, usefulness, review status, improvement status, screenshot evidence URL, notes and creation timestamp.

Each record is associated with the authenticated GitHub user identifier. Database queries are designed to restrict access to records belonging to the authenticated user.

SQLite was selected because it is lightweight and does not require a separate database server. PostgreSQL would provide a more suitable option for persistent storage and larger applications but would introduce additional configuration.

## Local Testing Results

The application was tested locally on 25 November 2026 using Node.js v24.14.1.

| Test | Result |
|---|---|
| React frontend | Pass |
| Express backend | Pass |
| Health endpoint | Pass |
| GitHub OAuth login | Pass |
| Authenticated dashboard | Pass |
| Create capsule | Pass |
| Read capsule | Pass |
| Update capsule | Pass |
| Delete capsule | Pass |
| Missing JWT rejection | Pass |
| Invalid JWT rejection | Pass |
| Cross-account ownership testing | Not yet completed |

### Health Check

Endpoint:

```
http://localhost:3000/api/health
```

Observed response:

```
{"status":"ok"}
```

### Security Test 1 — Missing Authentication

Command:

```
curl -i http://localhost:3000/api/capsules
```

Observed response:

```
HTTP/1.1 401 Unauthorized
{"error":"Unauthorized"}
```

Result: PASS. The backend rejected a request without authentication.

### Security Test 2 — Invalid JWT

Command:

```
curl -i -H "Cookie: token=fake-token-123" http://localhost:3000/api/capsules
```

Observed response:

```
HTTP/1.1 401 Unauthorized
{"error":"Unauthorized"}
```

Result: PASS. The backend rejected an invalid JWT.

These results demonstrate local API protection. The required public deployment tests have not yet been completed.

## Cloud Deployment

GitHub repository:

https://github.com/Lemuel2110/AI-Capsule

The source code was successfully uploaded to GitHub. A Render Web Service was configured using the following settings:

- Runtime: Node.js
- Branch: main
- Build command: npm ci && npm run build
- Start command: npm start
- Instance type: Free

The deployment could not be completed because Render requested payment card verification, despite selecting the free hosting plan.

Public deployment URL: Not yet available.

The required cloud health check, OAuth login, CRUD demonstration and security tests remain pending.

## Troubleshooting

### Port Already in Use

During development, the server returned an EADDRINUSE error because a previous Node.js process was still using port 3000.

The issue was resolved by identifying and stopping the existing process before restarting the application.

### Local OAuth Login

During local testing, the application returned to the landing page after authentication in Safari.

Switching to Google Chrome allowed the OAuth login process to complete successfully and the protected dashboard to load. The precise cause of the Safari behaviour was not independently confirmed.

## Application Limitations

The current application uses SQLite. When deployed on a hosting service with an ephemeral filesystem, database records may be lost after a restart or redeployment.

Cloud deployment is also currently incomplete due to the hosting provider's payment verification requirement.

## AI Collaboration Statement

ChatGPT was used to assist with initial source code generation, React UI development, Express API implementation, SQLite integration, OAuth and JWT configuration, troubleshooting and documentation.

I personally installed the project dependencies, configured the environment variables, registered the GitHub OAuth application, built and ran the application locally, tested authentication and CRUD functionality, performed the two local cURL security tests, uploaded the source code to GitHub and attempted cloud deployment.

One issue encountered during testing was the OAuth login returning to the landing page in Safari. Following troubleshooting, I switched to Chrome and successfully accessed the authenticated dashboard.

I also resolved a server startup issue caused by port 3000 already being occupied by another Node.js process.

OAuth functionality was verified through successful GitHub login and dashboard access. CRUD functionality was tested by creating, reading, updating and deleting a prompt record. Requests without a JWT and with an invalid JWT both returned HTTP 401 Unauthorized. Cross-account ownership testing remains incomplete.

The implementation uses a single Express application to serve the React frontend and backend API, simplifying deployment and avoiding unnecessary cross-origin configuration.

All testing results reported in this README refer to the local environment unless otherwise stated.