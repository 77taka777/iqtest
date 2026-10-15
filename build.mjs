import {writeFile} from 'node:fs/promises';
const url=(process.env.SUPABASE_URL||'').trim().replace(/\/$/,''),publishableKey=(process.env.SUPABASE_PUBLISHABLE_KEY||'').trim();
if(Boolean(url)!==Boolean(publishableKey))throw Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must both be configured.');
if(url&&!/^https:\/\/[a-z0-9.-]+$/.test(url))throw Error('SUPABASE_URL must be an HTTPS project URL.');
if(publishableKey&&!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey))throw Error('Only a Supabase publishable key may be sent to the browser. Never use a secret or service-role key.');
await writeFile(new URL('../dist/supabase-config.js',import.meta.url),"'use strict';\nconst SUPABASE_CONFIG=Object.freeze("+JSON.stringify({url,publishableKey})+");\n");
console.log(url?'Static app built with Supabase configured.':'Static app built. Shared score storage awaits Supabase configuration.');
