import test from 'node:test';import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import User from '../src/models/User.js';import Transaction from '../src/models/Transaction.js';import Budget from '../src/models/Budget.js';import Goal from '../src/models/Goal.js';
test('public user registration defaults to user role',()=>{const u=new User({name:'Test User',email:'test@example.com',passwordHash:'hash'});assert.equal(u.role,'user');assert.equal(u.status,'active')});
test('transaction rejects negative amount',()=>{const t=new Transaction({user:new mongoose.Types.ObjectId(),type:'expense',amountCents:-5,category:'Food',date:'2026-10-17'});assert.ok(t.validateSync()?.errors.amountCents)});
test('budget requires positive cents',()=>{const b=new Budget({user:new mongoose.Types.ObjectId(),month:'2026-10',category:'Food',limitCents:0});assert.ok(b.validateSync()?.errors.limitCents)});
test('goal saved amount cannot be negative',()=>{const g=new Goal({user:new mongoose.Types.ObjectId(),name:'Emergency fund',targetCents:50000,savedCents:-1});assert.ok(g.validateSync()?.errors.savedCents)});
