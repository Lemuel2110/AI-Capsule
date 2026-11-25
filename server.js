import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import {randomBytes, timingSafeEqual} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const app=express();
const port=process.env.PORT || 3000;
const base=new URL(process.env.APP_URL || `http://localhost:${port}`).origin;
const secret=process.env.JWT_SECRET;
const client=process.env.GITHUB_CLIENT_ID, clientSecret=process.env.GITHUB_CLIENT_SECRET;
const cookie={httpOnly:true,secure:true,sameSite:'lax',path:'/'};
const db=new DatabaseSync(process.env.DB_PATH || path.join(root,'capsules.sqlite'));
db.exec(`CREATE TABLE IF NOT EXISTS capsules(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,project_name TEXT NOT NULL,prompt_title TEXT NOT NULL,prompt_version TEXT,prompt_text TEXT NOT NULL,response_summary TEXT,category TEXT,usefulness TEXT,reviewed INTEGER DEFAULT 0,improved INTEGER DEFAULT 0,screenshot_url TEXT,notes TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP); CREATE INDEX IF NOT EXISTS owner_idx ON capsules(user_id);`);
app.disable('x-powered-by');app.use(express.json({limit:'128kb'}),cookieParser());
app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Referrer-Policy','same-origin');if(req.path.startsWith('/api')||req.path.startsWith('/auth'))res.set('Cache-Control','no-store');next();});
function auth(req,res,next){try{if(!secret)throw Error();const p=jwt.verify(req.cookies.token,secret,{algorithms:['HS256'],issuer:'ai-capsule',audience:'ai-capsule'});if(typeof p.sub!=='string'||!p.sub)throw Error();req.user=p;next();}catch{if(req.path==='/dashboard')return res.redirect('/login');res.status(401).json({error:'Unauthorized'});}}
function csrf(req,res,next){if(req.get('origin')!==base)return res.status(403).json({error:'Invalid origin'});next();}
app.get('/api/health',(_,res)=>res.json({status:'ok'}));
app.get('/auth/github',(req,res)=>{if(!client||!clientSecret||!secret||secret.length<32)return res.status(503).send('Configure GitHub OAuth and JWT_SECRET in .env first.');const state=randomBytes(32).toString('hex');res.cookie('oauth_state',state,{...cookie,maxAge:600000});const q=new URLSearchParams({client_id:client,redirect_uri:base+'/auth/github/callback',state});res.redirect('https://github.com/login/oauth/authorize?'+q);});
app.get('/auth/github/callback',async(req,res)=>{const state=req.cookies.oauth_state;res.clearCookie('oauth_state',cookie);try{if(typeof state!=='string'||typeof req.query.state!=='string'||state.length!==req.query.state.length||!timingSafeEqual(Buffer.from(state),Buffer.from(req.query.state))||typeof req.query.code!=='string')throw Error('state');const exchange=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:client,client_secret:clientSecret,code:req.query.code,redirect_uri:base+'/auth/github/callback'})});const token=await exchange.json();if(!exchange.ok||!token.access_token)throw Error('exchange');const profile=await fetch('https://api.github.com/user',{headers:{Authorization:`Bearer ${token.access_token}`,Accept:'application/vnd.github+json','User-Agent':'AI-Capsule'}});const user=await profile.json();if(!profile.ok||!Number.isSafeInteger(user.id))throw Error('profile');const session=jwt.sign({login:user.login},secret,{algorithm:'HS256',subject:String(user.id),issuer:'ai-capsule',audience:'ai-capsule',expiresIn:'2h'});res.cookie('token',session,{...cookie,maxAge:7200000});res.redirect('/dashboard');}catch{res.redirect('/login?error=oauth');}});
app.get('/api/me',auth,(req,res)=>res.json({login:req.user.login}));
app.post('/auth/logout',csrf,(req,res)=>{res.clearCookie('token',cookie);res.json({ok:true});});
const fields=['project_name','prompt_title','prompt_version','prompt_text','response_summary','category','usefulness','reviewed','improved','screenshot_url','notes'];
function values(body){if(!body||typeof body!=='object')throw Error('Invalid data');return fields.map(k=>{if(k==='reviewed'||k==='improved')return body[k]===true||body[k]===1?1:0;const v=body[k]??'';if(typeof v!=='string'||v.length>20000)throw Error('Invalid '+k);if(['project_name','prompt_title','prompt_text'].includes(k)&&!v.trim())throw Error('Required: '+k);if(k==='screenshot_url'&&v.trim()){let u;try{u=new URL(v);}catch{throw Error('Invalid screenshot URL');}if(!['http:','https:'].includes(u.protocol))throw Error('Invalid screenshot URL');}return v.trim();});}
app.use('/api/capsules',auth);
app.get('/api/capsules',(req,res)=>res.json(db.prepare('SELECT * FROM capsules WHERE user_id=? ORDER BY id DESC').all(req.user.sub)));
app.post('/api/capsules',csrf,(req,res)=>{let v;try{v=values(req.body);}catch(e){return res.status(400).json({error:e.message});}const r=db.prepare(`INSERT INTO capsules(user_id,${fields.join(',')}) VALUES (${Array(fields.length+1).fill('?').join(',')})`).run(req.user.sub,...v);res.status(201).json(db.prepare('SELECT * FROM capsules WHERE id=? AND user_id=?').get(r.lastInsertRowid,req.user.sub));});
app.put('/api/capsules/:id',csrf,(req,res)=>{let v;try{v=values(req.body);}catch(e){return res.status(400).json({error:e.message});}const r=db.prepare(`UPDATE capsules SET ${fields.map(k=>k+'=?').join(',')} WHERE id=? AND user_id=?`).run(...v,req.params.id,req.user.sub);if(!r.changes)return res.status(404).json({error:'Not found'});res.json(db.prepare('SELECT * FROM capsules WHERE id=? AND user_id=?').get(req.params.id,req.user.sub));});
app.delete('/api/capsules/:id',csrf,(req,res)=>{const r=db.prepare('DELETE FROM capsules WHERE id=? AND user_id=?').run(req.params.id,req.user.sub);if(!r.changes)return res.status(404).json({error:'Not found'});res.status(204).end();});
app.get('/dashboard',auth);
app.use('/api',(_,res)=>res.status(404).json({error:'Not found'}));
app.use(express.static(path.join(root,'dist')));app.get(['/', '/login','/dashboard'],(_,res)=>res.sendFile(path.join(root,'dist/index.html')));
app.use((err,req,res,next)=>{console.error(err.message);res.status(err.status||500).json({error:err.status===400?'Invalid request':'Server error'});});
app.listen(port,'0.0.0.0',()=>console.log(`AI Capsule listening on ${port}`));
