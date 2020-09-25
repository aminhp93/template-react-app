export default function makePageTitle(text) {
  return `${text} | Insight Community Platform`;
}

export const getUrlVars = (url) => {
  if (!url) return;

  const vars = {}
  const parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
    vars[key] = value;
  });

  return vars
}

export const getUrlParams = (url: string, parameter: string) => {
  let param = null
  if (url && url.indexOf(parameter) > -1) {
    param = getUrlVars(url)[parameter]
  }
  return param
}
