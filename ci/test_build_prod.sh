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

test ! -f public/js/vue.js
test   -f public/js/vue.min.js
test   -f public/js/vue.min.js.map

test -f public/img/check.png
test -f public/img/cross.png
test -f public/img/mini_arrow_down.png
test -f public/img/mini_arrow_up.png

# Files built with Rollup
test -f public/js/core-app-admin.rollup.js
test -f public/js/core-app-admin.rollup.js.map
test -f public/js/yprox-media-browser.rollup.js
test -f public/js/yprox-media-browser.rollup.js.map
test -f public/js/yprox-store-locator.rollup.js
test -f public/js/yprox-store-locator.rollup.js.map

# Files built with webpack
test -f public/js/manifest.js
test -f public/js/vendor.js
test -f public/js/core-app-front.webpack.js
test -f public/js/core-app-admin.webpack.js
test -f public/js/yprox-media-browser.webpack.js
test -f public/js/yprox-store-locator.webpack.js
test -f public/js/lazy-imported-component.js

test -f public/plugins/jQuery-Validation-Engine/css/validationEngine.jquery.css
test -f public/plugins/jQuery-Validation-Engine/js/languages/jquery.validationEngine-fr.js
test -f public/plugins/jQuery-Validation-Engine/js/jquery.validationEngine.js
