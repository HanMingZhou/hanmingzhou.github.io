document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("music");
    if (!container) return;

    const config = JSON.parse(container.dataset.config);
    const create = (audio) => {
        if (!audio.length) return container.remove();
        new APlayer({
            container,
            audio,
            fixed: config.fixed,
            mini: config.mini,
            autoplay: config.autoplay,
            volume: config.volume,
            order: config.order,
            loop: config.loop,
            preload: "none",
            listFolded: true,
            lrcType: config.lrc ? 3 : 0,
        });
    };

    if (config.audio && config.audio.length) return create(config.audio);

    const sources = (config.list && config.list.length ? config.list : [config]).filter((source) => source.id);
    const fetchSource = (source) => {
        const server = source.server || config.server;
        const type = source.type || config.type;
        const url = `${config.api}?server=${server}&type=${type}&id=${source.id}`;
        return fetch(url)
            .then((response) => response.json())
            .then((songs) =>
                (Array.isArray(songs) ? songs : []).map((song) => ({
                    name: song.name,
                    artist: song.artist,
                    url: song.url,
                    cover: song.pic,
                    lrc: config.lrc ? song.lrc : undefined,
                })),
            )
            .catch(() => []);
    };

    Promise.all(sources.map(fetchSource)).then((results) => create(results.flat()));
});
