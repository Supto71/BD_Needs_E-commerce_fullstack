"use strict";(()=>{var a={};a.id=9302,a.ids=[9302],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},1932:a=>{a.exports=require("url")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8128:a=>{a.exports=require("next/dist/server/runtime-reacts.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{a.exports=require("dns")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:a=>{a.exports=require("os")},27910:a=>{a.exports=require("stream")},28354:a=>{a.exports=require("util")},29021:a=>{a.exports=require("fs")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{a.exports=require("path")},34631:a=>{a.exports=require("tls")},37702:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>z,patchFetch:()=>y,routeModule:()=>u,serverHooks:()=>x,workAsyncStorage:()=>v,workUnitAsyncStorage:()=>w});var d=c(19225),e=c(84006),f=c(8317),g=c(99373),h=c(34775),i=c(24235),j=c(261),k=c(54365),l=c(90771),m=c(73461),n=c(67798),o=c(92280),p=c(62018),q=c(45696),r=c(47929),s=c(86439),t=c(37527);let u=new d.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/api/cron/abandoned-cart/route",pathname:"/api/cron/abandoned-cart",filename:"route",bundlePath:"app/api/cron/abandoned-cart/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/runner/work/BD_Needs_E-commerce_fullstack/BD_Needs_E-commerce_fullstack/src/app/api/cron/abandoned-cart/route.ts",nextConfigOutput:"standalone",userland:()=>c(94328),...{}}),{workAsyncStorage:v,workUnitAsyncStorage:w,serverHooks:x}=u;function y(){return(0,f.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:w})}async function z(a,b,c){c.requestMeta&&(0,g.setRequestMeta)(a,c.requestMeta),u.isDev&&(0,g.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/cron/abandoned-cart/route";"/index"===d&&(d="/");let f=await u.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!f)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:v,deploymentId:w,params:x,nextConfig:y,parsedUrl:z,isDraftMode:A,prerenderManifest:B,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=f,I=(0,j.normalizeAppPath)(d),J=!!(B.dynamicRoutes[I]||B.routes[F]),K=async()=>((null==C?void 0:C.render404)?await C.render404(a,b,z,!1):b.end("This page could not be found"),null);if(J&&!A){let a=!!B.routes[F],b=B.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(y.adapterPath)return await K();throw new s.NoFallbackError}}let L=null;!J||u.isDev||A||(L="/index"===(L=F)?"/":L);let M=!0===u.isDev||!J,N=J&&!M;H&&G&&(0,i.setManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H});let O=a.method||"GET",P=(0,h.getTracer)(),Q=P.getActiveScopeSpan(),R=!!(null==C?void 0:C.isWrappedByNextServer),S=!!(0,g.getRequestMeta)(a,"minimalMode"),T=(0,g.getRequestMeta)(a,"incrementalCache")||await u.getIncrementalCache(a,y,B,S);null==T||T.resetRequestCache(),globalThis.__incrementalCache=T;let U={params:x,previewProps:B.preview,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts,useCacheTimeout:y.experimental.useCacheTimeout},cacheComponents:!!y.cacheComponents,validationLevel:y.experimental.instantInsights.validationLevel,supportsDynamicResponse:M,incrementalCache:T,hmrRefreshHash:(0,g.getRequestMeta)(a,"hmrRefreshHash"),cacheLifeProfiles:y.cacheLife,staticPageGenerationTimeout:y.staticPageGenerationTimeout,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>u.onRequestError(a,b,d,e,C)},sharedContext:{buildId:v,deploymentId:w}},V=new k.NodeNextRequest(a),W=new k.NodeNextResponse(b),X=l.NextRequestAdapter.fromNodeNextRequest(V,(0,l.signalFromNodeResponse)(b)),Y=async({previousCacheEntry:e})=>{try{if(!S&&D&&E&&!e)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await u.handle(X,U);a.fetchMetrics=U.renderOpts.fetchMetrics;let f=U.renderOpts.pendingWaitUntil;f&&c.waitUntil&&(c.waitUntil(f),f=void 0);let g=U.renderOpts.collectedTags;if(!J)return await (0,o.I)(V,W,d,f),null;{let a=await d.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(d.headers);g&&(b[r.NEXT_CACHE_TAGS_HEADER]=g),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,e=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=r.INFINITE_CACHE?!1!==c&&c>0?y.expireTime:void 0:U.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==e?void 0:e.isStale)&&await u.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),b}},Z=async(d,f)=>{try{var g,i;let d=await u.handleResponse({req:a,nextConfig:y,cacheKey:L,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:B,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:Y,waitUntil:c.waitUntil,isMinimalMode:S});if(!J)return;if((null==d||null==(g=d.value)?void 0:g.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});S||b.setHeader("x-nextjs-cache",D?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),A&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);S&&J||f.delete(r.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||b.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,q.getCacheControlHeader)(d.cacheControl)),await (0,o.I)(V,W,new Response(d.value.body,{headers:f,status:d.value.status||200}));return}catch(b){if(b instanceof s.NoFallbackError||await u.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),J)throw b;await (0,o.I)(V,W,new Response(null,{status:500}));return}finally{(()=>{if(!d)return;let a=b.statusCode;d.setAttributes({"http.status_code":a,"next.rsc":!1}),a&&a>=500&&(d.setStatus({code:h.SpanStatusCode.ERROR}),d.setAttribute("error.type",a.toString()));let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==m.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route")||I,g=`${O} ${e}`;d.setAttributes({"next.route":e,"http.route":e,"next.span_name":g}),d.updateName(g),f&&f!==d&&(f.setAttribute("http.route",e),f.updateName(g))})()}};if(R&&Q)await Z(Q,void 0);else{let b=P.getActiveScopeSpan();await P.withPropagatedContext(a.headers,()=>P.trace(m.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:h.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},a=>Z(a,b)),void 0,!R)}}},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{a.exports=require("crypto")},55591:a=>{a.exports=require("https")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:a=>{a.exports=require("zlib")},79646:a=>{a.exports=require("child_process")},81630:a=>{a.exports=require("http")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{a.exports=require("net")},93061:(a,b,c)=>{c.d(b,{z:()=>d.zR});var d=c(20903)},94328:(a,b,c)=>{c.r(b),c.d(b,{GET:()=>h,dynamic:()=>g});var d=c(23211),e=c(93061),f=c(35924);let g="force-dynamic";async function h(a){try{if(a.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return new d.NextResponse("Unauthorized",{status:401});let b=new Date(Date.now()-864e5),c=new Date(Date.now()-1728e5),g=await e.z.cart.findMany({where:{updatedAt:{lte:b,gte:c},items:{some:{}}},include:{user:!0,items:!0}});if(0===g.length)return d.NextResponse.json({message:"No abandoned carts found.",emailsSent:0});let h=f.createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:Number(process.env.SMTP_PORT)||587,secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}),i=0,j=[];for(let a of g){if(await e.z.order.findFirst({where:{userId:a.userId,createdAt:{gte:b}}}))continue;let c=a.user.email,d=a.user.name;try{await h.sendMail({from:`"BDNeeds" <${process.env.SMTP_USER}>`,to:c,subject:`${d}, আপনার কার্টে পণ্য অপেক্ষা করছে! 🛒`,html:`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>You left something behind!</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;max-width:600px;width:100%;">
            
            <!-- Header -->
            <tr>
              <td style="background-color:#0B132B;padding:30px 40px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:900;letter-spacing:2px;">BDNEEDS</h1>
                <p style="color:#94a3b8;margin:6px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Premium Essentials</p>
              </td>
            </tr>

            <!-- Hero Icon -->
            <tr>
              <td style="padding:40px 40px 20px;text-align:center;">
                <div style="font-size:48px;">🛒</div>
                <h2 style="color:#0B132B;font-size:22px;font-weight:900;margin:16px 0 8px;">
                  আপনি কিছু রেখে গেছেন, ${d}!
                </h2>
                <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">
                  আপনার কার্টে কিছু পণ্য এখনও অপেক্ষা করছে।<br/>
                  অর্ডার সম্পন্ন করুন এবং দ্রুত ডেলিভারি উপভোগ করুন!
                </p>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td style="padding:20px 40px 40px;text-align:center;">
                <a 
                  href="https://bdneeds.com.bd/cart" 
                  style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.5px;"
                >
                  🛍️ কার্ট দেখুন ও অর্ডার করুন
                </a>
              </td>
            </tr>

            <!-- Benefits Bar -->
            <tr>
              <td style="padding:0 40px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:16px;text-align:center;border-right:1px solid #e2e8f0;">
                      <div style="font-size:20px;">🚚</div>
                      <p style="color:#0B132B;font-size:11px;font-weight:700;margin:6px 0 0;">দ্রুত ডেলিভারি</p>
                      <p style="color:#64748b;font-size:10px;margin:3px 0 0;">সারাদেশে</p>
                    </td>
                    <td style="padding:16px;text-align:center;border-right:1px solid #e2e8f0;">
                      <div style="font-size:20px;">🔄</div>
                      <p style="color:#0B132B;font-size:11px;font-weight:700;margin:6px 0 0;">৭ দিন রিটার্ন</p>
                      <p style="color:#64748b;font-size:10px;margin:3px 0 0;">সহজ প্রক্রিয়া</p>
                    </td>
                    <td style="padding:16px;text-align:center;">
                      <div style="font-size:20px;">🔒</div>
                      <p style="color:#0B132B;font-size:11px;font-weight:700;margin:6px 0 0;">নিরাপদ পেমেন্ট</p>
                      <p style="color:#64748b;font-size:10px;margin:3px 0 0;">bKash, Nagad, COD</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:11px;margin:0;">
                  এই ইমেইলটি পেতে না চাইলে এটি উপেক্ষা করুন।
                </p>
                <p style="color:#94a3b8;font-size:11px;margin:8px 0 0;">
                  \xa9 ${new Date().getFullYear()} BDNeeds &nbsp;|&nbsp; 
                  <a href="https://bdneeds.com.bd" style="color:#2563eb;text-decoration:none;">bdneeds.com.bd</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `}),console.log(`[Cron] Abandoned cart email sent to: ${c}`),i++}catch(a){console.error(`[Cron] Failed to send email to ${c}:`,a),j.push(c)}}return d.NextResponse.json({success:!0,totalAbandoned:g.length,emailsSent:i,failed:j.length})}catch(a){return console.error("Cron abandoned cart error:",a),d.NextResponse.json({error:"Failed to process abandoned carts"},{status:500})}}},94735:a=>{a.exports=require("events")},96330:a=>{a.exports=require("@prisma/client")}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[3445,1813,5924,859],()=>b(b.s=37702));module.exports=c})();