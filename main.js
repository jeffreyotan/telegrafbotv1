// load libraries and modules
const fetch = require('node-fetch');
const withQuery = require('with-query').default;

// configure environment variables
const GIFS_KEY = process.env.GIFS_KEY || "";
const BASE_URL = 'http://api.giphy.com/v1/gifs/search';

const NEWS_KEY = process.env.NEWS_KEY || "";
const NEWS_URL = 'https://newsapi.org/v2/top-headlines';

// bot libraries
const { Telegraf } = require("telegraf");
const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu');
const fs = require('fs/promises');

// create a menu
const menu = new MenuTemplate( () => 'News for Around the World' );
// add buttons to the menu
menu.interact('SG', 'sg', {
    do: ctx => ctx.answerCbQuery('SG').then(() => true)
});
menu.interact('CN', 'cn', {
    do: ctx => ctx.answerCbQuery('CN').then(() => true),
    joinLastRow: true
});
menu.interact('RU', 'ru', {
    do: ctx => ctx.answerCbQuery('RU').then(() => true),
    joinLastRow: true
});

// fetch news helper function
const fetchNews = (country) => {
    // for now, do nothing
}

// create a bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// when a user starts a session with your bot
bot.start(ctx => {
    return ctx.reply('Make something random and nice!');
})

bot.help(ctx => {
    return ctx.replyWithHTML("<b>Menu of bot:</b> - <i>Commands</i>: quit, pics, news - <i>Keywords</i>: hi, picture");
})

bot.hears('hi', ctx => {
    return ctx.reply('Hi! How may I help you?');
});

bot.hears('picture', ctx => {
    return ctx.replyWithPhoto('http://freebooksreviews.com/wp-content/uploads/2018/05/Great-Wall-of-China-PicsPhotos.jpg');
});

bot.command('pics', ctx => {
    // console.info('ctx:', ctx);
    console.info('ctx.message:', ctx.message);
    const cmdLength = ctx.message.entities[0].length;
    const country = ctx.message.text.substring(cmdLength).trim();

    console.info('Search Key: ', country);
    const url = withQuery(
        BASE_URL,
        {
            q: country,
            api_key: GIFS_KEY,
            limit: 5,
            rating: "g",
            lang: "en"
        }
    );
    fetch(url)
    .then(result => {
        result.json()
        .then(gifs => {
            gifs.data.forEach(element => {
                const title = element['title'];
                const link = element.images.fixed_height.url;
                // ctx.reply(title);
                // ctx.replyWithPhoto(link);
                ctx.replyWithPhoto(link, {caption: title});
            });
        })
    })
    .catch(e => {
        return ctx.reply(`An error occurred with the command: ${e}`);
    })

    return ctx.reply(`That's 5 gifs from ${country}`);
});

// work-in-progress.. please kindly enhence this route
bot.command('news', ctx => {
    // console.info('ctx:', ctx);
    console.info('ctx.message:', ctx.message);
    const cmdLength = ctx.message.entities[0].length;
    const country = ctx.message.text.substring(cmdLength).trim();

    // display menu if no country is selected
    if(country.length <= 0) {
        return MenuMiddleware.replyToContext(ctx);
    }

    console.info('Search Key: ', country);
    const url = withQuery(
        NEWS_URL,
        {
            apiKey: NEWS_KEY,
            country: country
        }
    );
    fetch(url)
    .then(result => {
        result.json()
        .then(newsData => {
            if(newsData['status'] === 'ok' && newsData['articles'].length > 0) {
                newsData['articles'].forEach(element => {
                    ctx.replyWithPhoto(element['urlToImage'], {caption: element['title'], text: element['description']});
                });
            }
        })
    })
    .catch(e => {
        return ctx.reply(`An error occurred with the command: ${e}`);
    });

    return ctx.reply(`That's 5 news articles from ${country}`);
});

bot.use((ctx, next) => {
    if(ctx.callbackQuery != null) {
        const country = ctx.callbackQuery.data.substring(1);
        return fetchNews(country);
    }
    next();
});

bot.command('quit', ctx => {
    return ctx.leaveChat();
});

// start the bot
console.info(`bot started on ${new Date()}`);
bot.launch();