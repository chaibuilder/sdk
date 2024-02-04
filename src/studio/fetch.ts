let ACCESS_TOKEN: string = "";
export const getAccessToken = () => {
  ACCESS_TOKEN = localStorage.getItem("__chai_at") as string;
  return ACCESS_TOKEN;
};

function get(url: string) {
  const requestOptions = {
    method: "GET",
    headers: { "x-chai-access-token": getAccessToken() },
  };
  return fetch(url, requestOptions);
}

function post(url: string, body: Record<string, any>) {
  const requestOptions = {
    method: "POST",
    headers: { "x-chai-access-token": getAccessToken() },
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions);
}

function put(url: string, body: Record<string, any>) {
  const requestOptions = {
    method: "PUT",
    headers: { "x-chai-access-token": getAccessToken() },
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions);
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete(url: string, body: Record<string, any>) {
  const requestOptions = {
    method: "DELETE",
    headers: { "x-chai-access-token": getAccessToken() },
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions);
}

export const fetchWrapper = {
  get,
  post,
  put,
  delete: _delete,
};
