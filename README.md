# Kiosko Server (Api)

This the first version of the Kiosko api for kiosko app web.

How colaborate in this project?

## 1. Clone project

You can clone this project with the differents methods that github offers.

## 2. Installing dependices

Installing dependencies using

`npm install` or `yarn install`

## 3. Configure enviroment

You need to have mongodb installed on your machine. If port `3001` is busy you can change port in .env file.

## 4. Run project in local

Only you should use the command for run project in your machine.

`npm run dev` or `yarn dev`

## 5. Run project in production

- Change the environment vars, remember that you can change this variables in .env file in the root project. It's necessary a url for do connection with mongodb database and other url for the realtime service based in socket.io (only if you what use the updates in realtime).

- Run the followings commands
  `npm run build` or `yarn build` and continually `npm run start` or `yarn start`.
