import mongoose from 'mongoose';
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},type:{type:String,enum:['income','expense'],required:true},amountCents:{type:Number,required:true,min:1},category:{type:String,required:true,trim:true,maxlength:50},description:{type:String,default:'',trim:true,maxlength:250},date:{type:String,required:true,match:/^\d{4}-\d{2}-\d{2}$/}},{timestamps:true});
schema.index({user:1,date:-1});export default mongoose.model('Transaction',schema);
