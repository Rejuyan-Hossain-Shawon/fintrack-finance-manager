import mongoose from 'mongoose';
const schema=new mongoose.Schema({actor:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},action:{type:String,required:true},target:{type:mongoose.Schema.Types.ObjectId,ref:'User'},details:{type:String,maxlength:200}},{timestamps:true});schema.index({createdAt:-1});export default mongoose.model('AuditLog',schema);
