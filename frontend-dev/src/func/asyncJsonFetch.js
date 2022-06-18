export default async (url, param) => {
    let res = await fetch(url,{
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(param)
    });
    let body = await res.json();
    return body;
}