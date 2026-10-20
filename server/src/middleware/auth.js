import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export default async function auth(req,res,next){
 const token=req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
 if(!token)return res.status(401).json({code:'LOGIN_REQUIRED',message:'Please log in.'});
 try{const payload=jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256'],issuer:'fintrack'});
 const user=await User.findById(payload.sub).select('name email role status');
 if(!user)return res.status(401).json({code:'ACCOUNT_MISSING',message:'This account no longer exists.'});
 if(user.status!=='active')return res.status(403).json({code:'ACCOUNT_SUSPENDED',message:'Your account is suspended. Contact the administrator.'});
 req.userId=user._id;req.currentUser=user;next();
 }catch(e){if(e.name==='JsonWebTokenError'||e.name==='TokenExpiredError'||e.name==='NotBeforeError')return res.status(401).json({code:'SESSION_EXPIRED',message:'Session expired. Please log in again.'});next(e)}
}
export function requireAdmin(req,res,next){if(req.currentUser?.role!=='admin')return res.status(403).json({code:'ADMIN_ONLY',message:'Administrator access required.'});next()}
