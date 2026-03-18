async function start() {
    const options = await import('./node/src/entry.node.mjs').then(
        (mod) => mod.default
    );
    const { Esmx } = await import('@esmx/core');
    const esmx = new Esmx(options);

    await esmx.init(esmx.COMMAND.start);
}

start();