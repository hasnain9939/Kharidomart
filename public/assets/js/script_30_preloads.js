
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.DsjDEvpF.js","/cdn/shopifycloud/checkout-web/assets/c1/app.Bfi60QhI.js","/cdn/shopifycloud/checkout-web/assets/c1/2c1ab0fe.Dbn2KvkT.js","/cdn/shopifycloud/checkout-web/assets/c1/6a2fc6d6.BXxh_g5t.js","/cdn/shopifycloud/checkout-web/assets/c1/4b4bc88f.Bt_GjDHq.js","/cdn/shopifycloud/checkout-web/assets/c1/bfe75f31.Xt7QheRQ.js","/cdn/shopifycloud/checkout-web/assets/c1/2bac2c53.BdUlvvak.js","/cdn/shopifycloud/checkout-web/assets/c1/9dba8418.BmUSQnrV.js","/cdn/shopifycloud/checkout-web/assets/c1/cb38e5c2.BEVZk-YL.js","/cdn/shopifycloud/checkout-web/assets/c1/3d539943.EO6QBDfn.js","/cdn/shopifycloud/checkout-web/assets/c1/2255f8fa.CUPyQ3cu.js","/cdn/shopifycloud/checkout-web/assets/c1/d25d1b95.Ur8jWsWV.js","/cdn/shopifycloud/checkout-web/assets/c1/b8733b27.BkXvhp9j.js","/cdn/shopifycloud/checkout-web/assets/c1/e39bc11c.C4RUW7iY.js","/cdn/shopifycloud/checkout-web/assets/c1/08a3b809.B0YPj-je.js","/cdn/shopifycloud/checkout-web/assets/c1/164ad2e3.Df3KV653.js","/cdn/shopifycloud/checkout-web/assets/c1/69fae6d4.YVef5tCE.js","/cdn/shopifycloud/checkout-web/assets/c1/f67abd2c.CTLI_dya.js","/cdn/shopifycloud/checkout-web/assets/c1/e12db40c.BixFQlty.js","/cdn/shopifycloud/checkout-web/assets/c1/60a453ce.BzJXYlTD.js","/cdn/shopifycloud/checkout-web/assets/c1/fb3b4968.C3QK4EUj.js","/cdn/shopifycloud/checkout-web/assets/c1/f8706cb6.B6FNGJsx.js","/cdn/shopifycloud/checkout-web/assets/c1/dffdfb34.60dXACLC.js","/cdn/shopifycloud/checkout-web/assets/c1/3ca8ef7e.Dw-VHH5s.js","/cdn/shopifycloud/checkout-web/assets/c1/1f5e7811.C02nJwFx.js","/cdn/shopifycloud/checkout-web/assets/c1/1a6c2867.D8mTtJ_Z.js","/cdn/shopifycloud/checkout-web/assets/c1/2fdb3dd3.Bu4jPNWf.js","/cdn/shopifycloud/checkout-web/assets/c1/22345fd4.DlfhSuX7.js","/cdn/shopifycloud/checkout-web/assets/c1/0e67bd3b.BYRYKBWs.js","/cdn/shopifycloud/checkout-web/assets/c1/74835653.DougAn5r.js","/cdn/shopifycloud/checkout-web/assets/c1/a9fa9fda.DiKC8DCq.js","/cdn/shopifycloud/checkout-web/assets/c1/ca3e798e.BBho0lps.js","/cdn/shopifycloud/checkout-web/assets/c1/47b970b2.nqHi1EJp.js","/cdn/shopifycloud/checkout-web/assets/c1/064f6ac1.BelRZHpM.js","/cdn/shopifycloud/checkout-web/assets/c1/efa0389a.CCYHIpoS.js","/cdn/shopifycloud/checkout-web/assets/c1/4b1c22b7.BXnSiXkd.js","/cdn/shopifycloud/checkout-web/assets/c1/17425706.n1wfLnWy.js","/cdn/shopifycloud/checkout-web/assets/c1/cb5cf153.CjGZFjEB.js","/cdn/shopifycloud/checkout-web/assets/c1/e3e348f2.BZ9ZSH0N.js","/cdn/shopifycloud/checkout-web/assets/c1/71ae3d5c.BmHaAqK0.js","/cdn/shopifycloud/checkout-web/assets/c1/78ab3dd0.BMjoGeVs.js","/cdn/shopifycloud/checkout-web/assets/c1/89e2d30a.C8YE7VXh.js","/cdn/shopifycloud/checkout-web/assets/c1/ed9f2238.CjY4o5If.js","/cdn/shopifycloud/checkout-web/assets/c1/6fb6f9d8.CsBHvGi2.js","/cdn/shopifycloud/checkout-web/assets/c1/1444e6bd.CLS56A6L.js","/cdn/shopifycloud/checkout-web/assets/c1/0b8657b8.CfWhGdB8.js","/cdn/shopifycloud/checkout-web/assets/c1/55098bf1.DT6NwZ4H.js","/cdn/shopifycloud/checkout-web/assets/c1/a422df8c.CRqSi2nj.js","/cdn/shopifycloud/checkout-web/assets/c1/f49d4216.DZ5-QvmQ.js","/cdn/shopifycloud/checkout-web/assets/c1/79974aab.CtHHl-UL.js","/cdn/shopifycloud/checkout-web/assets/c1/7b0c98ea.BZ8Xi8Pj.js","/cdn/shopifycloud/checkout-web/assets/c1/d22d2b80.bznv4sol.js","/cdn/shopifycloud/checkout-web/assets/c1/f58f39d8.CgYfdEj3.js","/cdn/shopifycloud/checkout-web/assets/c1/e03065ab.Ck1HazGU.js","/cdn/shopifycloud/checkout-web/assets/c1/0e9ee714.BIf29z68.js","/cdn/shopifycloud/checkout-web/assets/c1/39921a74.BdMCid-J.js","/cdn/shopifycloud/checkout-web/assets/c1/7a8217fd.q3MbwqNJ.js","/cdn/shopifycloud/checkout-web/assets/c1/c6b02d73.DWjo2wdl.js","/cdn/shopifycloud/checkout-web/assets/c1/ec391382.DdUw9Oe-.js","/cdn/shopifycloud/checkout-web/assets/c1/24773686.DfFnTEaZ.js","/cdn/shopifycloud/checkout-web/assets/c1/2210eadb.DF0gIp_2.js","/cdn/shopifycloud/checkout-web/assets/c1/71b60e0a.DfPLdYsH.js","/cdn/shopifycloud/checkout-web/assets/c1/6bfea526.xBZWwkVv.js","/cdn/shopifycloud/checkout-web/assets/c1/ac5a19ff.Jg-FWYbH.js","/cdn/shopifycloud/checkout-web/assets/c1/598fef4e.7IzGxsBF.js","/cdn/shopifycloud/checkout-web/assets/c1/e77f7fe0.DV0HdLQ2.js","/cdn/shopifycloud/checkout-web/assets/c1/cc6ff67d.PmLvsMWt.js","/cdn/shopifycloud/checkout-web/assets/c1/bf513f9c.CyucmNct.js","/cdn/shopifycloud/checkout-web/assets/c1/dfca5da5.CdZpAd4E.js","/cdn/shopifycloud/checkout-web/assets/c1/dae24aab.CVNnVl1k.js","/cdn/shopifycloud/checkout-web/assets/c1/ddf59287.Bv6OBjfF.js","/cdn/shopifycloud/checkout-web/assets/c1/01973ac7.D0JzvowN.js","/cdn/shopifycloud/checkout-web/assets/c1/58314944.CdtlOP_W.js","/cdn/shopifycloud/checkout-web/assets/c1/945a08d6.B4I_XgjM.js","/cdn/shopifycloud/checkout-web/assets/c1/7bc8057b.BT8wrO39.js","/cdn/shopifycloud/checkout-web/assets/c1/a25deb9a.BcD7DQFa.js","/cdn/shopifycloud/checkout-web/assets/c1/2b89a178.Ber0wB1s.js","/cdn/shopifycloud/checkout-web/assets/c1/b684bff6.amysyzvr.js","/cdn/shopifycloud/checkout-web/assets/c1/910cd6e2.DgcSbG_X.js","/cdn/shopifycloud/checkout-web/assets/c1/347b440c.CLBjYVqS.js","/cdn/shopifycloud/checkout-web/assets/c1/9ce08e25.DU3pImuI.js","/cdn/shopifycloud/checkout-web/assets/c1/181d38d3.B7i-QkDi.js","/cdn/shopifycloud/checkout-web/assets/c1/792bb671.B3OvVnSg.js","/cdn/shopifycloud/checkout-web/assets/c1/9ca7d819.D-TvA1hD.js","/cdn/shopifycloud/checkout-web/assets/c1/f51e663e.dCzW_19x.js","/cdn/shopifycloud/checkout-web/assets/c1/21cc90a2.DHzOO82q.js","/cdn/shopifycloud/checkout-web/assets/c1/64de7b49.B6kVDzMg.js","/cdn/shopifycloud/checkout-web/assets/c1/ca0c3e72.DHTwlcq_.js","/cdn/shopifycloud/checkout-web/assets/c1/8e79be58.BfMCIyab.js","/cdn/shopifycloud/checkout-web/assets/c1/90e26f5f.BVFtYfGY.js","/cdn/shopifycloud/checkout-web/assets/c1/31cc568e.95lmLO5k.js","/cdn/shopifycloud/checkout-web/assets/c1/65f3d4da.Bb3QiqCm.js","/cdn/shopifycloud/checkout-web/assets/c1/ca5e9c49.5KRO7puf.js","/cdn/shopifycloud/checkout-web/assets/c1/f3e117aa.BQaPMqhj.js","/cdn/shopifycloud/checkout-web/assets/c1/7aefefff.0O6VUnnv.js","/cdn/shopifycloud/checkout-web/assets/c1/b3389d5c.B8WzLkzP.js","/cdn/shopifycloud/checkout-web/assets/c1/73a9b0a0.BkNMQM31.js","/cdn/shopifycloud/checkout-web/assets/c1/25604ae0.56pfEpxV.js","/cdn/shopifycloud/checkout-web/assets/c1/dada7e07.DQUGB7b1.js","/cdn/shopifycloud/checkout-web/assets/c1/86720dbb.0zZX7aPo.js","/cdn/shopifycloud/checkout-web/assets/c1/f692f62f.B1ocCHyU.js","/cdn/shopifycloud/checkout-web/assets/c1/9babe369.SH-YgBx8.js","/cdn/shopifycloud/checkout-web/assets/c1/434e3b0a.oup8Ur0H.js","/cdn/shopifycloud/checkout-web/assets/c1/e0989459.ZroR9WKq.js","/cdn/shopifycloud/checkout-web/assets/c1/cdfd59e6.suvgNw4K.js","/cdn/shopifycloud/checkout-web/assets/c1/fc21c11a.VMoRgu6v.js","/cdn/shopifycloud/checkout-web/assets/c1/e129c76e.DS_EvCXn.js","/cdn/shopifycloud/checkout-web/assets/c1/d4ea2faa.B-YLTY0q.js","/cdn/shopifycloud/checkout-web/assets/c1/fe885b80.DIkjtkDB.js","/cdn/shopifycloud/checkout-web/assets/c1/f78726c8.BHgYUbQv.js","/cdn/shopifycloud/checkout-web/assets/c1/e477f96c.9KBtMNEd.js","/cdn/shopifycloud/checkout-web/assets/c1/d7065744.DH5rilol.js","/cdn/shopifycloud/checkout-web/assets/c1/7ee73f43.DxAPCnEM.js","/cdn/shopifycloud/checkout-web/assets/c1/0c0ad074.CgUqmSml.js","/cdn/shopifycloud/checkout-web/assets/c1/8fe56fc9.D3YWjcYw.js","/cdn/shopifycloud/checkout-web/assets/c1/87bfafec.CxwEzGHg.js","/cdn/shopifycloud/checkout-web/assets/c1/051149c8.lHD9iIAq.js","/cdn/shopifycloud/checkout-web/assets/c1/d2e6a587.CO1CRiBj.js","/cdn/shopifycloud/checkout-web/assets/c1/c10167e6.D5yGr37m.js","/cdn/shopifycloud/checkout-web/assets/c1/b9c0319a.C6BXCTvn.js","/cdn/shopifycloud/checkout-web/assets/c1/17e57de1.C4OivbHV.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.CcGlIMpn.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/wallet-prefilled-guest-return.BZwmSkmD.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/hydrate.DUY3Jbo2.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.C_uC3EPz.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/VatNumberValidationField.CAYYnuvZ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShopPayLogo.87JMHPUK.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShopPayVerificationTrigger.BnDF3H7t.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/BillingAddressForm.BdwN7V1K.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PhoneField.uZEuHncj.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Popover.Bi1nHaU-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Choice.CrYuHUmO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EmptyState.BEvzDDvy.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/TransitionHeight.CuRoM9zv.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StickyPayButton.D-gNjNDa.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Switch.BS8yVgoP.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayProgressIntercepts.CIy8uDiZ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Tipping.BcTJoNaV.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentIcon.gzvCNwz_.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentLine.DT05kVlY.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Section.CU18S7Ap.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/constants.xO_7ctnq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Middot.D7Ujmshx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EstimatedDeliveryContent.B_THySFF.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingMethods.DU0m5rdF.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingMethodSelector.B0hio2RO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SubscriptionPriceBreakdown.vTcdVGq4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/BelowTheFoldContent.BKRoWsh4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/RememberMeSection.JBO5WNhc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentMethodProgressionHost.C0BOgdmL.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/RedirectionNotice.DgiInWJ-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PayButtonSection.CZuxzxFG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/hooks.BDst-6PZ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName.D-F4uQ9M.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.BlloiNDx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentOptionSelector.s-Kd_X2E.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = [];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  