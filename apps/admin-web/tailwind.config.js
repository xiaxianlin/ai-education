module.exports = {
  content: ['./src/**/*.{tsx,ts,jsx,js}'],
  corePlugins: {
    // Ant Design 项目中开启 preflight 容易影响组件默认样式，这里默认关闭，只使用 utilities。
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
