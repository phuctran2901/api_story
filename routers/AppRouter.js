const { Router } = require("express");
const express = require("express");

const Route = express.Router();
const AppControllers = require("../controllers/AppControllers");

Route.get("/getHome", AppControllers.getHome);
Route.get("/getGenres", AppControllers.getGenres);
Route.get("/getDetailListGenres", AppControllers.getDetailListGenres);
Route.get("/getInfo/:slug", AppControllers.getInfo);
Route.get("/getListChapter/:idStory", AppControllers.getListChapter);
Route.get("/getDetailStory/:slug/:chapter", AppControllers.getDetailStory);
Route.get("/getListFilter", AppControllers.getListFilter);
Route.post("/getAudioChapter", AppControllers.getAudioChapter);
Route.post("/search", AppControllers.search);
Route.get("/getSlide", AppControllers.getSlide);
module.exports = Route;
