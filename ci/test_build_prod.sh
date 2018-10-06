#!/usr/bin/env bash

set -ev

test -f public/css/button.css
test -f public/css/button.css.map
test -f public/css/legacy.css
test -f public/css/legacy.css.map
test -f public/css/my-grid.css
test -f public/css/my-grid.css.map
test -f public/css/containers.css
test -f public/css/containers.css.map

test -f public/img/check.png
test -f public/img/cross.png
test -f public/img/mini_arrow_down.png
test -f public/img/mini_arrow_up.png

test -f public/js/core-app-admin.min.js
test -f public/js/core-app-admin.min.js.map
test -f public/js/core-app-front.min.js
test -f public/js/core-app-front.min.js.map
test -f public/js/vue.min.js
test -f public/js/vue.min.js.map
test -f public/js/yprox-store-locator.min.js
test -f public/js/yprox-store-locator.min.js.map
test -f public/js/yprox-media-browser.min.js
test -f public/js/yprox-media-browser.min.js.map

test -f public/plugins/jQuery-Validation-Engine/css/validationEngine.jquery.css
test -f public/plugins/jQuery-Validation-Engine/js/languages/jquery.validationEngine-fr.js
test -f public/plugins/jQuery-Validation-Engine/js/jquery.validationEngine.js
