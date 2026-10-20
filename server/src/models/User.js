import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,maxlength:80},email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:['user','admin'],default:'user'},status:{type:String,enum:['active','suspended'],default:'active'}},{timestamps:true});
export default mongoose.model('User',schema);
