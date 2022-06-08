const settings = require('../settings.json');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(settings.youtubeApiToken);

module.exports = {
    /**
     * Returns an array of video links from a given YT playlist
     */
    getPlaylist: async url => {
        let res = [];
        await youtube.getPlaylist(url)
            .then(playlist => playlist.getVideos())
            .then(videos => videos.forEach(video => res.push(video.url)))
            .catch(console.error)
        return res;
    },

    /**
     * Returns a YT video object
     */
    getVideo: async url => {
        return new Promise(async (resolve, reject) => {
            await youtube.getVideo(url)
                .then(video => resolve(video))
                .catch(err => reject(err))
        })
    },

    /**
     * Returns the title for given video
     */
    getTitleFromVideo: async url => {
        let res = undefined;
        await module.exports.getVideo(url)
            .then(video => res = video.title)
            .catch(console.error)
        return res;
    }
}