import Routing from './routing';

export const API_TOKEN = 'api_token';

function getToken() {
  return localStorage.getItem(API_TOKEN);
}

function setToken(token) {
  localStorage.setItem(API_TOKEN, token);
}

function buildUrl(endpoint) {
  return Array.isArray(endpoint) ? Routing.apiGenerate(...endpoint) : endpoint;
}

export const getGraphQlEndpoint = () => Routing.graphQLGenerate('overblog_graphql_endpoint');

export default function install(Vue) {
  const retryAuthentication = (cb) => {
    const checkLogin = (response) => {
      const formData = new FormData();
      formData.append('api_key', response.data.key);

      return Vue.http.post(Routing.apiGenerate('api_login_check'), formData);
    };

    const retryCall = (response) => {
      setToken(response.data.token);
      return cb();
    };

    return Vue.http.get(Routing.generate('api_retrieve_key'))
      .then(checkLogin)
      .then(retryCall);
  };

  Object.defineProperty(Vue.prototype, '$api', {
    get() {
      const curryingCall = (options) => {
        const call = () => {
          const headers = {
            ...options.headers,
            Authorization: `Bearer ${getToken()}`,
          };

          return Vue.http({ ...options, headers });
        };

        if (getToken() === null) {
          return retryAuthentication(call);
        }

        const handleError = (response) => {
          if (response.status === 401) {
            return retryAuthentication(call);
          }

          return Promise.reject(response);
        };

        return call().catch(handleError);
      };

      const api = {};

      ['get', 'delete', 'head', 'jsonp'].forEach((method) => {
        api[method] = (endpoint, options = {}) => curryingCall({
          ...options,
          url: buildUrl(endpoint),
          method,
        });
      });

      ['post', 'put', 'patch'].forEach((method) => {
        api[method] = (endpoint, body, options = {}) => curryingCall({
          ...options,
          url: buildUrl(endpoint),
          method,
          body,
        });
      });

      return api;
    },
  });

  Object.defineProperty(Vue.prototype, '$graphql', {
    get() {
      const defaultHeaders = {
        Accept: '*/*',
        'Content-Type': 'application/json;charset=UTF-8',
      };

      // eslint-disable-next-line no-unused-vars
      const call = (query, variables, hydrateFormData = (formData) => {}) => {
        const retryCall = () => call(query, variables, hydrateFormData);

        if (getToken() === null) {
          return retryAuthentication(retryCall);
        }

        const headers = {
          ...defaultHeaders,
          Authorization: `Bearer ${getToken()}`,
        };

        const formData = new FormData();
        formData.append('query', query.trim());
        formData.append('variables', JSON.stringify(variables));
        hydrateFormData(formData);

        return Vue.http
          .post(getGraphQlEndpoint(), formData, { headers })
          .then((response) => {
            if (Array.isArray(response.data.errors) && response.data.errors.length > 0) {
              return Promise.reject(response.data.errors);
            }

            return response.data.data;
          })
          .catch((responseOrErrors) => {
            if (responseOrErrors.status === 401) {
              return retryAuthentication(retryCall);
            }

            return Promise.reject(responseOrErrors);
          });
      };

      return call;
    },
  });
}
