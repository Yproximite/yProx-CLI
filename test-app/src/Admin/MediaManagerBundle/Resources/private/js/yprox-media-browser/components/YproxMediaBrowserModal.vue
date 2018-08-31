<template>
  <div class="yprox-media-browser-modal">
    <div
      v-show="isShown"
      :id="elementId"
      :aria-labelledby="elementId + '-label'"
      class="modal fade slide-up disable-scroll"
      tabindex="-1"
      role="dialog"
      aria-hidden="false"
    >
      <div class="modal-dialog">
        <div class="modal-content-wrapper">
          <div class="modal-content">
            <div class="modal-header clearfix text-left p-t-15">
              <button
                type="button"
                class="close"
                aria-hidden="true"
                @click="hide"
              >
                <i class="pg-close fs-14"/>
              </button>
              <h3>
                <span class="semi-bold">{{ trans('media_browser', {}, 'mediajs') }}</span>
              </h3>
            </div>
            <div class="modal-body padding-15">
              <slot/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Translatable, Modalable } from 'app';

export default {
  name: 'YproxMediaBrowserModal',
  mixins: [
    Translatable,
    Modalable,
  ],
};
</script>
