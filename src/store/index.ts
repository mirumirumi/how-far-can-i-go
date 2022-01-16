import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { Transportation } from '@/utils/defines'

export interface State {
  query: string,
  transportation: Transportation | string,
  time: number,
}

export const store = createStore<State>({
  state: {
    query: "",
    transportation: Transportation.WALKING,
    time: 10,
  },
  getters: {
  },
  mutations: {
    setQuery(state, query: string) {
      state.query = query
    },
    setTransportation(state, tp: Transportation) {
      state.transportation = tp
    },
    setTime(state, time: number) {
      state.time = time
    },
  },
  actions: {
  },
  modules: {
  }
})

export const key: InjectionKey<Store<State>> = Symbol();
export const useStore = () => {  // eslint-disable-line
  return baseUseStore(key)
}
