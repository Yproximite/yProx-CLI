import Routing from 'routing';
import { apiUrl, graphqlUrl } from 'constants';

const generateLink = (url, ...args) => {
  const apiLink = document.createElement('a');
  apiLink.href = url;

  const routeLink = document.createElement('a');
  routeLink.href = Routing.generate(...args);

  const protocol = apiLink.protocol ? apiLink.protocol.replace(/:$/, '') : '';
  const { host, search } = apiLink;
  const pathname = routeLink.pathname.charAt(0) === '/'
    ? routeLink.pathname
    : `/${routeLink.pathname}`;

  return `${protocol}://${host}${pathname}${search}`;
};

Routing.apiGenerate = function apiGenerate(...args) {
  return generateLink(apiUrl, ...args);
};

Routing.graphQLGenerate = function graphqlGenerate(...args) {
  return generateLink(graphqlUrl, ...args);
};

export default Routing;
