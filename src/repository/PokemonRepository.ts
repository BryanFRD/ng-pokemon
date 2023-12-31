import axios, { AxiosInstance} from 'axios';

const limit = 100;

const steamApi: AxiosInstance = axios.create({
  baseURL: 'https://pokeapi.co/api/v2/',
});

const get = (url: string): GetResponse<any> => {
  return steamApi.get(url)
    .then((response) => {
      return {
        data: response.data,
        error: null,
        status: response.status
      }
    }).catch((error) => {
      return {
        data: null,
        error: error.response.data,
        status: error.response.status
      }
    });
}

const getPokemonsAtPage = (page: number = 0): GetResponse<{hasNext: boolean, pokemons: Pokemon[]}> => {
  return get(`pokemon?limit=${limit}&offset=${page * limit}`).then((response) => {
    const pokemons: Pokemon[] = response.data?.results ?? [];
    const promises = pokemons.map((pokemon: any) => {
      return get(pokemon.url.replace(steamApi.getUri(), ''));
    });
    
    return Promise.all(promises).then((responses) => {
      return {
        data: {hasNext: response.data?.next, pokemons: responses.map((response) => response.data)},
        error: null,
        status: 200
      }
    })
    .catch((error) => {
      return {
        data: {hasNext: false, pokemons: []},
        error: error.response.error,
        status: error.response.status
      }
    });
  });
}

export { getPokemonsAtPage };