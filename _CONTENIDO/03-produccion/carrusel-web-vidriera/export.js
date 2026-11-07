const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
 for(let i=1;i<=4;i++){await p.goto('file://'+path.resolve(__dirname,`html/lamina-${i}.html`),{waitUntil:'load'});
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
  await p.screenshot({path:path.resolve(__dirname,`png/lamina-${i}.png`)});console.log('ok',i)}
 await b.close()})();
