# AI Capsule
A private React + Express prompt library with GitHub OAuth, application JWT and SQLite.

## Local setup (Node.js 24)

```sh
npm install
cp .env.example .env
npm run build
npm start
```
Open http://localhost:3000. Before logging in, configure the environment variables below. The Secure cookie is intended for HTTPS; modern browsers generally permit Secure cookies on localhost. If login fails locally due to cookie handling, verify on the HTTPS deployment. After editing frontend code, rerun `npm run build`.

## GitHub OAuth setup
In GitHub Settings > Developer settings > OAuth Apps, register a new OAuth app. For local testing set Homepage URL to `http://localhost:3000` and Authorization callback URL to `http://localhost:3000/auth/github/callback`. Copy the client ID and generate a client secret; put them in `.env`. Generate a JWT signing secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and put it in `.env` as JWT_SECRET. Never share these values. Use a separate OAuth app for the deployed URL.

Environment names: `PORT`, `APP_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `JWT_SECRET`, `DB_PATH` (optional). Express uses the supplied OAuth callback URL, exchanges the authorization code server-side, reads the GitHub user ID, and issues its own signed JWT. The JWT is stored in a cookie named `token` with Secure, HttpOnly and SameSite=Lax attributes. It expires after two hours. OAuth state protects the callback; mutation routes also check the request origin. Authentication middleware verifies JWT signature, issuer, audience and expiry. The OAuth access token is not returned to the browser.

## Render deployment
Public URL: **[replace with actual deployed HTTPS URL]**.
Platform: Render web service (planned; verify current free-tier eligibility).
1. Create a GitHub repository and upload this project, excluding `.env`, database files, `node_modules` and `dist` (see `.gitignore`).
2. Create a Render Web Service connected to the repository, Node runtime. Build command: `npm install && npm run build`. Start command: `npm start`. Select Node 24 (package.json engines specifies 24.x).
3. Obtain the assigned HTTPS URL. Create a production GitHub OAuth app with that URL as Homepage URL and `<public URL>/auth/github/callback` as callback.
4. Set `APP_URL` to the assigned HTTPS origin, and set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `JWT_SECRET` in Render environment settings. Render supplies PORT. Do not expose secret values. Redeploy after updating variables.
5. Open the public URL and test login and all CRUD functions. Keep service available until marking completes.

## Routes
| Method | Path | Access |
|---|---|---|
| GET | / | Public landing |
| GET | /login | Public login |
| GET | /dashboard | Protected dashboard |
| GET | /api/health | Public, returns {"status":"ok"} |
| GET | /api/capsules | JWT, own records |
| POST | /api/capsules | JWT, create own record |
| PUT | /api/capsules/:id | JWT, update own record |
| DELETE | /api/capsules/:id | JWT, delete own record |
| GET | /auth/github | Begin OAuth |
| GET | /auth/github/callback | OAuth callback |
| GET | /api/me | JWT, current login |
| POST | /auth/logout | Clear cookie |

React uses same-origin fetch to call Express; the browser sends the session cookie automatically. Express serves the built React files. SQLite is initialized automatically on startup via node:sqlite. Prepared statements bind all data. Every CRUD query scopes ownership to the verified JWT subject; browser-supplied user_id is ignored. SQLite is simple and sufficient for this small project; unlike a managed PostgreSQL database it is local to the running instance. On a Render free service the filesystem is ephemeral, so records may disappear on restart/redeploy. This is a limitation, not persistent cloud storage.

## Required deployed security checks
Replace the URL and run these commands in Terminal before logging in:
```sh
curl -i https://YOUR-APP/api/capsules
curl -i -H 'Cookie: token=fake-token-123' https://YOUR-APP/api/capsules
curl -i https://YOUR-APP/api/health
```
Expected: first two return HTTP 401; health returns HTTP 200 with {"status":"ok"}. Actual results: **[paste your real results here after deployment]**. Never include a real token.

## Verification checklist
- [ ] Public URL and health endpoint work.
- [ ] Both unauthenticated and fake JWT tests return 401.
- [ ] GitHub login succeeds and dashboard loads.
- [ ] Create, reload/read, edit, and delete a capsule.
- [ ] Log in as another GitHub user in a separate browser profile and verify the first user's records are not visible. Verify attempts to update/delete another user's record fail (404); use browser developer tools with that user's own session, not a shared token.
- [ ] Logout and confirm dashboard requires login again.

## AI collaboration statement (complete honestly before submission)
ChatGPT assisted with the initial code, UI, database design, OAuth/JWT integration and documentation. Personally completed: **[describe your actual setup, changes and deployment]**. Problem found and corrected in AI-generated code or configuration: **[describe an actual problem and fix]**. OAuth/JWT and CRUD/ownership verification: **[record actual tests and results]**. Implementation/deployment decision: **[explain a decision you personally made and understand]**. Limitation: SQLite data on Render free hosting may be lost after a restart or redeploy. Do not claim checks you did not perform.

## Submission
Complete this README with real evidence. Submit source ZIP without node_modules, dist, secrets or private database files; submit a separate 3–5 minute MP4 with audio and the LMS AI acknowledgement form. In the video show public URL, health, both 401 curl checks, GitHub OAuth, complete CRUD, cloud settings and environment names (not values), and storage limitation/issue.
