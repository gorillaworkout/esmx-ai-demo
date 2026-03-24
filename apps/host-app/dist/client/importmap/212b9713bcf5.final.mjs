(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"host-app\u002Fsrc\u002Fentry.client":"\u002Fhost-app\u002Fsrc\u002Fentry.client.1c2fc471.final.mjs","vue3-app\u002Fsrc\u002Froutes":"\u002Fvue3-app\u002Fsrc\u002Froutes.74a955ce.final.mjs","vue3-app\u002Fsrc\u002Fapp-creator":"\u002Fvue3-app\u002Fsrc\u002Fapp-creator.6c0f1b8d.final.mjs","vue3-app\u002Fvue":"\u002Fvue3-app\u002Fvue.eedf49f5.final.mjs","vue3-app\u002F@esmx\u002Frouter-vue":"\u002Fvue3-app\u002F@esmx\u002Frouter-vue.d32c91d0.final.mjs","vue2-app\u002Fsrc\u002Froutes":"\u002Fvue2-app\u002Fsrc\u002Froutes.d91bb3af.final.mjs","vue2-app\u002Fsrc\u002Fapp-creator":"\u002Fvue2-app\u002Fsrc\u002Fapp-creator.fecb4024.final.mjs","vue2-app\u002Fvue":"\u002Fvue2-app\u002Fvue.308b5600.final.mjs","vue2-app\u002F@esmx\u002Frouter-vue":"\u002Fvue2-app\u002F@esmx\u002Frouter-vue.d32c91d0.final.mjs","vue3-app-routes":"\u002Fvue3-app\u002Fsrc\u002Froutes.74a955ce.final.mjs","vue3-app-creator":"\u002Fvue3-app\u002Fsrc\u002Fapp-creator.6c0f1b8d.final.mjs","vue3-app-render":"vue3-app\u002Fsrc\u002Frender-to-str","vue2-app-routes":"\u002Fvue2-app\u002Fsrc\u002Froutes.d91bb3af.final.mjs","vue2-app-creator":"\u002Fvue2-app\u002Fsrc\u002Fapp-creator.fecb4024.final.mjs","vue2-app-render":"vue2-app\u002Fsrc\u002Frender-to-str","vue":"\u002Fvue3-app\u002Fvue.eedf49f5.final.mjs","@esmx\u002Frouter-vue":"\u002Fvue3-app\u002F@esmx\u002Frouter-vue.d32c91d0.final.mjs"},"scopes":{"\u002Fvue2-app\u002Fsrc\u002Froutes.d91bb3af.final.mjs":{"vue":"\u002Fvue2-app\u002Fvue.308b5600.final.mjs","@esmx\u002Frouter-vue":"\u002Fvue2-app\u002F@esmx\u002Frouter-vue.d32c91d0.final.mjs"},"\u002Fvue2-app\u002Fsrc\u002Fapp-creator.fecb4024.final.mjs":{"vue":"\u002Fvue2-app\u002Fvue.308b5600.final.mjs","@esmx\u002Frouter-vue":"\u002Fvue2-app\u002F@esmx\u002Frouter-vue.d32c91d0.final.mjs"},"\u002Fvue2-app\u002Fvue.308b5600.final.mjs":{"vue":"\u002Fvue2-app\u002Fvue.308b5600.final.mjs","@esmx\u002Frouter-vue":"\u002Fvue2-app\u002F@esmx\u002Frouter-vue.d32c91d0.final.mjs"},"\u002Fvue2-app\u002F@esmx\u002Frouter-vue.d32c91d0.final.mjs":{"vue":"\u002Fvue2-app\u002Fvue.308b5600.final.mjs","@esmx\u002Frouter-vue":"\u002Fvue2-app\u002F@esmx\u002Frouter-vue.d32c91d0.final.mjs"}}};
const set = (data) => {
    if (!data) return;
    Object.entries(data).forEach(([k, v]) => {
        data[k] = base + v;
    });
};
set(importmap.imports);
if (importmap.scopes) {
    Object.values(importmap.scopes).forEach(set);
}
const script = document.createElement("script");
script.type = "importmap";
script.innerText = JSON.stringify(importmap);
document.head.appendChild(script);
})();