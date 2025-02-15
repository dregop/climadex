## Climadex

## Overview

You are provided with Climadex, a small website where the user can monitor their factories and understand what kind of impact the rise of temperatures in the world is going to have on them!

The user can already see a list of their factories, with their names, address, geolocations, and yearly associated revenues.
For this test, there is no authentication of user management of any kind, and every visitor can see all factories.

The platform should be able to handle up to tens of thousands of factories.

Your mission - if you accept! - is threefold :

- implement a graph to show what the air temperature will be in 2030, 2050, 2070 and 2090 in the factory
- show what assets are at risk regarding air temperature in the table, in the "My factories" page.
- fix the search bar

## How to get started

Install the software requirements :
- [gdal 3.9](https://gdal.org/en/latest/download.html)
- [node.js >= 18](https://nodejs.org/en)
- [pnpm==9.1.2](https://pnpm.io/installation)

Then, run `pnpm install` at the root of the repository to install the dependencies.

The website has two parts :
- the backend : a Node.js server written in TypeScript, using Hono
- the frontend : a React.js app using simple css, built with Vite

run both the frontend and the backend with `pnpm start`. You can access the frontend at [localhost:4200](localhost:4200) and the backend at [localhost:3000](localhost:3000).

[Nx](https://nx.dev/) is used to manage the repository.

We provide you with an actual open climate model, the ACCESS-CM2 climate model from [CMIP6](https://www.worldclim.org/data/cmip6/cmip6climate.html), that you will use in the website!
There are 4 files, corresponding to 4 different timeframes (2030, 2050, 2070, 2090), each providing the mean temperature over the warmest quarter over the Earth.

To help you, we wrote the function `getMeanTemperatureWarmestQuarter` in `indicators.ts` to extract the measures given a latitude, longitude, and timeframe, and showed an example at [localhost:3000](localhost:3000)

## Tasks

As explained, there are three different tasks.

### 1. Implement a graph to show the air temperature evolution

The page `/reports/{factory_id}` is currently mostly empty. Design and implement a report page where the user can see in a graph the features of the factory, along with a graph showing the evolution of the temperature in 2030, 2050, 2070 and 2090 using the provided data. Feel free to design the page as you'd like.

### 2. Show in the factory page the factories at risk

The users should be able to see at a glance which of their factories are exposed to a risk related to air temperatures rising. Add this information to the table in the "My factories" page. Find out a simple way to determine if the risk is "High" or "Low" given available data - it will be far from perfect from a scientific point of view, but that's fine - and add the corresponding information to the factories table.

The platform should be able to handle up to tens of thousands of factories.

### 3. Fix the search bar

Users have been complaining about lack of fluidity in the search bar when using it.


**Feel free to change any of the existing code if you feel that's relevant!**


