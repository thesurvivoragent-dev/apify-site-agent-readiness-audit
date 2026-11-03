async function get(u){try{const r=await fetch(u,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; SiteAuditBot/0.1)'},signal:AbortSignal.timeout(15000)});return {ok:r.ok,status:r.status,url:r.url,text:r.ok?await r.text():''};}catch(e){return {ok:false,status:0,text:'',err:String(e)}}}
const m=(h,re)=>{const x=h.match(re);return x?x[1].trim():null};
async function audit(input){
 let u=input.trim(); if(!/^https?:\/\//.test(u))u='https://'+u;
 const o=new URL(u).origin;
 const [p,rb,sm,ll]=await Promise.all([get(u),get(o+'/robots.txt'),get(o+'/sitemap.xml'),get(o+'/llms.txt')]);
 const h=p.text;
 const meta=n=>m(h,new RegExp('<meta[^>]+(?:name|property)=["\']'+n+'["\'][^>]*content=["\']([^"\']*)["\']','i'))||m(h,new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:name|property)=["\']'+n+'["\']','i'));
 const types=[...h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].flatMap(x=>{try{const j=JSON.parse(x[1]);const a=Array.isArray(j)?j:(j['@graph']||[j]);return a.map(z=>z['@type']).flat().filter(Boolean)}catch{return[]}});
 const emails=[...new Set((h.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/g)||[]).filter(e=>!/\.(png|jpg|svg|webp|gif)$/i.test(e)))].slice(0,10);
 const social=[...new Set((h.match(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com|linkedin\.com|facebook\.com|instagram\.com|github\.com|youtube\.com|tiktok\.com)\/[^\s"'<>)]+/gi)||[]))].slice(0,15);
 const r={inputUrl:input,finalUrl:p.url||u,status:p.status,title:m(h,/<title[^>]*>([\s\S]*?)<\/title>/i),description:meta('description'),canonical:m(h,/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)/i),lang:m(h,/<html[^>]+lang=["']([^"']+)/i),ogTitle:meta('og:title'),ogImage:meta('og:image'),jsonLdTypes:[...new Set(types)],emails,socialLinks:social,hasRobotsTxt:rb.ok,hasSitemap:sm.ok&&/<(urlset|sitemapindex)/.test(sm.text),hasLlmsTxt:ll.ok&&!/<html/i.test(ll.text.slice(0,200)),robotsBlocksAI:/user-agent:\s*(gptbot|claudebot|ccbot|google-extended)/i.test(rb.text)};
 let s=0;if(p.ok)s+=10;if(r.title)s+=10;if(r.description)s+=10;if(r.canonical)s+=10;if(r.ogTitle)s+=10;if(r.jsonLdTypes.length)s+=20;if(r.hasSitemap)s+=10;if(r.hasRobotsTxt)s+=5;if(r.hasLlmsTxt)s+=15;
 r.agentReadinessScore=s;return r}
module.exports={audit};
