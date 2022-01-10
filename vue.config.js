module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/scss/_css.scss";`,
      },
    },
  },
  publicPath: process.env.NODE_ENV === "production"
    ? "/"
    : "/",
}
