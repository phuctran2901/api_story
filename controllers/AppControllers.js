require("dotenv").config();

const axios = require("axios");
const cheerio = require("cheerio");
const gtts = require("node-gtts")("vi");
const { bucket } = require("../firebase");
const request = require("request");
const path = require("path");

const call = axios.create({
    baseURL: process.env.BASE_URL,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        host: process.env.HOST,
    },
});
class AppControllers {
    static async getHome(req, res) {
        const { data } = await call.get(`/`);
        try {
            const $ = cheerio.load(data);

            const listNews = $(".new-rec-wrap .center-book-list ul li")
                .toArray()
                .map((item) => {
                    let sourceImage = $(item)
                        .find(".book-img a img.lazy")
                        .attr("src");
                    let slug = $(item)
                        .find(".book-img a")
                        .attr("href")
                        .split("/")[4];
                    let title = $(item).find(".book-info h3").text();
                    let des = $(item).find(".book-info p").text();
                    let author = $(item).find(".author");
                    let genres = $(author).prev();
                    return {
                        sourceImage,
                        title: title.trim().replace("/n", ""),
                        des,
                        slug,
                        author: {
                            name: author.text(),
                            image: author.find("img").attr("src"),
                            slug: author.attr("href").split("/")[3],
                        },
                        genres: {
                            title: genres.text(),
                            slug: genres.attr("href"),
                        },
                    };
                });

            const listFinish = $(".finish-book-wrap .center-book-list ul li")
                .toArray()
                .map((item) => {
                    let sourceImage = $(item)
                        .find(".book-img a img.lazy")
                        .attr("src");
                    let title = $(item).find(".book-info h3").text();
                    let des = $(item).find(".book-info p").text();
                    let author = $(item).find(".author");
                    let genres = $(author).prev();
                    let slug = $(item)
                        .find(".book-img a")
                        .attr("href")
                        .split("/")[4];
                    return {
                        sourceImage,
                        slug,
                        title: title.trim().replace("/n", ""),
                        des,
                        author: {
                            name: author.text(),
                            image: author.find("img").attr("src"),
                            slug: author.attr("href").split("/")[3],
                        },
                        genres: {
                            title: genres.text(),
                            slug: genres.attr("href"),
                        },
                    };
                });

            const listRankStory = $(".rank-list")
                .toArray()
                .map((listRank) => {
                    let titleRank = $(listRank).find(".wrap-title");
                    let listDataRank = $(listRank)
                        .find("li")
                        .toArray()
                        .map((item) => {
                            let sourceImage = $(item)
                                .find(".book-cover .link img")
                                .attr("src");
                            if (sourceImage) {
                                let rank = $(item).find(".book-info h3").text();
                                let title = $(item).find(".book-info h4 a");
                                let digital = $(item).find(
                                    ".book-info .digital"
                                );
                                let author = $(item).find(".author");
                                return {
                                    sourceImage,
                                    rank,
                                    title: {
                                        slug: title.attr("href").split("/")[4],
                                        name: title.text(),
                                    },
                                    digital: {
                                        amount: digital.find("em").text(),
                                        title: digital
                                            .clone()
                                            .children()
                                            .remove()
                                            .end()
                                            .text(),
                                    },
                                    author: {
                                        genres: {
                                            name: author.find("a.type").text(),
                                            slug: author
                                                .find("a.type")
                                                .attr("href"),
                                        },
                                        name: author.find(".writer").text(),
                                        slug: author
                                            .find(".writer")
                                            .attr("href")
                                            .split("/")[4],
                                    },
                                };
                            } else {
                                let numbox = $(item).find(".num-box").text();
                                let namebox = $(item).find(".name-box");
                                let total = $(item).find(".total").text();
                                return {
                                    numbox,
                                    title: {
                                        slug: $(namebox)
                                            .find(".name")
                                            .attr("href")
                                            .split("/")[4],
                                        name: $(namebox).find(".name").text(),
                                    },
                                    total,
                                };
                            }
                        });

                    return {
                        listDataRank,
                        titleRank: {
                            name: titleRank
                                .clone()
                                .children()
                                .remove()
                                .end()
                                .text(),
                            slug: titleRank
                                .find("a")
                                .attr("href")
                                .split("/")[3],
                        },
                    };
                });
            res.json({
                listNews,
                listFinish,
                listRankStory,
            });
        } catch (err) {
            res.json({ err });
        }
    }

    static async getGenres(req, res) {
        const { data } = await call.get("/tong-hop");
        try {
            const $ = await cheerio.load(data);
            const listGenres = $(".type-list p a")
                .toArray()
                .map((elm) => {
                    let item = $(elm);
                    return {
                        dataValue: item.attr("data-value"),
                        name: item.text(),
                    };
                });
            res.json({
                listGenres,
            });
        } catch (err) {}
    }

