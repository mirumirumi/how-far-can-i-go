import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'

export interface State {
  like: number
}

// interface xxx {

// }

export const store = createStore<State>({
  state: {
    like: 13,
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})

export const key: InjectionKey<Store<State>> = Symbol();
export const useStore = () => {
  return baseUseStore(key)
}
