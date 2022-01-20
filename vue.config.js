module.exports = {
  devServer: {
    port: 13137,
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/scss/_css.scss";`,
      },
    },
  },
  publicPath: process.env.NODE_ENV === "prd"
    ? "/apps/how-far-map"
    : "/",
}
