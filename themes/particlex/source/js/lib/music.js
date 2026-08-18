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
            lrcType: 3,
        });
    };

    if (config.audio && config.audio.length) return create(config.audio);

    const url = `${config.api}?server=${config.server}&type=${config.type}&id=${config.id}`;
    fetch(url)
        .then((response) => response.json())
        .then((songs) =>
            create(
                songs.map((song) => ({
                    name: song.name,
                    artist: song.artist,
                    url: song.url,
                    cover: song.pic,
                    lrc: song.lrc,
                })),
            ),
        )
        .catch(() => container.remove());
});
