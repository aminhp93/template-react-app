import uuid from 'uuid/v4';
import history from 'utils/history';

/*eslint-disable*/
class QueryString {
  // Make use of the API for URLSeachParams https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  createUrlSearchParams(params) {
    const urlSearchParams = new URLSearchParams();
    for(let key in params) {
      if (params[key] && params[key] instanceof Array) {
        params[key].forEach(value => urlSearchParams.append(key, value));
      } else {
        urlSearchParams.append(key, params[key]);
      }
    }
    return urlSearchParams;
  }

  parse = (q) => {
    const urlSearchParams = new URLSearchParams(q);
    const paramObject = {};
    for (let key of urlSearchParams.keys()) {
      if (!paramObject[key]) {
        const values = urlSearchParams.getAll(key);
        // If the key has only one value, return the value as a string
        if (values.length === 1) paramObject[key] = values[0];
        else if (values.length > 1) paramObject[key] = values;
      }
    }
    return paramObject;
  }

  stringify = params => this.createUrlSearchParams(params).toString()

  updateUrlWithParams(params) {
    history.push({
      pathname: history.location.pathname,
      search: this.stringify(params),
    });
  }

  // We are using tags in some components and this function will help transform param objects into an array of tag object
  initTagList(initialParams) {
    const tagList = [];
    if (initialParams) {
      Object.keys(initialParams).forEach((key) => {
        if (key === 'page') return;
        const values = initialParams[key];
        if (!values) return;
        if (values instanceof Array) {
          values.forEach((val) => {
            tagList.push({
              id: uuid(), type: key, title: val, value: val,
            });
          });
        } else {
          tagList.push({
            id: uuid(), type: key, title: values, value: values,
          });
        }
      });
    }
    return tagList;
  }
}

export default new QueryString();
