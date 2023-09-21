import '../css/style.css';

function handleChange (mediaQueryListEvent) {
  if (mediaQueryListEvent.matches) {
    // 用户切换到了暗色(dark)主题
    console.log('切换主题：', mediaQueryListDark.matches ? 'dark' : 'light');
    
  } else {
    // 用户切换到了亮色(light)主题
    console.log('切换主题：', mediaQueryListDark.matches ? 'dark' : 'light');
  }
}

const mediaQueryListDark = window.matchMedia('(prefers-color-scheme: dark)');

console.log('当前主题：', mediaQueryListDark.matches ? 'dark' : 'light');

// 添加主题变动监控事件
mediaQueryListDark.addListener(handleChange);

// 移除主题变动监控事件
// mediaQueryListDark.removeListener(handleChange);
