(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"esmx-ai-demo\u002Fsrc\u002Fentry.client":"\u002Fesmx-ai-demo\u002Fsrc\u002Fentry.client.077e8448.final.mjs"}};
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