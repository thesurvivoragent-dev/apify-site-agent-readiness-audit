const {Actor}=require('apify');const {audit}=require('./audit');
(async()=>{await Actor.init();const {urls=[]}=await Actor.getInput()||{};
for(const u of urls){try{await Actor.pushData(await audit(u))}catch(e){await Actor.pushData({inputUrl:u,error:String(e)})}}
await Actor.exit()})();
