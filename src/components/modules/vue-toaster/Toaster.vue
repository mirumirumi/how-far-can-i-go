<template>
  <transition
    :enter-active-class="transition.enter"
    :leave-active-class="transition.leave"
  >
    <div
      v-show="isActive"
      :class="['c-toast', `c-toast--${type}`, `c-toast--${position}`]"
      @mouseover="toggleTimer(true)"
      @mouseleave="toggleTimer(false)"
      @click="click"
      role="alert"
    >
      <svg v-if="type == `error`" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" licence="https://fontawesome.com/v5.15/icons/exclamation-circle">
        <path fill="#fe5e5e" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path>
      </svg>
      <span>{{ message }}</span>
    </div>
  </transition>
</template>

<script>
/* eslint-disable */
import { removeElement } from './helpers/remove-element'
import Timer from './helpers/timer'
import Positions, { definePosition } from './defaults/positions'
import eventBus from './helpers/event-bus'

export default {
  name: 'toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'default'
    },
    position: {
      type: String,
      default: Positions.BOTTOM_RIGHT,
      validator(value) {
        return Object.values(Positions).includes(value)
      }
    },
    maxToasts: {
      type: [Number, Boolean],
      default: false
    },
    duration: {
      type: [Number, Boolean],
      default: 4000
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    queue: {
      type: Boolean,
      default: false
    },
    pauseOnHover: {
      type: Boolean,
      default: true
    },
    useDefaultCss: {
      type: Boolean,
      default: true
    },
    onClose: {
      type: Function,
      default: () => {}
    },
    onClick: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      isActive: false,
      parentTop: null,
      parentBottom: null,
      isHovered: false,
      timer: null
    }
  },
  beforeMount() {
    this.createParents()
    this.setDefaultCss()
    this.setupContainer()
  },
  mounted() {
    this.showNotice()
    eventBus.$on('toast-clear', this.close)
  },
  methods: {
    createParents() {
      this.parentTop = document.querySelector('.c-toast-container--top')
      this.parentBottom = document.querySelector('.c-toast-container--bottom')

      if (this.parentTop && this.parentBottom) return

      if (!this.parentTop) {
        this.parentTop = document.createElement('div')
        this.parentTop.className = 'c-toast-container c-toast-container--top'
      }

      if (!this.parentBottom) {
        this.parentBottom = document.createElement('div')
        this.parentBottom.className =
          'c-toast-container c-toast-container--bottom'
      }
    },
    setDefaultCss() {
      const type = this.useDefaultCss ? 'add' : 'remove'
      this.parentTop.classList[type]('v--default-css')
      this.parentBottom.classList[type]('v--default-css')
    },
    setupContainer() {
      const container = document.body
      container.appendChild(this.parentTop)
      container.appendChild(this.parentBottom)
    },
    shouldQueue() {
      if (!this.queue && this.maxToasts === false) {
        return false
      }

      if (this.maxToasts !== false) {
        return (
          this.maxToasts <=
          this.parentTop.childElementCount + this.parentBottom.childElementCount
        )
      }

      return (
        this.parentTop.childElementCount > 0 ||
        this.parentBottom.childElementCount > 0
      )
    },
    showNotice() {
      if (this.shouldQueue()) {
        this.queueTimer = setTimeout(this.showNotice, 250)
        return
      }

      this.correctParent.insertAdjacentElement('afterbegin', this.$el)
      this.isActive = true

      this.timer =
        this.duration !== false ? new Timer(this.close, this.duration) : null
    },
    click() {
      this.onClick.apply(null, arguments)

      if (this.dismissible) {
        this.close()
      }
    },
    toggleTimer(newVal) {
      if (this.timer && this.pauseOnHover) {
        newVal ? this.timer.pause() : this.timer.resume()
      }
    },
    stopTimer() {
      this.timer && this.timer.stop()
      clearTimeout(this.queueTimer)
    },
    close() {
      this.stopTimer()
      this.isActive = false
      setTimeout(() => {
        this.onClose.apply(null, arguments)
        removeElement(this.$el)
      }, 150)
    }
  },
  computed: {
    correctParent() {
      return definePosition(this.position, this.parentTop, this.parentBottom)
    },
    transition() {
      return definePosition(
        this.position,
        {
          enter: 'fadeInDown',
          leave: 'fadeOut'
        },
        {
          enter: 'fadeInUp',
          leave: 'fadeOut'
        }
      )
    }
  },
  beforeUnmount() {
    eventBus.$off('toast-clear', this.close)
  }
}
</script>
<style lang="scss">
.c-toast-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 2em 2.3em;
  overflow: hidden;
  z-index: 9999;
  pointer-events: none;
}
@media screen and (max-width: 768px) {
  .c-toast-container {
    position: fixed !important;
    padding: 0;
    top: auto !important;
    bottom: 85px;
  }
}
.c-toast {
  display: flex;
  align-items: center;
  margin: 0.5em 1em;
  padding: 0.1em 1.3em 0;
  width: 37%;
  min-width: 300px;
  min-height: 39.5px;
  color: #fff;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 0.97em;
  font-weight: bold;
  border-radius: 5px;
  box-shadow: 2px 2px 3px 1px rgba($color: #000000, $alpha: 0.23);
  word-break: break-word;
  cursor: pointer;
  pointer-events: auto;
  animation-duration: 150ms;
  svg {
    width: 1.3em;
    margin-right: 0.9em;
  }
  span {
    display: block;
    margin: 0.7em 0;
    width: calc(100% - 1.3em - 0.9em);
    line-height: 1.4;
  }
}
@media screen and (max-width: 768px) {
  .c-toast {
    align-self: center !important;
    padding: 0.1em 1em 0;
  }
}
.c-toast--info {
  background-color: #17a2b8;
}
.c-toast--success {
  background-color: #28a745;
}
.c-toast--warning {
  background-color: #ffc107;
}
.c-toast--error {
  color: #fe5e5e;
  background-color: #fde0e0;
}
.c-toast--default {
  background-color: #343a40;
}
.c-toast-container--top {
  flex-direction: column;
}
.c-toast-container--bottom {
  flex-direction: column-reverse;
}
.c-toast--top, .c-toast--bottom {
  align-self: center;
}
.c-toast--top-right, .c-toast--bottom-right {
  align-self: flex-end;
}
.c-toast--top-left, .c-toast--bottom-left {
  align-self: flex-start;
}
.fadeOut {
  animation-name: fadeOut;
}
.fadeInDown {
  animation-name: fadeInDown;
}
.fadeInUp {
  animation-name: fadeInUp;
}
.fade-enter-active {
  transition: opacity 300ms ease-in;
}
.fade-leave-active {
  transition: opacity 150ms ease-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
@-moz-keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-webkit-keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-o-keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-moz-keyframes fadeInDown {
  from {
    opacity: 0.5;
    transform: translate3d(0, -100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@-webkit-keyframes fadeInDown {
  from {
    opacity: 0.5;
    transform: translate3d(0, -100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@-o-keyframes fadeInDown {
  from {
    opacity: 0.5;
    transform: translate3d(0, -100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes fadeInDown {
  from {
    opacity: 0.5;
    transform: translate3d(0, -100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@-moz-keyframes fadeInUp {
  from {
    opacity: 0.5;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@-webkit-keyframes fadeInUp {
  from {
    opacity: 0.5;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@-o-keyframes fadeInUp {
  from {
    opacity: 0.5;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes fadeInUp {
  from {
    opacity: 0.5;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
