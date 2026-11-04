import {drizzle} from 'drizzle-orm/sqlite-proxy';
import {sqlite} from '../lib/runtime';
import * as schema from './schema';
export function getDb(){return drizzle(async(sql,params,method)=>{const stmt=sqlite().prepare(sql);if(method==='run'){stmt.run(...params);return {rows:[]}}const rows=stmt.all(...params);return {rows:rows.map(row=>Object.values(row))}},{schema})}
