const MODULE_NAME = "mod_chn";
const WELCOMED_NAME = "welcomed";
const LISTVER_NAME = "listver";

const LIST_VERSION = 6;

Hooks.on("init", () => {
    game.settings.register(MODULE_NAME, WELCOMED_NAME, {
        name: WELCOMED_NAME,
        scope: "client",
        config: false,
        type: Boolean,
        default: false
    });
    game.settings.register(MODULE_NAME, LISTVER_NAME, {
        name: LISTVER_NAME,
        scope: "client",
        config: false,
        type: Number,
        default: LIST_VERSION
    });
});

Hooks.on("ready", () => {
    const welcomed = game.settings.get(MODULE_NAME, WELCOMED_NAME);
    const listVersion = game.settings.get(MODULE_NAME, LISTVER_NAME);

    if (!welcomed || listVersion < LIST_VERSION) {
        game.settings.set(MODULE_NAME, LISTVER_NAME, LIST_VERSION);

        let content = `
            <h2>欢迎使用Foundry VTT Mod 翻译包！</h2>
            <p>本模组为 FVTT 的部分mod提供了汉化，目前的翻译基本适配于FVTT绝大多数主流mod。</p>
            <p>如需提议新增模组汉化（仅限5e和通用mod），可以在<a href="https://github.com/13996090016/fvtt_mod_chn/discussions/1">建议贴</a>中回复。</p>
			<p>如发现此mod汉化文本的错误或缺失（仅限此mod的汉化），可以在<a href="https://github.com/13996090016/fvtt_mod_chn/discussions/2">纠错贴</a>中回复。</p>
        `;

        const welcomeDialog = new Dialog({
            title: "已开启Foundry VTT Mod 翻译包！",
            content: content,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check-circle"></i>',
                    label: "OK"
                },
                check: {
                    icon: '<i class="fas fa-thumbs-up"></i>',
                    label: "不再显示",
                    callback: () => game.settings.set(MODULE_NAME, WELCOMED_NAME, true)
                }
            }
        });
        welcomeDialog.render(true);
    }
});
