<div style="text-align:center"> 
    <img src="assets/logo.svg" />
</div>

<p align="center" >
    <a href="https://discord.com/api/oauth2/authorize?client_id=774329375206277122&permissions=2150909952&scope=bot%20applications.commands">
        <img src="https://img.shields.io/badge/Invite-Discord-7289da?style=flat&logo=discord&logoColor=white"/>
    </a>
    <a href="https://discord.gg/XmqkJRmcty">
        <img src="https://img.shields.io/badge/Support-Discord-7289da?style=flat&logo=discord&logoColor=white" />
    </a>
</p>

## Overview

Griza is a simple radio bot for Discord. If you're a fan of listening to music, and you are bored with your playlist, then Griza is the best solution for you and the members of your server.

[Installation](#installation) does not take long if you follow the instructions. Just a few clicks and the bot is already on your server in the right channel, tuned to the right frequency and playing cool music.

**The bot has some cool features:**

-  Set up the radio channel with one command
-  Music playback 24/7
-  Support for slash commands
-  Large number of radio stations
-  You can find out the name of the current music on the radio

## Prerequisites

Before starting the installation, make sure you have the following tools installed:

-  **[NodeJS](https://nodejs.org/)** (version 16 and above)
-  **[Yarn](https://yarnpkg.com/)**
-  **[Git](https://git-scm.com/)**

## Installation

First, you need to clone the bot repository using the command:

```bash
git clone https://github.com/Noktomezo/griza-discord-bot.git
```

Then you need to install all dependencies:

```bash
yarn
# or
yarn install
```

Before you run it, you need to set up environment variables. Rename the file **`.env.example`** to **`.env`** and change the values to the desired ones:

-  **`DISCORD_TOKEN`**: Token of your Discord-bot. To get it, log in to [this](https://discord.com/developers/applications) site and create a new application. Under the "**Bot**" tab, copy the token of your bot
-  **`MONGO_CONNECTION_URL`**: The link to connect to your **[MongoDB](https://cloud.mongodb.com/)** database. Register or log in, then create a new database by clicking on the "**New Project**" button and follow the instructions, deploy your database with the desired plan (the free plan fully covers the bot's needs). Then configure the data to connect to your database and click "**Create User**". In the line "**IP Address**" enter **`0.0.0.0.0/0`** so you can connect to the database from any IP or enter your own. Finish creating your database and click "**Connect**" and find the connection URL (for example click on the "**Compass**" tab), it should look something like this: **`mongodb+srv://{username}:{password}@xxx.xxx.mongodb.net/`**. All you need to do is replace **`{username}`** and **`{password}`** with the values specified at the very beginning of the database creation. If you plan to connect multiple bots to the same database, specify the name of the **collection** at the end of the connection URL, like **`mongodb+srv://uuu:ppp@xxx.xxx.mongodb.net/{collection}`**
-  **`DEFAULT_LOCALE`**: The default language of the bot is required for correct display of logs (does not affect the language of the bot on the servers), available languages can be found in the **`locales`** folder, specify the file name without its extension (without '.json').
-  **`TIMEZONE`**: Time zone, needed for correct time display in logs, can be found [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) in column "**TZ identifier**"

## Run

When you're all set, build your bot and launch it:

```bash
yarn build
yarn start
```

## Run in dev mode

The bot can also be run in dev mode, where the bot will instantly restart when any changes are made:

```bash
yarn start:dev
```

## License

Released under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html) license.