    static async getDetailListGenres(req, res) {
        function serialize(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(
                        encodeURIComponent(p) + "=" + encodeURIComponent(obj[p])
                    );
                }
            return str.join("&");
        }
        const { data } = await call.get(
            `/tong-hop${
                serialize(req.query) !== "" ? "?" + serialize(req.query) : ""
            }`
        );
        try {
            const $ = cheerio.load(data);
            const listData = $(".rank-body ul li")
                .toArray()
                .map((elm) => {
                    let item = $(elm);
                    let sourceImage = item.find("a img").attr("src");
                    let slug = item.find("a").attr("href").split("/")[4];
                    let title = item.find("h4").text();
                    let author = item.find(".author");
                    let intro = item.find(".intro").text();
                    return {
                        sourceImage,
                        slug,
                        title,
                        author: {
                            img: author.find("img").attr("src"),
                            slug: author
                                .find(".name")
                                .attr("href")
                                .split("/")[2],
                            name: author.find(".name").text(),
                            type: $(author.find("a").toArray()[1]).text(),
                            status: $(author.find("span").toArray()[0]).text(),
                            chapter: $(author.find("span").toArray()[1])
                                .find("span")
                                .text(),
                            intro,
                        },
                    };
                });
            res.json({
                listData,
            });
        } catch (err) {}
    }
    static async getListFilter(req, res) {
        const { data } = await call.get("/tong-hop");
        const insert = (arr, index, newItem) => [
            ...arr.slice(0, index),
            newItem,
            ...arr.slice(index),
        ];
        try {
            const $ = cheerio.load(data);
            const filterType = $(".type-list p:first-child a")
                .toArray()
                .map((item) => {
                    const elm = $(item);
                    const title = elm.text();
                    const dataName = elm.attr("data-name");
                    const dataValue = elm.attr("data-value");
                    return {
                        title,
                        dataName,
                        dataValue,
                    };
                });
            const newType = {
                titleFilter: "Loại truyện",
                typeFilter: filterType,
            };
            const filterRank = $(".rank-nav-list .box-box")
                .toArray()
                .map((item) => {
                    const elm = $(item);
                    const titleFilter = elm.find("h4").text();
                    const typeFilter = elm
                        .find("ul li")
                        .toArray()
                        .map((itemType) => {
                            const elmType = $(itemType);
                            const title = $(itemType).find("a").text();
                            const dataName = elmType
                                .find("a")
                                .attr("data-name");
                            const dataValue = elmType
                                .find("a")
                                .attr("data-value");
                            return {
                                dataName,
                                title,
                                dataValue: dataValue ? dataValue : null,
                            };
                        });
                    return {
                        titleFilter,
                        typeFilter,
                    };
                });
            res.json({
                filterRank: insert(filterRank, 1, newType),
            });
        } catch (err) {}
    }
    static async getInfo(req, res) {
        const { slug } = req.params;
        const { data } = await call.get(
            `/doc-truyen/${encodeURI(
                slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            )}`
        );
        try {
            const $ = cheerio.load(data);
            // let backgroundImage = $(".top-bg-box")
            //     .css("background-image")
            //     .split("(")[1]
            //     .slice(0, backgroundImage.length - 5);
            let idStory = $("meta[name=book_detail]").attr("content");
            let sourceImage = $("#bookImg img").attr("src");
            let info = $(".book-info");
            let rank = $(".book-information .book-info .tag + p + p");
            let readNow = $("#readBtn").attr("href");
            let intro = $.html($(".book-info-detail .book-intro p"));
            let rating = $("#myrate").text();
            let lastestChapter = $(".detail .cf a").text();
            let amountRating = $("#myrating").text();
            let listWillLike = $(".like-more-list .cf li")
                .toArray()
                .map((item) => {
                    let itemElm = $(item);
                    let sourceImage = itemElm
                        .find(".book-img a img")
                        .attr("src");
                    let slugItem = itemElm
                        .find(".book-img a")
                        .attr("href")
                        .split("/")[4];
                    let author = itemElm.find("h4").text();
                    let title = itemElm.find("p").text();
                    return {
                        sourceImage,
                        slug: slugItem,
                        author,
                        title,
                    };
                });
            res.json({
                // backgroundImage,
                idStory,
                sourceImage,
                amountRating,
                rating,
                readNow,
                info: {
                    name: info.find("h1").text(),
                    tag: info
                        .find(".tag")
                        .children()
                        .toArray()
                        .map((item) => $(item).text()),
                },
                intro,
                lastestChapter: {
                    name: lastestChapter,
                },
                rank: {
                    favorite: $($(rank).find("em").toArray()[0]).text().trim(),
                    favoriteName: $($(rank).find("cite").toArray()[0]).text(),
                    views: $($(rank).find("em").toArray()[1]).text(),
                    viewsName: $($(rank).find("cite").toArray()[1]).text(),
                    follow: $($(rank).find("em").toArray()[2]).text(),
                    followName: $($(rank).find("cite").toArray()[2]).text(),
                    nominationsName: $(
                        $(rank).find("cite").toArray()[3]
                    ).text(),
                    nominations: $($(rank).find("em").toArray()[3]).text(),
                },
                listWillLike,
            });
        } catch (err) {}
    }
    static async getListChapter(req, res) {
        const { idStory } = req.params;
        const { data } = await call.get(
            `/doc-truyen/page/${idStory.trim()}?page=0&limit=10000&web=1`
        );
        try {
            const $ = cheerio.load(data);
            const listChapter = $("ul li")
                .toArray()
                .map((li) => {
                    let item = $(li);
                    let slugChap =
                        item.find("a").attr("href")?.split("/")[5] || null;
                    let nameChap = item.find("a").attr("title") || null;
                    if (slugChap) {
                        return {
                            slugChap,
                            nameChap,
                        };
                    } else {
                        return {
                            nameChap: item.find("span").text(),
                            slugChap: null,
                        };
                    }
                });
            res.json({ listChapter });
        } catch (err) {}
    }
    static async getDetailStory(req, res) {
        const { slug, chapter } = req.params;
        const { idStory } = req.query;
        const { data } = await call.get(
            `/doc-truyen/${encodeURI(
                slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            )}/${chapter}`
        );
        try {
            const $ = cheerio.load(data);
            let idChapter = $(".more-chap").attr("onclick").split("'")[1];
            const getDataChapter = await call.get(
                `/story/chapters?story_id=${idStory}&chapter_id=${idChapter}`
            );
            let $chapter = cheerio.load(getDataChapter.data);
            let currentChapter = $chapter("ul li.active");
            let nextChapter = currentChapter.next();
            let prevChapter = currentChapter.prev();
            let titleStory = $(".truyen-title").text();
            let titleChapter = $(".truyen-title").next().text();
            let poster = $(".truyen-title").next().next().find("a").text();
            let content = $(
                $(".chapter .chapter-c .box-chap").toArray()[0]
            ).text();
            res.json({
                titleChapter,
                titleStory,
                poster,
                content,
                currentChap: chapter,
                nextChapter: $.html(nextChapter)
                    ? nextChapter.find("a").attr("href").split("/")[5]
                    : null,
                prevChapter: $.html(prevChapter)
                    ? prevChapter.find("a").attr("href").split("/")[5]
                    : null,
            });
        } catch (err) {}
    }
    static async getAudioChapter(req, res) {
        const { text, idStory, chapter } = req.body;
        var filepath = path.join(
            __dirname + "/audio",
            `${idStory}-${chapter?.trim()}.mp3`
        );

        bucket.file(`${idStory}-${chapter?.trim()}.mp3`).getSignedUrl(
            {
                action: "read",
                expires: "1-1-2050",
            },
            function (err, result) {
                if (err) return;
                request(result, function (err, resp) {
                    console.log(resp.statusCode);
                    if (err)
                        res.json({
                            status: "failed",
                            message: "Opps! Đã có lỗi xảy ra",
                        });
                    if (resp.statusCode === 200) {
                        res.json({
                            status: "success",
                            audio: result,
                        });
                    }
                    if (resp.statusCode !== 200) {
                        gtts.save(filepath, text, function () {
                            console.log("done create audio");
                            bucket
                                .upload(filepath)
                                .then((v) => {
                                    console.log("done upload");
                                    bucket
                                        .file(
                                            `${idStory}-${chapter?.trim()}.mp3`
                                        )
                                        .getSignedUrl({
                                            action: "read",
                                            expires: "1-1-2050",
                                        })
                                        .then((data) =>
                                            res.json({
                                                status: "success",
                                                audio: data[0],
                                            })
                                        )
                                        .catch((err) =>
                                            res.join({
                                                status: "failed",
                                                err: err,
                                            })
                                        );
                                })
                                .catch((err) => console.log(err));
                        });
                    }
                });
            }
        );
    }
    static async search(req, res) {
        const { term } = req.body;
        const { data } = await call.get(`/tim-kiem?term=${encodeURI(term)}`);
        try {
            const dataSearch = data.filter((item) => item.type !== "author");
            res.json({
                dataSearch,
            });
        } catch (err) {
            console.log(err.message);
        }
    }
    static async getSlide(req, res) {
        const { data } = await call.get("/");
        try {
            const $ = cheerio.load(data);
            const carousel = $("#carousel .slides a")
                .toArray()
                .map((item, index) => {
                    const $item = $(item);
                    const sourceImage = $item.find("img").attr("src");
                    const title = $(`.desc-wrap.item-${index + 1} h3 a`).text();
                    const slug = $(`.desc-wrap.item-${index + 1} .read-btn`)
                        .attr("onclick")
                        .split("/")[4];
                    return {
                        sourceImage,
                        title,
                        slug,
                    };
                });
            res.json({
                listSlide: [...carousel],
            });
        } catch (err) {
            console.log(err.message);
        }
    }
}

module.exports = AppControllers;
