# ImageX
====================

author: [Jitendrudu Lacaraju]

Code: 
1. Main HTML is index.html

2. HTML pages are in /partials/

3. app.js is the map application file where routers and controllers are written

4. APIs used: Angular JS, Leaflet JS, World Window

5. CSS used Bootstrap

6. Tiles are loaded from cache: 
https://d2xy2u667w9tvp.cloudfront.net/LAYDB-1-BlueMarbleWithBathymetry-data/1072915200000/

7. Tiles use the NASA World Wind : "URLs are formed by appending the specified server address with the specified path and appending a path of the form /level/row/row_column.image-format"
This cache does not conform to the OpenGIS standards for image cache tiles URL format such as:
http://{subDomain}.tile.opencyclemap.org/cycle/{level}/{col}/{row}.png

8. Note: Work in progress on World Window API image overlay
It is not work because there is :  "-layer/"
at line # 220  WebWorldWind/src/layer/TiledImageLayer.js => TiledImageLayer.prototype.createTile function which is not the format of the Cache URL is wrongly formated in the API function as: https://d2xy2u667w9tvp.cloudfront.net/LAYDB-1-BlueMarbleWithBathymetry-data/1072915200000/-layer/0/0/0_1.jpg 





View the application :https://jeetu-gis.github.io/ImageX/.
